import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { employeeAPI, logApiError } from '../services/api';
import Header from '../components/Layout/Header';
import Logo from '../components/UI/Logo';
import Modal from '../components/UI/Modal';
import ConfirmDialog from '../components/UI/ConfirmDialog';
import {
    Users, Plus, Search, Filter, Mail, Briefcase, Calendar, ShieldCheck,
    UserPlus, Loader2, Pencil, Trash2, ChevronLeft, ChevronRight, UserCircle,
    MapPin, Download, X, Check, AlertTriangle, TrendingUp, Clock, Award,
    Activity, Sparkles, Zap, Crown, BarChart3, Eye, RefreshCw, FileSpreadsheet,
    FileJson, FileDown
} from 'lucide-react';
import * as XLSX from 'xlsx';

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS & CONFIG
// ═══════════════════════════════════════════════════════════════════════════
const ITEMS_PER_PAGE = 8;

const ROLE_CONFIG = {
    ADMIN:     { label: 'Administrator',  bg: 'bg-slate-800',       text: 'text-white',      border: 'border-slate-700', icon: Crown },
    MANAGER:   { label: 'Manager',          bg: 'bg-ram-red',         text: 'text-white',      border: 'border-red-500',   icon: Award },
    TECHNICIAN:{ label: 'Technician',       bg: 'bg-blue-500',        text: 'text-white',      border: 'border-blue-400',  icon: Zap },
    DEFAULT:   { label: 'Staff',            bg: 'bg-slate-100',       text: 'text-slate-700',  border: 'border-slate-300', icon: UserCircle }
};

const STATUS_CONFIG = {
    ACTIVE:    { bg: 'bg-emerald-50', text: 'text-emerald-600', dot: 'bg-emerald-500', pulse: true,  border: 'border-emerald-200' },
    INACTIVE:  { bg: 'bg-slate-100',   text: 'text-slate-500',   dot: 'bg-slate-400',   pulse: false, border: 'border-slate-200' },
    SUSPENDED: { bg: 'bg-amber-50',  text: 'text-amber-600',   dot: 'bg-amber-500',   pulse: false, border: 'border-amber-200' }
};

// ═══════════════════════════════════════════════════════════════════════════
// UTILITY COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

const AnimatedCounter = ({ value, duration = 800 }) => {
    const [count, setCount] = useState(0);
    const countRef = useRef(null);

    useEffect(() => {
        const start = 0;
        const end = value;
        const startTime = performance.now();

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeOut = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(start + (end - start) * easeOut));
            if (progress < 1) countRef.current = requestAnimationFrame(animate);
        };

        countRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(countRef.current);
    }, [value, duration]);

    return <span>{count}</span>;
};

const RoleBadge = ({ role }) => {
    const config = ROLE_CONFIG[role] || ROLE_CONFIG.DEFAULT;
    const Icon = config.icon;
    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border ${config.bg} ${config.text} ${config.border} shadow-sm transition-all duration-200 hover:scale-105`}>
            <Icon size={12} />
            {config.label}
        </span>
    );
};

const StatusBadge = ({ status }) => {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.INACTIVE;
    return (
        <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${config.bg} ${config.text} ${config.border} transition-all duration-200 hover:scale-105`}>
            <span className={`w-2 h-2 rounded-full ${config.dot} ${config.pulse ? 'animate-pulse' : ''}`} />
            {status}
        </span>
    );
};

const Avatar = ({ name }) => {
    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    return (
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-sm font-black text-slate-600 border border-slate-200 shadow-sm transition-all duration-300 hover:scale-110 hover:shadow-md">
            {initials}
        </div>
    );
};

const EmptyState = ({ onAction }) => (
    <tr>
        <td colSpan={6} className="px-10 py-20">
            <div className="flex flex-col items-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center border border-slate-200">
                    <Users size={32} className="text-slate-300" />
                </div>
                <div className="text-center">
                    <p className="text-base font-black text-slate-700 mb-1">No personnel found</p>
                    <p className="text-xs text-slate-400">Add your first employee to get started</p>
                </div>
                <button onClick={onAction} className="flex items-center gap-2 px-5 py-2.5 bg-ram-red text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:shadow-lg hover:shadow-ram-red/20 transition-all active:scale-95">
                    <UserPlus size={14} /> Add Employee
                </button>
            </div>
        </td>
    </tr>
);

const SkeletonRow = () => (
    <tr className="animate-pulse">
        <td className="px-8 py-6"><div className="flex items-center gap-4"><div className="w-11 h-11 rounded-xl bg-slate-200" /><div className="space-y-2"><div className="w-28 h-4 bg-slate-200 rounded" /><div className="w-20 h-3 bg-slate-100 rounded" /></div></div></td>
        <td className="px-8 py-6"><div className="w-20 h-6 bg-slate-200 rounded-lg" /></td>
        <td className="px-8 py-6"><div className="w-24 h-4 bg-slate-200 rounded" /></td>
        <td className="px-8 py-6"><div className="w-20 h-4 bg-slate-200 rounded" /></td>
        <td className="px-8 py-6"><div className="w-16 h-6 bg-slate-200 rounded-full" /></td>
        <td className="px-8 py-6"><div className="w-24 h-8 bg-slate-200 rounded-xl ml-auto" /></td>
    </tr>
);

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

function Employees() {
    // ── State ──────────────────────────────────────────────────────────────
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [sortConfig, setSortConfig] = useState({ key: 'firstName', direction: 'asc' });
    const [viewEmployee, setViewEmployee] = useState(null);
    const [showViewModal, setShowViewModal] = useState(false);

    const [showModal, setShowModal] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const [formData, setFormData] = useState({
        firstName: '', lastName: '', email: '', role: 'TECHNICIAN',
        department: '', hireDate: '', status: 'ACTIVE',
    });

    const [formErrors, setFormErrors] = useState({});

    // ── Effects ────────────────────────────────────────────────────────────
    useEffect(() => { fetchEmployees(); }, []);
    useEffect(() => { setCurrentPage(1); }, [searchTerm]);

    // ── Data Fetching ──────────────────────────────────────────────────────
    const fetchEmployees = useCallback(async () => {
        try {
            setLoading(true);
            const response = await employeeAPI.getAll();
            setEmployees(response.data || []);
            setError(null);
        } catch (err) {
            logApiError('Employee Load', err);
            setError('Failed to load employees. Please try again.');
        } finally {
            setLoading(false);
        }
    }, []);

    // ── Derived State ──────────────────────────────────────────────────────
    const filteredEmployees = useMemo(() => {
        let result = employees;
        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase().trim();
            result = result.filter(e =>
                e.firstName?.toLowerCase().includes(term) ||
                e.lastName?.toLowerCase().includes(term) ||
                e.email?.toLowerCase().includes(term) ||
                e.department?.toLowerCase().includes(term)
            );
        }
        result = [...result].sort((a, b) => {
            const aVal = (a[sortConfig.key] || '').toString().toLowerCase();
            const bVal = (b[sortConfig.key] || '').toString().toLowerCase();
            if (sortConfig.direction === 'asc') return aVal > bVal ? 1 : -1;
            return aVal < bVal ? 1 : -1;
        });
        return result;
    }, [employees, searchTerm, sortConfig]);

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const totalPages = Math.max(1, Math.ceil(filteredEmployees.length / ITEMS_PER_PAGE));
    const paginatedEmployees = filteredEmployees.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const stats = useMemo(() => {
        const active = employees.filter(e => e.status === 'ACTIVE');
        const techs = employees.filter(e => e.role === 'TECHNICIAN');
        const depts = new Set(employees.map(e => e.department).filter(Boolean));
        const avgTenure = employees.length > 0
            ? Math.round(employees.reduce((acc, e) => {
                const years = e.hireDate ? (Date.now() - new Date(e.hireDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000) : 0;
                return acc + years;
            }, 0) / employees.length) : 0;
        return {
            total: employees.length, active: active.length, techs: techs.length,
            deptCount: depts.size, avgTenure,
            activeRate: employees.length > 0 ? Math.round((active.length / employees.length) * 100) : 0
        };
    }, [employees]);

    // ── Form Validation ────────────────────────────────────────────────────
    const validateForm = () => {
        const errors = {};
        if (!formData.firstName?.trim()) errors.firstName = 'First name is required';
        if (!formData.lastName?.trim()) errors.lastName = 'Last name is required';
        if (!formData.email?.trim()) {
            errors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            errors.email = 'Invalid email format';
        }
        if (!formData.department?.trim()) errors.department = 'Department is required';
        if (!formData.hireDate) errors.hireDate = 'Hire date is required';
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // ── Handlers ─────────────────────────────────────────────────────────

    // EXPORT: génère un fichier Excel ultra-stylé avec couleurs
    const handleExport = useCallback(() => {
        if (filteredEmployees.length === 0) {
            setError('No data to export. Add employees first.');
            return;
        }
        setExporting(true);
        try {
            // ─── Données ─────────────────────────────────────────────────────
            const headers = ['Employee ID', 'Full Name', 'Email', 'Role', 'Department', 'Hire Date', 'Status', 'Tenure (Years)'];

            const data = filteredEmployees.map(e => ({
                'Employee ID': e.id || 'N/A',
                'Full Name': `${e.firstName || ''} ${e.lastName || ''}`.trim(),
                'Email': e.email || 'N/A',
                'Role': e.role || 'N/A',
                'Department': e.department || 'N/A',
                'Hire Date': e.hireDate ? new Date(e.hireDate).toLocaleDateString('en-GB') : 'N/A',
                'Status': e.status || 'N/A',
                'Tenure (Years)': e.hireDate ? Math.floor((Date.now() - new Date(e.hireDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : 'N/A'
            }));

            // ─── Créer le workbook ─────────────────────────────────────────
            const wb = XLSX.utils.book_new();

            // ═══════════════════════════════════════════════════════════════
            // FEUILLE PRINCIPALE - Avec titre stylé et données
            // ═══════════════════════════════════════════════════════════════
            const ws = XLSX.utils.aoa_to_sheet([
                [''],
                ['', '', '', 'RAM WORKFORCE REGISTER'],
                ['', '', '', 'Personnel Division'],
                ['', '', '', `Export Date: ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`],
                [''],
                ['', 'SUMMARY STATISTICS'],
                ['', 'Total Employees:', filteredEmployees.length, '', 'Active:', filteredEmployees.filter(e => e.status === 'ACTIVE').length],
                ['', 'Technicians:', filteredEmployees.filter(e => e.role === 'TECHNICIAN').length, '', 'Departments:', new Set(filteredEmployees.map(e => e.department).filter(Boolean)).size],
                [''],
                headers,
                ...data.map(row => headers.map(h => row[h]))
            ]);

            // ─── Largeurs de colonnes ──────────────────────────────────────
            ws['!cols'] = [
                { wch: 3 },   // Colonne vide (marge)
                { wch: 14 },  // Employee ID / Labels
                { wch: 24 },  // Full Name / Values
                { wch: 30 },  // Email / Values
                { wch: 14 },  // Role
                { wch: 18 },  // Department
                { wch: 12 },  // Hire Date
                { wch: 12 },  // Status
                { wch: 14 },  // Tenure
            ];

            // ─── Merge cells pour le titre ─────────────────────────────────
            ws['!merges'] = [
                // Titre principal
                { s: { r: 1, c: 1 }, e: { r: 1, c: 8 } },
                // Sous-titre
                { s: { r: 2, c: 1 }, e: { r: 2, c: 8 } },
                // Date
                { s: { r: 3, c: 1 }, e: { r: 3, c: 8 } },
                // Section Statistics
                { s: { r: 5, c: 1 }, e: { r: 5, c: 8 } },
            ];

            // ─── Styles ────────────────────────────────────────────────────
            const COLOR_HEADER_BG = '1E3A5F';      // Bleu foncé
            const COLOR_HEADER_TEXT = 'FFFFFF';    // Blanc
            const COLOR_TITLE_BG = 'F8FAFC';         // Gris très clair
            const COLOR_TITLE_TEXT = '1E293B';     // Slate 800
            const COLOR_SUBTITLE = '64748B';       // Slate 500
            const COLOR_STATS_BG = 'F1F5F9';       // Slate 100
            const COLOR_STATS_LABEL = '475569';      // Slate 600
            const COLOR_STATS_VALUE = '0F172A';      // Slate 900
            const COLOR_ALT_ROW = 'F8FAFC';        // Gris alterné
            const COLOR_WHITE = 'FFFFFF';
            const COLOR_BORDER = 'E2E8F0';         // Slate 200
            const COLOR_ADMIN_BG = '1E293B';       // Admin badge
            const COLOR_MANAGER_BG = 'DC2626';     // Manager badge (red)
            const COLOR_TECH_BG = '2563EB';        // Tech badge (blue)
            const COLOR_STAFF_BG = 'F1F5F9';       // Staff badge
            const COLOR_ACTIVE_BG = 'DCFCE7';      // Active green light
            const COLOR_ACTIVE_TEXT = '166534';    // Active green dark
            const COLOR_INACTIVE_BG = 'F1F5F9';    // Inactive gray
            const COLOR_INACTIVE_TEXT = '64748B';  // Inactive text
            const COLOR_SUSPENDED_BG = 'FEF3C7';   // Suspended amber
            const COLOR_SUSPENDED_TEXT = '92400E'; // Suspended text

            // ═══ LIGNE 1: Espace vide (marge) ═══
            for (let C = 0; C <= 8; C++) {
                const cell = XLSX.utils.encode_cell({ r: 0, c: C });
                ws[cell] = { v: '', t: 's', s: { fill: { fgColor: { rgb: COLOR_TITLE_BG }, patternType: 'solid' } } };
            }

            // ═══ LIGNE 2: TITRE PRINCIPAL ═══
            ws['B2'] = {
                v: 'RAM WORKFORCE REGISTER',
                t: 's',
                s: {
                    font: { bold: true, sz: 22, color: { rgb: COLOR_TITLE_TEXT }, name: 'Calibri' },
                    fill: { fgColor: { rgb: COLOR_TITLE_BG }, patternType: 'solid' },
                    alignment: { horizontal: 'center', vertical: 'center' },
                    border: {
                        top: { style: 'medium', color: { rgb: COLOR_HEADER_BG } },
                        bottom: { style: 'thin', color: { rgb: COLOR_BORDER } }
                    }
                }
            };

            // ═══ LIGNE 3: Sous-titre ═══
            ws['B3'] = {
                v: 'Personnel Division',
                t: 's',
                s: {
                    font: { sz: 13, color: { rgb: COLOR_SUBTITLE }, name: 'Calibri' },
                    fill: { fgColor: { rgb: COLOR_TITLE_BG }, patternType: 'solid' },
                    alignment: { horizontal: 'center', vertical: 'center' }
                }
            };

            // ═══ LIGNE 4: Date ═══
            ws['B4'] = {
                v: `Export Date: ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`,
                t: 's',
                s: {
                    font: { sz: 10, italic: true, color: { rgb: '94A3B8' }, name: 'Calibri' },
                    fill: { fgColor: { rgb: COLOR_TITLE_BG }, patternType: 'solid' },
                    alignment: { horizontal: 'center', vertical: 'center' }
                }
            };

            // ═══ LIGNE 5: Espace ═══
            for (let C = 0; C <= 8; C++) {
                const cell = XLSX.utils.encode_cell({ r: 4, c: C });
                ws[cell] = { v: '', t: 's', s: { fill: { fgColor: { rgb: COLOR_WHITE }, patternType: 'solid' } } };
            }

            // ═══ LIGNE 6: Section Statistics ═══
            ws['B6'] = {
                v: 'SUMMARY STATISTICS',
                t: 's',
                s: {
                    font: { bold: true, sz: 12, color: { rgb: COLOR_HEADER_BG }, name: 'Calibri' },
                    fill: { fgColor: { rgb: COLOR_STATS_BG }, patternType: 'solid' },
                    alignment: { horizontal: 'left', vertical: 'center' },
                    border: {
                        top: { style: 'thin', color: { rgb: COLOR_BORDER } },
                        bottom: { style: 'thin', color: { rgb: COLOR_BORDER } }
                    }
                }
            };

            // ═══ LIGNE 7: Stats row 1 ═══
            ws['B7'] = { v: 'Total Employees:', t: 's', s: {
                    font: { bold: true, sz: 10, color: { rgb: COLOR_STATS_LABEL }, name: 'Calibri' },
                    fill: { fgColor: { rgb: COLOR_STATS_BG }, patternType: 'solid' },
                    alignment: { horizontal: 'right', vertical: 'center' }
                }};
            ws['C7'] = { v: filteredEmployees.length, t: 'n', s: {
                    font: { bold: true, sz: 11, color: { rgb: COLOR_STATS_VALUE }, name: 'Calibri' },
                    fill: { fgColor: { rgb: COLOR_STATS_BG }, patternType: 'solid' },
                    alignment: { horizontal: 'left', vertical: 'center' }
                }};
            ws['D7'] = { v: '', t: 's', s: { fill: { fgColor: { rgb: COLOR_STATS_BG }, patternType: 'solid' } } };
            ws['E7'] = { v: 'Active:', t: 's', s: {
                    font: { bold: true, sz: 10, color: { rgb: COLOR_STATS_LABEL }, name: 'Calibri' },
                    fill: { fgColor: { rgb: COLOR_STATS_BG }, patternType: 'solid' },
                    alignment: { horizontal: 'right', vertical: 'center' }
                }};
            ws['F7'] = { v: filteredEmployees.filter(e => e.status === 'ACTIVE').length, t: 'n', s: {
                    font: { bold: true, sz: 11, color: { rgb: '16A34A' }, name: 'Calibri' },
                    fill: { fgColor: { rgb: COLOR_STATS_BG }, patternType: 'solid' },
                    alignment: { horizontal: 'left', vertical: 'center' }
                }};
            for (let C = 6; C <= 8; C++) {
                const cell = XLSX.utils.encode_cell({ r: 6, c: C });
                if (!ws[cell]) ws[cell] = { v: '', t: 's', s: { fill: { fgColor: { rgb: COLOR_STATS_BG }, patternType: 'solid' } } };
            }

            // ═══ LIGNE 8: Stats row 2 ═══
            ws['B8'] = { v: 'Technicians:', t: 's', s: {
                    font: { bold: true, sz: 10, color: { rgb: COLOR_STATS_LABEL }, name: 'Calibri' },
                    fill: { fgColor: { rgb: COLOR_STATS_BG }, patternType: 'solid' },
                    alignment: { horizontal: 'right', vertical: 'center' }
                }};
            ws['C8'] = { v: filteredEmployees.filter(e => e.role === 'TECHNICIAN').length, t: 'n', s: {
                    font: { bold: true, sz: 11, color: { rgb: COLOR_STATS_VALUE }, name: 'Calibri' },
                    fill: { fgColor: { rgb: COLOR_STATS_BG }, patternType: 'solid' },
                    alignment: { horizontal: 'left', vertical: 'center' }
                }};
            ws['D8'] = { v: '', t: 's', s: { fill: { fgColor: { rgb: COLOR_STATS_BG }, patternType: 'solid' } } };
            ws['E8'] = { v: 'Departments:', t: 's', s: {
                    font: { bold: true, sz: 10, color: { rgb: COLOR_STATS_LABEL }, name: 'Calibri' },
                    fill: { fgColor: { rgb: COLOR_STATS_BG }, patternType: 'solid' },
                    alignment: { horizontal: 'right', vertical: 'center' }
                }};
            ws['F8'] = { v: new Set(filteredEmployees.map(e => e.department).filter(Boolean)).size, t: 'n', s: {
                    font: { bold: true, sz: 11, color: { rgb: COLOR_STATS_VALUE }, name: 'Calibri' },
                    fill: { fgColor: { rgb: COLOR_STATS_BG }, patternType: 'solid' },
                    alignment: { horizontal: 'left', vertical: 'center' }
                }};
            for (let C = 6; C <= 8; C++) {
                const cell = XLSX.utils.encode_cell({ r: 7, c: C });
                if (!ws[cell]) ws[cell] = { v: '', t: 's', s: { fill: { fgColor: { rgb: COLOR_STATS_BG }, patternType: 'solid' } } };
            }

            // ═══ LIGNE 9: Espace avant tableau ═══
            for (let C = 0; C <= 8; C++) {
                const cell = XLSX.utils.encode_cell({ r: 8, c: C });
                ws[cell] = { v: '', t: 's', s: { fill: { fgColor: { rgb: COLOR_WHITE }, patternType: 'solid' } } };
            }

            // ═══ LIGNE 10: HEADER du tableau ═══
            for (let C = 0; C < headers.length; C++) {
                const cellRef = XLSX.utils.encode_cell({ r: 9, c: C + 1 });
                ws[cellRef] = {
                    v: headers[C],
                    t: 's',
                    s: {
                        font: { bold: true, sz: 11, color: { rgb: COLOR_HEADER_TEXT }, name: 'Calibri' },
                        fill: { fgColor: { rgb: COLOR_HEADER_BG }, patternType: 'solid' },
                        alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
                        border: {
                            top: { style: 'medium', color: { rgb: COLOR_HEADER_BG } },
                            bottom: { style: 'medium', color: { rgb: '2C5282' } },
                            left: { style: 'thin', color: { rgb: '3B5998' } },
                            right: { style: 'thin', color: { rgb: '3B5998' } }
                        }
                    }
                };
            }

            // ═══ LIGNES DE DONNÉES ═══
            const dataStartRow = 10;
            for (let R = 0; R < data.length; R++) {
                const rowIdx = dataStartRow + R;
                const rowData = data[R];
                const isEven = R % 2 === 0;
                const baseBg = isEven ? COLOR_WHITE : COLOR_ALT_ROW;

                for (let C = 0; C < headers.length; C++) {
                    const cellRef = XLSX.utils.encode_cell({ r: rowIdx, c: C + 1 });
                    const headerKey = headers[C];
                    const cellValue = rowData[headerKey];

                    let bgColor = baseBg;
                    let fontColor = '1E293B';
                    let fontBold = false;
                    let hAlign = 'left';

                    // Style spécial pour Employee ID (centré)
                    if (headerKey === 'Employee ID') {
                        hAlign = 'center';
                        fontColor = '64748B';
                    }

                    // Style spécial pour Role
                    if (headerKey === 'Role') {
                        hAlign = 'center';
                        if (cellValue === 'ADMIN') {
                            bgColor = COLOR_ADMIN_BG;
                            fontColor = 'FFFFFF';
                            fontBold = true;
                        } else if (cellValue === 'MANAGER') {
                            bgColor = COLOR_MANAGER_BG;
                            fontColor = 'FFFFFF';
                            fontBold = true;
                        } else if (cellValue === 'TECHNICIAN') {
                            bgColor = COLOR_TECH_BG;
                            fontColor = 'FFFFFF';
                            fontBold = true;
                        } else if (cellValue === 'STAFF') {
                            bgColor = COLOR_STAFF_BG;
                            fontColor = '475569';
                        }
                    }

                    // Style spécial pour Status
                    if (headerKey === 'Status') {
                        hAlign = 'center';
                        if (cellValue === 'ACTIVE') {
                            bgColor = COLOR_ACTIVE_BG;
                            fontColor = COLOR_ACTIVE_TEXT;
                            fontBold = true;
                        } else if (cellValue === 'INACTIVE') {
                            bgColor = COLOR_INACTIVE_BG;
                            fontColor = COLOR_INACTIVE_TEXT;
                        } else if (cellValue === 'SUSPENDED') {
                            bgColor = COLOR_SUSPENDED_BG;
                            fontColor = COLOR_SUSPENDED_TEXT;
                        }
                    }

                    // Style spécial pour Tenure (centré)
                    if (headerKey === 'Tenure (Years)') {
                        hAlign = 'center';
                    }

                    // Style spécial pour Hire Date (centré)
                    if (headerKey === 'Hire Date') {
                        hAlign = 'center';
                        fontColor = '64748B';
                    }

                    ws[cellRef] = {
                        v: cellValue,
                        t: typeof cellValue === 'number' ? 'n' : 's',
                        s: {
                            font: { bold: fontBold, color: { rgb: fontColor }, sz: 10, name: 'Calibri' },
                            fill: { fgColor: { rgb: bgColor }, patternType: 'solid' },
                            alignment: { horizontal: hAlign, vertical: 'center' },
                            border: {
                                top: { style: 'thin', color: { rgb: COLOR_BORDER } },
                                bottom: { style: 'thin', color: { rgb: COLOR_BORDER } },
                                left: { style: 'thin', color: { rgb: COLOR_BORDER } },
                                right: { style: 'thin', color: { rgb: COLOR_BORDER } }
                            }
                        }
                    };
                }
            }

            // ═══ LIGNE FINALE: Footer ═══
            const footerRow = dataStartRow + data.length;
            for (let C = 0; C <= 8; C++) {
                const cell = XLSX.utils.encode_cell({ r: footerRow, c: C });
                ws[cell] = {
                    v: '',
                    t: 's',
                    s: {
                        fill: { fgColor: { rgb: COLOR_TITLE_BG }, patternType: 'solid' },
                        border: {
                            top: { style: 'medium', color: { rgb: COLOR_HEADER_BG } }
                        }
                    }
                };
            }

            // ═══ Hauteurs de lignes ═══
            ws['!rows'] = [
                { hpx: 8 },    // Ligne 0: marge
                { hpx: 42 },   // Ligne 1: titre
                { hpx: 24 },   // Ligne 2: sous-titre
                { hpx: 18 },   // Ligne 3: date
                { hpx: 8 },    // Ligne 4: espace
                { hpx: 28 },   // Ligne 5: stats header
                { hpx: 22 },   // Ligne 6: stats 1
                { hpx: 22 },   // Ligne 7: stats 2
                { hpx: 8 },    // Ligne 8: espace
                { hpx: 32 },   // Ligne 9: header tableau
            ];
            // Hauteurs des lignes de données
            for (let i = 0; i < data.length; i++) {
                ws['!rows'].push({ hpx: 26 });
            }
            // Hauteur footer
            ws['!rows'].push({ hpx: 8 });

            // ─── Sauvegarder ────────────────────────────────────────────────
            XLSX.utils.book_append_sheet(wb, ws, 'Workforce Register');

            // Générer le nom de fichier avec timestamp
            const timestamp = new Date().toISOString().slice(0, 10);
            XLSX.writeFile(wb, `RAM_Workforce_Export_${timestamp}.xlsx`);

            setError(null);
        } catch (err) {
            logApiError('Employee Export', err);
            const errorMsg = err?.message || 'Export failed. Please try again.';
            setError(errorMsg);
        } finally {
            setExporting(false);
        }
    }, [filteredEmployees]);    const handleOpenModal = useCallback((employee = null) => {
        setFormErrors({});
        if (employee) {
            setEditingEmployee(employee);
            setFormData({
                firstName: employee.firstName || '',
                lastName: employee.lastName || '',
                email: employee.email || '',
                role: employee.role || 'TECHNICIAN',
                department: employee.department || '',
                hireDate: employee.hireDate ? employee.hireDate.split('T')[0] : '',
                status: employee.status || 'ACTIVE',
            });
        } else {
            setEditingEmployee(null);
            setFormData({
                firstName: '', lastName: '', email: '', role: 'TECHNICIAN',
                department: '', hireDate: '', status: 'ACTIVE',
            });
        }
        setShowModal(true);
    }, []);

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setSubmitting(true);
        try {
            if (editingEmployee) {
                await employeeAPI.update(editingEmployee.id, formData);
            } else {
                await employeeAPI.create(formData);
            }
            await fetchEmployees();
            setShowModal(false);
            setError(null);
        } catch (err) {
            logApiError('Employee Submit', err);
            const errorMsg = err?.response?.data?.message || err?.message || (editingEmployee ? 'Failed to update employee.' : 'Failed to add employee.');
            setError(errorMsg);
        } finally {
            setSubmitting(false);
        }
    }, [editingEmployee, formData, fetchEmployees]);

    // DELETE: gestion d'erreur FK et message traduit
    const handleConfirmDelete = useCallback(async () => {
        if (!deleteTarget || !deleteTarget.id) {
            setError('Cannot delete: employee has no valid ID');
            setShowDeleteConfirm(false);
            setDeleting(false);
            return;
        }
        setDeleting(true);
        try {
            await employeeAPI.delete(deleteTarget.id);
            await fetchEmployees();
            setShowDeleteConfirm(false);
            setDeleteTarget(null);
            setError(null);
        } catch (err) {
            logApiError('Employee Delete', err);

            // Convertir l'erreur en string pour détection (gestion des accents)
            let errorStr = '';
            try {
                errorStr = JSON.stringify(err).toLowerCase();
            } catch (e) {
                errorStr = (err?.message || '').toLowerCase();
            }
            // Ajouter aussi le message direct
            errorStr += ' ' + (err?.message || '').toLowerCase();
            errorStr += ' ' + (err?.response?.data?.message || '').toLowerCase();

            // Détecter l'erreur de contrainte FK (technician lié) - patterns en FR et EN
            const isFKError =
                errorStr.includes('clé étrangère') ||
                errorStr.includes('cle etrangere') ||
                errorStr.includes('foreign key') ||
                errorStr.includes('contrainte') ||
                errorStr.includes('constraint') ||
                errorStr.includes('fk3xltodasm6q4nolke4kbs2ui4') ||
                errorStr.includes('technician') ||
                errorStr.includes('referenced') ||
                errorStr.includes('référencée') ||
                errorStr.includes('referencee') ||
                errorStr.includes('still referenced') ||
                errorStr.includes('est toujours référencée');

            let errorMsg;
            if (isFKError) {
                errorMsg = `Cannot delete "${deleteTarget.firstName} ${deleteTarget.lastName}". This employee is linked to a Technician record. Please remove the technician assignment first.`;
            } else {
                errorMsg = err?.response?.data?.message || err?.message || 'Failed to delete employee. Please try again.';
            }
            setError(errorMsg);
            // Fermer le dialog en cas d'erreur, l'utilisateur voit le toast
            setShowDeleteConfirm(false);
            setDeleteTarget(null);
        } finally {
            setDeleting(false);
        }
    }, [deleteTarget, fetchEmployees]);

    const handleView = useCallback((employee) => {
        setViewEmployee(employee);
        setShowViewModal(true);
    }, []);

    const handleSort = useCallback((key) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
    }, []);

    const clearSearch = useCallback(() => setSearchTerm(''), []);

    const handleFormChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (formErrors[field]) {
            setFormErrors(prev => { const next = { ...prev }; delete next[field]; return next; });
        }
    };

    // ── Loading State ─────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8">
                <div className="relative mb-6">
                    <div className="absolute inset-0 w-14 h-14 bg-ram-red/10 rounded-full animate-ping" />
                    <Loader2 className="w-14 h-14 animate-spin text-ram-red relative z-10" />
                </div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] animate-pulse">
                    Loading Workforce Data...
                </p>
            </div>
        );
    }

    // ═══════════════════════════════════════════════════════════════════════
    // RENDER
    // ═══════════════════════════════════════════════════════════════════════
    return (
        <div className="min-h-screen bg-[#F8FAFC] p-6 lg:p-10 font-sans">

            {/* ═══ HEADER ═══════════════════════════════════════════════════ */}
            <header className="mb-8 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div className="flex items-center gap-4">
                    <div className="bg-white rounded-xl p-2.5 shadow-sm border border-slate-100">
                        <Logo className="h-10" />
                    </div>
                    <div className="h-10 w-px bg-slate-200 hidden lg:block" />
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Activity size={10} className="text-ram-red" />
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Personnel Division</span>
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                            Workforce <span className="text-ram-red italic">Register</span>
                        </h1>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={handleExport}
                        disabled={exporting || filteredEmployees.length === 0}
                        className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
                    >
                        {exporting ? <Loader2 size={14} className="animate-spin" /> : <FileDown size={14} />}
                        {exporting ? 'Exporting...' : 'Export Excel'}
                    </button>
                    <button
                        onClick={() => handleOpenModal()}
                        className="flex items-center gap-2 px-5 py-2.5 bg-ram-red text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:shadow-lg hover:shadow-ram-red/20 transition-all active:scale-95 shadow-sm"
                    >
                        <UserPlus size={14} /> Add
                    </button>
                </div>
            </header>

            {/* ═══ METRICS DASHBOARD ════════════════════════════════════════ */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
                {[
                    { label: 'Total', value: stats.total, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Active', value: stats.active, icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    { label: 'Technical', value: stats.techs, icon: Zap, color: 'text-ram-red', bg: 'bg-red-50' },
                    { label: 'Departments', value: stats.deptCount, icon: MapPin, color: 'text-amber-600', bg: 'bg-amber-50' },
                    { label: 'Avg Tenure', value: stats.avgTenure, icon: Clock, color: 'text-violet-600', bg: 'bg-violet-50', suffix: 'y' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm flex items-center justify-between group hover:shadow-md hover:border-ram-red/10 transition-all duration-300">
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                            <p className="text-2xl font-black text-slate-900 tabular-nums">
                                <AnimatedCounter value={stat.value} />
                                {stat.suffix || ''}
                            </p>
                        </div>
                        <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} transition-transform duration-300 group-hover:scale-110`}>
                            <stat.icon size={20} />
                        </div>
                    </div>
                ))}
            </div>

            {/* ═══ SEARCH BAR ════════════════════════════════════════════════ */}
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center">
                <div className="flex-1 relative w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <input
                        type="text"
                        placeholder="Search by name, email or department..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-11 pr-10 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-ram-red/10 focus:border-ram-red/20 font-semibold text-sm text-slate-700 placeholder:text-slate-400 transition-all outline-none"
                    />
                    {searchTerm && (
                        <button onClick={clearSearch} className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 bg-slate-200 rounded-full text-slate-500 hover:bg-slate-300 transition-all">
                            <X size={12} />
                        </button>
                    )}
                </div>
                <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl border border-slate-100">
                    <BarChart3 size={14} className="text-slate-400" />
                    <span className="text-[11px] font-bold text-slate-500">{filteredEmployees.length} records</span>
                </div>
                <button onClick={fetchEmployees} className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-slate-600 transition-all shadow-sm" title="Refresh">
                    <RefreshCw size={16} />
                </button>
            </div>

            {/* ═══ TABLE ═══════════════════════════════════════════════════ */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                        <tr className="bg-slate-50/80 border-b border-slate-100">
                            {[
                                { key: 'firstName', label: 'Employee' },
                                { key: 'role', label: 'Role' },
                                { key: 'department', label: 'Department' },
                                { key: 'hireDate', label: 'Hire Date' },
                                { key: 'status', label: 'Status' },
                            ].map((col) => (
                                <th key={col.key} onClick={() => handleSort(col.key)} className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer hover:text-slate-600 transition-colors select-none">
                                    <div className="flex items-center gap-1">
                                        {col.label}
                                        {sortConfig.key === col.key && (
                                            <span className="text-ram-red">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                                        )}
                                    </div>
                                </th>
                            ))}
                            <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                        {loading ? (
                            Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                        ) : paginatedEmployees.length > 0 ? (
                            paginatedEmployees.map((employee) => (
                                <tr key={employee.id} className="group hover:bg-slate-50/60 transition-all duration-200">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <Avatar name={`${employee.firstName} ${employee.lastName}`} />
                                            <div>
                                                <p className="text-sm font-black text-slate-900 uppercase tracking-wide">{employee.firstName} {employee.lastName}</p>
                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                    <Mail size={10} className="text-slate-400" />
                                                    <span className="text-[10px] font-semibold text-slate-400 lowercase">{employee.email}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6"><RoleBadge role={employee.role} /></td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-slate-300" />
                                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{employee.department || 'General'}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2">
                                            <Calendar size={12} className="text-slate-400" />
                                            <span className="font-mono text-xs text-slate-500 font-semibold">{employee.hireDate ? new Date(employee.hireDate).toLocaleDateString('en-GB') : '--/--/--'}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6"><StatusBadge status={employee.status} /></td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-2 group-hover:translate-x-0">
                                            <button onClick={() => handleView(employee)} className="p-2.5 bg-white border border-slate-200 text-slate-400 hover:text-blue-600 hover:border-blue-300 rounded-xl transition-all shadow-sm hover:shadow-md hover:scale-105" title="View">
                                                <Eye size={14} />
                                            </button>
                                            <button onClick={() => handleOpenModal(employee)} className="p-2.5 bg-white border border-slate-200 text-slate-400 hover:text-ram-red hover:border-ram-red/30 rounded-xl transition-all shadow-sm hover:shadow-md hover:scale-105" title="Edit">
                                                <Pencil size={14} />
                                            </button>
                                            <button onClick={() => { setDeleteTarget(employee); setShowDeleteConfirm(true); }} className="p-2.5 bg-white border border-slate-200 text-slate-400 hover:text-red-600 hover:border-red-300 rounded-xl transition-all shadow-sm hover:shadow-md hover:scale-105" title="Delete">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <EmptyState onAction={() => handleOpenModal()} />
                        )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="px-8 py-5 border-t border-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/30">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            Showing <span className="text-slate-700">{startIndex + 1}</span> - <span className="text-slate-700">{Math.min(startIndex + ITEMS_PER_PAGE, filteredEmployees.length)}</span> of <span className="text-slate-700">{filteredEmployees.length}</span>
                        </p>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1} className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm">
                                <ChevronLeft size={16} />
                            </button>
                            <div className="flex gap-1">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                    <button key={page} onClick={() => setCurrentPage(page)} className={`w-9 h-9 rounded-xl text-[10px] font-black transition-all duration-200 ${currentPage === page ? 'bg-ram-red text-white shadow-md scale-110' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                                        {page}
                                    </button>
                                ))}
                            </div>
                            <button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages} className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm">
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* ═══ ADD/EDIT MODAL ═══════════════════════════════════════════ */}
            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingEmployee ? 'Edit Employee' : 'Add New Employee'}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">First Name *</label>
                            <input type="text" value={formData.firstName} onChange={(e) => handleFormChange('firstName', e.target.value)} className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm font-semibold text-slate-700 outline-none transition-all focus:ring-2 focus:ring-ram-red/20 ${formErrors.firstName ? 'border-red-300 focus:border-red-400' : 'border-slate-200 focus:border-ram-red/30'}`} placeholder="John" />
                            {formErrors.firstName && <p className="text-[10px] text-red-500 mt-1 font-semibold">{formErrors.firstName}</p>}
                        </div>
                        <div>
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Last Name *</label>
                            <input type="text" value={formData.lastName} onChange={(e) => handleFormChange('lastName', e.target.value)} className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm font-semibold text-slate-700 outline-none transition-all focus:ring-2 focus:ring-ram-red/20 ${formErrors.lastName ? 'border-red-300 focus:border-red-400' : 'border-slate-200 focus:border-ram-red/30'}`} placeholder="Doe" />
                            {formErrors.lastName && <p className="text-[10px] text-red-500 mt-1 font-semibold">{formErrors.lastName}</p>}
                        </div>
                    </div>
                    <div>
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Email *</label>
                        <input type="email" value={formData.email} onChange={(e) => handleFormChange('email', e.target.value)} className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm font-semibold text-slate-700 outline-none transition-all focus:ring-2 focus:ring-ram-red/20 ${formErrors.email ? 'border-red-300 focus:border-red-400' : 'border-slate-200 focus:border-ram-red/30'}`} placeholder="john.doe@company.com" />
                        {formErrors.email && <p className="text-[10px] text-red-500 mt-1 font-semibold">{formErrors.email}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Role</label>
                            <select value={formData.role} onChange={(e) => handleFormChange('role', e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 outline-none transition-all focus:ring-2 focus:ring-ram-red/20 focus:border-ram-red/30">
                                <option value="TECHNICIAN">Technician</option>
                                <option value="MANAGER">Manager</option>
                                <option value="ADMIN">Administrator</option>
                                <option value="STAFF">Staff</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Status</label>
                            <select value={formData.status} onChange={(e) => handleFormChange('status', e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 outline-none transition-all focus:ring-2 focus:ring-ram-red/20 focus:border-ram-red/30">
                                <option value="ACTIVE">Active</option>
                                <option value="INACTIVE">Inactive</option>
                                <option value="SUSPENDED">Suspended</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Department *</label>
                        <input type="text" value={formData.department} onChange={(e) => handleFormChange('department', e.target.value)} className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm font-semibold text-slate-700 outline-none transition-all focus:ring-2 focus:ring-ram-red/20 ${formErrors.department ? 'border-red-300 focus:border-red-400' : 'border-slate-200 focus:border-ram-red/30'}`} placeholder="Engineering, HR, Finance..." />
                        {formErrors.department && <p className="text-[10px] text-red-500 mt-1 font-semibold">{formErrors.department}</p>}
                    </div>
                    <div>
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Hire Date *</label>
                        <input type="date" value={formData.hireDate} onChange={(e) => handleFormChange('hireDate', e.target.value)} className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm font-semibold text-slate-700 outline-none transition-all focus:ring-2 focus:ring-ram-red/20 ${formErrors.hireDate ? 'border-red-300 focus:border-red-400' : 'border-slate-200 focus:border-ram-red/30'}`} />
                        {formErrors.hireDate && <p className="text-[10px] text-red-500 mt-1 font-semibold">{formErrors.hireDate}</p>}
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-5 py-3 bg-slate-100 text-slate-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-all">
                            Cancel
                        </button>
                        <button type="submit" disabled={submitting} className="flex-1 px-5 py-3 bg-ram-red text-white rounded-xl text-xs font-black uppercase tracking-widest hover:shadow-lg hover:shadow-ram-red/20 transition-all disabled:opacity-50 active:scale-95">
                            {submitting ? <Loader2 size={14} className="animate-spin inline mr-2" /> : null}
                            {submitting ? 'Saving...' : (editingEmployee ? 'Update' : 'Add')}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* ═══ VIEW MODAL ═══════════════════════════════════════════════ */}
            <Modal isOpen={showViewModal} onClose={() => setShowViewModal(false)} title="Employee Details">
                {viewEmployee && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
                            <Avatar name={`${viewEmployee.firstName} ${viewEmployee.lastName}`} />
                            <div>
                                <h3 className="text-lg font-black text-slate-900 uppercase">{viewEmployee.firstName} {viewEmployee.lastName}</h3>
                                <p className="text-sm text-slate-400">{viewEmployee.email}</p>
                            </div>
                            <div className="ml-auto"><StatusBadge status={viewEmployee.status} /></div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-50 rounded-xl p-4">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Role</p>
                                <RoleBadge role={viewEmployee.role} />
                            </div>
                            <div className="bg-slate-50 rounded-xl p-4">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Department</p>
                                <p className="text-sm font-black text-slate-700">{viewEmployee.department || 'General'}</p>
                            </div>
                            <div className="bg-slate-50 rounded-xl p-4">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Hire Date</p>
                                <p className="text-sm font-black text-slate-700">{viewEmployee.hireDate ? new Date(viewEmployee.hireDate).toLocaleDateString('en-GB') : 'N/A'}</p>
                            </div>
                            <div className="bg-slate-50 rounded-xl p-4">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Employee ID</p>
                                <p className="text-sm font-black text-slate-700 font-mono">#{viewEmployee.id}</p>
                            </div>
                        </div>
                        <div className="flex gap-3 pt-2">
                            <button onClick={() => { setShowViewModal(false); handleOpenModal(viewEmployee); }} className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-ram-red text-white rounded-xl text-xs font-black uppercase tracking-widest hover:shadow-lg transition-all">
                                <Pencil size={14} /> Edit
                            </button>
                            <button onClick={() => setShowViewModal(false)} className="flex-1 px-5 py-3 bg-slate-100 text-slate-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-all">
                                Close
                            </button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* ═══ DELETE CONFIRM ─ avec message FK explicite ═══════════ */}
            <ConfirmDialog
                isOpen={showDeleteConfirm}
                onClose={() => { setShowDeleteConfirm(false); setDeleteTarget(null); }}
                onConfirm={handleConfirmDelete}
                title="Confirm Deletion"
                message={deleteTarget ? (
                    <span>
                        Are you sure you want to delete <strong>{deleteTarget.firstName} {deleteTarget.lastName}</strong>?<br />
                        {deleteTarget.role === 'TECHNICIAN' && (
                            <span className="text-amber-600 text-xs block mt-2">
                                ⚠️ This employee is a Technician. You may need to remove their technician assignment first.
                            </span>
                        )}
                    </span>
                ) : 'Are you sure you want to delete this employee?'}
                confirmText="Delete"
                isDangerous={true}
                isLoading={deleting}
            />

            {/* ═══ ERROR TOAST ══════════════════════════════════════════════ */}
            {error && (
                <div className="fixed bottom-8 right-8 z-50 animate-slide-up">
                    <div className="bg-red-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 max-w-md">
                        <AlertTriangle size={20} />
                        <span className="text-[11px] font-black uppercase tracking-widest">{error}</span>
                        <button onClick={() => setError(null)} className="ml-2 opacity-60 hover:opacity-100 font-bold">×</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Employees;