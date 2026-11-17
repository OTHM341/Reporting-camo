import { useState, useEffect, useMemo } from 'react';
import { defectAPI, aircraftAPI, logApiError } from '../services/api';
import { useAppData } from '../context/AppDataContext';
import Modal from '../components/UI/Modal';
import ConfirmDialog from '../components/UI/ConfirmDialog';
import Logo from '../components/UI/Logo';
import XLSXStyle from 'xlsx-js-style';
import {
    Search, Loader2, Plus, Download, ChevronLeft, ChevronRight,
    AlertTriangle, ShieldAlert, CheckCircle2, Zap, Clock,
    Pencil, Trash2, X
} from 'lucide-react';

const ITEMS_PER_PAGE = 8;

// ── Helpers Excel ─────────────────────────────────────────────────────────
const RAM_RED = "CC0000";
const DARK = "2D2D2D";
const WHITE = "FFFFFF";
const ALT_ROW = "FFF5F5";
const TOTAL_BG = "F5F5F5";

const STATUS_STYLE = {
    OPEN: { bg: "FFEBEE", fg: "B71C1C" },
    IN_PROGRESS: { bg: "E3F2FD", fg: "0D47A1" },
    RESOLVED: { bg: "E8F5E9", fg: "1B5E20" },
};

const SEVERITY_STYLE = {
    CRITICAL: { bg: "FFEBEE", fg: "B71C1C" },
    MAJOR: { bg: "FFF8E1", fg: "E65100" },
    MINOR: { bg: "E3F2FD", fg: "0D47A1" },
};

function cell(value, opts = {}) {
    const { bold = false, size = 10, color = null, bg = null, hAlign = "center", wrap = false, numFmt = null, borderColor = "DDDDDD", borderBottom = null, borderTop = null } = opts;
    const s = {
        font: { name: "Calibri", sz: size, bold, color: { rgb: color || "333333" } },
        alignment: { horizontal: hAlign, vertical: "center", wrapText: wrap },
        border: {
            top: { style: borderTop ? "medium" : "thin", color: { rgb: borderTop || borderColor } },
            bottom: { style: borderBottom ? "medium" : "thin", color: { rgb: borderBottom || borderColor } },
            left: { style: "thin", color: { rgb: borderColor } },
            right: { style: "thin", color: { rgb: borderColor } },
        }
    };
    if (bg) s.fill = { fgColor: { rgb: bg }, patternType: "solid" };
    const c = { v: value, s };
    c.t = typeof value === 'number' ? 'n' : 's';
    if (numFmt) c.z = numFmt;
    return c;
}

function headerCell(value) {
    return cell(value, { bold: true, size: 10, color: WHITE, bg: DARK, borderBottom: RAM_RED, borderColor: DARK });
}

function titleCell(value, size = 20) {
    return { v: value, t: 's', s: { font: { name: "Calibri", sz: size, bold: true, color: { rgb: WHITE } }, fill: { fgColor: { rgb: RAM_RED }, patternType: "solid" }, alignment: { horizontal: "center", vertical: "center", wrapText: true } } };
}

function kpiCell(label, val, bg, fg) {
    return { v: `${label}\n${val}`, t: 's', s: { font: { name: "Calibri", sz: 12, bold: true, color: { rgb: fg } }, fill: { fgColor: { rgb: bg }, patternType: "solid" }, alignment: { horizontal: "center", vertical: "center", wrapText: true } } };
}

function emptyCell(bg = WHITE) {
    return { v: "", t: 's', s: { fill: { fgColor: { rgb: bg }, patternType: "solid" } } };
}

// ════════════════════════════════════════════════════════════════════════════
// FEUILLE 1 — Defects Registry
// ════════════════════════════════════════════════════════════════════════════
function buildSheet1(defectsList, stats, dateStr) {
    const ws = {};
    const n = defectsList.length;
    const setCell = (addr, c) => { ws[addr] = c; };
    const letters = ["A", "B", "C", "D", "E", "F", "G", "H"];

    setCell("A1", titleCell("ROYAL AIR MAROC", 20));
    letters.slice(1).forEach(l => setCell(`${l}1`, emptyCell(RAM_RED)));

    setCell("A2", titleCell("MAINTENANCE CONTROL — DEFECTS & TECHNICAL LOGS", 11));
    letters.slice(1).forEach(l => setCell(`${l}2`, emptyCell(RAM_RED)));

    letters.forEach(l => setCell(`${l}3`, emptyCell("EEEEEE")));

    setCell("A4", { v: "TECHNICAL DEFECTS REGISTER", t: 's', s: { font: { name: "Calibri", sz: 14, bold: true, color: { rgb: RAM_RED } }, alignment: { horizontal: "left", vertical: "center" } } });
    ["B4", "C4", "D4"].forEach(a => setCell(a, emptyCell()));
    setCell("E4", { v: "Export Date:", t: 's', s: { font: { name: "Calibri", sz: 10, bold: true, color: { rgb: "555555" } }, alignment: { horizontal: "right", vertical: "center" } } });
    setCell("F4", { v: dateStr, t: 's', s: { font: { name: "Calibri", sz: 10, color: { rgb: "333333" } }, alignment: { horizontal: "left", vertical: "center" } } });
    setCell("G4", { v: "Total Records:", t: 's', s: { font: { name: "Calibri", sz: 10, bold: true, color: { rgb: "555555" } }, alignment: { horizontal: "right", vertical: "center" } } });
    setCell("H4", { v: n, t: 'n', s: { font: { name: "Calibri", sz: 10, bold: true, color: { rgb: RAM_RED } }, alignment: { horizontal: "left", vertical: "center" } } });

    letters.forEach(l => setCell(`${l}5`, emptyCell()));

    setCell("A6", kpiCell("OPEN", stats.open, "FFEBEE", "B71C1C"));
    setCell("B6", emptyCell("FFEBEE"));
    setCell("C6", kpiCell("IN PROGRESS", stats.inProgress, "E3F2FD", "0D47A1"));
    setCell("D6", emptyCell("E3F2FD"));
    setCell("E6", kpiCell("RESOLVED", stats.resolved, "E8F5E9", "1B5E20"));
    setCell("F6", emptyCell("E8F5E9"));
    setCell("G6", kpiCell("AOG CRITICAL", stats.critical, "FFF8E1", "E65100"));
    setCell("H6", emptyCell("FFF8E1"));

    letters.forEach(l => setCell(`${l}7`, emptyCell()));

    const headers = ["#", "ID", "Aircraft", "Description", "Severity", "Status", "Reported Date", "Priority"];
    headers.forEach((h, i) => setCell(`${letters[i]}8`, headerCell(h)));

    defectsList.forEach((d, idx) => {
        const row = idx + 9;
        const bg = idx % 2 === 1 ? ALT_ROW : WHITE;
        const status = d.status || "OPEN";
        const st = STATUS_STYLE[status] || STATUS_STYLE.OPEN;
        const severity = d.severity || "MINOR";
        const sv = SEVERITY_STYLE[severity] || SEVERITY_STYLE.MINOR;
        const priority = severity === 'CRITICAL' ? 'AOG' : severity === 'MAJOR' ? 'URGENT' : 'ROUTINE';
        const pc = severity === 'CRITICAL' ? { bg: "FFEBEE", fg: "B71C1C" } : severity === 'MAJOR' ? { bg: "FFF8E1", fg: "E65100" } : { bg: "E8F5E9", fg: "1B5E20" };

        setCell(`A${row}`, cell(idx + 1, { bg, size: 9 }));
        setCell(`B${row}`, cell(d.id, { bg, size: 9, color: RAM_RED, bold: true }));
        setCell(`C${row}`, cell(d.aircraftRegistration || d.aircraft?.registration || "N/A", { bg, size: 9, bold: true }));
        setCell(`D${row}`, cell(d.description || "", { bg, size: 9, hAlign: "left" }));
        setCell(`E${row}`, cell(severity, { bg: sv.bg, size: 9, color: sv.fg, bold: true }));
        setCell(`F${row}`, cell(status, { bg: st.bg, size: 9, color: st.fg, bold: true }));
        setCell(`G${row}`, cell(d.createdAt ? new Date(d.createdAt).toLocaleDateString('fr-FR') : dateStr, { bg, size: 9 }));
        setCell(`H${row}`, cell(priority, { bg: pc.bg, size: 9, color: pc.fg, bold: true }));
    });

    const tr = n + 9;
    setCell(`A${tr}`, { v: `TOTAL  —  ${n} Records`, t: 's', s: { font: { name: "Calibri", sz: 10, bold: true, color: { rgb: "333333" } }, fill: { fgColor: { rgb: TOTAL_BG }, patternType: "solid" }, alignment: { horizontal: "right", vertical: "center" }, border: { top: { style: "medium", color: { rgb: RAM_RED } } } } });
    ["B", "C", "D", "E", "F", "G"].forEach(c => setCell(`${c}${tr}`, emptyCell(TOTAL_BG)));
    setCell(`H${tr}`, emptyCell(TOTAL_BG));

    ws['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 7 } },
        { s: { r: 1, c: 0 }, e: { r: 1, c: 7 } },
        { s: { r: 2, c: 0 }, e: { r: 2, c: 7 } },
        { s: { r: 3, c: 0 }, e: { r: 3, c: 3 } },
        { s: { r: 5, c: 0 }, e: { r: 5, c: 1 } },
        { s: { r: 5, c: 2 }, e: { r: 5, c: 3 } },
        { s: { r: 5, c: 4 }, e: { r: 5, c: 5 } },
        { s: { r: 5, c: 6 }, e: { r: 5, c: 7 } },
        { s: { r: tr - 1, c: 0 }, e: { r: tr - 1, c: 7 } },
    ];

    ws['!cols'] = [{ wch: 5 }, { wch: 8 }, { wch: 14 }, { wch: 40 }, { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 14 }];
    ws['!rows'] = [{ hpt: 40 }, { hpt: 22 }, { hpt: 8 }, { hpt: 28 }, { hpt: 10 }, { hpt: 48 }, { hpt: 6 }, { hpt: 24 }, ...Array(n).fill({ hpt: 18 }), { hpt: 22 }];
    ws['!ref'] = `A1:H${tr}`;
    return ws;
}

// ════════════════════════════════════════════════════════════════════════════
// FEUILLE 2 — Summary Dashboard
// ════════════════════════════════════════════════════════════════════════════
function buildSheet2(defectsList, stats, dateStr) {
    const ws = {};
    const setCell = (addr, c) => { ws[addr] = c; };
    const letters = ["A", "B", "C", "D", "E", "F", "G", "H"];

    setCell("A1", titleCell("DEFECTS SUMMARY DASHBOARD", 16));
    letters.slice(1).forEach(l => setCell(`${l}1`, emptyCell(RAM_RED)));

    setCell("A2", titleCell(`Royal Air Maroc — Maintenance Control  |  Audit Date: ${dateStr}`, 10));
    letters.slice(1).forEach(l => setCell(`${l}2`, emptyCell(RAM_RED)));

    letters.forEach(l => setCell(`${l}3`, emptyCell()));

    const kpiStyle = (fg, bg) => ({
        font: { name: "Calibri", sz: 13, bold: true, color: { rgb: fg } },
        fill: { fgColor: { rgb: bg }, patternType: "solid" },
        alignment: { horizontal: "center", vertical: "center", wrapText: true },
        border: { top: { style: "medium", color: { rgb: fg } }, bottom: { style: "medium", color: { rgb: fg } }, left: { style: "medium", color: { rgb: fg } }, right: { style: "medium", color: { rgb: fg } } }
    });

    const kpis = [
        ["B4", "C5", "TOTAL LOGS", defectsList.length, "1A237E", "EEF2FF"],
        ["E4", "F5", "OPEN", stats.open, "B71C1C", "FFEBEE"],
        ["H4", "I5", "RESOLVED", stats.resolved, "1B5E20", "E8F5E9"],
        ["B7", "C8", "AOG CRITICAL", stats.critical, "E65100", "FFF8E1"],
    ];
    kpis.forEach(([s, , lbl, val, fg, bg]) => {
        setCell(s, { v: `${lbl}\n${val}`, t: 's', s: kpiStyle(fg, bg) });
    });
    ["C4", "C5", "F4", "F5", "I4", "I5", "C7", "C8"].forEach(a => setCell(a, emptyCell()));

    letters.forEach(l => setCell(`${l}10`, emptyCell()));

    setCell("B11", { v: "SEVERITY BREAKDOWN BY STATUS", t: 's', s: { font: { name: "Calibri", sz: 11, bold: true, color: { rgb: RAM_RED } }, border: { bottom: { style: "medium", color: { rgb: RAM_RED } } } } });

    ["Severity", "OPEN", "IN_PROGRESS", "RESOLVED", "TOTAL", "% Resolved"].forEach((h, i) => {
        setCell(`${["B", "C", "D", "E", "F", "G"][i]}12`, {
            v: h, t: 's',
            s: { font: { name: "Calibri", sz: 9, bold: true, color: { rgb: WHITE } }, fill: { fgColor: { rgb: DARK }, patternType: "solid" }, alignment: { horizontal: "center", vertical: "center" }, border: { top: { style: "thin", color: { rgb: DARK } }, bottom: { style: "thin", color: { rgb: DARK } }, left: { style: "thin", color: { rgb: DARK } }, right: { style: "thin", color: { rgb: DARK } } } }
        });
    });

    const severities = ['CRITICAL', 'MAJOR', 'MINOR'];
    severities.forEach((sev, mi) => {
        const row = 13 + mi;
        const mf = defectsList.filter(r => r.severity === sev);
        const o = mf.filter(r => r.status === "OPEN").length;
        const ip = mf.filter(r => r.status === "IN_PROGRESS").length;
        const r = mf.filter(r => r.status === "RESOLVED").length;
        const t = mf.length;
        const bg = mi % 2 === 1 ? ALT_ROW : WHITE;
        const pct = t ? `${Math.round(r / t * 100)}%` : "0%";
        [sev, o, ip, r, t, pct].forEach((val, ci) => {
            setCell(`${["B", "C", "D", "E", "F", "G"][ci]}${row}`, {
                v: val, t: typeof val === 'number' ? 'n' : 's',
                s: { font: { name: "Calibri", sz: 9, bold: ci === 0, color: { rgb: "333333" } }, fill: { fgColor: { rgb: bg }, patternType: "solid" }, alignment: { horizontal: "center", vertical: "center" }, border: { top: { style: "thin", color: { rgb: "DDDDDD" } }, bottom: { style: "thin", color: { rgb: "DDDDDD" } }, left: { style: "thin", color: { rgb: "DDDDDD" } }, right: { style: "thin", color: { rgb: "DDDDDD" } } } }
            });
        });
    });

    const tr2 = 13 + severities.length;
    const totalPct = defectsList.length ? `${Math.round(stats.resolved / defectsList.length * 100)}%` : "0%";
    ["TOTAL", stats.open, stats.inProgress, stats.resolved, defectsList.length, totalPct].forEach((val, ci) => {
        setCell(`${["B", "C", "D", "E", "F", "G"][ci]}${tr2}`, {
            v: val, t: typeof val === 'number' ? 'n' : 's',
            s: { font: { name: "Calibri", sz: 9, bold: true, color: { rgb: WHITE } }, fill: { fgColor: { rgb: RAM_RED }, patternType: "solid" }, alignment: { horizontal: "center", vertical: "center" } }
        });
    });

    const fr = tr2 + 2;
    setCell(`B${fr}`, { v: `Generated by RAM Maintenance Control Platform  •  ${dateStr}`, t: 's', s: { font: { name: "Calibri", sz: 8, italic: true, color: { rgb: "999999" } }, alignment: { horizontal: "center" } } });

    ws['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 7 } },
        { s: { r: 1, c: 0 }, e: { r: 1, c: 7 } },
        { s: { r: 3, c: 1 }, e: { r: 4, c: 2 } },
        { s: { r: 3, c: 4 }, e: { r: 4, c: 5 } },
        { s: { r: 3, c: 7 }, e: { r: 4, c: 8 } },
        { s: { r: 6, c: 1 }, e: { r: 7, c: 2 } },
        { s: { r: 10, c: 1 }, e: { r: 10, c: 8 } },
        { s: { r: fr - 1, c: 1 }, e: { r: fr - 1, c: 8 } },
    ];

    ws['!cols'] = [{ wch: 3 }, { wch: 16 }, { wch: 14 }, { wch: 3 }, { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 3 }];
    ws['!rows'] = [{ hpt: 36 }, { hpt: 20 }, { hpt: 14 }, ...Array(10).fill({ hpt: 28 })];
    ws['!ref'] = `A1:H${fr}`;
    return ws;
}

// ════════════════════════════════════════════════════════════════════════════
// FEUILLE 3 — Critical & Open Defects
// ════════════════════════════════════════════════════════════════════════════
function buildSheet3(defectsList, dateStr) {
    const ws = {};
    const setCell = (addr, c) => { ws[addr] = c; };
    const letters = ["A", "B", "C", "D", "E", "F", "G", "H"];

    setCell("A1", titleCell("CRITICAL & OPEN DEFECTS — AOG PRIORITY LIST", 13));
    letters.slice(1).forEach(l => setCell(`${l}1`, emptyCell(RAM_RED)));

    setCell("A2", titleCell(`Audit Date: ${dateStr}  |  Maintenance Control Priority`, 9));
    letters.slice(1).forEach(l => setCell(`${l}2`, emptyCell(RAM_RED)));

    letters.forEach(l => setCell(`${l}3`, emptyCell()));

    ["#", "ID", "Aircraft", "Description", "Severity", "Status", "Reported Date", "Priority"].forEach((h, i) => {
        setCell(`${letters[i]}4`, headerCell(h));
    });

    const critical = defectsList.filter(d => d.status === 'OPEN' || d.status === 'IN_PROGRESS' || d.severity === 'CRITICAL');

    critical.forEach((d, idx) => {
        const row = idx + 5;
        const status = d.status || "OPEN";
        const st = STATUS_STYLE[status] || STATUS_STYLE.OPEN;
        const severity = d.severity || "MINOR";
        const sv = SEVERITY_STYLE[severity] || SEVERITY_STYLE.MINOR;
        let priority = "ROUTINE";
        if (severity === 'CRITICAL') priority = "AOG";
        else if (severity === 'MAJOR') priority = "URGENT";
        else if (status === 'OPEN') priority = "PENDING";
        else if (status === 'IN_PROGRESS') priority = "ACTIVE";

        const priorityColors = {
            AOG: { bg: "FFEBEE", fg: "B71C1C" },
            URGENT: { bg: "FFF8E1", fg: "E65100" },
            PENDING: { bg: "E3F2FD", fg: "0D47A1" },
            ACTIVE: { bg: "E8F5E9", fg: "1B5E20" },
            ROUTINE: { bg: "F5F5F5", fg: "616161" },
        };
        const pc = priorityColors[priority] || priorityColors.ROUTINE;

        setCell(`A${row}`, cell(idx + 1, { bg: "FAFAFA", size: 9 }));
        setCell(`B${row}`, cell(d.id, { bg: "FAFAFA", size: 9, color: RAM_RED, bold: true }));
        setCell(`C${row}`, cell(d.aircraftRegistration || d.aircraft?.registration || "", { bg: "FAFAFA", size: 9, bold: true }));
        setCell(`D${row}`, cell(d.description || "", { bg: "FAFAFA", size: 9, hAlign: "left" }));
        setCell(`E${row}`, cell(severity, { bg: sv.bg, size: 9, color: sv.fg, bold: true }));
        setCell(`F${row}`, cell(status, { bg: st.bg, size: 9, color: st.fg, bold: true }));
        setCell(`G${row}`, cell(d.createdAt ? new Date(d.createdAt).toLocaleDateString('fr-FR') : dateStr, { bg: "FAFAFA", size: 9 }));
        setCell(`H${row}`, cell(priority, { bg: pc.bg, size: 9, color: pc.fg, bold: true }));
    });

    ws['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 7 } },
        { s: { r: 1, c: 0 }, e: { r: 1, c: 7 } },
    ];
    ws['!cols'] = [{ wch: 5 }, { wch: 8 }, { wch: 14 }, { wch: 40 }, { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 14 }];
    ws['!ref'] = `A1:H${critical.length + 4}`;
    return ws;
}

// ════════════════════════════════════════════════════════════════════════════
// COMPONENT
// ════════════════════════════════════════════════════════════════════════════
const Defects = () => {
    const { state: globalState } = useAppData();
    const [defects, setDefects] = useState([]);
    const [aircraft, setAircraft] = useState([]);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    const [showArchived, setShowArchived] = useState(false);
    const [severityFilter, setSeverityFilter] = useState('ALL');

    const [showModal, setShowModal] = useState(false);
    const [editingDefect, setEditingDefect] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const [formData, setFormData] = useState({
        description: '',
        severity: 'MAJOR',
        aircraftId: '',
        status: 'OPEN'
    });

    useEffect(() => { fetchData(); }, []);
    useEffect(() => { setCurrentPage(1); }, [searchTerm, showArchived, severityFilter]);

    // Merge global store data after API data loads
    useEffect(() => {
        if (!loading && globalState.defects && globalState.defects.length > 0) {
            setDefects(prev => {
                const mappedGlobalDefects = globalState.defects.map(d => ({
                    id: d.Defect_ID || d.id,
                    aircraftRegistration: d.Aircraft || d.aircraftRegistration,
                    aircraftType: d.Aircraft_Type || d.aircraftType,
                    description: d.Description || d.description,
                    category: d.Category || d.category,
                    ataChapter: d.ATA_Chapter || d.ataChapter,
                    severity: d.Severity || d.severity,
                    status: d.Status || d.status,
                    reportedDate: d.Reported_Date || d.reportedDate,
                    resolvedDate: d.Resolved_Date || d.resolvedDate,
                    reportedBy: d.Reported_By || d.reportedBy,
                    assignedTechnician: d.Assigned_Technician || d.assignedTechnician,
                    correctiveAction: d.Corrective_Action || d.correctiveAction,
                    repairCostMAD: d.Repair_Cost_MAD || d.repairCostMAD,
                    flightHoursAtDiscovery: d.Flight_Hours_At_Discovery || d.flightHoursAtDiscovery,
                    cyclesAtDiscovery: d.Cycles_At_Discovery || d.cyclesAtDiscovery,
                    complianceReference: d.Compliance_Reference || d.complianceReference,
                }));
                const existingIds = new Set(prev.map(d => d.id));
                const newDefects = mappedGlobalDefects.filter(d => !existingIds.has(d.id));
                return [...prev, ...newDefects];
            });
        }
    }, [loading, globalState.defects]);

    async function fetchData() {
        try {
            setLoading(true);
            const [defectsRes, aircraftRes] = await Promise.all([
                defectAPI.getAll(),
                aircraftAPI.getAll()
            ]);
            setDefects(defectsRes.data || []);
            setAircraft(aircraftRes.data || []);
            setError(null);
        } catch (err) {
            logApiError('Defects Load', err);
            setError('Database synchronization failed.');
        } finally {
            setLoading(false);
        }
    }

    const filteredDefects = useMemo(() => {
        let result = defects.filter(d => {
            const term = searchTerm.toLowerCase();
            return (
                d.id?.toString().includes(term) ||
                d.aircraftRegistration?.toLowerCase().includes(term) ||
                d.aircraft?.registration?.toLowerCase().includes(term) ||
                d.description?.toLowerCase().includes(term)
            );
        });
        if (showArchived) result = result.filter(d => d.status === 'RESOLVED');
        if (severityFilter !== 'ALL') result = result.filter(d => d.severity === severityFilter);
        return result;
    }, [defects, searchTerm, showArchived, severityFilter]);

    const totalPages = Math.ceil(filteredDefects.length / ITEMS_PER_PAGE) || 1;
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedDefects = useMemo(() =>
            filteredDefects.slice(startIndex, startIndex + ITEMS_PER_PAGE)
        , [filteredDefects, startIndex]);

    const stats = useMemo(() => ({
        total: defects.length,
        open: defects.filter(d => d.status === 'OPEN').length,
        inProgress: defects.filter(d => d.status === 'IN_PROGRESS').length,
        resolved: defects.filter(d => d.status === 'RESOLVED').length,
        critical: defects.filter(d => (d.severity === 'CRITICAL' || d.severity === 'MAJOR') && d.status === 'OPEN').length,
    }), [defects]);

    // ── Export Excel ─────────────────────────────────────────────────────
    const handleExport = () => {
        setExporting(true);
        try {
            const dateStr = new Date().toLocaleDateString('fr-FR');
            const wb = XLSXStyle.utils.book_new();
            XLSXStyle.utils.book_append_sheet(wb, buildSheet1(filteredDefects, stats, dateStr), "Defects Registry");
            XLSXStyle.utils.book_append_sheet(wb, buildSheet2(filteredDefects, stats, dateStr), "Summary Dashboard");
            XLSXStyle.utils.book_append_sheet(wb, buildSheet3(filteredDefects, dateStr), "Critical & Open");
            XLSXStyle.writeFile(wb, `RAM_Defects_Registry_${new Date().toISOString().slice(0, 10)}.xlsx`);
        } catch (err) {
            console.error('Export failed:', err);
            setError('Report generation failed.');
        } finally {
            setExporting(false);
        }
    };

    const handleOpenModal = (defect = null) => {
        if (defect) {
            setEditingDefect(defect);
            setFormData({
                description: defect.description,
                severity: defect.severity,
                aircraftId: defect.aircraftId || defect.aircraft?.id || '',
                status: defect.status
            });
        } else {
            setEditingDefect(null);
            setFormData({ description: '', severity: 'MAJOR', aircraftId: '', status: 'OPEN' });
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
            const payload = { ...formData, aircraftId: Number(formData.aircraftId) };
            if (editingDefect) {
                await defectAPI.update(editingDefect.id, payload);
            } else {
                await defectAPI.create(payload);
            }
            await fetchData();
            setShowModal(false);
            setEditingDefect(null);
            setFormData({ description: '', severity: 'MAJOR', aircraftId: '', status: 'OPEN' });
        } catch (err) {
            logApiError('Defect Submit', err);
            setError(`Transaction failed: ${err.response?.data?.message || err.message}`);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteClick = (defect) => {
        setDeleteTarget(defect);
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
            await defectAPI.delete(deleteTarget.id);
            await fetchData();
            setShowDeleteConfirm(false);
            setDeleteTarget(null);
            setError(null);
        } catch (err) {
            logApiError('Delete Defect', err);
            setError(`Failed to remove defect #${deleteTarget.id}: ${err.response?.data?.message || err.message}`);
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
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Loading Defects...</p>
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
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Maintenance Control</span>
                        </div>
                        <h1 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tighter uppercase">
                            Defects <span className="text-ram-red italic">& Logs</span>
                        </h1>
                    </div>
                </div>
                <div className="flex gap-3 w-full lg:w-auto">
                    <div className="relative flex-1 lg:flex-none">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                        <input
                            type="text"
                            placeholder="Search by ID, aircraft, description..."
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
                        <Plus size={14} /> Report
                    </button>
                </div>
            </header>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                    { label: 'Total Logs', value: stats.total, icon: Zap, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Unresolved', value: stats.open, icon: AlertTriangle, color: 'text-ram-red', bg: 'bg-red-50' },
                    { label: 'AOG Critical', value: stats.critical, icon: ShieldAlert, color: 'text-amber-600', bg: 'bg-amber-50' },
                    { label: 'Resolved', value: stats.resolved, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
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

            {/* Filters */}
            <div className="flex flex-wrap gap-3 mb-6">
                <button
                    onClick={() => setShowArchived(prev => !prev)}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                        showArchived
                            ? 'bg-ram-red text-white border-ram-red shadow-sm'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                >
                    {showArchived ? 'Show Active' : 'Show Resolved'}
                </button>
                {['ALL', 'CRITICAL', 'MAJOR', 'MINOR'].map(sev => (
                    <button
                        key={sev}
                        onClick={() => setSeverityFilter(sev)}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                            severityFilter === sev
                                ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                    >
                        {sev === 'ALL' ? 'All' : sev}
                    </button>
                ))}
                {(showArchived || severityFilter !== 'ALL') && (
                    <button
                        onClick={() => { setShowArchived(false); setSeverityFilter('ALL'); }}
                        className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-ram-red transition-all flex items-center gap-1"
                    >
                        <X size={12} /> Clear
                    </button>
                )}
            </div>

            {/* Table */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm">
                <div className="w-full">
                    <table className="w-full text-left table-fixed">
                        <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-100">
                            <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest w-[8%]">ID</th>
                            <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest w-[16%]">Aircraft</th>
                            <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest w-[32%]">Description</th>
                            <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest w-[12%]">Severity</th>
                            <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest w-[12%]">Status</th>
                            <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right w-[20%]">Control</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                        {paginatedDefects.length > 0 ? paginatedDefects.map((d) => (
                            <tr key={d.id} className="hover:bg-slate-50/50 transition-colors group">
                                <td className="px-6 py-6">
                                    <span className="text-sm font-black text-slate-400 tabular-nums">#{d.id}</span>
                                </td>
                                <td className="px-6 py-6">
                                    <span className="text-sm font-black text-slate-900 tracking-tighter uppercase">{d.aircraftRegistration || d.aircraft?.registration || 'N/A'}</span>
                                </td>
                                <td className="px-6 py-6">
                                    <p className="text-sm text-slate-700 truncate">{d.description}</p>
                                </td>
                                <td className="px-6 py-6">
                                        <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                                            d.severity === 'CRITICAL' ? 'bg-red-50 text-red-700 border-red-100' :
                                                d.severity === 'MAJOR' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                                    'bg-blue-50 text-blue-700 border-blue-100'
                                        }`}>
                                            <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${d.severity === 'CRITICAL' ? 'bg-red-600 animate-pulse' : 'bg-current'}`} />
                                            {d.severity}
                                        </span>
                                </td>
                                <td className="px-6 py-6">
                                        <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                                            d.status === 'OPEN' ? 'bg-red-50 text-red-600 border-red-100' :
                                                d.status === 'IN_PROGRESS' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                                    'bg-emerald-50 text-emerald-600 border-emerald-100'
                                        }`}>
                                            <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${d.status === 'IN_PROGRESS' ? 'bg-blue-500 animate-pulse' : 'bg-current'}`} />
                                            {d.status}
                                        </span>
                                </td>
                                <td className="px-6 py-6 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            onClick={() => handleOpenModal(d)}
                                            className="p-2.5 bg-white border border-slate-100 text-slate-400 hover:text-ram-red hover:border-ram-red/30 rounded-xl transition-all shadow-sm"
                                            title="Edit defect"
                                        >
                                            <Pencil size={14} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteClick(d)}
                                            className="p-2.5 bg-white border border-slate-100 text-slate-400 hover:text-red-600 hover:border-red-200 rounded-xl transition-all shadow-sm"
                                            title="Delete defect"
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
                                        <AlertTriangle size={32} className="text-slate-200" />
                                        <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.4em]">No defects found</p>
                                        <p className="text-slate-300 text-[10px]">Report a new defect to begin tracking</p>
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
                            {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, filteredDefects.length)} of {filteredDefects.length} records
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

            {/* Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => { setShowModal(false); setEditingDefect(null); }}
                title={editingDefect ? 'Edit Defect' : 'Report New Defect'}
            >
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <p className="text-slate-500 text-sm font-medium italic border-b border-slate-100 pb-3">
                        {editingDefect ? 'Update defect details.' : 'Enter defect information for tracking.'}
                    </p>

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
                                <option key={ac.id} value={ac.id}>{ac.registration} — {ac.model}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            required
                            rows={3}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-ram-red/20 focus:border-ram-red transition-all resize-none"
                            placeholder="Describe the defect..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Severity</label>
                            <select
                                name="severity"
                                value={formData.severity}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-ram-red/20 focus:border-ram-red transition-all appearance-none"
                            >
                                <option value="MINOR">Minor</option>
                                <option value="MAJOR">Major</option>
                                <option value="CRITICAL">Critical (AOG)</option>
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
                                <option value="OPEN">Open</option>
                                <option value="IN_PROGRESS">In Progress</option>
                                <option value="RESOLVED">Resolved</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={() => { setShowModal(false); setEditingDefect(null); }}
                            className="px-6 py-3 font-black text-xs uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-ram-red transition-all disabled:opacity-50 flex items-center gap-2"
                        >
                            {submitting ? <Loader2 size={14} className="animate-spin" /> : null}
                            {submitting ? 'Processing...' : (editingDefect ? 'Update' : 'Report')}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Confirm Delete */}
            <ConfirmDialog
                isOpen={showDeleteConfirm}
                onClose={handleCancelDelete}
                onConfirm={handleConfirmDelete}
                title="Confirm Deletion"
                message={deleteTarget ? `Remove defect #${deleteTarget.id} for ${deleteTarget.aircraftRegistration || deleteTarget.aircraft?.registration || 'N/A'}? This cannot be undone.` : ''}
                confirmText={deleting ? 'Removing...' : 'Confirm Removal'}
                cancelText="Cancel"
                confirmVariant="danger"
                isLoading={deleting}
            />

            {/* Toast */}
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

export default Defects;