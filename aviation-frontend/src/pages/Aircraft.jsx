import { useState, useEffect, useMemo } from 'react';
import { Download, Plus, Loader2, Pencil, Trash2, ChevronLeft, ChevronRight, Plane, Box, Clock, ShieldCheck, AlertCircle, Activity } from 'lucide-react';
import { aircraftAPI, logApiError } from '../services/api';
import Modal from '../components/UI/Modal';
import ConfirmDialog from '../components/UI/ConfirmDialog';
import Logo from '../components/UI/Logo';
import XLSXStyle from 'xlsx-js-style';

const ITEMS_PER_PAGE = 8;

// ── Helpers de style Excel ─────────────────────────────────────────────────
const RAM_RED  = "CC0000";
const DARK     = "2D2D2D";
const WHITE    = "FFFFFF";
const ALT_ROW  = "FFF5F5";
const TOTAL_BG = "F5F5F5";

const STATUS_STYLE = {
    ACTIVE:      { bg: "E8F5E9", fg: "1B5E20" },
    MAINTENANCE: { bg: "FFF8E1", fg: "E65100" },
    GROUNDED:    { bg: "FFEBEE", fg: "B71C1C" },
    INACTIVE:    { bg: "FFEBEE", fg: "B71C1C" },
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

function buildSheet1(fleet, stats, dateStr) {
    const ws = {};
    const n = fleet.length;
    const setCell = (addr, c) => { ws[addr] = c; };

    // Row 1 — Titre
    setCell("A1", titleCell("ROYAL AIR MAROC", 20));
    ["B1","C1","D1","E1","F1","G1","H1"].forEach(a => setCell(a, emptyCell(RAM_RED)));

    // Row 2 — Sous-titre
    setCell("A2", titleCell("CONTINUING AIRWORTHINESS MANAGEMENT ORGANIZATION (CAMO)", 11));
    ["B2","C2","D2","E2","F2","G2","H2"].forEach(a => setCell(a, emptyCell(RAM_RED)));

    // Row 3 — Spacer
    ["A3","B3","C3","D3","E3","F3","G3","H3"].forEach(a => setCell(a, emptyCell("EEEEEE")));

    // Row 4 — Titre registre + meta
    setCell("A4", { v: "FLEET INVENTORY REGISTER", t: 's', s: { font: { name:"Calibri", sz:14, bold:true, color:{rgb:RAM_RED} }, alignment:{horizontal:"left",vertical:"center"} } });
    ["B4","C4","D4"].forEach(a => setCell(a, emptyCell()));
    setCell("E4", { v: "Export Date:", t:'s', s:{ font:{name:"Calibri",sz:10,bold:true,color:{rgb:"555555"}}, alignment:{horizontal:"right",vertical:"center"} } });
    setCell("F4", { v: dateStr, t:'s', s:{ font:{name:"Calibri",sz:10,color:{rgb:"333333"}}, alignment:{horizontal:"left",vertical:"center"} } });
    setCell("G4", { v: "Total Aircraft:", t:'s', s:{ font:{name:"Calibri",sz:10,bold:true,color:{rgb:"555555"}}, alignment:{horizontal:"right",vertical:"center"} } });
    setCell("H4", { v: n, t:'n', s:{ font:{name:"Calibri",sz:10,bold:true,color:{rgb:RAM_RED}}, alignment:{horizontal:"left",vertical:"center"} } });

    // Row 5 — Spacer
    ["A5","B5","C5","D5","E5","F5","G5","H5"].forEach(a => setCell(a, emptyCell()));

    // Row 6 — KPI Cards
    setCell("A6", kpiCell("ACTIVE FLEET",     stats.active,      "E8F5E9", "1B5E20"));
    setCell("B6", emptyCell("E8F5E9"));
    setCell("C6", kpiCell("IN MAINTENANCE",   stats.maintenance, "FFF8E1", "E65100"));
    setCell("D6", emptyCell("FFF8E1"));
    setCell("E6", kpiCell("GROUNDED",         stats.grounded,    "FFEBEE", "B71C1C"));
    setCell("F6", emptyCell("FFEBEE"));
    setCell("G6", kpiCell("TOTAL FLIGHT HRS", stats.totalHours.toLocaleString(), "EEF2FF", "1A237E"));
    setCell("H6", emptyCell("EEF2FF"));

    // Row 7 — Spacer
    ["A7","B7","C7","D7","E7","F7","G7","H7"].forEach(a => setCell(a, emptyCell()));

    // Row 8 — Headers
    const cols = ["#","Registration","Type","Manufacturer","Model","Flight Hours","Status","Audit Date"];
    const letters = ["A","B","C","D","E","F","G","H"];
    cols.forEach((h,i) => setCell(`${letters[i]}8`, headerCell(h)));

    // Rows 9+ — Données
    fleet.forEach((ac, idx) => {
        const row = idx + 9;
        const bg  = idx % 2 === 1 ? ALT_ROW : WHITE;
        const status = ac.status || "GROUNDED";
        const st = STATUS_STYLE[status] || STATUS_STYLE.GROUNDED;

        setCell(`A${row}`, cell(idx + 1,             { bg, size:9 }));
        setCell(`B${row}`, cell(ac.registration||"", { bg, size:9, color:RAM_RED, bold:true }));
        setCell(`C${row}`, cell(ac.type||"N/A",      { bg, size:9 }));
        setCell(`D${row}`, cell(ac.manufacturer||"", { bg, size:9 }));
        setCell(`E${row}`, cell(ac.model||"",        { bg, size:9 }));
        setCell(`F${row}`, cell(ac.totalFlightHours||0, { bg, size:9, numFmt:"#,##0" }));
        setCell(`G${row}`, cell(status,              { bg:st.bg, size:9, color:st.fg, bold:true }));
        setCell(`H${row}`, cell(dateStr,             { bg, size:9 }));
    });

    // Totals row
    const tr = n + 9;
    setCell(`A${tr}`, { v: `TOTAL  —  ${n} Aircraft`, t:'s', s:{ font:{name:"Calibri",sz:10,bold:true,color:{rgb:"333333"}}, fill:{fgColor:{rgb:TOTAL_BG},patternType:"solid"}, alignment:{horizontal:"right",vertical:"center"}, border:{top:{style:"medium",color:{rgb:RAM_RED}}} } });
    ["B","C","D","E"].forEach(c => setCell(`${c}${tr}`, emptyCell(TOTAL_BG)));
    setCell(`F${tr}`, { v: stats.totalHours, t:'n', z:"#,##0", s:{ font:{name:"Calibri",sz:10,bold:true,color:{rgb:RAM_RED}}, fill:{fgColor:{rgb:TOTAL_BG},patternType:"solid"}, alignment:{horizontal:"center",vertical:"center"}, border:{top:{style:"medium",color:{rgb:RAM_RED}}} } });
    ["G","H"].forEach(c => setCell(`${c}${tr}`, emptyCell(TOTAL_BG)));

    // Merges
    ws['!merges'] = [
        {s:{r:0,c:0},e:{r:0,c:7}},
        {s:{r:1,c:0},e:{r:1,c:7}},
        {s:{r:2,c:0},e:{r:2,c:7}},
        {s:{r:3,c:0},e:{r:3,c:3}},
        {s:{r:5,c:0},e:{r:5,c:1}},
        {s:{r:5,c:2},e:{r:5,c:3}},
        {s:{r:5,c:4},e:{r:5,c:5}},
        {s:{r:5,c:6},e:{r:5,c:7}},
        {s:{r:tr-1,c:0},e:{r:tr-1,c:4}},
    ];

    ws['!cols'] = [
        {wch:5},{wch:14},{wch:22},{wch:14},{wch:14},{wch:16},{wch:16},{wch:14}
    ];

    ws['!rows'] = [
        {hpt:40},{hpt:22},{hpt:8},{hpt:28},{hpt:10},
        {hpt:48},{hpt:6},{hpt:24},
        ...Array(n).fill({hpt:18}),
        {hpt:22}
    ];

    ws['!ref'] = `A1:H${tr}`;
    return ws;
}

function buildSheet2(fleet, stats, dateStr) {
    const ws = {};
    const letters = ["A","B","C","D","E","F","G","H","I","J"];
    const setCell = (addr, c) => { ws[addr] = c; };

    setCell("A1", titleCell("FLEET STATUS SUMMARY DASHBOARD", 16));
    letters.slice(1).forEach(l => setCell(`${l}1`, emptyCell(RAM_RED)));

    setCell("A2", titleCell(`Royal Air Maroc — CAMO Operations  |  Audit Date: ${dateStr}`, 10));
    letters.slice(1).forEach(l => setCell(`${l}2`, emptyCell(RAM_RED)));

    letters.forEach(l => setCell(`${l}3`, emptyCell()));

    const kpiStyle = (fg, bg) => ({
        font:{name:"Calibri",sz:13,bold:true,color:{rgb:fg}},
        fill:{fgColor:{rgb:bg},patternType:"solid"},
        alignment:{horizontal:"center",vertical:"center",wrapText:true},
        border:{top:{style:"medium",color:{rgb:fg}},bottom:{style:"medium",color:{rgb:fg}},left:{style:"medium",color:{rgb:fg}},right:{style:"medium",color:{rgb:fg}}}
    });

    const kpis = [
        ["B4","C5","TOTAL ASSETS",   fleet.length,             "1A237E","EEF2FF"],
        ["E4","F5","ACTIVE FLEET",   stats.active,             "1B5E20","E8F5E9"],
        ["H4","I5","IN MAINTENANCE", stats.maintenance,        "E65100","FFF8E1"],
        ["B7","C8","GROUNDED",       stats.grounded,           "B71C1C","FFEBEE"],
        ["E7","F8","TOTAL FH",       stats.totalHours.toLocaleString(), "4A148C","F3E5F5"],
    ];
    kpis.forEach(([s,,lbl,val,fg,bg]) => {
        setCell(s, { v:`${lbl}\n${val}`, t:'s', s: kpiStyle(fg,bg) });
    });
    ["C4","C5","F4","F5","I4","I5","C7","C8","F7","F8"].forEach(a => setCell(a, emptyCell()));

    letters.forEach(l => setCell(`${l}10`, emptyCell()));

    setCell("B11", { v:"STATUS BREAKDOWN BY MANUFACTURER", t:'s', s:{ font:{name:"Calibri",sz:11,bold:true,color:{rgb:RAM_RED}}, border:{bottom:{style:"medium",color:{rgb:RAM_RED}}} } });

    ["Manufacturer","ACTIVE","MAINTENANCE","GROUNDED","TOTAL","% Active"].forEach((h,i) => {
        setCell(`${["B","C","D","E","F","G"][i]}12`, {
            v:h, t:'s',
            s:{ font:{name:"Calibri",sz:9,bold:true,color:{rgb:WHITE}}, fill:{fgColor:{rgb:DARK},patternType:"solid"}, alignment:{horizontal:"center",vertical:"center"}, border:{top:{style:"thin",color:{rgb:DARK}},bottom:{style:"thin",color:{rgb:DARK}},left:{style:"thin",color:{rgb:DARK}},right:{style:"thin",color:{rgb:DARK}}} }
        });
    });

    const manufacturers = [...new Set(fleet.map(r => r.manufacturer).filter(Boolean))].sort();
    manufacturers.forEach((mfr, mi) => {
        const row = 13 + mi;
        const mf  = fleet.filter(r => r.manufacturer === mfr);
        const a   = mf.filter(r => r.status==="ACTIVE").length;
        const m   = mf.filter(r => r.status==="MAINTENANCE").length;
        const g   = mf.filter(r => ["GROUNDED","INACTIVE"].includes(r.status)).length;
        const t   = mf.length;
        const bg  = mi % 2 === 1 ? ALT_ROW : WHITE;
        const pct = t ? `${Math.round(a/t*100)}%` : "0%";
        [mfr,a,m,g,t,pct].forEach((val,ci) => {
            setCell(`${["B","C","D","E","F","G"][ci]}${row}`, {
                v:val, t: typeof val==='number'?'n':'s',
                s:{ font:{name:"Calibri",sz:9,bold:ci===0,color:{rgb:"333333"}}, fill:{fgColor:{rgb:bg},patternType:"solid"}, alignment:{horizontal:"center",vertical:"center"}, border:{top:{style:"thin",color:{rgb:"DDDDDD"}},bottom:{style:"thin",color:{rgb:"DDDDDD"}},left:{style:"thin",color:{rgb:"DDDDDD"}},right:{style:"thin",color:{rgb:"DDDDDD"}}} }
            });
        });
    });

    const tr2 = 13 + manufacturers.length;
    const totalPct = fleet.length ? `${Math.round(stats.active/fleet.length*100)}%` : "0%";
    ["TOTAL", stats.active, stats.maintenance, stats.grounded, fleet.length, totalPct].forEach((val,ci) => {
        setCell(`${["B","C","D","E","F","G"][ci]}${tr2}`, {
            v:val, t:typeof val==='number'?'n':'s',
            s:{ font:{name:"Calibri",sz:9,bold:true,color:{rgb:WHITE}}, fill:{fgColor:{rgb:RAM_RED},patternType:"solid"}, alignment:{horizontal:"center",vertical:"center"} }
        });
    });

    const fr = tr2 + 2;
    setCell(`B${fr}`, { v:`Generated by RAM CAMO Reporting Platform  •  ${dateStr}`, t:'s', s:{ font:{name:"Calibri",sz:8,italic:true,color:{rgb:"999999"}}, alignment:{horizontal:"center"} } });

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

    ws['!cols'] = [{wch:3},{wch:16},{wch:16},{wch:3},{wch:16},{wch:16},{wch:14},{wch:3},{wch:16},{wch:3}];
    ws['!rows'] = [{hpt:36},{hpt:20},{hpt:14},...Array(10).fill({hpt:28})];
    ws['!ref'] = `A1:J${fr}`;
    return ws;
}

function buildSheet3(fleet, dateStr) {
    const ws = {};
    const setCell = (addr, c) => { ws[addr] = c; };
    const letters = ["A","B","C","D","E","F","G"];

    setCell("A1", titleCell("AIRCRAFT REQUIRING ATTENTION  —  MAINTENANCE & GROUNDED", 13));
    letters.slice(1).forEach(l => setCell(`${l}1`, emptyCell(RAM_RED)));

    setCell("A2", titleCell(`Audit Date: ${dateStr}  |  Exported from CAMO System`, 9));
    letters.slice(1).forEach(l => setCell(`${l}2`, emptyCell(RAM_RED)));

    letters.forEach(l => setCell(`${l}3`, emptyCell()));

    ["#","Registration","Aircraft Type","Manufacturer","Flight Hours","Status","Priority"].forEach((h,i) => {
        setCell(`${letters[i]}4`, headerCell(h));
    });

    const attention = fleet.filter(r => ["MAINTENANCE","GROUNDED","INACTIVE"].includes(r.status));
    attention.forEach((ac, idx) => {
        const row    = idx + 5;
        const status = ac.status || "GROUNDED";
        const st     = STATUS_STYLE[status] || STATUS_STYLE.GROUNDED;
        const priority = status === "MAINTENANCE" ? "SCHEDULED" : "UNSERVICEABLE";

        setCell(`A${row}`, cell(idx+1,                       { bg:"FAFAFA", size:9 }));
        setCell(`B${row}`, cell(ac.registration||"",         { bg:"FAFAFA", size:9, color:RAM_RED, bold:true }));
        setCell(`C${row}`, cell(ac.type||"",                 { bg:"FAFAFA", size:9 }));
        setCell(`D${row}`, cell(ac.manufacturer||"",         { bg:"FAFAFA", size:9 }));
        setCell(`E${row}`, cell(ac.totalFlightHours||0,      { bg:"FAFAFA", size:9, numFmt:"#,##0" }));
        setCell(`F${row}`, cell(status,                      { bg:st.bg, size:9, color:st.fg, bold:true }));
        setCell(`G${row}`, cell(priority,                    { bg:st.bg, size:9, color:st.fg, bold:true }));
    });

    ws['!merges'] = [
        {s:{r:0,c:0},e:{r:0,c:6}},
        {s:{r:1,c:0},e:{r:1,c:6}},
    ];
    ws['!cols'] = [{wch:5},{wch:14},{wch:24},{wch:14},{wch:16},{wch:18},{wch:14}];
    ws['!ref'] = `A1:G${attention.length + 4}`;
    return ws;
}

// ════════════════════════════════════════════════════════════════════════════
const Aircraft = () => {
    const [fleet, setFleet] = useState([]);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [showModal, setShowModal] = useState(false);
    const [editingAircraft, setEditingAircraft] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    // ── États pour la suppression ──────────────────────────────────────────
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deletingAircraft, setDeletingAircraft] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const [formData, setFormData] = useState({
        registration: '', type: '', model: '', manufacturer: '', status: 'ACTIVE', totalFlightHours: 0
    });

    useEffect(() => { fetchAircraft(); }, []);

    async function fetchAircraft() {
        try {
            setLoading(true);
            const response = await aircraftAPI.getAll();
            setFleet(response.data || []);
            setError(null);
        } catch (err) {
            logApiError('Fleet Load', err);
            setError('Operational database synchronization failed.');
        } finally {
            setLoading(false);
        }
    }

    const filteredFleet = useMemo(() =>
        fleet.filter(ac =>
            ac.registration?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ac.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ac.manufacturer?.toLowerCase().includes(searchTerm.toLowerCase())
        ), [fleet, searchTerm]);

    const totalPages = Math.ceil(filteredFleet.length / ITEMS_PER_PAGE) || 1;
    const paginatedFleet = useMemo(() =>
            filteredFleet.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE),
        [filteredFleet, currentPage]);

    const stats = useMemo(() => ({
        total:      fleet.length,
        active:     fleet.filter(a => a.status === 'ACTIVE').length,
        maintenance:fleet.filter(a => a.status === 'MAINTENANCE').length,
        grounded:   fleet.filter(a => a.status === 'GROUNDED' || a.status === 'INACTIVE').length,
        totalHours: fleet.reduce((acc, curr) => acc + (curr.totalFlightHours || 0), 0)
    }), [fleet]);

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) setCurrentPage(page);
    };

    const handleExport = () => {
        setExporting(true);
        try {
            const dateStr = new Date().toLocaleDateString('fr-FR');
            const wb = XLSXStyle.utils.book_new();

            XLSXStyle.utils.book_append_sheet(wb, buildSheet1(filteredFleet, stats, dateStr), "Fleet Inventory");
            XLSXStyle.utils.book_append_sheet(wb, buildSheet2(filteredFleet, stats, dateStr), "Summary Dashboard");
            XLSXStyle.utils.book_append_sheet(wb, buildSheet3(filteredFleet, dateStr), "Maintenance & Grounded");

            const fileName = `RAM_Fleet_Inventory_${new Date().toISOString().slice(0,10)}.xlsx`;
            XLSXStyle.writeFile(wb, fileName);
        } catch (err) {
            console.error('Export failed:', err);
            setError('Génération du rapport Excel échouée.');
        } finally {
            setExporting(false);
        }
    };

    const handleOpenModal = (aircraft = null) => {
        if (aircraft) {
            setEditingAircraft(aircraft);
            setFormData({
                registration: aircraft.registration,
                type: aircraft.type,
                model: aircraft.model,
                manufacturer: aircraft.manufacturer,
                status: aircraft.status,
                totalFlightHours: aircraft.totalFlightHours
            });
        } else {
            setEditingAircraft(null);
            setFormData({ registration: '', type: '', model: '', manufacturer: '', status: 'ACTIVE', totalFlightHours: 0 });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (editingAircraft) await aircraftAPI.update(editingAircraft.id, formData);
            else await aircraftAPI.create(formData);
            await fetchAircraft();
            setShowModal(false);
            setEditingAircraft(null);
            setFormData({ registration: '', type: '', model: '', manufacturer: '', status: 'ACTIVE', totalFlightHours: 0 });
        } catch (err) {
            setError('Transaction failed.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'totalFlightHours' ? parseFloat(value) || 0 : value
        }));
    };

    // ── Gestion de la suppression ─────────────────────────────────────────
    const handleDeleteClick = (aircraft) => {
        setDeletingAircraft(aircraft);
        setShowDeleteConfirm(true);
    };

    const handleConfirmDelete = async () => {
        if (!deletingAircraft) return;
        setDeleting(true);
        try {
            await aircraftAPI.delete(deletingAircraft.id);
            await fetchAircraft();
            setShowDeleteConfirm(false);
            setDeletingAircraft(null);
            setError(null);
        } catch (err) {
            logApiError('Delete Aircraft', err);
            setError(`Failed to remove aircraft ${deletingAircraft.registration}.`);
        } finally {
            setDeleting(false);
        }
    };

    const handleCancelDelete = () => {
        setShowDeleteConfirm(false);
        setDeletingAircraft(null);
    };

    if (loading) return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8">
            <Loader2 className="w-10 h-10 animate-spin text-ram-red mb-4" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Establishing Fleet Link...</p>
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
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Continuing Airworthiness</span>
                        </div>
                        <h1 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tighter uppercase font-barlow">
                            Fleet <span className="text-ram-red italic">Inventory</span>
                        </h1>
                    </div>
                </div>
                <div className="flex gap-3 w-full lg:w-auto">
                    <div className="relative flex-1 lg:flex-none">
                        <input
                            type="text"
                            placeholder="Search by reg, model, manufacturer..."
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                            className="w-full lg:w-64 pl-4 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-ram-red/20 focus:border-ram-red transition-all"
                        />
                    </div>
                    <button onClick={handleExport} disabled={exporting}
                            className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all shadow-sm disabled:opacity-50 whitespace-nowrap">
                        {exporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                        {exporting ? 'Generating...' : 'Export'}
                    </button>
                    <button onClick={() => handleOpenModal()}
                            className="flex items-center gap-2 px-5 py-3 bg-ram-red text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:shadow-lg shadow-ram-red/20 transition-all active:scale-95 whitespace-nowrap">
                        <Plus size={14} /> Add
                    </button>
                </div>
            </header>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                    { label: 'Total Assets',  value: stats.total,                    icon: Box,        color: 'text-blue-600',    bg: 'bg-blue-50' },
                    { label: 'Active',        value: stats.active,                   icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    { label: 'Maintenance',   value: stats.maintenance,               icon: Clock,      color: 'text-amber-600',   bg: 'bg-amber-50' },
                    { label: 'Total FH',      value: stats.totalHours.toLocaleString(),icon: Activity,  color: 'text-ram-red',     bg: 'bg-red-50' },
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
                            <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest w-[26%]">A/C Identification</th>
                            <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest w-[16%]">Technical Spec</th>
                            <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest w-[18%]">Operational Log</th>
                            <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest w-[16%]">Status</th>
                            <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right w-[24%]">Control</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                        {paginatedFleet.length > 0 ? paginatedFleet.map((ac) => (
                            <tr key={ac.id} className="hover:bg-slate-50/50 transition-colors group">
                                <td className="px-6 py-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-ram-red group-hover:bg-ram-red group-hover:text-white transition-all flex-shrink-0">
                                            <Plane size={20} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-base font-black text-slate-900 tracking-tighter uppercase truncate">{ac.registration}</p>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest truncate">{ac.manufacturer}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-6">
                                    <div className="px-3 py-1.5 bg-slate-100 rounded-lg text-xs font-black text-slate-700 uppercase tracking-tight inline-block truncate max-w-full">
                                        {ac.model}
                                    </div>
                                </td>
                                <td className="px-6 py-6">
                                    <div className="flex items-center gap-2">
                                        <Clock size={12} className="text-slate-300 flex-shrink-0" />
                                        <span className="text-sm font-black text-slate-700 tabular-nums">
                                                {ac.totalFlightHours?.toLocaleString()}
                                            <span className="text-[9px] uppercase text-slate-400 ml-1">FH</span>
                                            </span>
                                    </div>
                                </td>
                                <td className="px-6 py-6">
                                        <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                                            ac.status === 'ACTIVE'      ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                ac.status === 'MAINTENANCE' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                                    'bg-slate-100 text-slate-500 border-slate-200'}`}>
                                            <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${ac.status === 'ACTIVE' ? 'bg-emerald-500 animate-pulse' : 'bg-current'}`} />
                                            <span className="truncate">{ac.status}</span>
                                        </span>
                                </td>
                                <td className="px-6 py-6 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button onClick={() => handleOpenModal(ac)}
                                                className="p-2.5 bg-white border border-slate-100 text-slate-400 hover:text-ram-red hover:border-ram-red/30 rounded-xl transition-all shadow-sm"
                                                title="Edit aircraft">
                                            <Pencil size={14} />
                                        </button>
                                        <button onClick={() => handleDeleteClick(ac)}
                                                className="p-2.5 bg-white border border-slate-100 text-slate-400 hover:text-red-600 hover:border-red-200 rounded-xl transition-all shadow-sm"
                                                title="Delete aircraft">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="5" className="px-6 py-20 text-center">
                                    <div className="flex flex-col items-center gap-3">
                                        <Plane size={32} className="text-slate-200" />
                                        <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.4em]">Fleet Registry Empty</p>
                                        <p className="text-slate-300 text-[10px]">No aircraft match your search criteria</p>
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
                            Page {currentPage} of {totalPages} • {filteredFleet.length} records
                        </p>
                        <div className="flex items-center gap-2">
                            <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}
                                    className="p-2.5 bg-white border border-slate-200 rounded-lg text-slate-400 disabled:opacity-30 transition-all shadow-sm hover:border-slate-300">
                                <ChevronLeft size={16} />
                            </button>
                            <span className="text-xs font-black text-slate-600 tabular-nums px-3">
                                {currentPage} / {totalPages}
                            </span>
                            <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}
                                    className="p-2.5 bg-white border border-slate-200 rounded-lg text-slate-400 disabled:opacity-30 transition-all shadow-sm hover:border-slate-300">
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal d'édition/ajout */}
            <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditingAircraft(null); }}
                   title={editingAircraft ? 'Technical Asset Modification' : 'Asset Induction Register'}>
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <p className="text-slate-500 text-sm font-medium italic border-b border-slate-100 pb-3">
                        Operational data entry interface for RAM fleet inductors.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Registration</label>
                            <input
                                name="registration"
                                value={formData.registration}
                                onChange={handleInputChange}
                                required
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-ram-red/20 focus:border-ram-red transition-all uppercase"
                                placeholder="e.g. CN-RGJ"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Aircraft Type</label>
                            <input
                                name="type"
                                value={formData.type}
                                onChange={handleInputChange}
                                required
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-ram-red/20 focus:border-ram-red transition-all"
                                placeholder="e.g. B737-800"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Model</label>
                            <input
                                name="model"
                                value={formData.model}
                                onChange={handleInputChange}
                                required
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-ram-red/20 focus:border-ram-red transition-all"
                                placeholder="e.g. 737-8B6"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Manufacturer</label>
                            <input
                                name="manufacturer"
                                value={formData.manufacturer}
                                onChange={handleInputChange}
                                required
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-ram-red/20 focus:border-ram-red transition-all"
                                placeholder="e.g. Boeing"
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
                                <option value="ACTIVE">ACTIVE</option>
                                <option value="MAINTENANCE">MAINTENANCE</option>
                                <option value="GROUNDED">GROUNDED</option>
                                <option value="INACTIVE">INACTIVE</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Flight Hours</label>
                            <input
                                name="totalFlightHours"
                                type="number"
                                value={formData.totalFlightHours}
                                onChange={handleInputChange}
                                min="0"
                                step="0.1"
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-ram-red/20 focus:border-ram-red transition-all tabular-nums"
                                placeholder="0.0"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={() => { setShowModal(false); setEditingAircraft(null); }}
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
                            {submitting ? 'Processing...' : (editingAircraft ? 'Update Asset' : 'Register Asset')}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Dialog de confirmation de suppression */}
            <ConfirmDialog
                isOpen={showDeleteConfirm}
                onClose={handleCancelDelete}
                onConfirm={handleConfirmDelete}
                title="Confirm Aircraft Removal"
                message={deletingAircraft ? `Are you sure you want to permanently remove aircraft ${deletingAircraft.registration} from the fleet registry? This action cannot be undone.` : ''}
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

export default Aircraft;
