import { useEffect, useState, useMemo } from 'react';
import { maintenanceAPI, aircraftAPI, employeeAPI, logApiError } from '../services/api';
import { useAppData } from '../context/AppDataContext';
import Modal from '../components/UI/Modal';
import ConfirmDialog from '../components/UI/ConfirmDialog';
import Logo from '../components/UI/Logo';
import XLSXStyle from 'xlsx-js-style';
import {
    Wrench, Plus, Loader2, Search, Download,
    Calendar, CheckCircle2, Clock, AlertTriangle,
    ChevronLeft, ChevronRight, Pencil, Trash2, ShieldCheck,
    Activity, FileSpreadsheet
} from 'lucide-react';

const ITEMS_PER_PAGE = 8;

const RAM_RED  = "CC0000";
const DARK     = "2D2D2D";
const WHITE    = "FFFFFF";
const ALT_ROW  = "FFF5F5";
const TOTAL_BG = "F5F5F5";

const STATUS_STYLE = {
    COMPLETED:   { bg: "E8F5E9", fg: "1B5E20" },
    IN_PROGRESS: { bg: "E3F2FD", fg: "0D47A1" },
    PLANNED:     { bg: "FFF8E1", fg: "E65100" },
    CANCELLED:   { bg: "FFEBEE", fg: "B71C1C" },
};

const TYPE_STYLE = {
    C_CHECK: { bg: "FFEBEE", fg: "B71C1C" },
    D_CHECK: { bg: "FFEBEE", fg: "B71C1C" },
    A_CHECK: { bg: "E8F5E9", fg: "1B5E20" },
    B_CHECK: { bg: "E3F2FD", fg: "0D47A1" },
    LINE:    { bg: "FFF8E1", fg: "E65100" },
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
// FEUILLE 1 — Maintenance Registry
// ════════════════════════════════════════════════════════════════════════════
function buildSheet1(maintenanceList, stats, dateStr) {
    const ws = {};
    const n = maintenanceList.length;
    const setCell = (addr, c) => { ws[addr] = c; };
    const letters = ["A","B","C","D","E","F","G","H","I"];

    setCell("A1", titleCell("ROYAL AIR MAROC", 20));
    letters.slice(1).forEach(l => setCell(`${l}1`, emptyCell(RAM_RED)));

    setCell("A2", titleCell("TECHNICAL SERVICES — MAINTENANCE MANAGEMENT", 11));
    letters.slice(1).forEach(l => setCell(`${l}2`, emptyCell(RAM_RED)));

    letters.forEach(l => setCell(`${l}3`, emptyCell("EEEEEE")));

    setCell("A4", { v: "MAINTENANCE TECHNICAL REGISTER", t: 's', s: { font: { name:"Calibri", sz:14, bold:true, color:{rgb:RAM_RED} }, alignment:{horizontal:"left",vertical:"center"} } });
    ["B4","C4","D4"].forEach(a => setCell(a, emptyCell()));
    setCell("E4", { v: "Export Date:", t:'s', s:{ font:{name:"Calibri",sz:10,bold:true,color:{rgb:"555555"}}, alignment:{horizontal:"right",vertical:"center"} } });
    setCell("F4", { v: dateStr, t:'s', s:{ font:{name:"Calibri",sz:10,color:{rgb:"333333"}}, alignment:{horizontal:"left",vertical:"center"} } });
    setCell("G4", { v: "Total Records:", t:'s', s:{ font:{name:"Calibri",sz:10,bold:true,color:{rgb:"555555"}}, alignment:{horizontal:"right",vertical:"center"} } });
    setCell("H4", { v: n, t:'n', s:{ font:{name:"Calibri",sz:10,bold:true,color:{rgb:RAM_RED}}, alignment:{horizontal:"left",vertical:"center"} } });
    setCell("I4", emptyCell());

    letters.forEach(l => setCell(`${l}5`, emptyCell()));

    setCell("A6", kpiCell("COMPLETED",      stats.completed,   "E8F5E9", "1B5E20"));
    setCell("B6", emptyCell("E8F5E9"));
    setCell("C6", kpiCell("IN PROGRESS",    stats.inProgress,  "E3F2FD", "0D47A1"));
    setCell("D6", emptyCell("E3F2FD"));
    setCell("E6", kpiCell("PLANNED",        stats.planned,     "FFF8E1", "E65100"));
    setCell("F6", emptyCell("FFF8E1"));
    setCell("G6", kpiCell("CANCELLED",      stats.cancelled,   "FFEBEE", "B71C1C"));
    setCell("H6", emptyCell("FFEBEE"));
    setCell("I6", emptyCell());

    letters.forEach(l => setCell(`${l}7`, emptyCell()));

    const headers = ["#","ID","Aircraft","Type","Description","Start Date","End Date","Lead Tech","Status"];
    headers.forEach((h,i) => setCell(`${letters[i]}8`, headerCell(h)));

    maintenanceList.forEach((m, idx) => {
        const row = idx + 9;
        const bg  = idx % 2 === 1 ? ALT_ROW : WHITE;
        const status = m.status || "PLANNED";
        const st = STATUS_STYLE[status] || STATUS_STYLE.PLANNED;
        const type = m.maintenanceType || "LINE";
        const ts = TYPE_STYLE[type] || TYPE_STYLE.LINE;

        setCell(`A${row}`, cell(idx + 1,                    { bg, size:9 }));
        setCell(`B${row}`, cell(m.id,                      { bg, size:9, color:RAM_RED, bold:true }));
        setCell(`C${row}`, cell(m.aircraftRegistration||"N/A", { bg, size:9, bold:true }));
        setCell(`D${row}`, cell(type,                      { bg:ts.bg, size:9, color:ts.fg, bold:true }));
        setCell(`E${row}`, cell(m.description||"",         { bg, size:9, hAlign:"left" }));
        setCell(`F${row}`, cell(m.startDate ? new Date(m.startDate).toLocaleDateString('fr-FR') : 'TBD', { bg, size:9 }));
        setCell(`G${row}`, cell(m.endDate ? new Date(m.endDate).toLocaleDateString('fr-FR') : 'TBD',   { bg, size:9 }));
        setCell(`H${row}`, cell(m.technicianName||"Unassigned", { bg, size:9 }));
        setCell(`I${row}`, cell(status,                    { bg:st.bg, size:9, color:st.fg, bold:true }));
    });

    const tr = n + 9;
    setCell(`A${tr}`, { v: `TOTAL  —  ${n} Records`, t:'s', s:{ font:{name:"Calibri",sz:10,bold:true,color:{rgb:"333333"}}, fill:{fgColor:{rgb:TOTAL_BG},patternType:"solid"}, alignment:{horizontal:"right",vertical:"center"}, border:{top:{style:"medium",color:{rgb:RAM_RED}}} } });
    ["B","C","D","E","F","G","H"].forEach(c => setCell(`${c}${tr}`, emptyCell(TOTAL_BG)));
    setCell(`I${tr}`, emptyCell(TOTAL_BG));

    ws['!merges'] = [
        {s:{r:0,c:0},e:{r:0,c:8}},
        {s:{r:1,c:0},e:{r:1,c:8}},
        {s:{r:2,c:0},e:{r:2,c:8}},
        {s:{r:3,c:0},e:{r:3,c:3}},
        {s:{r:5,c:0},e:{r:5,c:1}},
        {s:{r:5,c:2},e:{r:5,c:3}},
        {s:{r:5,c:4},e:{r:5,c:5}},
        {s:{r:5,c:6},e:{r:5,c:7}},
        {s:{r:tr-1,c:0},e:{r:tr-1,c:8}},
    ];

    ws['!cols'] = [
        {wch:5},{wch:8},{wch:14},{wch:14},{wch:35},{wch:14},{wch:14},{wch:16},{wch:14}
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
// FEUILLE 2 — Maintenance Summary Dashboard
// ════════════════════════════════════════════════════════════════════════════
function buildSheet2(maintenanceList, stats, dateStr) {
    const ws = {};
    const setCell = (addr, c) => { ws[addr] = c; };
    const letters = ["A","B","C","D","E","F","G","H","I"];

    setCell("A1", titleCell("MAINTENANCE SUMMARY DASHBOARD", 16));
    letters.slice(1).forEach(l => setCell(`${l}1`, emptyCell(RAM_RED)));

    setCell("A2", titleCell(`Royal Air Maroc — Technical Services  |  Audit Date: ${dateStr}`, 10));
    letters.slice(1).forEach(l => setCell(`${l}2`, emptyCell(RAM_RED)));

    letters.forEach(l => setCell(`${l}3`, emptyCell()));

    const kpiStyle = (fg, bg) => ({
        font:{name:"Calibri",sz:13,bold:true,color:{rgb:fg}},
        fill:{fgColor:{rgb:bg},patternType:"solid"},
        alignment:{horizontal:"center",vertical:"center",wrapText:true},
        border:{top:{style:"medium",color:{rgb:fg}},bottom:{style:"medium",color:{rgb:fg}},left:{style:"medium",color:{rgb:fg}},right:{style:"medium",color:{rgb:fg}}}
    });

    const kpis = [
        ["B4","C5","TOTAL RECORDS",  maintenanceList.length,    "1A237E","EEF2FF"],
        ["E4","F5","COMPLETED",        stats.completed,         "1B5E20","E8F5E9"],
        ["H4","I5","IN PROGRESS",      stats.inProgress,        "0D47A1","E3F2FD"],
        ["B7","C8","PLANNED",          stats.planned,           "E65100","FFF8E1"],
    ];
    kpis.forEach(([s,,lbl,val,fg,bg]) => {
        setCell(s, { v:`${lbl}\n${val}`, t:'s', s: kpiStyle(fg,bg) });
    });
    ["C4","C5","F4","F5","I4","I5","C7","C8"].forEach(a => setCell(a, emptyCell()));

    letters.forEach(l => setCell(`${l}10`, emptyCell()));

    setCell("B11", { v:"STATUS BREAKDOWN BY MAINTENANCE TYPE", t:'s', s:{ font:{name:"Calibri",sz:11,bold:true,color:{rgb:RAM_RED}}, border:{bottom:{style:"medium",color:{rgb:RAM_RED}}} } });

    ["Maintenance Type","COMPLETED","IN_PROGRESS","PLANNED","CANCELLED","TOTAL","% Completed"].forEach((h,i) => {
        setCell(`${["B","C","D","E","F","G","H"][i]}12`, {
            v:h, t:'s',
            s:{ font:{name:"Calibri",sz:9,bold:true,color:{rgb:WHITE}}, fill:{fgColor:{rgb:DARK},patternType:"solid"}, alignment:{horizontal:"center",vertical:"center"}, border:{top:{style:"thin",color:{rgb:DARK}},bottom:{style:"thin",color:{rgb:DARK}},left:{style:"thin",color:{rgb:DARK}},right:{style:"thin",color:{rgb:DARK}}} }
        });
    });

    const types = [...new Set(maintenanceList.map(r => r.maintenanceType).filter(Boolean))].sort();
    types.forEach((type, mi) => {
        const row = 13 + mi;
        const mf  = maintenanceList.filter(r => r.maintenanceType === type);
        const c   = mf.filter(r => r.status==="COMPLETED").length;
        const ip  = mf.filter(r => r.status==="IN_PROGRESS").length;
        const p   = mf.filter(r => r.status==="PLANNED").length;
        const ca  = mf.filter(r => r.status==="CANCELLED").length;
        const t   = mf.length;
        const bg  = mi % 2 === 1 ? ALT_ROW : WHITE;
        const pct = t ? `${Math.round(c/t*100)}%` : "0%";
        [type,c,ip,p,ca,t,pct].forEach((val,ci) => {
            setCell(`${["B","C","D","E","F","G","H"][ci]}${row}`, {
                v:val, t: typeof val==='number'?'n':'s',
                s:{ font:{name:"Calibri",sz:9,bold:ci===0,color:{rgb:"333333"}}, fill:{fgColor:{rgb:bg},patternType:"solid"}, alignment:{horizontal:"center",vertical:"center"}, border:{top:{style:"thin",color:{rgb:"DDDDDD"}},bottom:{style:"thin",color:{rgb:"DDDDDD"}},left:{style:"thin",color:{rgb:"DDDDDD"}},right:{style:"thin",color:{rgb:"DDDDDD"}}} }
            });
        });
    });

    const tr2 = 13 + types.length;
    const totalPct = maintenanceList.length ? `${Math.round(stats.completed/maintenanceList.length*100)}%` : "0%";
    ["TOTAL", stats.completed, stats.inProgress, stats.planned, stats.cancelled, maintenanceList.length, totalPct].forEach((val,ci) => {
        setCell(`${["B","C","D","E","F","G","H"][ci]}${tr2}`, {
            v:val, t:typeof val==='number'?'n':'s',
            s:{ font:{name:"Calibri",sz:9,bold:true,color:{rgb:WHITE}}, fill:{fgColor:{rgb:RAM_RED},patternType:"solid"}, alignment:{horizontal:"center",vertical:"center"} }
        });
    });

    const fr = tr2 + 2;
    setCell(`B${fr}`, { v:`Generated by RAM Technical Services Platform  •  ${dateStr}`, t:'s', s:{ font:{name:"Calibri",sz:8,italic:true,color:{rgb:"999999"}}, alignment:{horizontal:"center"} } });

    ws['!merges'] = [
        {s:{r:0,c:0},e:{r:0,c:8}},
        {s:{r:1,c:0},e:{r:1,c:8}},
        {s:{r:3,c:1},e:{r:4,c:2}},
        {s:{r:3,c:4},e:{r:4,c:5}},
        {s:{r:3,c:7},e:{r:4,c:8}},
        {s:{r:6,c:1},e:{r:7,c:2}},
        {s:{r:10,c:1},e:{r:10,c:8}},
        {s:{r:fr-1,c:1},e:{r:fr-1,c:8}},
    ];

    ws['!cols'] = [{wch:3},{wch:20},{wch:14},{wch:3},{wch:14},{wch:14},{wch:14},{wch:14},{wch:3}];
    ws['!rows'] = [{hpt:36},{hpt:20},{hpt:14},...Array(10).fill({hpt:28})];
    ws['!ref'] = `A1:I${fr}`;
    return ws;
}

// ════════════════════════════════════════════════════════════════════════════
// FEUILLE 3 — Critical & Overdue Maintenance
// ════════════════════════════════════════════════════════════════════════════
function buildSheet3(maintenanceList, dateStr) {
    const ws = {};
    const setCell = (addr, c) => { ws[addr] = c; };
    const letters = ["A","B","C","D","E","F","G","H","I"];

    setCell("A1", titleCell("CRITICAL & OVERDUE MAINTENANCE ALERTS", 13));
    letters.slice(1).forEach(l => setCell(`${l}1`, emptyCell(RAM_RED)));

    setCell("A2", titleCell(`Audit Date: ${dateStr}  |  Technical Services Priority List`, 9));
    letters.slice(1).forEach(l => setCell(`${l}2`, emptyCell(RAM_RED)));

    letters.forEach(l => setCell(`${l}3`, emptyCell()));

    ["#","ID","Aircraft","Type","Description","Start Date","End Date","Status","Priority"].forEach((h,i) => {
        setCell(`${letters[i]}4`, headerCell(h));
    });

    const now = new Date();
    const critical = maintenanceList.filter(m => {
        const status = m.status;
        const start = m.startDate ? new Date(m.startDate) : null;
        const end = m.endDate ? new Date(m.endDate) : null;
        return status === 'IN_PROGRESS' ||
            status === 'CANCELLED' ||
            (status === 'PLANNED' && start && start < now) ||
            (status === 'IN_PROGRESS' && end && end < now);
    });

    critical.forEach((m, idx) => {
        const row = idx + 5;
        const status = m.status || "PLANNED";
        const st = STATUS_STYLE[status] || STATUS_STYLE.PLANNED;
        const start = m.startDate ? new Date(m.startDate) : null;
        const end = m.endDate ? new Date(m.endDate) : null;
        let priority = "NORMAL";
        if (status === 'CANCELLED') priority = "CANCELLED";
        else if (status === 'IN_PROGRESS' && end && end < now) priority = "OVERDUE";
        else if (status === 'PLANNED' && start && start < now) priority = "DELAYED";
        else if (status === 'IN_PROGRESS') priority = "ACTIVE";

        const priorityColors = {
            OVERDUE:   { bg: "FFEBEE", fg: "B71C1C" },
            DELAYED:   { bg: "FFF8E1", fg: "E65100" },
            ACTIVE:    { bg: "E3F2FD", fg: "0D47A1" },
            CANCELLED: { bg: "FFEBEE", fg: "B71C1C" },
            NORMAL:    { bg: "E8F5E9", fg: "1B5E20" },
        };
        const pc = priorityColors[priority] || priorityColors.NORMAL;

        setCell(`A${row}`, cell(idx+1,                       { bg:"FAFAFA", size:9 }));
        setCell(`B${row}`, cell(m.id,                        { bg:"FAFAFA", size:9, color:RAM_RED, bold:true }));
        setCell(`C${row}`, cell(m.aircraftRegistration||"", { bg:"FAFAFA", size:9, bold:true }));
        setCell(`D${row}`, cell(m.maintenanceType||"",      { bg:"FAFAFA", size:9 }));
        setCell(`E${row}`, cell(m.description||"",         { bg:"FAFAFA", size:9, hAlign:"left" }));
        setCell(`F${row}`, cell(m.startDate ? new Date(m.startDate).toLocaleDateString('fr-FR') : 'TBD', { bg:"FAFAFA", size:9 }));
        setCell(`G${row}`, cell(m.endDate ? new Date(m.endDate).toLocaleDateString('fr-FR') : 'TBD',   { bg:"FAFAFA", size:9 }));
        setCell(`H${row}`, cell(status,                      { bg:st.bg, size:9, color:st.fg, bold:true }));
        setCell(`I${row}`, cell(priority,                    { bg:pc.bg, size:9, color:pc.fg, bold:true }));
    });

    ws['!merges'] = [
        {s:{r:0,c:0},e:{r:0,c:8}},
        {s:{r:1,c:0},e:{r:1,c:8}},
    ];
    ws['!cols'] = [{wch:5},{wch:8},{wch:14},{wch:14},{wch:35},{wch:14},{wch:14},{wch:14},{wch:14}];
    ws['!ref'] = `A1:I${critical.length + 4}`;
    return ws;
}

// ════════════════════════════════════════════════════════════════════════════
// COMPONENT
// ════════════════════════════════════════════════════════════════════════════
const Maintenance = () => {
    const { state: globalState } = useAppData();
    const [maintenance, setMaintenance] = useState([]);
    const [aircraft, setAircraft] = useState([]);
    const [technicians, setTechnicians] = useState([]);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    const [showModal, setShowModal] = useState(false);
    const [editingMaintenance, setEditingMaintenance] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const [formData, setFormData] = useState({
        aircraftId: '',
        maintenanceType: 'LINE',
        description: '',
        startDate: '',
        endDate: '',
        technicianId: '',
        status: 'PLANNED',
    });

    useEffect(() => { fetchData(); }, []);
    useEffect(() => { setCurrentPage(1); }, [searchTerm]);

    // Merge global store data whenever it changes
    useEffect(() => {
        if (globalState.maintenance && globalState.maintenance.length > 0) {
            setMaintenance(prev => {
                const mappedGlobalMaintenance = globalState.maintenance.map(m => ({
                    id: m.ID || m.id,
                    aircraftRegistration: m.Aircraft || m.aircraftRegistration,
                    aircraftType: m.Aircraft_Type || m.aircraftType,
                    maintenanceType: m.Maintenance_Type || m.maintenanceType,
                    description: m.Task_Description || m.description,
                    startDate: m.Scheduled_Date || m.startDate,
                    status: m.Status || m.status,
                    technicianName: m.Technician || m.technicianName,
                    numTechnicians: m.Num_Technicians || m.numTechnicians,
                    estimatedDurationHours: m.Estimated_Duration_Hours || m.estimatedDurationHours,
                    priority: m.Priority || m.priority,
                    estimatedCostMAD: m.Estimated_Cost_MAD || m.estimatedCostMAD,
                    location: m.Location || m.location,
                    complianceReference: m.Compliance_Reference || m.complianceReference,
                }));
                const existingIds = new Set(prev.map(m => m.id));
                const newMaintenance = mappedGlobalMaintenance.filter(m => !existingIds.has(m.id));
                return [...prev, ...newMaintenance];
            });
        }
    }, [globalState.maintenance]);

    async function fetchData() {
        try {
            setLoading(true);
            setError(null);
            const [maintenanceRes, aircraftRes, employeesRes] = await Promise.all([
                maintenanceAPI.getAll(),
                aircraftAPI.getAll(),
                employeeAPI.getAll(),
            ]);
            setMaintenance(maintenanceRes.data || []);
            setAircraft(aircraftRes.data || []);
            setTechnicians(employeesRes.data?.filter(e => e.role === 'TECHNICIAN' || e.technicianId) || []);
        } catch (err) {
            logApiError('Maintenance Load', err);
            setError('Maintenance cluster synchronization failed.');
        } finally {
            setLoading(false);
        }
    }

    const filteredMaintenance = useMemo(() =>
            maintenance.filter(m => {
                const term = searchTerm.toLowerCase();
                return (
                    m.id?.toString().includes(term) ||
                    m.aircraftRegistration?.toLowerCase().includes(term) ||
                    m.description?.toLowerCase().includes(term) ||
                    m.maintenanceType?.toLowerCase().includes(term)
                );
            })
        , [maintenance, searchTerm]);

    const totalPages = Math.ceil(filteredMaintenance.length / ITEMS_PER_PAGE) || 1;
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedMaintenance = useMemo(() =>
            filteredMaintenance.slice(startIndex, startIndex + ITEMS_PER_PAGE)
        , [filteredMaintenance, startIndex]);

    const stats = useMemo(() => ({
        total: maintenance.length,
        inProgress: maintenance.filter(m => m.status === 'IN_PROGRESS').length,
        completed: maintenance.filter(m => m.status === 'COMPLETED').length,
        planned: maintenance.filter(m => m.status === 'PLANNED').length,
        cancelled: maintenance.filter(m => m.status === 'CANCELLED').length,
    }), [maintenance]);

    // ── Export Excel stylisé ─────────────────────────────────────────────
    const handleExport = () => {
        setExporting(true);
        try {
            const dateStr = new Date().toLocaleDateString('fr-FR');
            const wb = XLSXStyle.utils.book_new();

            XLSXStyle.utils.book_append_sheet(wb, buildSheet1(filteredMaintenance, stats, dateStr), "Maintenance Registry");
            XLSXStyle.utils.book_append_sheet(wb, buildSheet2(filteredMaintenance, stats, dateStr), "Summary Dashboard");
            XLSXStyle.utils.book_append_sheet(wb, buildSheet3(filteredMaintenance, dateStr), "Critical Alerts");

            const fileName = `RAM_Maintenance_Registry_${new Date().toISOString().slice(0,10)}.xlsx`;
            XLSXStyle.writeFile(wb, fileName);
        } catch (err) {
            console.error('Export failed:', err);
            setError('Generation of maintenance report failed.');
        } finally {
            setExporting(false);
        }
    };

    const handleOpenModal = (m = null) => {
        if (m) {
            setEditingMaintenance(m);
            setFormData({
                aircraftId: m.aircraftId || '',
                maintenanceType: m.maintenanceType || 'LINE',
                description: m.description || '',
                startDate: m.startDate ? m.startDate.split('T')[0] : '',
                endDate: m.endDate ? m.endDate.split('T')[0] : '',
                technicianId: m.technicianId || '',
                status: m.status || 'PLANNED',
            });
        } else {
            setEditingMaintenance(null);
            setFormData({
                aircraftId: '', maintenanceType: 'LINE', description: '',
                startDate: '', endDate: '', technicianId: '', status: 'PLANNED',
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
                aircraftId: Number(formData.aircraftId),
                technicianId: formData.technicianId ? Number(formData.technicianId) : null,
            };
            if (editingMaintenance) {
                await maintenanceAPI.update(editingMaintenance.id, payload);
            } else {
                await maintenanceAPI.create(payload);
            }
            await fetchData();
            setShowModal(false);
            setEditingMaintenance(null);
            setFormData({ aircraftId: '', maintenanceType: 'LINE', description: '', startDate: '', endDate: '', technicianId: '', status: 'PLANNED' });
        } catch (err) {
            logApiError('Maintenance Submit', err);
            setError(`Transaction failed: ${err.response?.data?.message || err.message}`);
        } finally {
            setSubmitting(false);
        }
    };

    // ── Gestion suppression ──────────────────────────────────────────────
    const handleDeleteClick = (m) => {
        setDeleteTarget(m);
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
            await maintenanceAPI.delete(deleteTarget.id);
            await fetchData();
            setShowDeleteConfirm(false);
            setDeleteTarget(null);
            setError(null);
        } catch (err) {
            logApiError('Delete Maintenance', err);
            setError(`Failed to remove maintenance record ${deleteTarget.id}: ${err.response?.data?.message || err.message}`);
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
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Querying Maintenance Database...</p>
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
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Technical Services</span>
                        </div>
                        <h1 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tighter uppercase">
                            Technical <span className="text-ram-red italic">Check-list</span>
                        </h1>
                    </div>
                </div>
                <div className="flex gap-3 w-full lg:w-auto">
                    <div className="relative flex-1 lg:flex-none">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                        <input
                            type="text"
                            placeholder="Filter by ID, aircraft, type or description..."
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
                        {exporting ? <Loader2 size={14} className="animate-spin" /> : <FileSpreadsheet size={14} />}
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
                    { label: 'Active Checks', value: stats.inProgress, icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Pending', value: stats.planned, icon: Calendar, color: 'text-amber-600', bg: 'bg-amber-50' },
                    { label: 'Completed', value: stats.completed, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    { label: 'Cancelled', value: stats.cancelled, icon: ShieldCheck, color: 'text-ram-red', bg: 'bg-red-50' },
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

            {/* Tableau principal - screenshot-friendly */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm">
                <div className="w-full">
                    <table className="w-full text-left table-fixed">
                        <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-100">
                            <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest w-[24%]">Identification</th>
                            <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest w-[14%]">Type</th>
                            <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest w-[16%]">Timeline</th>
                            <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest w-[16%]">Technician</th>
                            <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest w-[14%]">Status</th>
                            <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right w-[16%]">Control</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                        {paginatedMaintenance.length > 0 ? paginatedMaintenance.map((m) => (
                            <tr key={m.id} className="hover:bg-slate-50/50 transition-colors group">
                                <td className="px-6 py-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-ram-red group-hover:bg-ram-red group-hover:text-white transition-all flex-shrink-0">
                                            <Wrench size={20} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-base font-black text-slate-900 tracking-tighter uppercase truncate">{m.aircraftRegistration || 'N/A'}</p>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest truncate">ID: {m.id}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-6">
                                        <span className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border inline-block truncate max-w-full ${
                                            m.maintenanceType === 'C_CHECK' || m.maintenanceType === 'D_CHECK' ? 'bg-red-50 text-red-700 border-red-100' :
                                                m.maintenanceType === 'A_CHECK' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                                    m.maintenanceType === 'B_CHECK' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                                        'bg-amber-50 text-amber-700 border-amber-100'
                                        }`}>
                                            {m.maintenanceType || 'LINE'}
                                        </span>
                                </td>
                                <td className="px-6 py-6">
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2">
                                            <Clock size={12} className="text-slate-300 flex-shrink-0" />
                                            <span className="font-mono text-sm font-black text-slate-700 tabular-nums">
                                                    {m.startDate ? new Date(m.startDate).toLocaleDateString('en-GB') : 'TBD'}
                                                </span>
                                        </div>
                                        <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">to {m.endDate ? new Date(m.endDate).toLocaleDateString('en-GB') : 'TBD'}</p>
                                    </div>
                                </td>
                                <td className="px-6 py-6">
                                    <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 flex-shrink-0">
                                            <span className="text-[10px] font-black">{(m.technicianName || 'TBD').charAt(0)}</span>
                                        </div>
                                        <span className="text-sm font-bold text-slate-600 truncate">{m.technicianName || 'PENDING'}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-6">
                                        <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                                            m.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                m.status === 'IN_PROGRESS' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                                    m.status === 'CANCELLED' ? 'bg-red-50 text-red-600 border-red-100' :
                                                        'bg-slate-100 text-slate-500 border-slate-200'
                                        }`}>
                                            <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${m.status === 'IN_PROGRESS' ? 'bg-blue-500 animate-pulse' : 'bg-current'}`} />
                                            <span className="truncate">{m.status}</span>
                                        </span>
                                </td>
                                <td className="px-6 py-6 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            onClick={() => handleOpenModal(m)}
                                            className="p-2.5 bg-white border border-slate-100 text-slate-400 hover:text-ram-red hover:border-ram-red/30 rounded-xl transition-all shadow-sm"
                                            title="Edit maintenance"
                                        >
                                            <Pencil size={14} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteClick(m)}
                                            className="p-2.5 bg-white border border-slate-100 text-slate-400 hover:text-red-600 hover:border-red-200 rounded-xl transition-all shadow-sm"
                                            title="Delete maintenance"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="6" className="px-6 py-20 text-center">
                                    <div className="flex flex-col items-center gap-3">
                                        <Wrench size={32} className="text-slate-200" />
                                        <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.4em]">No maintenance records found</p>
                                        <p className="text-slate-300 text-[10px]">Schedule an intervention to begin tracking</p>
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
                            {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, filteredMaintenance.length)} of {filteredMaintenance.length} records
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

            {/* Modal Add/Edit - FORMULAIRE COMPLET */}
            <Modal
                isOpen={showModal}
                onClose={() => { setShowModal(false); setEditingMaintenance(null); }}
                title={editingMaintenance ? 'Technical Record Revision' : 'Schedule New Intervention'}
            >
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <p className="text-slate-500 text-sm font-medium italic border-b border-slate-100 pb-3">
                        {editingMaintenance ? 'Update maintenance record details.' : 'Enter intervention details for technical scheduling.'}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Maintenance Type</label>
                            <select
                                name="maintenanceType"
                                value={formData.maintenanceType}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-ram-red/20 focus:border-ram-red transition-all appearance-none"
                            >
                                <option value="LINE">LINE</option>
                                <option value="A_CHECK">A CHECK</option>
                                <option value="B_CHECK">B CHECK</option>
                                <option value="C_CHECK">C CHECK</option>
                                <option value="D_CHECK">D CHECK</option>
                            </select>
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                required
                                rows={2}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-ram-red/20 focus:border-ram-red transition-all resize-none"
                                placeholder="Describe the maintenance intervention..."
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Start Date</label>
                            <input
                                name="startDate"
                                type="date"
                                value={formData.startDate}
                                onChange={handleInputChange}
                                required
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-ram-red/20 focus:border-ram-red transition-all"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">End Date</label>
                            <input
                                name="endDate"
                                type="date"
                                value={formData.endDate}
                                onChange={handleInputChange}
                                required
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-ram-red/20 focus:border-ram-red transition-all"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Lead Technician</label>
                            <select
                                name="technicianId"
                                value={formData.technicianId}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-ram-red/20 focus:border-ram-red transition-all appearance-none"
                            >
                                <option value="">Unassigned</option>
                                {technicians.map(t => (
                                    <option key={t.id} value={t.id}>
                                        {t.firstName} {t.lastName}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-ram-red/20 focus:border-ram-red transition-all appearance-none"
                            >
                                <option value="PLANNED">PLANNED</option>
                                <option value="IN_PROGRESS">IN PROGRESS</option>
                                <option value="COMPLETED">COMPLETED</option>
                                <option value="CANCELLED">CANCELLED</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={() => { setShowModal(false); setEditingMaintenance(null); }}
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
                            {submitting ? 'Processing...' : (editingMaintenance ? 'Update Record' : 'Schedule Intervention')}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Dialog de confirmation suppression */}
            <ConfirmDialog
                isOpen={showDeleteConfirm}
                onClose={handleCancelDelete}
                onConfirm={handleConfirmDelete}
                title="Confirm Record Removal"
                message={deleteTarget ? `Permanently remove maintenance record #${deleteTarget.id} for ${deleteTarget.aircraftRegistration}? This action cannot be undone.` : ''}
                confirmText={deleting ? 'Removing...' : 'Confirm Removal'}
                cancelText="Cancel"
                confirmVariant="danger"
                isLoading={deleting}
            />

            {/* Toast d'erreur */}
            {error && (
                <div className="fixed bottom-8 right-8 bg-red-600 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 z-50 animate-in slide-in-from-bottom-4">
                    <AlertTriangle size={18} />
                    <span className="text-[10px] font-black uppercase tracking-widest">{error}</span>
                    <button onClick={() => setError(null)} className="ml-2 opacity-60 hover:opacity-100 font-bold text-lg leading-none">×</button>
                </div>
            )}
        </div>
    );
};

export default Maintenance;