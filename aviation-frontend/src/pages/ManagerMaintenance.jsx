import { useState, useEffect, useMemo } from 'react';
import {
    Wrench,
    CheckCircle,
    Clock,
    AlertTriangle,
    Search,
    ArrowUpRight,
    ArrowDownRight,
    CalendarDays,
    Settings,
    ShieldCheck,
    BarChart3,
    FileText,
    Plus,
    X,
    Save,
    Trash2,
    Edit3,
    Eye,
    TrendingUp,
    User,
    Hash,
    Activity,
    ChevronUp,
    ChevronDown,
    Filter,
    FileDown,
    Loader2,
    Check
} from 'lucide-react';
import Logo from '../components/UI/Logo';

// ─── Helpers ────────────────────────────────────────────────

const STATUS_CONFIG = {
    PLANNED: { label: 'Planned', color: 'text-slate-500', bg: 'bg-slate-50', ring: 'ring-slate-200', icon: CalendarDays },
    IN_PROGRESS: { label: 'In Progress', color: 'text-blue-600', bg: 'bg-blue-50', ring: 'ring-blue-200', icon: Clock },
    COMPLETED: { label: 'Completed', color: 'text-emerald-600', bg: 'bg-emerald-50', ring: 'ring-emerald-200', icon: CheckCircle },
    ON_HOLD: { label: 'On Hold', color: 'text-amber-600', bg: 'bg-amber-50', ring: 'ring-amber-200', icon: AlertTriangle },
    CANCELLED: { label: 'Cancelled', color: 'text-red-600', bg: 'bg-red-50', ring: 'ring-red-200', icon: X },
};

const SEVERITY_CONFIG = {
    LOW: { label: 'Low', color: 'text-slate-500', bg: 'bg-slate-100', border: 'border-slate-200' },
    MEDIUM: { label: 'Medium', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
    HIGH: { label: 'High', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100' },
    CRITICAL: { label: 'Critical', color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-100' },
};

const TYPE_CONFIG = {
    'A-Check': { icon: Wrench, color: 'text-blue-600' },
    'B-Check': { icon: Settings, color: 'text-purple-600' },
    'C-Check': { icon: ShieldCheck, color: 'text-emerald-600' },
    'D-Check': { icon: BarChart3, color: 'text-ram-red' },
    'Engine Swap': { icon: Activity, color: 'text-orange-600' },
    'Avionics Insp.': { icon: Eye, color: 'text-violet-600' },
    'Landing Gear': { icon: TrendingUp, color: 'text-cyan-600' },
    'APU Overhaul': { icon: Settings, color: 'text-pink-600' },
};

const getProgress = (task) => {
    if (task.progress !== undefined && task.progress !== null) return task.progress;
    const status = task.status;
    if (status === 'COMPLETED') return 100;
    if (status === 'CANCELLED') return 0;
    if (status === 'PLANNED') return Math.floor(Math.random() * 5);
    if (status === 'IN_PROGRESS') return Math.floor(Math.random() * 40) + 30;
    if (status === 'ON_HOLD') return Math.floor(Math.random() * 20) + 10;
    return 0;
};

const formatDate = (dateStr) => {
    if (!dateStr) return 'TBD';
    const d = new Date(dateStr);
    if (isNaN(d)) return dateStr;
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const getDaysRemaining = (endDate) => {
    if (!endDate) return null;
    const end = new Date(endDate);
    const now = new Date();
    const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    return diff;
};

// ─── Toast Component ────────────────────────────────────────
const Toast = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const bgClass = type === 'success' ? 'bg-emerald-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500';
    const Icon = type === 'success' ? Check : type === 'error' ? AlertTriangle : Activity;

    return (
        <div className={`fixed bottom-6 right-6 z-[60] ${bgClass} text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right duration-300`}>
            <Icon size={16} />
            <span className="text-xs font-black uppercase tracking-widest">{message}</span>
            <button onClick={onClose} className="ml-2 hover:opacity-70"><X size={14} /></button>
        </div>
    );
};

// ─── Component ───────────────────────────────────────────────

const ManagerMaintenance = () => {
    const [maintenance, setMaintenance] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('All');
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [filterSeverity, setFilterSeverity] = useState('ALL');
    const [showModal, setShowModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [expandedId, setExpandedId] = useState(null);
    const [exportLoading, setExportLoading] = useState(false);
    const [toast, setToast] = useState(null);
    const [sortBy, setSortBy] = useState('endDate');
    const [sortDir, setSortDir] = useState('asc');

    // Form state
    const [formData, setFormData] = useState({
        id: '',
        aircraft: '',
        type: 'A-Check',
        status: 'PLANNED',
        startDate: '',
        endDate: '',
        technician: '',
        severity: 'MEDIUM',
        progress: 0,
        description: '',
        estimatedHours: '',
        partsRequired: '',
        hangar: ''
    });
    const [formErrors, setFormErrors] = useState({});

    useEffect(() => {
        const timer = setTimeout(() => {
            const mockData = [
                { id: 'MA-001', aircraft: 'CN-RGN', type: 'A-Check', status: 'IN_PROGRESS', startDate: '2024-05-25', endDate: '2024-05-27', technician: 'Fatima Z.', severity: 'MEDIUM', progress: 65, description: 'Routine A-Check inspection including landing gear review', estimatedHours: 48, partsRequired: 'Brake pads, Hydraulic fluid', hangar: 'H1' },
                { id: 'MA-002', aircraft: 'CN-ROB', type: 'Engine Swap', status: 'COMPLETED', startDate: '2024-05-20', endDate: '2024-05-22', technician: 'Ahmed K.', severity: 'CRITICAL', progress: 100, description: 'Full engine replacement due to FOD damage on turbine blades', estimatedHours: 72, partsRequired: 'CFM56-7B complete engine', hangar: 'H3' },
                { id: 'MA-003', aircraft: 'CN-RGO', type: 'B-Check', status: 'PLANNED', startDate: '2024-06-01', endDate: '2024-06-05', technician: 'Youssef E.', severity: 'HIGH', progress: 0, description: 'Scheduled B-Check with structural inspection', estimatedHours: 120, partsRequired: 'TBD', hangar: 'H2' },
                { id: 'MA-004', aircraft: 'CN-RGP', type: 'Avionics Insp.', status: 'IN_PROGRESS', startDate: '2024-05-26', endDate: '2024-05-26', technician: 'Omar C.', severity: 'LOW', progress: 30, description: 'ADS-B OUT compliance verification and transponder check', estimatedHours: 8, partsRequired: 'None', hangar: 'H1' },
                { id: 'MA-005', aircraft: 'CN-RGN', type: 'Landing Gear', status: 'PLANNED', startDate: '2024-06-10', endDate: '2024-06-12', technician: 'Fatima Z.', severity: 'HIGH', progress: 0, description: 'Landing gear strut replacement and oleo service', estimatedHours: 36, partsRequired: 'Main strut assembly', hangar: 'H3' },
                { id: 'MA-006', aircraft: 'CN-ROJ', type: 'C-Check', status: 'IN_PROGRESS', startDate: '2024-05-15', endDate: '2024-06-15', technician: 'Ahmed K.', severity: 'MEDIUM', progress: 45, description: 'Heavy maintenance C-Check with full systems overhaul', estimatedHours: 480, partsRequired: 'Multiple', hangar: 'H2' },
                { id: 'MA-007', aircraft: 'CN-RGI', type: 'APU Overhaul', status: 'ON_HOLD', startDate: '2024-05-20', endDate: '2024-05-25', technician: 'Youssef E.', severity: 'CRITICAL', progress: 15, description: 'APU compressor section overhaul - awaiting parts delivery', estimatedHours: 24, partsRequired: 'APU compressor blades', hangar: 'H1' },
                { id: 'MA-008', aircraft: 'CN-ROH', type: 'D-Check', status: 'PLANNED', startDate: '2024-07-01', endDate: '2024-08-15', technician: 'Omar C.', severity: 'HIGH', progress: 0, description: 'Full structural D-Check with corrosion inspection', estimatedHours: 960, partsRequired: 'TBD', hangar: 'H3' },
            ];
            const enriched = mockData.map(m => ({
                ...m,
                _progress: getProgress(m),
                _daysRemaining: getDaysRemaining(m.endDate),
            }));
            setMaintenance(enriched);
            setLoading(false);
        }, 1000);
        return () => clearTimeout(timer);
    }, []);

    const showToastMsg = (message, type = 'success') => {
        setToast({ message, type });
    };

    const validateForm = () => {
        const errors = {};
        if (!formData.id.trim()) errors.id = 'Task ID required';
        if (!formData.aircraft.trim()) errors.aircraft = 'Aircraft required';
        if (!formData.technician.trim()) errors.technician = 'Technician required';
        if (!formData.startDate) errors.startDate = 'Start date required';
        if (!formData.endDate) errors.endDate = 'End date required';
        if (formData.startDate && formData.endDate && new Date(formData.startDate) > new Date(formData.endDate)) {
            errors.endDate = 'End date must be after start date';
        }
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const resetForm = () => {
        setFormData({
            id: '', aircraft: '', type: 'A-Check', status: 'PLANNED',
            startDate: '', endDate: '', technician: '', severity: 'MEDIUM',
            progress: 0, description: '', estimatedHours: '', partsRequired: '', hangar: ''
        });
        setFormErrors({});
    };

    const handleAddTask = () => {
        if (!validateForm()) return;
        const newTask = {
            ...formData,
            id: formData.id.toUpperCase(),
            aircraft: formData.aircraft.toUpperCase(),
            progress: parseInt(formData.progress) || 0,
            estimatedHours: parseFloat(formData.estimatedHours) || null,
            _progress: parseInt(formData.progress) || 0,
            _daysRemaining: getDaysRemaining(formData.endDate)
        };
        setMaintenance(prev => [...prev, newTask]);
        setShowModal(false);
        resetForm();
        showToastMsg(`Task ${newTask.id} created`);
    };

    const handleEditTask = () => {
        if (!validateForm()) return;
        const updated = {
            ...formData,
            progress: parseInt(formData.progress) || 0,
            estimatedHours: parseFloat(formData.estimatedHours) || null,
            _progress: parseInt(formData.progress) || 0,
            _daysRemaining: getDaysRemaining(formData.endDate)
        };
        setMaintenance(prev => prev.map(m => m.id === selectedTask.id ? updated : m));
        setShowEditModal(false);
        setSelectedTask(null);
        resetForm();
        showToastMsg(`Task ${updated.id} updated`);
    };

    const handleDeleteTask = (taskId) => {
        if (window.confirm(`Delete maintenance task ${taskId}?`)) {
            setMaintenance(prev => prev.filter(m => m.id !== taskId));
            showToastMsg(`Task ${taskId} deleted`, 'warning');
        }
    };

    const openEditModal = (task) => {
        setSelectedTask(task);
        setFormData({
            ...task,
            startDate: task.startDate || '',
            endDate: task.endDate || '',
            description: task.description || '',
            estimatedHours: task.estimatedHours ? task.estimatedHours.toString() : '',
            partsRequired: task.partsRequired || '',
            hangar: task.hangar || ''
        });
        setFormErrors({});
        setShowEditModal(true);
    };

    const openDetailModal = (task) => {
        setSelectedTask(task);
        setShowDetailModal(true);
    };

    const toggleExpand = (id) => {
        setExpandedId(expandedId === id ? null : id);
    };

    const exportToExcel = () => {
        setExportLoading(true);
        setTimeout(() => {
            const headers = ['Task ID;Aircraft;Type;Status;Severity;Start Date;End Date;Technician;Progress;Est. Hours;Parts Required;Hangar;Description;Export Date'];
            const rows = filteredTasks.map(m => [
                m.id, m.aircraft, m.type, m.status, m.severity,
                formatDate(m.startDate), formatDate(m.endDate), m.technician,
                m._progress || m.progress, m.estimatedHours || 'N/A',
                m.partsRequired || 'N/A', m.hangar || 'N/A',
                m.description || '', new Date().toLocaleString('fr-FR')
            ].join(';'));
            const csv = '\uFEFF' + [...headers, ...rows].join('\n');
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const ts = new Date().toISOString().slice(0,19).replace(/:/g,'-');
            link.href = URL.createObjectURL(blob);
            link.download = `RAM_Maintenance_${ts}.csv`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setExportLoading(false);
            showToastMsg(`${filteredTasks.length} tasks exported`);
        }, 1200);
    };

    const handleSort = (field) => {
        if (sortBy === field) {
            setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortDir('asc');
        }
    };

    // ─── Filtering & Sorting ────────────────────────────────

    const filteredTasks = useMemo(() => {
        let result = maintenance.filter(m => {
            const term = searchTerm.toLowerCase();
            const matchesSearch =
                m.id?.toLowerCase().includes(term) ||
                m.aircraft?.toLowerCase().includes(term) ||
                m.technician?.toLowerCase().includes(term) ||
                m.type?.toLowerCase().includes(term) ||
                m.description?.toLowerCase().includes(term);

            const matchesType = filterType === 'All' || m.type === filterType;
            const matchesStatus = filterStatus === 'ALL' || m.status === filterStatus;
            const matchesSeverity = filterSeverity === 'ALL' || m.severity === filterSeverity;

            return matchesSearch && matchesType && matchesStatus && matchesSeverity;
        });

        const severityWeight = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
        result.sort((a, b) => {
            let cmp = 0;
            switch (sortBy) {
                case 'severity':
                    cmp = (severityWeight[b.severity] || 0) - (severityWeight[a.severity] || 0);
                    break;
                case 'status':
                    cmp = (a.status || '').localeCompare(b.status || '');
                    break;
                case 'endDate':
                    cmp = new Date(a.endDate || '9999') - new Date(b.endDate || '9999');
                    break;
                case 'progress':
                    cmp = (a._progress || 0) - (b._progress || 0);
                    break;
                default:
                    cmp = (a.id || '').localeCompare(b.id || '');
            }
            return sortDir === 'desc' ? -cmp : cmp;
        });

        return result;
    }, [maintenance, searchTerm, filterType, filterStatus, filterSeverity, sortBy, sortDir]);

    const stats = useMemo(() => ({
        total: maintenance.length,
        inProgress: maintenance.filter(m => m.status === 'IN_PROGRESS').length,
        critical: maintenance.filter(m => m.severity === 'CRITICAL' && m.status !== 'COMPLETED').length,
        completed: maintenance.filter(m => m.status === 'COMPLETED').length,
        planned: maintenance.filter(m => m.status === 'PLANNED').length,
        onHold: maintenance.filter(m => m.status === 'ON_HOLD').length,
        overdue: maintenance.filter(m => m._daysRemaining !== null && m._daysRemaining < 0 && m.status !== 'COMPLETED').length,
    }), [maintenance]);

    // ─── Render Helpers ─────────────────────────────────────

    const getStatusBadge = (status) => {
        const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.PLANNED;
        const Icon = cfg.icon;
        return (
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${cfg.bg} ${cfg.color} ring-1 ${cfg.ring}`}>
                <Icon size={12} />
                {cfg.label}
            </span>
        );
    };

    const getSeverityBadge = (severity) => {
        const cfg = SEVERITY_CONFIG[severity] || SEVERITY_CONFIG.MEDIUM;
        return (
            <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
                {cfg.label}
            </span>
        );
    };

    const inputClass = (err) => `w-full px-4 py-3 bg-slate-50 border rounded-2xl font-bold text-sm transition-all ${err ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100' : 'border-slate-200 focus:border-ram-red focus:ring-2 focus:ring-ram-red/10'} focus:outline-none`;

    const renderFormFields = (isEdit = false) => (
        <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Task ID *</label>
                    <input type="text" placeholder="MA-###" className={inputClass(formErrors.id)} value={formData.id} onChange={e => setFormData({...formData, id: e.target.value})} disabled={isEdit} />
                    {formErrors.id && <p className="text-red-500 text-xs mt-1 font-bold">{formErrors.id}</p>}
                </div>
                <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Aircraft *</label>
                    <input type="text" placeholder="CN-XXX" className={inputClass(formErrors.aircraft)} value={formData.aircraft} onChange={e => setFormData({...formData, aircraft: e.target.value.toUpperCase()})} />
                    {formErrors.aircraft && <p className="text-red-500 text-xs mt-1 font-bold">{formErrors.aircraft}</p>}
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Maintenance Type</label>
                    <select className={inputClass()} value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                        {Object.keys(TYPE_CONFIG).map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                </div>
                <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Severity</label>
                    <select className={inputClass()} value={formData.severity} onChange={e => setFormData({...formData, severity: e.target.value})}>
                        {Object.keys(SEVERITY_CONFIG).map(s => <option key={s} value={s}>{SEVERITY_CONFIG[s].label}</option>)}
                    </select>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Status</label>
                    <select className={inputClass()} value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                        {Object.keys(STATUS_CONFIG).map(s => <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>)}
                    </select>
                </div>
                <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Progress (%)</label>
                    <input type="number" min="0" max="100" className={inputClass()} value={formData.progress} onChange={e => setFormData({...formData, progress: e.target.value})} />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Start Date *</label>
                    <input type="date" className={inputClass(formErrors.startDate)} value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} />
                    {formErrors.startDate && <p className="text-red-500 text-xs mt-1 font-bold">{formErrors.startDate}</p>}
                </div>
                <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">End Date *</label>
                    <input type="date" className={inputClass(formErrors.endDate)} value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} />
                    {formErrors.endDate && <p className="text-red-500 text-xs mt-1 font-bold">{formErrors.endDate}</p>}
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Technician *</label>
                    <input type="text" placeholder="Name" className={inputClass(formErrors.technician)} value={formData.technician} onChange={e => setFormData({...formData, technician: e.target.value})} />
                    {formErrors.technician && <p className="text-red-500 text-xs mt-1 font-bold">{formErrors.technician}</p>}
                </div>
                <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Hangar</label>
                    <input type="text" placeholder="H1" className={inputClass()} value={formData.hangar} onChange={e => setFormData({...formData, hangar: e.target.value})} />
                </div>
            </div>
            <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Estimated Hours</label>
                <input type="number" step="0.5" placeholder="e.g. 48" className={inputClass()} value={formData.estimatedHours} onChange={e => setFormData({...formData, estimatedHours: e.target.value})} />
            </div>
            <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Parts Required</label>
                <input type="text" placeholder="List required parts..." className={inputClass()} value={formData.partsRequired} onChange={e => setFormData({...formData, partsRequired: e.target.value})} />
            </div>
            <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Description *</label>
                <textarea rows="3" placeholder="Task description..." className={`${inputClass()} resize-none`} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
            </div>
        </div>
    );

    return (
        <div className="bg-slate-50 min-h-screen relative">
            {/* Toast */}
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            <div className="p-8 max-w-[1600px] mx-auto">
                {/* Header with Logo */}
                <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-200 pb-8">
                    <div>
                        <div className="flex items-center gap-3 mb-3">
                            <Logo className="h-10" />
                            <div className="h-6 w-px bg-slate-200" />
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Technical Control</span>
                        </div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">
                            Maintenance <span className="text-ram-red italic">Oversight</span>
                        </h1>
                        <p className="text-xs text-slate-400 font-bold mt-2 tracking-wide">
                            {stats.total} tasks tracked · {stats.inProgress} in progress · {stats.critical} critical
                        </p>
                    </div>
                    <button
                        onClick={() => { resetForm(); setShowModal(true); }}
                        className="flex items-center gap-2 px-6 py-3.5 bg-ram-red text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:shadow-xl shadow-ram-red/20 transition-all active:scale-95 hover:-translate-y-0.5"
                    >
                        <Plus size={14} strokeWidth={3} /> Schedule Task
                    </button>
                </header>

                {/* KPI Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                    {[
                        { label: 'Active Tasks', value: stats.total, icon: Wrench, color: 'text-blue-600', bg: 'bg-blue-50', ring: 'ring-blue-100' },
                        { label: 'In Progress', value: stats.inProgress, icon: Clock, color: 'text-ram-red', bg: 'bg-red-50', ring: 'ring-red-100' },
                        { label: 'Critical', value: stats.critical, icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-50', ring: 'ring-orange-100' },
                        { label: 'Completed', value: stats.completed, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50', ring: 'ring-emerald-100' },
                        { label: 'Planned', value: stats.planned, icon: CalendarDays, color: 'text-slate-600', bg: 'bg-slate-50', ring: 'ring-slate-100' },
                        { label: 'Overdue', value: stats.overdue, icon: Clock, color: 'text-red-600', bg: 'bg-red-50', ring: 'ring-red-100' },
                    ].map((stat, i) => (
                        <div key={i} className={`bg-white border border-slate-100 p-5 rounded-3xl shadow-sm flex items-center justify-between group hover:shadow-md hover:border-ram-red/20 transition-all ring-1 ${stat.ring} hover:ring-ram-red/20`}>
                            <div>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                                <p className="text-2xl font-black text-slate-900 tabular-nums">{stat.value}</p>
                            </div>
                            <div className={`p-3.5 rounded-2xl ${stat.bg} ${stat.color} transition-transform group-hover:scale-110 duration-300`}>
                                <stat.icon size={18} strokeWidth={2.5} />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Filters & Search */}
                <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm mb-6 flex flex-col lg:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                        <input
                            type="text"
                            placeholder="Search by Task ID, Aircraft, Technician, Type..."
                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-ram-red/10 font-bold text-sm transition-all"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-3 flex-wrap">
                        <select value={filterType} onChange={e => setFilterType(e.target.value)}
                                className="px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-100 transition-all cursor-pointer outline-none focus:ring-2 focus:ring-ram-red/10">
                            <option value="All">All Types</option>
                            {Object.keys(TYPE_CONFIG).map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                                className="px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-100 transition-all cursor-pointer outline-none focus:ring-2 focus:ring-ram-red/10">
                            <option value="ALL">All Statuses</option>
                            {Object.entries(STATUS_CONFIG).map(([key, cfg]) => <option key={key} value={key}>{cfg.label}</option>)}
                        </select>
                        <select value={filterSeverity} onChange={e => setFilterSeverity(e.target.value)}
                                className="px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-100 transition-all cursor-pointer outline-none focus:ring-2 focus:ring-ram-red/10">
                            <option value="ALL">All Severities</option>
                            {Object.entries(SEVERITY_CONFIG).map(([key, cfg]) => <option key={key} value={key}>{cfg.label}</option>)}
                        </select>
                        <button onClick={() => handleSort('endDate')}
                                className={`px-4 py-3 border rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${sortBy === 'endDate' ? 'bg-ram-red text-white border-ram-red' : 'bg-slate-50 text-slate-500 border-slate-100 hover:bg-slate-100'}`}>
                            <CalendarDays size={12} /> Due {sortBy === 'endDate' && (sortDir === 'asc' ? '↑' : '↓')}
                        </button>
                        <button onClick={() => handleSort('severity')}
                                className={`px-4 py-3 border rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${sortBy === 'severity' ? 'bg-ram-red text-white border-ram-red' : 'bg-slate-50 text-slate-500 border-slate-100 hover:bg-slate-100'}`}>
                            <AlertTriangle size={12} /> Severity {sortBy === 'severity' && (sortDir === 'asc' ? '↑' : '↓')}
                        </button>
                    </div>
                </div>

                {/* Results count */}
                <div className="flex items-center justify-between mb-6">
                    <p className="text-sm font-bold text-slate-500">
                        Showing <span className="text-slate-900">{filteredTasks.length}</span> of <span className="text-slate-900">{maintenance.length}</span> tasks
                    </p>
                    <button
                        onClick={exportToExcel}
                        disabled={exportLoading || filteredTasks.length === 0}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all disabled:opacity-50"
                    >
                        {exportLoading ? <Loader2 size={14} className="animate-spin" /> : <FileDown size={14} />}
                        {exportLoading ? 'Exporting...' : 'Export Excel'}
                    </button>
                </div>

                {/* Tasks List */}
                <div className="space-y-3 mb-8">
                    {loading ? (
                        <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm py-32 flex flex-col items-center">
                            <div className="w-12 h-12 border-4 border-slate-100 border-t-ram-red rounded-full animate-spin mb-4" />
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Compiling Technical Logs...</p>
                        </div>
                    ) : filteredTasks.length === 0 ? (
                        <div className="bg-white border border-dashed border-slate-200 rounded-[3rem] p-20 text-center">
                            <Wrench className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.4em]">No maintenance tasks found.</p>
                            <p className="text-slate-300 text-xs mt-2">Try adjusting your filters or search criteria.</p>
                        </div>
                    ) : filteredTasks.map(task => {
                        const isExpanded = expandedId === task.id;
                        const daysLeft = task._daysRemaining;
                        const isOverdue = daysLeft !== null && daysLeft < 0;
                        const typeCfg = TYPE_CONFIG[task.type] || TYPE_CONFIG['A-Check'];
                        const TypeIcon = typeCfg.icon;

                        return (
                            <div key={task.id}
                                 className={`bg-white border rounded-3xl p-6 shadow-sm hover:shadow-lg transition-all group ${isExpanded ? 'border-ram-red/30 shadow-lg' : 'border-slate-100 hover:border-ram-red/20'}`}>
                                {/* Main Row */}
                                <div className="flex flex-wrap items-center justify-between gap-6 cursor-pointer" onClick={() => toggleExpand(task.id)}>
                                    {/* Left: Icon + Identity */}
                                    <div className="flex items-center gap-5 min-w-[280px]">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-sm ${isExpanded ? 'bg-ram-red text-white' : 'bg-slate-50 text-ram-red group-hover:bg-ram-red group-hover:text-white'}`}>
                                            <TypeIcon size={24} strokeWidth={2} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3 mb-1.5">
                                                <span className="text-xl font-black text-slate-900 tracking-tighter">{task.id}</span>
                                                {getSeverityBadge(task.severity)}
                                            </div>
                                            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                                <span className="text-ram-red">{task.aircraft}</span>
                                                <span className="w-1 h-1 bg-slate-300 rounded-full" />
                                                <span>{task.type}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Center: Progress */}
                                    <div className="flex-1 min-w-[200px] max-w-md">
                                        <div className="flex justify-between items-center mb-2">
                                            {getStatusBadge(task.status)}
                                            <span className={`text-xs font-black tabular-nums ${task.status === 'COMPLETED' ? 'text-emerald-600' : 'text-slate-700'}`}>
                                                {task.status === 'CANCELLED' ? '—' : `${task._progress}%`}
                                            </span>
                                        </div>
                                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                            <div className={`h-full transition-all duration-1000 ease-out ${task.status === 'COMPLETED' ? 'bg-emerald-500' : task.status === 'CANCELLED' ? 'bg-slate-300' : 'bg-ram-red'}`}
                                                 style={{ width: task.status === 'CANCELLED' ? '0%' : `${task._progress}%` }} />
                                        </div>
                                    </div>

                                    {/* Right: Meta + Actions */}
                                    <div className="flex items-center gap-8">
                                        <div className="text-right hidden md:block">
                                            <p className="text-[9px] font-black text-slate-400 uppercase mb-1 tracking-widest">Lead Tech</p>
                                            <div className="flex items-center gap-1.5 justify-end">
                                                <User size={12} className="text-slate-400" />
                                                <p className="text-xs font-bold text-slate-700">{task.technician}</p>
                                            </div>
                                        </div>
                                        <div className="text-right hidden md:block">
                                            <p className="text-[9px] font-black text-slate-400 uppercase mb-1 tracking-widest">Release</p>
                                            <div className="flex items-center gap-1.5 justify-end">
                                                <CalendarDays size={12} className={isOverdue ? 'text-red-500' : 'text-slate-400'} />
                                                <p className={`text-xs font-bold ${isOverdue ? 'text-red-600' : 'text-slate-700'}`}>
                                                    {formatDate(task.endDate)}
                                                    {isOverdue && <span className="ml-1 text-[9px] font-black">({daysLeft}d)</span>}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            <button onClick={(e) => { e.stopPropagation(); openDetailModal(task); }}
                                                    className="w-11 h-11 bg-slate-100 text-slate-600 rounded-2xl flex items-center justify-center hover:bg-ram-red hover:text-white transition-all shadow-sm active:scale-90"
                                                    title="View Details">
                                                <Eye size={18} strokeWidth={2} />
                                            </button>
                                            <button onClick={(e) => { e.stopPropagation(); toggleExpand(task.id); }}
                                                    className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all shadow-sm active:scale-90 ${isExpanded ? 'bg-ram-red text-white' : 'bg-slate-900 text-white hover:bg-ram-red'}`}
                                                    title={isExpanded ? 'Collapse' : 'Expand'}>
                                                {isExpanded ? <ChevronUp size={18} strokeWidth={2.5} /> : <ArrowDownRight size={18} strokeWidth={2.5} />}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Expanded Details */}
                                {isExpanded && (
                                    <div className="mt-6 pt-6 border-t border-slate-100 animate-in slide-in-from-top-2 duration-300">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            {/* Column 1: Aircraft & Task Info */}
                                            <div className="space-y-4">
                                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Task Information</h4>
                                                <div className="space-y-3">
                                                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl">
                                                        <Hash size={16} className="text-slate-400" />
                                                        <div>
                                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Task ID</p>
                                                            <p className="text-sm font-bold text-slate-800">{task.id}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl">
                                                        <FileText size={16} className="text-slate-400" />
                                                        <div>
                                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Type</p>
                                                            <p className="text-sm font-bold text-slate-800">{task.type}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl">
                                                        <Settings size={16} className="text-slate-400" />
                                                        <div>
                                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Hangar</p>
                                                            <p className="text-sm font-bold text-slate-800">{task.hangar || 'TBD'}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Column 2: Assignment & Timeline */}
                                            <div className="space-y-4">
                                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Assignment & Timeline</h4>
                                                <div className="space-y-3">
                                                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl">
                                                        <User size={16} className="text-slate-400" />
                                                        <div>
                                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Technician</p>
                                                            <p className="text-sm font-bold text-slate-800">{task.technician}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl">
                                                        <CalendarDays size={16} className={isOverdue ? 'text-red-400' : 'text-slate-400'} />
                                                        <div>
                                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Due Date</p>
                                                            <p className={`text-sm font-bold ${isOverdue ? 'text-red-600' : 'text-slate-800'}`}>
                                                                {formatDate(task.endDate)}
                                                                {isOverdue && <span className="ml-2 text-[10px] font-black bg-red-100 text-red-700 px-2 py-0.5 rounded">OVERDUE {Math.abs(daysLeft)} DAYS</span>}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl">
                                                        <Activity size={16} className="text-slate-400" />
                                                        <div>
                                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Current Status</p>
                                                            <div className="mt-1">{getStatusBadge(task.status)}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Column 3: Progress & Actions */}
                                            <div className="space-y-4">
                                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Progress & Actions</h4>
                                                <div className="p-4 bg-slate-50 rounded-2xl">
                                                    <div className="flex justify-between items-center mb-3">
                                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Completion</span>
                                                        <span className="text-lg font-black text-slate-900 tabular-nums">{task._progress}%</span>
                                                    </div>
                                                    <div className="h-3 bg-white rounded-full overflow-hidden shadow-inner">
                                                        <div className={`h-full rounded-full transition-all duration-1000 ${task.status === 'COMPLETED' ? 'bg-emerald-500' : task.status === 'CANCELLED' ? 'bg-slate-300' : 'bg-ram-red'}`}
                                                             style={{ width: `${task._progress}%` }} />
                                                    </div>
                                                    <div className="flex justify-between mt-2 text-[9px] font-black text-slate-400 uppercase tracking-wider">
                                                        <span>0%</span><span>50%</span><span>100%</span>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-3 gap-2">
                                                    <button onClick={(e) => { e.stopPropagation(); openEditModal(task); }}
                                                            className="flex items-center justify-center gap-2 px-3 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-ram-red transition-all active:scale-95">
                                                        <Edit3 size={12} /> Edit
                                                    </button>
                                                    <button onClick={(e) => { e.stopPropagation(); openDetailModal(task); }}
                                                            className="flex items-center justify-center gap-2 px-3 py-3 border border-slate-200 text-slate-700 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:border-ram-red hover:text-ram-red transition-all active:scale-95">
                                                        <Eye size={12} /> View
                                                    </button>
                                                    <button onClick={(e) => { e.stopPropagation(); handleDeleteTask(task.id); }}
                                                            className="flex items-center justify-center gap-2 px-3 py-3 border border-red-200 text-red-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-50 hover:border-red-300 transition-all active:scale-95">
                                                        <Trash2 size={12} /> Delete
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {task.description && (
                                            <div className="mt-4 p-4 bg-amber-50 border border-amber-100 rounded-2xl">
                                                <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">Description</p>
                                                <p className="text-sm font-medium text-amber-800">{task.description}</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Right Column - Sidebar (below on mobile, side on large) */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    <div className="xl:col-span-2">
                        {/* Fleet Reliability */}
                        <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden mb-6">
                            <div className="absolute top-0 right-0 p-8 opacity-10">
                                <BarChart3 className="w-32 h-32" />
                            </div>
                            <h3 className="text-lg font-black uppercase tracking-tight mb-6 flex items-center gap-3">
                                <BarChart3 className="w-5 h-5 text-ram-red" /> Fleet Reliability
                            </h3>
                            <div className="space-y-6 relative z-10">
                                {[
                                    { label: 'Technical Despatch Reliability', value: '99.2%' },
                                    { label: 'AOG Incidents (MTD)', value: stats.critical.toString() },
                                    { label: 'MTBUR (Engine Fleet)', value: '3,240h' },
                                    { label: 'On-Time Maintenance', value: `${Math.round((stats.completed / (stats.total || 1)) * 100)}%` },
                                ].map((stat, i) => (
                                    <div key={i} className="flex justify-between items-end border-b border-white/10 pb-4">
                                        <span className="text-xs font-bold text-slate-400">{stat.label}</span>
                                        <span className="text-xl font-black">{stat.value}</span>
                                    </div>
                                ))}
                            </div>
                            <button className="w-full mt-8 py-4 bg-white/5 hover:bg-ram-red transition-all border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest">
                                Detailed Reliability Report
                            </button>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                            <h3 className="text-lg font-black uppercase tracking-tight mb-6 flex items-center gap-3">
                                <FileText className="w-5 h-5 text-ram-red" /> Tech Directives
                            </h3>
                            <div className="space-y-4">
                                {[
                                    { id: 'AD-2024-05', title: 'B737 Max Rudder Inspection', priority: 'MANDATORY', date: '2024-06-15' },
                                    { id: 'SB-RAM-42', title: 'Cabin Lighting Upgrade', priority: 'OPTIONAL', date: '2024-07-01' },
                                    { id: 'AD-2024-03', title: 'CFM56 Blade Inspection', priority: 'MANDATORY', date: '2024-05-30' },
                                ].map((doc, i) => (
                                    <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-ram-red/20 transition-all cursor-pointer">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-[10px] font-black text-slate-900">{doc.id}</span>
                                            <span className={`text-[8px] font-black px-2 py-0.5 rounded-full ${doc.priority === 'MANDATORY' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>{doc.priority}</span>
                                        </div>
                                        <p className="text-xs font-bold text-slate-600 group-hover:text-ram-red transition-colors mb-1">{doc.title}</p>
                                        <p className="text-[9px] font-bold text-slate-400">Due: {doc.date}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                            <h3 className="text-lg font-black uppercase tracking-tight mb-6 flex items-center gap-3">
                                <ShieldCheck className="w-5 h-5 text-ram-red" /> Compliance
                            </h3>
                            <div className="space-y-4">
                                {[
                                    { label: 'EASA Part-M', status: 'COMPLIANT', color: 'text-emerald-600', bg: 'bg-emerald-50' },
                                    { label: 'IOSA Standards', status: 'COMPLIANT', color: 'text-emerald-600', bg: 'bg-emerald-50' },
                                    { label: 'RAM Internal QA', status: 'REVIEW', color: 'text-amber-600', bg: 'bg-amber-50' },
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl">
                                        <span className="text-xs font-bold text-slate-600">{item.label}</span>
                                        <span className={`text-[9px] font-black px-2 py-1 rounded-lg ${item.bg} ${item.color}`}>{item.status}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ─── Create Modal ─────────────────────────────────── */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-[2.5rem] p-10 max-w-lg w-full shadow-2xl animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-ram-red rounded-2xl flex items-center justify-center text-white">
                                    <Plus size={20} strokeWidth={3} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black uppercase tracking-tight">Schedule Task</h2>
                                    <p className="text-xs text-slate-400 font-bold mt-1">Initialize a new maintenance intervention</p>
                                </div>
                            </div>
                            <button onClick={() => setShowModal(false)} className="w-10 h-10 bg-slate-100 rounded-2xl flex items-center justify-center hover:bg-slate-200 transition-all">
                                <X size={18} className="text-slate-500" />
                            </button>
                        </div>
                        {renderFormFields(false)}
                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-8">
                            <button onClick={() => setShowModal(false)} className="px-8 py-3.5 font-black text-xs uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-all rounded-2xl hover:bg-slate-50">Cancel</button>
                            <button onClick={handleAddTask} className="px-8 py-3.5 bg-ram-red text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-ram-red/20 active:scale-95 flex items-center gap-2">
                                <Save size={14} /> Initialize
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ─── EDIT Modal ───────────────────────────────────── */}
            {showEditModal && selectedTask && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-[2.5rem] p-10 max-w-lg w-full shadow-2xl animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-ram-red rounded-2xl flex items-center justify-center text-white">
                                    <Edit3 size={20} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black uppercase tracking-tight">Edit {selectedTask.id}</h2>
                                    <p className="text-xs text-slate-400 font-bold mt-1">Update maintenance task details</p>
                                </div>
                            </div>
                            <button onClick={() => setShowEditModal(false)} className="w-10 h-10 bg-slate-100 rounded-2xl flex items-center justify-center hover:bg-slate-200 transition-all">
                                <X size={18} className="text-slate-500" />
                            </button>
                        </div>
                        {renderFormFields(true)}
                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-8">
                            <button onClick={() => setShowEditModal(false)} className="px-8 py-3.5 font-black text-xs uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-all rounded-2xl hover:bg-slate-50">Cancel</button>
                            <button onClick={handleEditTask} className="px-8 py-3.5 bg-ram-red text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-ram-red/20 active:scale-95 flex items-center gap-2">
                                <Save size={14} /> Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ─── Details Modal ────────────────────────────────── */}
            {showDetailModal && selectedTask && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-[2.5rem] p-10 max-w-2xl w-full shadow-2xl animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-4">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${STATUS_CONFIG[selectedTask.status]?.bg}`}>
                                    {(() => { const Icon = STATUS_CONFIG[selectedTask.status]?.icon || Wrench; return <Icon size={24} className={STATUS_CONFIG[selectedTask.status]?.color} />; })()}
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black uppercase tracking-tight">{selectedTask.id}</h2>
                                    <div className="flex items-center gap-2 mt-1">
                                        {getSeverityBadge(selectedTask.severity)}
                                        {getStatusBadge(selectedTask.status)}
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => setShowDetailModal(false)} className="w-10 h-10 bg-slate-100 rounded-2xl flex items-center justify-center hover:bg-slate-200 transition-all">
                                <X size={18} className="text-slate-500" />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Task Information</h3>
                                <div className="p-4 bg-slate-50 rounded-2xl space-y-3">
                                    <div className="flex justify-between"><span className="text-xs font-bold text-slate-400">Aircraft</span><span className="text-sm font-black text-slate-800">{selectedTask.aircraft}</span></div>
                                    <div className="flex justify-between"><span className="text-xs font-bold text-slate-400">Type</span><span className="text-sm font-black text-slate-800">{selectedTask.type}</span></div>
                                    <div className="flex justify-between"><span className="text-xs font-bold text-slate-400">Hangar</span><span className="text-sm font-black text-slate-800">{selectedTask.hangar || 'TBD'}</span></div>
                                    <div className="flex justify-between"><span className="text-xs font-bold text-slate-400">Est. Hours</span><span className="text-sm font-black text-slate-800">{selectedTask.estimatedHours || '—'}</span></div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Timeline</h3>
                                <div className="p-4 bg-slate-50 rounded-2xl space-y-3">
                                    <div className="flex justify-between"><span className="text-xs font-bold text-slate-400">Start Date</span><span className="text-sm font-black text-slate-800">{formatDate(selectedTask.startDate)}</span></div>
                                    <div className="flex justify-between"><span className="text-xs font-bold text-slate-400">End Date</span><span className="text-sm font-black text-slate-800">{formatDate(selectedTask.endDate)}</span></div>
                                    <div className="flex justify-between"><span className="text-xs font-bold text-slate-400">Technician</span><span className="text-sm font-black text-slate-800">{selectedTask.technician}</span></div>
                                    <div className="flex justify-between"><span className="text-xs font-bold text-slate-400">Progress</span><span className="text-sm font-black text-slate-800">{selectedTask._progress}%</span></div>
                                </div>
                            </div>
                        </div>

                        {selectedTask.description && (
                            <div className="mt-6 p-4 bg-amber-50 border border-amber-100 rounded-2xl">
                                <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">Description</p>
                                <p className="text-sm font-medium text-amber-800">{selectedTask.description}</p>
                            </div>
                        )}

                        {selectedTask.partsRequired && (
                            <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-2xl">
                                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Parts Required</p>
                                <p className="text-sm font-medium text-blue-800">{selectedTask.partsRequired}</p>
                            </div>
                        )}

                        <div className="mt-6">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Progress Timeline</h3>
                            <div className="p-4 bg-slate-50 rounded-2xl">
                                <div className="h-4 bg-white rounded-full overflow-hidden shadow-inner">
                                    <div className={`h-full rounded-full transition-all duration-1000 ${selectedTask.status === 'COMPLETED' ? 'bg-emerald-500' : selectedTask.status === 'CANCELLED' ? 'bg-slate-300' : 'bg-ram-red'}`}
                                         style={{ width: `${selectedTask._progress}%` }} />
                                </div>
                                <div className="flex justify-between mt-3 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                                    <span>Created</span><span>In Progress</span><span>Completed</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-slate-100">
                            <button onClick={() => { setShowDetailModal(false); handleDeleteTask(selectedTask.id); }}
                                    className="px-6 py-3.5 border border-red-200 text-red-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-50 transition-all flex items-center gap-2">
                                <Trash2 size={14} /> Delete
                            </button>
                            <button onClick={() => { setShowDetailModal(false); openEditModal(selectedTask); }}
                                    className="px-8 py-3.5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-ram-red transition-all shadow-lg active:scale-95 flex items-center gap-2">
                                <Edit3 size={14} /> Edit Task
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManagerMaintenance;