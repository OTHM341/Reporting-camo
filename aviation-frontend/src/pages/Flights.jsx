import { useEffect, useState, useMemo } from 'react';
import { flightAPI, aircraftAPI, logApiError } from '../services/api';
import { useAppData } from '../context/AppDataContext';
import Modal from '../components/UI/Modal';
import ConfirmDialog from '../components/UI/ConfirmDialog';
import Logo from '../components/UI/Logo';
import XLSXStyle from 'xlsx-js-style';
import {
    Route, Plus, Loader2, Search, Download, Plane,
    Navigation, Clock, ArrowUpRight, CheckCircle2,
    AlertCircle, ChevronLeft, ChevronRight,
    Pencil, Trash2, Globe
} from 'lucide-react';

const ITEMS_PER_PAGE = 8;

// ── Helpers de style Excel (identiques à Aircraft) ────────────────────────
const RAM_RED  = "CC0000";
const DARK     = "2D2D2D";
const WHITE    = "FFFFFF";
const ALT_ROW  = "FFF5F5";
const TOTAL_BG = "F5F5F5";

const STATUS_STYLE = {
    SCHEDULED:  { bg: "E3F2FD", fg: "0D47A1" },
    DEPARTED:   { bg: "E8F5E9", fg: "1B5E20" },
    ARRIVED:    { bg: "E8F5E9", fg: "1B5E20" },
    DELAYED:    { bg: "FFF8E1", fg: "E65100" },
    CANCELLED:  { bg: "FFEBEE", fg: "B71C1C" },
};

function cell(value, { bold=false, size=10, color=null, bg=null, hAlign="center", wrap=false, numFmt=null, borderColor="DDDDDD", borderBottom=null, borderTop=null } = {}) {
    const s = {
        font: { name: "Calibri", sz: size, bold, color: { rgb: color || "333333" } },
        alignment: { horizontal: hAlign, vertical: "center", wrapText: wrap },
        border: {
            top:    { style: borderTop    ? "medium" : "thin", color: { rgb: borderTop    || borderColor } },
            bottom: { style: borderBottom ? "medium" : "thin", color: { rgb: borderBottom || borderColor } },
            left:   { style: "thin", color: { rgb: borderColor } },
            right:  { style: "thin", color: { rgb: borderColor } },
        }
    };
    if (bg) s.fill = { fgColor: { rgb: bg }, patternType: "solid" };
    const c = { v: value, s };
    if (typeof value === 'number') c.t = 'n';
    else c.t = 's';
    if (numFmt) c.z = numFmt;
    return c;
}

function headerCell(value) {
    return cell(value, {
        bold: true, size: 10, color: WHITE, bg: DARK,
        borderBottom: RAM_RED, borderColor: DARK
    });
}

function titleCell(value, size=20) {
    return {
        v: value, t: 's',
        s: {
            font: { name: "Calibri", sz: size, bold: true, color: { rgb: WHITE } },
            fill: { fgColor: { rgb: RAM_RED }, patternType: "solid" },
            alignment: { horizontal: "center", vertical: "center", wrapText: true },
        }
    };
}

function kpiCell(label, val, bg, fg) {
    return {
        v: `${label}\n${val}`, t: 's',
        s: {
            font: { name: "Calibri", sz: 12, bold: true, color: { rgb: fg } },
            fill: { fgColor: { rgb: bg }, patternType: "solid" },
            alignment: { horizontal: "center", vertical: "center", wrapText: true },
        }
    };
}

function emptyCell(bg = WHITE) {
    return { v: "", t: 's', s: { fill: { fgColor: { rgb: bg }, patternType: "solid" } } };
}

// ════════════════════════════════════════════════════════════════════════════
// SHEET 1: Flight Manifest Register
// ════════════════════════════════════════════════════════════════════════════
function buildSheet1(flights, stats, dateStr) {
    const ws = {};
    const n = flights.length;
    const setCell = (addr, c) => { ws[addr] = c; };

    // Row 1 — Titre
    setCell("A1", titleCell("ROYAL AIR MAROC", 20));
    ["B1","C1","D1","E1","F1","G1","H1","I1"].forEach(a => setCell(a, emptyCell(RAM_RED)));

    // Row 2 — Sous-titre
    setCell("A2", titleCell("FLIGHT OPERATIONS DISPATCH CENTER", 11));
    ["B2","C2","D2","E2","F2","G2","H2","I2"].forEach(a => setCell(a, emptyCell(RAM_RED)));

    // Row 3 — Spacer
    ["A3","B3","C3","D3","E3","F3","G3","H3","I3"].forEach(a => setCell(a, emptyCell("EEEEEE")));

    // Row 4 — Titre registre + meta
    setCell("A4", { v: "FLIGHT MANIFEST REGISTER", t: 's', s: { font: { name:"Calibri", sz:14, bold:true, color:{rgb:RAM_RED} }, alignment:{horizontal:"left",vertical:"center"} } });
    ["B4","C4","D4"].forEach(a => setCell(a, emptyCell()));
    setCell("E4", { v: "Export Date:", t:'s', s:{ font:{name:"Calibri",sz:10,bold:true,color:{rgb:"555555"}}, alignment:{horizontal:"right",vertical:"center"} } });
    setCell("F4", { v: dateStr, t:'s', s:{ font:{name:"Calibri",sz:10,color:{rgb:"333333"}}, alignment:{horizontal:"left",vertical:"center"} } });
    setCell("G4", { v: "Total Movements:", t:'s', s:{ font:{name:"Calibri",sz:10,bold:true,color:{rgb:"555555"}}, alignment:{horizontal:"right",vertical:"center"} } });
    setCell("H4", { v: n, t:'n', s:{ font:{name:"Calibri",sz:10,bold:true,color:{rgb:RAM_RED}}, alignment:{horizontal:"left",vertical:"center"} } });

    // Row 5 — Spacer
    ["A5","B5","C5","D5","E5","F5","G5","H5","I5"].forEach(a => setCell(a, emptyCell()));

    // Row 6 — KPI Cards
    setCell("A6", kpiCell("TOTAL MOVEMENTS",  stats.total,     "E3F2FD", "0D47A1"));
    setCell("B6", emptyCell("E3F2FD"));
    setCell("C6", kpiCell("IN FLIGHT",        stats.departed,  "E8F5E9", "1B5E20"));
    setCell("D6", emptyCell("E8F5E9"));
    setCell("E6", kpiCell("ARRIVED",          stats.arrived,   "E8F5E9", "1B5E20"));
    setCell("F6", emptyCell("E8F5E9"));
    setCell("G6", kpiCell("DELAYED",          stats.delayed,   "FFF8E1", "E65100"));
    setCell("H6", emptyCell("FFF8E1"));
    setCell("I6", emptyCell("FFF8E1"));

    // Row 7 — Spacer
    ["A7","B7","C7","D7","E7","F7","G7","H7","I7"].forEach(a => setCell(a, emptyCell()));

    // Row 8 — Headers
    const cols = ["#","Flight No","Aircraft","Origin","Destination","Departure","Arrival","Status","Gate"];
    const letters = ["A","B","C","D","E","F","G","H","I"];
    cols.forEach((h,i) => setCell(`${letters[i]}8`, headerCell(h)));

    // Rows 9+ — Données
    flights.forEach((f, idx) => {
        const row = idx + 9;
        const bg  = idx % 2 === 1 ? ALT_ROW : WHITE;
        const status = f.status || "SCHEDULED";
        const st = STATUS_STYLE[status] || STATUS_STYLE.SCHEDULED;

        setCell(`A${row}`, cell(idx + 1,                { bg, size:9 }));
        setCell(`B${row}`, cell(f.flightNumber||"",     { bg, size:9, color:RAM_RED, bold:true }));
        setCell(`C${row}`, cell(f.aircraftRegistration||"TBD", { bg, size:9 }));
        setCell(`D${row}`, cell(f.origin||"",          { bg, size:9 }));
        setCell(`E${row}`, cell(f.destination||"",     { bg, size:9 }));
        setCell(`F${row}`, cell(f.scheduledDeparture ? new Date(f.scheduledDeparture).toLocaleString('fr-FR') : 'N/A', { bg, size:9 }));
        setCell(`G${row}`, cell(f.scheduledArrival ? new Date(f.scheduledArrival).toLocaleString('fr-FR') : 'N/A', { bg, size:9 }));
        setCell(`H${row}`, cell(status,                { bg:st.bg, size:9, color:st.fg, bold:true }));
        setCell(`I${row}`, cell(f.gate||"N/A",         { bg, size:9 }));
    });

    // Totals row
    const tr = n + 9;
    setCell(`A${tr}`, { v: `TOTAL  —  ${n} Movements`, t:'s', s:{ font:{name:"Calibri",sz:10,bold:true,color:{rgb:"333333"}}, fill:{fgColor:{rgb:TOTAL_BG},patternType:"solid"}, alignment:{horizontal:"right",vertical:"center"}, border:{top:{style:"medium",color:{rgb:RAM_RED}}} } });
    ["B","C","D","E","F","G"].forEach(c => setCell(`${c}${tr}`, emptyCell(TOTAL_BG)));
    setCell(`H${tr}`, { v: `${stats.departed} DEP / ${stats.arrived} ARR / ${stats.delayed} DLY`, t:'s', s:{ font:{name:"Calibri",sz:9,bold:true,color:{rgb:RAM_RED}}, fill:{fgColor:{rgb:TOTAL_BG},patternType:"solid"}, alignment:{horizontal:"center",vertical:"center"}, border:{top:{style:"medium",color:{rgb:RAM_RED}}} } });
    setCell(`I${tr}`, emptyCell(TOTAL_BG));

    ws['!merges'] = [
        {s:{r:0,c:0},e:{r:0,c:8}},
        {s:{r:1,c:0},e:{r:1,c:8}},
        {s:{r:2,c:0},e:{r:2,c:8}},
        {s:{r:3,c:0},e:{r:3,c:3}},
        {s:{r:5,c:0},e:{r:5,c:1}},
        {s:{r:5,c:2},e:{r:5,c:3}},
        {s:{r:5,c:4},e:{r:5,c:5}},
        {s:{r:5,c:6},e:{r:5,c:8}},
        {s:{r:tr-1,c:0},e:{r:tr-1,c:6}},
    ];

    ws['!cols'] = [
        {wch:5},{wch:14},{wch:16},{wch:10},{wch:10},{wch:22},{wch:22},{wch:14},{wch:10}
    ];

    ws['!rows'] = [
        {hpt:40},{hpt:22},{hpt:8},{hpt:28},{hpt:10},
        {hpt:48},{hpt:6},{hpt:24},
        ...Array(n).fill({hpt:18}),
        {hpt:22}
    ];

    ws['!ref'] = `A1:I${tr}`;
    return ws;
}

// ════════════════════════════════════════════════════════════════════════════
// SHEET 2: Operations Dashboard
// ════════════════════════════════════════════════════════════════════════════
function buildSheet2(flights, stats, dateStr) {
    const ws = {};
    const letters = ["A","B","C","D","E","F","G","H","I","J"];
    const setCell = (addr, c) => { ws[addr] = c; };

    setCell("A1", titleCell("FLIGHT OPERATIONS DASHBOARD", 16));
    letters.slice(1).forEach(l => setCell(`${l}1`, emptyCell(RAM_RED)));

    setCell("A2", titleCell(`Royal Air Maroc — Dispatch Center  |  Generated: ${dateStr}`, 10));
    letters.slice(1).forEach(l => setCell(`${l}2`, emptyCell(RAM_RED)));

    letters.forEach(l => setCell(`${l}3`, emptyCell()));

    const kpiStyle = (fg, bg) => ({
        font:{name:"Calibri",sz:13,bold:true,color:{rgb:fg}},
        fill:{fgColor:{rgb:bg},patternType:"solid"},
        alignment:{horizontal:"center",vertical:"center",wrapText:true},
        border:{top:{style:"medium",color:{rgb:fg}},bottom:{style:"medium",color:{rgb:fg}},left:{style:"medium",color:{rgb:fg}},right:{style:"medium",color:{rgb:fg}}}
    });

    const kpis = [
        ["B4","C5","TOTAL MOVEMENTS", flights.length,          "0D47A1","E3F2FD"],
        ["E4","F5","DEPARTED",        stats.departed,         "1B5E20","E8F5E9"],
        ["H4","I5","ARRIVED",         stats.arrived,          "1B5E20","E8F5E9"],
        ["B7","C8","DELAYED",         stats.delayed,          "E65100","FFF8E1"],
        ["E7","F8","CANCELLED",       flights.filter(f=>f.status==='CANCELLED').length, "B71C1C","FFEBEE"],
    ];
    kpis.forEach(([s,,lbl,val,fg,bg]) => {
        setCell(s, { v:`${lbl}\n${val}`, t:'s', s: kpiStyle(fg,bg) });
    });
    ["C4","C5","F4","F5","I4","I5","C7","C8","F7","F8"].forEach(a => setCell(a, emptyCell()));

    letters.forEach(l => setCell(`${l}10`, emptyCell()));

    setCell("B11", { v:"STATUS BREAKDOWN BY ROUTE", t:'s', s:{ font:{name:"Calibri",sz:11,bold:true,color:{rgb:RAM_RED}}, border:{bottom:{style:"medium",color:{rgb:RAM_RED}}} } });

    ["Route","SCHEDULED","DEPARTED","ARRIVED","DELAYED","CANCELLED","TOTAL"].forEach((h,i) => {
        setCell(`${["B","C","D","E","F","G","H"][i]}12`, {
            v:h, t:'s',
            s:{ font:{name:"Calibri",sz:9,bold:true,color:{rgb:WHITE}}, fill:{fgColor:{rgb:DARK},patternType:"solid"}, alignment:{horizontal:"center",vertical:"center"}, border:{top:{style:"thin",color:{rgb:DARK}},bottom:{style:"thin",color:{rgb:DARK}},left:{style:"thin",color:{rgb:DARK}},right:{style:"thin",color:{rgb:DARK}}} }
        });
    });

    const routes = [...new Set(flights.map(f => `${f.origin}-${f.destination}`))].sort();
    routes.forEach((route, ri) => {
        const row = 13 + ri;
        const rf = flights.filter(f => `${f.origin}-${f.destination}` === route);
        const s = rf.filter(f => f.status==='SCHEDULED').length;
        const d = rf.filter(f => f.status==='DEPARTED').length;
        const a = rf.filter(f => f.status==='ARRIVED').length;
        const dl = rf.filter(f => f.status==='DELAYED').length;
        const c = rf.filter(f => f.status==='CANCELLED').length;
        const t = rf.length;
        const bg = ri % 2 === 1 ? ALT_ROW : WHITE;
        [route,s,d,a,dl,c,t].forEach((val,ci) => {
            setCell(`${["B","C","D","E","F","G","H"][ci]}${row}`, {
                v:val, t: typeof val==='number'?'n':'s',
                s:{ font:{name:"Calibri",sz:9,bold:ci===0,color:{rgb:"333333"}}, fill:{fgColor:{rgb:bg},patternType:"solid"}, alignment:{horizontal:"center",vertical:"center"}, border:{top:{style:"thin",color:{rgb:"DDDDDD"}},bottom:{style:"thin",color:{rgb:"DDDDDD"}},left:{style:"thin",color:{rgb:"DDDDDD"}},right:{style:"thin",color:{rgb:"DDDDDD"}}} }
            });
        });
    });

    const tr2 = 13 + routes.length;
    const cancelled = flights.filter(f=>f.status==='CANCELLED').length;
    ["TOTAL", flights.filter(f=>f.status==='SCHEDULED').length, stats.departed, stats.arrived, stats.delayed, cancelled, flights.length].forEach((val,ci) => {
        setCell(`${["B","C","D","E","F","G","H"][ci]}${tr2}`, {
            v:val, t:typeof val==='number'?'n':'s',
            s:{ font:{name:"Calibri",sz:9,bold:true,color:{rgb:WHITE}}, fill:{fgColor:{rgb:RAM_RED},patternType:"solid"}, alignment:{horizontal:"center",vertical:"center"} }
        });
    });

    const fr = tr2 + 2;
    setCell(`B${fr}`, { v:`Generated by RAM Flight Operations  •  ${dateStr}`, t:'s', s:{ font:{name:"Calibri",sz:8,italic:true,color:{rgb:"999999"}}, alignment:{horizontal:"center"} } });

    ws['!merges'] = [
        {s:{r:0,c:0},e:{r:0,c:9}},
        {s:{r:1,c:0},e:{r:1,c:9}},
        {s:{r:3,c:1},e:{r:4,c:2}},
        {s:{r:3,c:4},e:{r:4,c:5}},
        {s:{r:3,c:7},e:{r:4,c:8}},
        {s:{r:6,c:1},e:{r:7,c:2}},
        {s:{r:6,c:4},e:{r:7,c:5}},
        {s:{r:10,c:1},e:{r:10,c:8}},
        {s:{r:fr-1,c:1},e:{r:fr-1,c:8}},
    ];

    ws['!cols'] = [{wch:3},{wch:16},{wch:14},{wch:14},{wch:14},{wch:14},{wch:14},{wch:14},{wch:3},{wch:3}];
    ws['!rows'] = [{hpt:36},{hpt:20},{hpt:14},...Array(10).fill({hpt:28})];
    ws['!ref'] = `A1:J${fr}`;
    return ws;
}

// ════════════════════════════════════════════════════════════════════════════
// SHEET 3: Delayed & Cancelled Operations
// ════════════════════════════════════════════════════════════════════════════
function buildSheet3(flights, dateStr) {
    const ws = {};
    const setCell = (addr, c) => { ws[addr] = c; };
    const letters = ["A","B","C","D","E","F","G","H"];

    setCell("A1", titleCell("OPERATIONS REQUIRING ATTENTION  —  DELAYS & CANCELLATIONS", 13));
    letters.slice(1).forEach(l => setCell(`${l}1`, emptyCell(RAM_RED)));

    setCell("A2", titleCell(`Audit Date: ${dateStr}  |  Exported from Flight Ops System`, 9));
    letters.slice(1).forEach(l => setCell(`${l}2`, emptyCell(RAM_RED)));

    letters.forEach(l => setCell(`${l}3`, emptyCell()));

    ["#","Flight No","Route","Aircraft","Departure","Status","Delay (min)","Priority"].forEach((h,i) => {
        setCell(`${letters[i]}4`, headerCell(h));
    });

    const attention = flights.filter(f => ["DELAYED","CANCELLED"].includes(f.status));
    attention.forEach((f, idx) => {
        const row = idx + 5;
        const status = f.status || "DELAYED";
        const st = STATUS_STYLE[status] || STATUS_STYLE.DELAYED;
        const priority = status === "CANCELLED" ? "CRITICAL" : "HIGH";

        setCell(`A${row}`, cell(idx+1,                              { bg:"FAFAFA", size:9 }));
        setCell(`B${row}`, cell(f.flightNumber||"",               { bg:"FAFAFA", size:9, color:RAM_RED, bold:true }));
        setCell(`C${row}`, cell(`${f.origin}-${f.destination}`,   { bg:"FAFAFA", size:9 }));
        setCell(`D${row}`, cell(f.aircraftRegistration||"TBD",    { bg:"FAFAFA", size:9 }));
        setCell(`E${row}`, cell(f.scheduledDeparture ? new Date(f.scheduledDeparture).toLocaleString('fr-FR') : 'N/A', { bg:"FAFAFA", size:9 }));
        setCell(`F${row}`, cell(status,                           { bg:st.bg, size:9, color:st.fg, bold:true }));
        setCell(`G${row}`, cell(f.delayMinutes||0,                { bg:"FAFAFA", size:9, numFmt:"#,##0" }));
        setCell(`H${row}`, cell(priority,                         { bg:st.bg, size:9, color:st.fg, bold:true }));
    });

    ws['!merges'] = [
        {s:{r:0,c:0},e:{r:0,c:7}},
        {s:{r:1,c:0},e:{r:1,c:7}},
    ];
    ws['!cols'] = [{wch:5},{wch:14},{wch:16},{wch:16},{wch:22},{wch:14},{wch:14},{wch:14}];
    ws['!ref'] = `A1:H${attention.length + 4}`;
    return ws;
}

// ════════════════════════════════════════════════════════════════════════════
// COMPONENT
// ════════════════════════════════════════════════════════════════════════════
const Flights = () => {
    const { state: globalState } = useAppData();
    const [flights, setFlights] = useState([]);
    const [aircraft, setAircraft] = useState([]);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    const [showModal, setShowModal] = useState(false);
    const [editingFlight, setEditingFlight] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const [formData, setFormData] = useState({
        flightNumber: '', aircraftId: '', origin: '', destination: '',
        scheduledDeparture: '', scheduledArrival: '', status: 'SCHEDULED', gate: '',
    });

    useEffect(() => { fetchData(); }, []);
    useEffect(() => { setCurrentPage(1); }, [searchTerm]);

    // Merge global store data whenever it changes
    useEffect(() => {
        if (globalState.flights && globalState.flights.length > 0) {
            setFlights(prev => {
                const mappedGlobalFlights = globalState.flights.map(f => ({
                    id: f.Flight_Number || f.id,
                    flightNumber: f.Flight_Number || f.flightNumber,
                    origin: f.Origin || f.origin,
                    destination: f.Destination || f.destination,
                    route: f.Route || f.route,
                    scheduledDeparture: f.Departure_Time || f.scheduledDeparture,
                    scheduledArrival: f.Arrival_Time || f.scheduledArrival,
                    flightDate: f.Flight_Date || f.flightDate,
                    status: f.Status || f.status,
                    delayInfo: f.Delay_Info || f.delayInfo,
                    aircraftRegistration: f.Aircraft || f.aircraftRegistration,
                    aircraftType: f.Aircraft_Type || f.aircraftType,
                    gate: f.Gate || f.gate,
                    flightType: f.Flight_Type || f.flightType,
                    flightDurationMin: f.Flight_Duration_Min || f.flightDurationMin,
                }));
                const existingIds = new Set(prev.map(f => f.id));
                const newFlights = mappedGlobalFlights.filter(f => !existingIds.has(f.id));
                return [...prev, ...newFlights];
            });
        }
    }, [globalState.flights]);

    async function fetchData() {
        try {
            setLoading(true);
            setError(null);
            const [flightsRes, aircraftRes] = await Promise.all([
                flightAPI.getAll(),
                aircraftAPI.getAll(),
            ]);
            setFlights(flightsRes.data || []);
            setAircraft(aircraftRes.data?.filter(a => a.status === 'ACTIVE') || []);
        } catch (err) {
            logApiError('Flight Load', err);
            setError('PostgreSQL cluster synchronization failed.');
        } finally {
            setLoading(false);
        }
    }

    const filteredFlights = useMemo(() =>
            flights.filter(f => {
                const term = searchTerm.toLowerCase();
                return (
                    f.flightNumber?.toLowerCase().includes(term) ||
                    f.origin?.toLowerCase().includes(term) ||
                    f.destination?.toLowerCase().includes(term) ||
                    f.aircraftRegistration?.toLowerCase().includes(term)
                );
            })
        , [flights, searchTerm]);

    const totalPages = Math.ceil(filteredFlights.length / ITEMS_PER_PAGE) || 1;
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedFlights = useMemo(() =>
            filteredFlights.slice(startIndex, startIndex + ITEMS_PER_PAGE)
        , [filteredFlights, startIndex]);

    const stats = useMemo(() => ({
        total: flights.length,
        departed: flights.filter(f => f.status === 'DEPARTED').length,
        arrived: flights.filter(f => f.status === 'ARRIVED').length,
        delayed: flights.filter(f => f.status === 'DELAYED').length,
        cancelled: flights.filter(f => f.status === 'CANCELLED').length,
    }), [flights]);

    // ── Export Excel stylisé ─────────────────────────────────────────────
    const handleExport = () => {
        setExporting(true);
        try {
            const dateStr = new Date().toLocaleDateString('fr-FR');
            const wb = XLSXStyle.utils.book_new();

            XLSXStyle.utils.book_append_sheet(wb, buildSheet1(filteredFlights, stats, dateStr), "Flight Manifest");
            XLSXStyle.utils.book_append_sheet(wb, buildSheet2(filteredFlights, stats, dateStr), "Ops Dashboard");
            XLSXStyle.utils.book_append_sheet(wb, buildSheet3(filteredFlights, dateStr), "Delays & Cancellations");

            const fileName = `RAM_Flight_Operations_${new Date().toISOString().slice(0,10)}.xlsx`;
            XLSXStyle.writeFile(wb, fileName);
        } catch (err) {
            console.error('Export failed:', err);
            setError('Generation of operational report failed.');
        } finally {
            setExporting(false);
        }
    };

    const handleOpenModal = (flight = null) => {
        if (flight) {
            setEditingFlight(flight);
            setFormData({
                flightNumber: flight.flightNumber,
                aircraftId: flight.aircraftId || '',
                origin: flight.origin,
                destination: flight.destination,
                scheduledDeparture: flight.scheduledDeparture ? new Date(flight.scheduledDeparture).toISOString().slice(0, 16) : '',
                scheduledArrival: flight.scheduledArrival ? new Date(flight.scheduledArrival).toISOString().slice(0, 16) : '',
                status: flight.status,
                gate: flight.gate || '',
            });
        } else {
            setEditingFlight(null);
            setFormData({
                flightNumber: '', aircraftId: '', origin: '', destination: '',
                scheduledDeparture: '', scheduledArrival: '', status: 'SCHEDULED', gate: '',
            });
        }
        setShowModal(true);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const payload = {
                ...formData,
                scheduledDeparture: new Date(formData.scheduledDeparture).toISOString(),
                scheduledArrival: new Date(formData.scheduledArrival).toISOString(),
            };
            if (editingFlight) {
                await flightAPI.update(editingFlight.id, payload);
            } else {
                await flightAPI.create(payload);
            }
            await fetchData();
            setShowModal(false);
            setEditingFlight(null);
            setFormData({ flightNumber: '', aircraftId: '', origin: '', destination: '', scheduledDeparture: '', scheduledArrival: '', status: 'SCHEDULED', gate: '' });
        } catch (err) {
            logApiError('Flight Submit', err);
            setError(`Transaction failed: ${err.response?.data?.message || err.message}`);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteClick = (flight) => {
        setDeleteTarget(flight);
        setShowDeleteConfirm(true);
    };

    const handleCancelDelete = () => {
        setShowDeleteConfirm(false);
        setDeleteTarget(null);
    };

    const handleConfirmDelete = async () => {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            await flightAPI.delete(deleteTarget.id);
            await fetchData();
            setShowDeleteConfirm(false);
            setDeleteTarget(null);
            setError(null);
        } catch (err) {
            logApiError('Delete Flight', err);
            setError(`Failed to remove flight ${deleteTarget.flightNumber}: ${err.response?.data?.message || err.message}`);
        } finally {
            setDeleting(false);
        }
    };

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) setCurrentPage(page);
    };

    if (loading) return (
        <div className="bg-slate-50 flex flex-col items-center justify-center p-8 min-h-[60vh]">
            <Loader2 className="w-10 h-10 animate-spin text-ram-red mb-4" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Establishing Flight Link...</p>
        </div>
    );

    return (
        <div className="bg-[#F8FAFC] p-6 lg:p-10 font-sans">
            {/* Header */}
            <header className="mb-8 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 border-b border-slate-200 pb-8">
                <div className="flex items-center gap-4">
                    <div className="transition-transform hover:scale-105"><Logo className="h-12" /></div>
                    <div className="h-10 w-px bg-slate-200 hidden lg:block" />
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Flight Dispatch</span>
                        </div>
                        <h1 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tighter uppercase">
                            Network <span className="text-ram-red italic">Operations</span>
                        </h1>
                    </div>
                </div>
                <div className="flex gap-3 w-full lg:w-auto">
                    <div className="relative flex-1 lg:flex-none">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                        <input
                            type="text"
                            placeholder="Filter by Flight No, Origin, Destination..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full lg:w-72 pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-ram-red/20 focus:border-ram-red transition-all"
                        />
                    </div>
                    <button
                        onClick={handleExport}
                        disabled={exporting}
                        className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all shadow-sm disabled:opacity-50 whitespace-nowrap"
                    >
                        {exporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                        {exporting ? 'Generating...' : 'Export'}
                    </button>
                    <button
                        onClick={() => handleOpenModal()}
                        className="flex items-center gap-2 px-5 py-3 bg-ram-red text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:shadow-lg shadow-ram-red/20 transition-all active:scale-95 whitespace-nowrap"
                    >
                        <Plus size={14} /> Schedule
                    </button>
                </div>
            </header>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                    { label: 'Total Movements', value: stats.total, icon: Globe, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'In Flight', value: stats.departed, icon: Plane, color: 'text-ram-red', bg: 'bg-red-50' },
                    { label: 'Arrived', value: stats.arrived, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    { label: 'Delayed', value: stats.delayed, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm flex items-center justify-between group hover:border-ram-red/20 transition-all">
                        <div className="min-w-0">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 truncate">{stat.label}</p>
                            <p className="text-xl lg:text-2xl font-black text-slate-900 tabular-nums">{stat.value}</p>
                        </div>
                        <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} transition-transform group-hover:scale-110 flex-shrink-0`}>
                            <stat.icon size={18} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Tableau principal */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm">
                <div className="w-full">
                    <table className="w-full text-left table-fixed">
                        <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-100">
                            <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest w-[26%]">Identification</th>
                            <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest w-[24%]">Sector / Route</th>
                            <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest w-[18%]">Timeline</th>
                            <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest w-[16%]">Status</th>
                            <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right w-[16%]">Control</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                        {paginatedFlights.length > 0 ? paginatedFlights.map((f) => (
                            <tr key={f.id} className="hover:bg-slate-50/50 transition-colors group">
                                <td className="px-6 py-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-ram-red group-hover:bg-ram-red group-hover:text-white transition-all flex-shrink-0">
                                            <Navigation size={20} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-base font-black text-slate-900 tracking-tighter uppercase truncate">{f.flightNumber}</p>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest truncate">{f.aircraftRegistration || 'TBD'}</span>
                                                {f.gate && <span className="px-1.5 py-0.5 bg-slate-100 rounded text-[8px] font-black text-slate-500 uppercase flex-shrink-0">G{f.gate}</span>}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-6">
                                    <div className="flex items-center gap-3">
                                        <div className="text-center min-w-0">
                                            <p className="text-lg font-black text-slate-700 tracking-tighter">{f.origin}</p>
                                            <p className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">ORIG</p>
                                        </div>
                                        <div className="flex flex-col items-center opacity-30 flex-shrink-0">
                                            <ArrowUpRight size={12} className="text-ram-red" />
                                            <div className="h-[1px] w-8 bg-slate-400" />
                                        </div>
                                        <div className="text-center min-w-0">
                                            <p className="text-lg font-black text-slate-700 tracking-tighter">{f.destination}</p>
                                            <p className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">DEST</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-6">
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2">
                                            <Clock size={12} className="text-ram-red flex-shrink-0" />
                                            <span className="font-mono text-sm font-black text-slate-700 tabular-nums">
                                                    {new Date(f.scheduledDeparture).toLocaleTimeString('fr-FR', {hour:'2-digit', minute:'2-digit'})}
                                                </span>
                                        </div>
                                        <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Scheduled UTC</p>
                                    </div>
                                </td>
                                <td className="px-6 py-6">
                                    <div className="flex items-center gap-2">
                                            <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                                                f.status === 'ARRIVED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                    f.status === 'DEPARTED' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                                        f.status === 'DELAYED' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                                            'bg-slate-100 text-slate-500 border-slate-200'
                                            }`}>
                                                <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${f.status === 'DEPARTED' ? 'bg-blue-500 animate-pulse' : 'bg-current'}`} />
                                                <span className="truncate">{f.status}</span>
                                            </span>
                                        {f.delayMinutes > 0 && <span className="text-[10px] font-black text-ram-red flex-shrink-0">+{f.delayMinutes}m</span>}
                                    </div>
                                </td>
                                <td className="px-6 py-6 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            onClick={() => handleOpenModal(f)}
                                            className="p-2.5 bg-white border border-slate-100 text-slate-400 hover:text-ram-red hover:border-ram-red/30 rounded-xl transition-all shadow-sm"
                                            title="Edit flight"
                                        >
                                            <Pencil size={14} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteClick(f)}
                                            className="p-2.5 bg-white border border-slate-100 text-slate-400 hover:text-red-600 hover:border-red-200 rounded-xl transition-all shadow-sm"
                                            title="Delete flight"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="5" className="px-6 py-20 text-center">
                                    <div className="flex flex-col items-center gap-3">
                                        <Route size={32} className="text-slate-200" />
                                        <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.4em]">No active movements in sector</p>
                                        <p className="text-slate-300 text-[10px]">Schedule a new movement to begin operations</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="px-6 py-6 border-t border-slate-50 flex items-center justify-between bg-slate-50/30">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, filteredFlights.length)} of {filteredFlights.length} movements
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="p-2.5 bg-white border border-slate-200 rounded-lg text-slate-400 disabled:opacity-30 transition-all shadow-sm hover:border-slate-300"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <span className="text-xs font-black text-slate-600 tabular-nums px-3">
                                {currentPage} / {totalPages}
                            </span>
                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="p-2.5 bg-white border border-slate-200 rounded-lg text-slate-400 disabled:opacity-30 transition-all shadow-sm hover:border-slate-300"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal Add/Edit */}
            <Modal
                isOpen={showModal}
                onClose={() => { setShowModal(false); setEditingFlight(null); }}
                title={editingFlight ? 'Modify Flight Movement' : 'Schedule New Movement'}
            >
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <p className="text-slate-500 text-sm font-medium italic border-b border-slate-100 pb-3">
                        {editingFlight ? 'Update operational flight data.' : 'Enter flight movement details for dispatch.'}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Flight Number</label>
                            <input
                                name="flightNumber"
                                value={formData.flightNumber}
                                onChange={handleInputChange}
                                required
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-ram-red/20 focus:border-ram-red transition-all uppercase"
                                placeholder="e.g. AT420"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Aircraft</label>
                            <select
                                name="aircraftId"
                                value={formData.aircraftId}
                                onChange={handleInputChange}
                                required
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-ram-red/20 focus:border-ram-red transition-all appearance-none"
                            >
                                <option value="">Select Aircraft</option>
                                {aircraft.map(ac => (
                                    <option key={ac.id} value={ac.id}>
                                        {ac.registration} — {ac.model}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Origin</label>
                            <input
                                name="origin"
                                value={formData.origin}
                                onChange={handleInputChange}
                                required
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-ram-red/20 focus:border-ram-red transition-all uppercase"
                                placeholder="e.g. CMN"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Destination</label>
                            <input
                                name="destination"
                                value={formData.destination}
                                onChange={handleInputChange}
                                required
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-ram-red/20 focus:border-ram-red transition-all uppercase"
                                placeholder="e.g. CDG"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Departure (UTC)</label>
                            <input
                                name="scheduledDeparture"
                                type="datetime-local"
                                value={formData.scheduledDeparture}
                                onChange={handleInputChange}
                                required
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-ram-red/20 focus:border-ram-red transition-all"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Arrival (UTC)</label>
                            <input
                                name="scheduledArrival"
                                type="datetime-local"
                                value={formData.scheduledArrival}
                                onChange={handleInputChange}
                                required
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-ram-red/20 focus:border-ram-red transition-all"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-ram-red/20 focus:border-ram-red transition-all appearance-none"
                            >
                                <option value="SCHEDULED">SCHEDULED</option>
                                <option value="DEPARTED">DEPARTED</option>
                                <option value="ARRIVED">ARRIVED</option>
                                <option value="DELAYED">DELAYED</option>
                                <option value="CANCELLED">CANCELLED</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Gate</label>
                            <input
                                name="gate"
                                value={formData.gate}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-ram-red/20 focus:border-ram-red transition-all uppercase"
                                placeholder="e.g. A12"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={() => { setShowModal(false); setEditingFlight(null); }}
                            className="px-6 py-3 font-black text-xs uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            Abort
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-ram-red transition-all disabled:opacity-50 flex items-center gap-2"
                        >
                            {submitting ? <Loader2 size={14} className="animate-spin" /> : null}
                            {submitting ? 'Processing...' : (editingFlight ? 'Update Movement' : 'Schedule Movement')}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Dialog de confirmation suppression */}
            <ConfirmDialog
                isOpen={showDeleteConfirm}
                onClose={handleCancelDelete}
                onConfirm={handleConfirmDelete}
                title="Confirm Flight Removal"
                message={deleteTarget ? `Permanently remove flight ${deleteTarget.flightNumber} (${deleteTarget.origin} → ${deleteTarget.destination}) from operations? This action cannot be undone.` : ''}
                confirmText={deleting ? 'Removing...' : 'Confirm Removal'}
                cancelText="Cancel"
                confirmVariant="danger"
                isLoading={deleting}
            />

            {/* Toast d'erreur */}
            {error && (
                <div className="fixed bottom-8 right-8 bg-red-600 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 z-50 animate-in slide-in-from-bottom-4">
                    <AlertCircle size={18} />
                    <span className="text-[10px] font-black uppercase tracking-widest">{error}</span>
                    <button onClick={() => setError(null)} className="ml-2 opacity-60 hover:opacity-100 font-bold text-lg leading-none">×</button>
                </div>
            )}
        </div>
    );
};

export default Flights;