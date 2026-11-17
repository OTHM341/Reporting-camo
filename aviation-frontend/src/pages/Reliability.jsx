import { useState, useEffect, useMemo } from 'react';
import {
    BarChart3,
    TrendingUp,
    Zap,
    Activity,
    ShieldAlert,
    PieChart,
    Download,
    RefreshCcw,
    Search,
    Clock,
    Plane,
    AlertCircle,
    CheckCircle2,
    ArrowUpRight,
    X,
    Plus,
    Save,
    Trash2,
    Edit3,
    Eye,
    FileDown,
    Loader2,
    Filter,
    ChevronDown,
    ChevronUp,
    Hash,
    FileText,
    User,
    CalendarDays
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart as RePieChart, Pie, Cell, Legend, AreaChart, Area
} from 'recharts';
import Logo from '../components/UI/Logo';

// ─── Helpers ────────────────────────────────────────────────

const COLORS = ['#e8372a', '#e8952a', '#2a7be8', '#2ae882'];

const SEVERITY_CONFIG = {
    CRITICAL: { label: 'Critical', color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-100', dot: 'bg-red-600' },
    MAJOR: { label: 'Major', color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-100', dot: 'bg-orange-600' },
    MINOR: { label: 'Minor', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-100', dot: 'bg-blue-600' },
    LOW: { label: 'Low', color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-100', dot: 'bg-slate-400' },
};

const STATUS_CONFIG = {
    OPEN: { label: 'Open', color: 'text-amber-600', bg: 'bg-amber-50', ring: 'ring-amber-200', icon: AlertCircle },
    IN_PROGRESS: { label: 'In Progress', color: 'text-blue-600', bg: 'bg-blue-50', ring: 'ring-blue-200', icon: Activity },
    RESOLVED: { label: 'Resolved', color: 'text-emerald-600', bg: 'bg-emerald-50', ring: 'ring-emerald-200', icon: CheckCircle2 },
    CLOSED: { label: 'Closed', color: 'text-slate-600', bg: 'bg-slate-50', ring: 'ring-slate-200', icon: CheckCircle2 },
};

const getSeverityBadge = (severity) => {
    const cfg = SEVERITY_CONFIG[severity] || SEVERITY_CONFIG.MINOR;
    return (
        <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
            <div className={`w-1.5 h-1.5 rounded-full ${cfg.dot} ${severity === 'CRITICAL' ? 'animate-ping' : ''}`} />
            {cfg.label}
        </span>
    );
};

const getStatusBadge = (status) => {
    const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.OPEN;
    const Icon = cfg.icon;
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${cfg.bg} ${cfg.color} ring-1 ${cfg.ring}`}>
            <Icon size={12} />
            {cfg.label}
        </span>
    );
};

const formatDate = (dateStr) => {
    if (!dateStr) return 'TBD';
    const d = new Date(dateStr);
    if (isNaN(d)) return dateStr;
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

// ─── Toast Component ────────────────────────────────────────
const Toast = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const bgClass = type === 'success' ? 'bg-emerald-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500';
    const Icon = type === 'success' ? CheckCircle2 : type === 'error' ? ShieldAlert : Activity;

    return (
        <div className={`fixed bottom-6 right-6 z-[60] ${bgClass} text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right duration-300`}>
            <Icon size={16} />
            <span className="text-xs font-black uppercase tracking-widest">{message}</span>
            <button onClick={onClose} className="ml-2 hover:opacity-70"><X size={14} /></button>
        </div>
    );
};

// ─── Component ───────────────────────────────────────────────

const Reliability = () => {
    const [defects, setDefects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterSeverity, setFilterSeverity] = useState('ALL');
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [lastUpdated, setLastUpdated] = useState(new Date());
    const [expandedId, setExpandedId] = useState(null);
    const [exportLoading, setExportLoading] = useState(false);
    const [toast, setToast] = useState(null);

    // Modals
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedDefect, setSelectedDefect] = useState(null);

    // Form
    const [formData, setFormData] = useState({
        id: '',
        aircraftRegistration: '',
        severity: 'MINOR',
        status: 'OPEN',
        description: '',
        reportedDate: new Date().toISOString().split('T')[0],
        resolvedDate: '',
        technician: '',
        component: '',
        ataChapter: '',
        flightHours: '',
        cycles: '',
        correctiveAction: ''
    });
    const [formErrors, setFormErrors] = useState({});

    useEffect(() => {
        fetchData();
        const interval = setInterval(() => { fetchData(); }, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            // Mock data enriched
            const mockData = [
                { id: 'DEF-001', aircraftRegistration: 'CN-RGN', severity: 'CRITICAL', status: 'OPEN', description: 'Engine #2 vibration exceedance during climb - N2 oscillating at 102%', reportedDate: '2024-05-25', resolvedDate: '', technician: 'Ahmed K.', component: 'CFM56-7B Engine', ataChapter: '72-00', flightHours: 12450, cycles: 5230, correctiveAction: 'Pending borescope inspection' },
                { id: 'DEF-002', aircraftRegistration: 'CN-ROB', severity: 'MAJOR', status: 'IN_PROGRESS', description: 'Landing gear retraction anomaly - hydraulic pressure drop on left main', reportedDate: '2024-05-24', resolvedDate: '', technician: 'Fatima Z.', component: 'Landing Gear System', ataChapter: '32-00', flightHours: 8920, cycles: 4100, correctiveAction: 'Replacing hydraulic actuator' },
                { id: 'DEF-003', aircraftRegistration: 'CN-RGO', severity: 'MINOR', status: 'RESOLVED', description: 'Cabin PA system intermittent static on channel 3', reportedDate: '2024-05-20', resolvedDate: '2024-05-22', technician: 'Omar C.', component: 'Audio System', ataChapter: '23-00', flightHours: 15600, cycles: 6800, correctiveAction: 'Replaced audio amplifier unit' },
                { id: 'DEF-004', aircraftRegistration: 'CN-RGP', severity: 'CRITICAL', status: 'IN_PROGRESS', description: 'APU auto-shutdown on ground start - EGT exceedance', reportedDate: '2024-05-26', resolvedDate: '', technician: 'Youssef E.', component: 'APU GTCP 131-9B', ataChapter: '49-00', flightHours: 7800, cycles: 3200, correctiveAction: 'Awaiting APU replacement unit' },
                { id: 'DEF-005', aircraftRegistration: 'CN-RGN', severity: 'MAJOR', status: 'OPEN', description: 'Flight control computer #1 fault - spoiler position disagree', reportedDate: '2024-05-27', resolvedDate: '', technician: 'Ahmed K.', component: 'FCC', ataChapter: '27-00', flightHours: 12450, cycles: 5230, correctiveAction: 'Scheduled software reload' },
                { id: 'DEF-006', aircraftRegistration: 'CN-ROJ', severity: 'MINOR', status: 'CLOSED', description: 'Cockpit window seal degradation - minor air leak at FL350', reportedDate: '2024-05-15', resolvedDate: '2024-05-18', technician: 'Fatima Z.', component: 'Cabin Window', ataChapter: '56-00', flightHours: 21000, cycles: 8900, correctiveAction: 'Resealed window frame' },
                { id: 'DEF-007', aircraftRegistration: 'CN-RGI', severity: 'LOW', status: 'OPEN', description: 'Inoperative reading light in seat 14A business class', reportedDate: '2024-05-28', resolvedDate: '', technician: 'Omar C.', component: 'Cabin Lighting', ataChapter: '33-00', flightHours: 18900, cycles: 7600, correctiveAction: 'Parts on order' },
                { id: 'DEF-008', aircraftRegistration: 'CN-ROH', severity: 'MAJOR', status: 'IN_PROGRESS', description: 'Fuel quantity indication error - left wing tank showing 200kg discrepancy', reportedDate: '2024-05-26', resolvedDate: '', technician: 'Youssef E.', component: 'Fuel System', ataChapter: '28-00', flightHours: 9500, cycles: 4300, correctiveAction: 'Calibrating fuel probes' },
                { id: 'DEF-009', aircraftRegistration: 'CN-RGP', severity: 'CRITICAL', status: 'OPEN', description: 'TCAS RA failure - no resolution advisory generated during encounter', reportedDate: '2024-05-28', resolvedDate: '', technician: 'Ahmed K.', component: 'TCAS System', ataChapter: '34-00', flightHours: 7800, cycles: 3200, correctiveAction: 'Emergency replacement required' },
                { id: 'DEF-010', aircraftRegistration: 'CN-ROB', severity: 'MINOR', status: 'RESOLVED', description: 'Galley oven #2 not heating - tripping circuit breaker', reportedDate: '2024-05-22', resolvedDate: '2024-05-23', technician: 'Fatima Z.', component: 'Galley Equipment', ataChapter: '25-00', flightHours: 8920, cycles: 4100, correctiveAction: 'Replaced heating element' },
            ];
            setDefects(mockData);
            setLastUpdated(new Date());
        } catch (error) {
            console.error('Reliability Dashboard', error);
        } finally {
            setLoading(false);
        }
    };

    const showToastMsg = (message, type = 'success') => {
        setToast({ message, type });
    };

    const validateForm = () => {
        const errors = {};
        if (!formData.id.trim()) errors.id = 'Defect ID required';
        if (!formData.aircraftRegistration.trim()) errors.aircraftRegistration = 'Aircraft registration required';
        if (!formData.description.trim()) errors.description = 'Description required';
        if (!formData.reportedDate) errors.reportedDate = 'Reported date required';
        if (!formData.technician.trim()) errors.technician = 'Technician required';
        if (!formData.component.trim()) errors.component = 'Component required';
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const resetForm = () => {
        setFormData({
            id: '', aircraftRegistration: '', severity: 'MINOR', status: 'OPEN',
            description: '', reportedDate: new Date().toISOString().split('T')[0],
            resolvedDate: '', technician: '', component: '', ataChapter: '',
            flightHours: '', cycles: '', correctiveAction: ''
        });
        setFormErrors({});
    };

    const handleAddDefect = () => {
        if (!validateForm()) return;
        const newDefect = {
            ...formData,
            id: formData.id.toUpperCase(),
            aircraftRegistration: formData.aircraftRegistration.toUpperCase(),
            flightHours: parseInt(formData.flightHours) || 0,
            cycles: parseInt(formData.cycles) || 0
        };
        setDefects(prev => [newDefect, ...prev]);
        setShowAddModal(false);
        resetForm();
        showToastMsg(`Defect ${newDefect.id} logged`);
    };

    const handleEditDefect = () => {
        if (!validateForm()) return;
        const updated = {
            ...formData,
            flightHours: parseInt(formData.flightHours) || 0,
            cycles: parseInt(formData.cycles) || 0
        };
        setDefects(prev => prev.map(d => d.id === selectedDefect.id ? updated : d));
        setShowEditModal(false);
        setSelectedDefect(null);
        resetForm();
        showToastMsg(`Defect ${updated.id} updated`);
    };

    const handleDeleteDefect = (defectId) => {
        if (window.confirm(`Delete defect ${defectId}?`)) {
            setDefects(prev => prev.filter(d => d.id !== defectId));
            showToastMsg(`Defect ${defectId} deleted`, 'warning');
        }
    };

    const openEditModal = (defect) => {
        setSelectedDefect(defect);
        setFormData({
            ...defect,
            reportedDate: defect.reportedDate || '',
            resolvedDate: defect.resolvedDate || '',
            flightHours: defect.flightHours ? defect.flightHours.toString() : '',
            cycles: defect.cycles ? defect.cycles.toString() : '',
            correctiveAction: defect.correctiveAction || ''
        });
        setFormErrors({});
        setShowEditModal(true);
    };

    const openDetailModal = (defect) => {
        setSelectedDefect(defect);
        setShowDetailModal(true);
    };

    const toggleExpand = (id) => {
        setExpandedId(expandedId === id ? null : id);
    };

    const exportToExcel = () => {
        setExportLoading(true);
        setTimeout(() => {
            const headers = ['Defect ID;Aircraft;Severity;Status;Description;Reported Date;Resolved Date;Technician;Component;ATA Chapter;Flight Hours;Cycles;Corrective Action;Export Date'];
            const rows = filteredDefects.map(d => [
                d.id, d.aircraftRegistration, d.severity, d.status,
                d.description, formatDate(d.reportedDate), formatDate(d.resolvedDate),
                d.technician, d.component, d.ataChapter || 'N/A',
                d.flightHours || 0, d.cycles || 0, d.correctiveAction || '',
                new Date().toLocaleString('fr-FR')
            ].join(';'));
            const csv = '\uFEFF' + [...headers, ...rows].join('\n');
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const ts = new Date().toISOString().slice(0,19).replace(/:/g,'-');
            link.href = URL.createObjectURL(blob);
            link.download = `RAM_Reliability_${ts}.csv`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setExportLoading(false);
            showToastMsg(`${filteredDefects.length} defects exported`);
        }, 1200);
    };

    // ─── Computed Analytics ─────────────────────────────────
    const kpis = useMemo(() => {
        const total = defects.length;
        const open = defects.filter(d => d.status === 'OPEN' || d.status === 'IN_PROGRESS').length;
        const critical = defects.filter(d => d.severity === 'CRITICAL' && d.status !== 'RESOLVED' && d.status !== 'CLOSED').length;
        const resolved = defects.filter(d => d.status === 'RESOLVED' || d.status === 'CLOSED').length;
        const uniqueAircraft = new Set(defects.map(d => d.aircraftRegistration)).size;
        const avgResTime = '4.2d';

        return [
            { label: 'Total Defects', value: total, icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Open Defects', value: open, icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: 'Critical Issues', value: critical, icon: ShieldAlert, color: 'text-ram-red', bg: 'bg-red-50' },
            { label: 'Resolved (MTD)', value: resolved, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Avg Res Time', value: avgResTime, icon: Clock, color: 'text-slate-600', bg: 'bg-slate-50' },
            { label: 'Aircraft Impact', value: uniqueAircraft, icon: Plane, color: 'text-indigo-600', bg: 'bg-indigo-50' },
        ];
    }, [defects]);

    const severityData = useMemo(() => {
        const counts = { CRITICAL: 0, MAJOR: 0, MINOR: 0, LOW: 0 };
        defects.forEach(d => { if(counts[d.severity] !== undefined) counts[d.severity]++; });
        return Object.keys(counts).map(key => ({ name: key, value: counts[key] }));
    }, [defects]);

    const statusData = useMemo(() => {
        const open = defects.filter(d => d.status === 'OPEN' || d.status === 'IN_PROGRESS').length;
        const resolved = defects.filter(d => d.status === 'RESOLVED' || d.status === 'CLOSED').length;
        return [
            { name: 'Active', value: open },
            { name: 'Resolved', value: resolved }
        ];
    }, [defects]);

    const trendData = useMemo(() => [
        { day: 'Mon', reported: 3, resolved: 1 },
        { day: 'Tue', reported: 5, resolved: 2 },
        { day: 'Wed', reported: 4, resolved: 3 },
        { day: 'Thu', reported: 7, resolved: 2 },
        { day: 'Fri', reported: 6, resolved: 4 },
        { day: 'Sat', reported: 2, resolved: 3 },
        { day: 'Sun', reported: 3, resolved: 2 }
    ], []);

    const aircraftDefectStats = useMemo(() => {
        const stats = {};
        defects.forEach(d => {
            if (!stats[d.aircraftRegistration]) stats[d.aircraftRegistration] = { count: 0, critical: 0 };
            stats[d.aircraftRegistration].count++;
            if (d.severity === 'CRITICAL') stats[d.aircraftRegistration].critical++;
        });
        return Object.entries(stats).map(([reg, data]) => ({ name: reg, defects: data.count, critical: data.critical }));
    }, [defects]);

    const filteredDefects = useMemo(() => {
        return defects.filter(d => {
            const term = searchTerm.toLowerCase();
            const matchesSearch =
                d.id?.toLowerCase().includes(term) ||
                d.aircraftRegistration?.toLowerCase().includes(term) ||
                d.description?.toLowerCase().includes(term) ||
                d.technician?.toLowerCase().includes(term) ||
                d.component?.toLowerCase().includes(term) ||
                d.ataChapter?.toLowerCase().includes(term);
            const matchesSeverity = filterSeverity === 'ALL' || d.severity === filterSeverity;
            const matchesStatus = filterStatus === 'ALL' || d.status === filterStatus;
            return matchesSearch && matchesSeverity && matchesStatus;
        });
    }, [defects, searchTerm, filterSeverity, filterStatus]);

    const alerts = useMemo(() => {
        const items = [];
        const aogCount = defects.filter(d => d.severity === 'CRITICAL' && d.status === 'OPEN').length;
        if(aogCount > 0) items.push({ type: 'AOG', msg: `${aogCount} Aircraft currently AOG due to critical defects.` });

        const aircraftStats = {};
        defects.forEach(d => {
            aircraftStats[d.aircraftRegistration] = (aircraftStats[d.aircraftRegistration] || 0) + 1;
        });
        Object.entries(aircraftStats).forEach(([reg, count]) => {
            if(count > 2) items.push({ type: 'REPEAT', msg: `Repeated failures detected on ${reg} (${count} reports).` });
        });

        return items;
    }, [defects]);

    const inputClass = (err) => `w-full px-4 py-3 bg-slate-50 border rounded-2xl font-bold text-sm transition-all ${err ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100' : 'border-slate-200 focus:border-ram-red focus:ring-2 focus:ring-ram-red/10'} focus:outline-none`;

    const renderFormFields = (isEdit = false) => (
        <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Defect ID *</label>
                    <input type="text" placeholder="DEF-###" className={inputClass(formErrors.id)} value={formData.id} onChange={e => setFormData({...formData, id: e.target.value})} disabled={isEdit} />
                    {formErrors.id && <p className="text-red-500 text-xs mt-1 font-bold">{formErrors.id}</p>}
                </div>
                <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Aircraft Reg *</label>
                    <input type="text" placeholder="CN-XXX" className={inputClass(formErrors.aircraftRegistration)} value={formData.aircraftRegistration} onChange={e => setFormData({...formData, aircraftRegistration: e.target.value.toUpperCase()})} />
                    {formErrors.aircraftRegistration && <p className="text-red-500 text-xs mt-1 font-bold">{formErrors.aircraftRegistration}</p>}
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Severity</label>
                    <select className={inputClass()} value={formData.severity} onChange={e => setFormData({...formData, severity: e.target.value})}>
                        {Object.keys(SEVERITY_CONFIG).map(s => <option key={s} value={s}>{SEVERITY_CONFIG[s].label}</option>)}
                    </select>
                </div>
                <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Status</label>
                    <select className={inputClass()} value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                        {Object.keys(STATUS_CONFIG).map(s => <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>)}
                    </select>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Reported Date *</label>
                    <input type="date" className={inputClass(formErrors.reportedDate)} value={formData.reportedDate} onChange={e => setFormData({...formData, reportedDate: e.target.value})} />
                    {formErrors.reportedDate && <p className="text-red-500 text-xs mt-1 font-bold">{formErrors.reportedDate}</p>}
                </div>
                <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Resolved Date</label>
                    <input type="date" className={inputClass()} value={formData.resolvedDate} onChange={e => setFormData({...formData, resolvedDate: e.target.value})} />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Component *</label>
                    <input type="text" placeholder="e.g. CFM56-7B Engine" className={inputClass(formErrors.component)} value={formData.component} onChange={e => setFormData({...formData, component: e.target.value})} />
                    {formErrors.component && <p className="text-red-500 text-xs mt-1 font-bold">{formErrors.component}</p>}
                </div>
                <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">ATA Chapter</label>
                    <input type="text" placeholder="e.g. 72-00" className={inputClass()} value={formData.ataChapter} onChange={e => setFormData({...formData, ataChapter: e.target.value})} />
                </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
                <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Technician *</label>
                    <input type="text" placeholder="Name" className={inputClass(formErrors.technician)} value={formData.technician} onChange={e => setFormData({...formData, technician: e.target.value})} />
                    {formErrors.technician && <p className="text-red-500 text-xs mt-1 font-bold">{formErrors.technician}</p>}
                </div>
                <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Flight Hours</label>
                    <input type="number" className={inputClass()} value={formData.flightHours} onChange={e => setFormData({...formData, flightHours: e.target.value})} />
                </div>
                <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Cycles</label>
                    <input type="number" className={inputClass()} value={formData.cycles} onChange={e => setFormData({...formData, cycles: e.target.value})} />
                </div>
            </div>
            <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Description *</label>
                <textarea rows="3" placeholder="Detailed defect description..." className={`${inputClass(formErrors.description)} resize-none`} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                {formErrors.description && <p className="text-red-500 text-xs mt-1 font-bold">{formErrors.description}</p>}
            </div>
            <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Corrective Action</label>
                <textarea rows="2" placeholder="Planned or completed corrective action..." className={`${inputClass()} resize-none`} value={formData.correctiveAction} onChange={e => setFormData({...formData, correctiveAction: e.target.value})} />
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="p-8 flex flex-col items-center justify-center min-h-screen bg-slate-50">
                <div className="w-12 h-12 border-4 border-slate-100 border-t-ram-red rounded-full animate-spin mb-4" />
                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Synchronizing Tech Logs...</p>
            </div>
        );
    }

    return (
        <div className="bg-[#F8FAFC] min-h-screen font-sans pb-20 relative">
            {/* Toast */}
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            <div className="p-8 max-w-[1600px] mx-auto">
                {/* Header with Logo */}
                <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-200 pb-8">
                    <div>
                        <div className="flex items-center gap-3 mb-3">
                            <Logo className="h-10" />
                            <div className="h-6 w-px bg-slate-200" />
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Maintenance Intelligence</span>
                        </div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">
                            Reliability <span className="text-ram-red italic">Control</span>
                        </h1>
                        <div className="flex items-center gap-2 mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            <Clock className="w-3 h-3" /> Last Synced: {lastUpdated.toLocaleTimeString()} (UTC)
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <button
                            onClick={() => { resetForm(); setShowAddModal(true); }}
                            className="flex items-center gap-2 px-6 py-3.5 bg-ram-red text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:shadow-xl shadow-ram-red/20 transition-all active:scale-95 hover:-translate-y-0.5"
                        >
                            <Plus size={14} strokeWidth={3} /> Log Defect
                        </button>
                        <button onClick={fetchData} className="p-3.5 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all text-slate-500 shadow-sm">
                            <RefreshCcw size={18} />
                        </button>
                        <button
                            onClick={exportToExcel}
                            disabled={exportLoading || filteredDefects.length === 0}
                            className="flex items-center gap-2 px-6 py-3.5 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all shadow-sm disabled:opacity-50"
                        >
                            {exportLoading ? <Loader2 size={14} className="animate-spin" /> : <FileDown size={14} />}
                            {exportLoading ? 'Exporting...' : 'Export Excel'}
                        </button>
                    </div>
                </header>

                {/* KPI Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
                    {kpis.map((kpi, i) => (
                        <div key={i} className="bg-white border border-slate-100 p-5 rounded-3xl shadow-sm flex items-center justify-between group hover:shadow-md hover:border-ram-red/20 transition-all">
                            <div>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{kpi.label}</p>
                                <p className="text-2xl font-black text-slate-900 tabular-nums">{kpi.value}</p>
                            </div>
                            <div className={`p-3.5 rounded-2xl ${kpi.bg} ${kpi.color} transition-transform group-hover:scale-110 duration-300`}>
                                <kpi.icon size={18} strokeWidth={2.5} />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Alerts */}
                {alerts.length > 0 && (
                    <div className="mb-8 space-y-3">
                        {alerts.map((alert, i) => (
                            <div key={i} className="flex items-center gap-4 p-4 bg-red-50 border border-red-100 rounded-2xl">
                                <Zap className="w-5 h-5 text-ram-red animate-pulse" />
                                <span className="text-xs font-black text-red-700 uppercase tracking-widest">{alert.type} ALERT:</span>
                                <p className="text-sm font-bold text-red-900">{alert.msg}</p>
                            </div>
                        ))}
                    </div>
                )}

                {/* Charts Grid */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
                    {/* Severity Profile */}
                    <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm">
                        <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-6 flex items-center gap-3">
                            <BarChart3 className="w-5 h-5 text-ram-red" /> Severity Profile
                        </h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={severityData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold', fill: '#94a3b8'}} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold', fill: '#94a3b8'}} />
                                    <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                                        {severityData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Resolution Burn-down */}
                    <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm">
                        <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-6 flex items-center gap-3">
                            <TrendingUp className="w-5 h-5 text-blue-600" /> Resolution Burn-down
                        </h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={trendData}>
                                    <defs>
                                        <linearGradient id="colorReported" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#e8372a" stopOpacity={0.1}/>
                                            <stop offset="95%" stopColor="#e8372a" stopOpacity={0}/>
                                        </linearGradient>
                                        <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#2ae882" stopOpacity={0.1}/>
                                            <stop offset="95%" stopColor="#2ae882" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold', fill: '#94a3b8'}} />
                                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                                    <Area type="monotone" dataKey="reported" stroke="#e8372a" strokeWidth={2} fillOpacity={1} fill="url(#colorReported)" name="Reported" />
                                    <Area type="monotone" dataKey="resolved" stroke="#2ae882" strokeWidth={2} fillOpacity={1} fill="url(#colorResolved)" name="Resolved" />
                                    <Legend iconType="circle" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Log Integrity */}
                    <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm">
                        <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-6 flex items-center gap-3">
                            <PieChart className="w-5 h-5 text-emerald-600" /> Log Integrity
                        </h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <RePieChart>
                                    <Pie data={statusData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                        <Cell fill="#e8372a" />
                                        <Cell fill="#2ae882" />
                                    </Pie>
                                    <Tooltip />
                                    <Legend verticalAlign="bottom" align="center" iconType="circle" />
                                </RePieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Aircraft Defect Stats */}
                <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm mb-8">
                    <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-6 flex items-center gap-3">
                        <Plane className="w-5 h-5 text-ram-red" /> Defects by Aircraft
                    </h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={aircraftDefectStats} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                                <XAxis type="number" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold', fill: '#94a3b8'}} />
                                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold', fill: '#64748b'}} width={80} />
                                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                                <Bar dataKey="defects" fill="#2a7be8" radius={[0, 6, 6, 0]} name="Total Defects" />
                                <Bar dataKey="critical" fill="#e8372a" radius={[0, 6, 6, 0]} name="Critical" />
                                <Legend iconType="circle" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm mb-6 flex flex-col lg:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                        <input
                            type="text"
                            placeholder="Search by ID, Aircraft, Description, Technician, Component..."
                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-ram-red/10 font-bold text-sm transition-all"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-3 flex-wrap">
                        <select value={filterSeverity} onChange={e => setFilterSeverity(e.target.value)}
                                className="px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-100 transition-all cursor-pointer outline-none focus:ring-2 focus:ring-ram-red/10">
                            <option value="ALL">All Severities</option>
                            {Object.entries(SEVERITY_CONFIG).map(([key, cfg]) => <option key={key} value={key}>{cfg.label}</option>)}
                        </select>
                        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                                className="px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-100 transition-all cursor-pointer outline-none focus:ring-2 focus:ring-ram-red/10">
                            <option value="ALL">All Statuses</option>
                            {Object.entries(STATUS_CONFIG).map(([key, cfg]) => <option key={key} value={key}>{cfg.label}</option>)}
                        </select>
                    </div>
                </div>

                {/* Results count */}
                <div className="flex items-center justify-between mb-6">
                    <p className="text-sm font-bold text-slate-500">
                        Showing <span className="text-slate-900">{filteredDefects.length}</span> of <span className="text-slate-900">{defects.length}</span> defects
                    </p>
                </div>

                {/* Defects Table */}
                <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden mb-12">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                            <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                <th className="px-10 py-6">ID / Tail</th>
                                <th className="px-10 py-6">Component / ATA</th>
                                <th className="px-10 py-6">Operational Descriptor</th>
                                <th className="px-10 py-6">Impact</th>
                                <th className="px-10 py-6">Timeline</th>
                                <th className="px-10 py-6">Status</th>
                                <th className="px-10 py-6 text-right">Actions</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                            {filteredDefects.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-10 py-20 text-center">
                                        <ShieldAlert className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                                        <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.4em]">No defects found.</p>
                                        <p className="text-slate-300 text-xs mt-2">Try adjusting your filters or search criteria.</p>
                                    </td>
                                </tr>
                            ) : filteredDefects.map((d) => (
                                <tr key={d.id} className={`hover:bg-slate-50 transition-colors group ${d.severity === 'CRITICAL' ? 'bg-red-50/30' : ''}`}>
                                    <td className="px-10 py-6">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-sm font-black text-slate-900 tracking-tighter uppercase">{d.id}</span>
                                            <span className="text-xs font-black text-ram-red">{d.aircraftRegistration}</span>
                                        </div>
                                    </td>
                                    <td className="px-10 py-6">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-xs font-bold text-slate-700">{d.component}</span>
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">ATA {d.ataChapter || 'N/A'}</span>
                                        </div>
                                    </td>
                                    <td className="px-10 py-6">
                                        <p className="text-sm font-medium text-slate-600 max-w-md line-clamp-2 leading-relaxed italic">"{d.description}"</p>
                                    </td>
                                    <td className="px-10 py-6">
                                        {getSeverityBadge(d.severity)}
                                    </td>
                                    <td className="px-10 py-6">
                                        <div className="flex flex-col gap-1 text-[10px] font-bold text-slate-400">
                                            <div className="flex items-center gap-2"><CalendarDays size={12} /> {formatDate(d.reportedDate)}</div>
                                            <div className="flex items-center gap-2"><User size={12} /> {d.technician}</div>
                                        </div>
                                    </td>
                                    <td className="px-10 py-6">
                                        {getStatusBadge(d.status)}
                                    </td>
                                    <td className="px-10 py-6 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={() => openDetailModal(d)} className="p-2.5 bg-slate-100 hover:bg-ram-red hover:text-white rounded-xl transition-all text-slate-500" title="View Details">
                                                <Eye size={16} />
                                            </button>
                                            <button onClick={() => openEditModal(d)} className="p-2.5 bg-slate-100 hover:bg-blue-500 hover:text-white rounded-xl transition-all text-slate-500" title="Edit">
                                                <Edit3 size={16} />
                                            </button>
                                            <button onClick={() => handleDeleteDefect(d.id)} className="p-2.5 bg-slate-100 hover:bg-red-500 hover:text-white rounded-xl transition-all text-slate-500" title="Delete">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="px-10 py-6 border-t border-slate-50 flex items-center justify-between bg-slate-50/10">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Showing {filteredDefects.length} data records</p>
                        <div className="flex gap-2">
                            <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl opacity-50 cursor-not-allowed text-[10px] font-bold uppercase tracking-widest">Previous</button>
                            <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-[10px] font-bold uppercase tracking-widest">Next</button>
                        </div>
                    </div>
                </div>

                {/* Footer Logo */}
                <div className="mt-20 flex flex-col items-center opacity-10 grayscale pointer-events-none">
                    <Logo className="h-32 mb-4" />
                    <p className="text-[10px] font-black tracking-[1em] uppercase">Royal Air Maroc Reliability Dept</p>
                </div>
            </div>

            {/* ─── ADD Modal ────────────────────────────────────── */}
            {showAddModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-[2.5rem] p-10 max-w-2xl w-full shadow-2xl animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-ram-red rounded-2xl flex items-center justify-center text-white">
                                    <Plus size={20} strokeWidth={3} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black uppercase tracking-tight">Log New Defect</h2>
                                    <p className="text-xs text-slate-400 font-bold mt-1">Record a new reliability incident</p>
                                </div>
                            </div>
                            <button onClick={() => setShowAddModal(false)} className="w-10 h-10 bg-slate-100 rounded-2xl flex items-center justify-center hover:bg-slate-200 transition-all">
                                <X size={18} className="text-slate-500" />
                            </button>
                        </div>
                        {renderFormFields(false)}
                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-8">
                            <button onClick={() => setShowAddModal(false)} className="px-8 py-3.5 font-black text-xs uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-all rounded-2xl hover:bg-slate-50">Cancel</button>
                            <button onClick={handleAddDefect} className="px-8 py-3.5 bg-ram-red text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-ram-red/20 active:scale-95 flex items-center gap-2">
                                <Save size={14} /> Log Defect
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ─── EDIT Modal ───────────────────────────────────── */}
            {showEditModal && selectedDefect && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-[2.5rem] p-10 max-w-2xl w-full shadow-2xl animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-ram-red rounded-2xl flex items-center justify-center text-white">
                                    <Edit3 size={20} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black uppercase tracking-tight">Edit {selectedDefect.id}</h2>
                                    <p className="text-xs text-slate-400 font-bold mt-1">Update defect details</p>
                                </div>
                            </div>
                            <button onClick={() => setShowEditModal(false)} className="w-10 h-10 bg-slate-100 rounded-2xl flex items-center justify-center hover:bg-slate-200 transition-all">
                                <X size={18} className="text-slate-500" />
                            </button>
                        </div>
                        {renderFormFields(true)}
                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-8">
                            <button onClick={() => setShowEditModal(false)} className="px-8 py-3.5 font-black text-xs uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-all rounded-2xl hover:bg-slate-50">Cancel</button>
                            <button onClick={handleEditDefect} className="px-8 py-3.5 bg-ram-red text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-ram-red/20 active:scale-95 flex items-center gap-2">
                                <Save size={14} /> Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ─── DETAIL Modal ─────────────────────────────────── */}
            {showDetailModal && selectedDefect && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-[2.5rem] p-10 max-w-2xl w-full shadow-2xl animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-4">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${SEVERITY_CONFIG[selectedDefect.severity]?.bg}`}>
                                    <ShieldAlert size={24} className={SEVERITY_CONFIG[selectedDefect.severity]?.color} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black uppercase tracking-tight">{selectedDefect.id}</h2>
                                    <div className="flex items-center gap-2 mt-1">
                                        {getSeverityBadge(selectedDefect.severity)}
                                        {getStatusBadge(selectedDefect.status)}
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => setShowDetailModal(false)} className="w-10 h-10 bg-slate-100 rounded-2xl flex items-center justify-center hover:bg-slate-200 transition-all">
                                <X size={18} className="text-slate-500" />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Aircraft & Component</h3>
                                <div className="p-4 bg-slate-50 rounded-2xl space-y-3">
                                    <div className="flex justify-between"><span className="text-xs font-bold text-slate-400">Aircraft</span><span className="text-sm font-black text-slate-800">{selectedDefect.aircraftRegistration}</span></div>
                                    <div className="flex justify-between"><span className="text-xs font-bold text-slate-400">Component</span><span className="text-sm font-black text-slate-800">{selectedDefect.component}</span></div>
                                    <div className="flex justify-between"><span className="text-xs font-bold text-slate-400">ATA Chapter</span><span className="text-sm font-black text-slate-800">{selectedDefect.ataChapter || 'N/A'}</span></div>
                                    <div className="flex justify-between"><span className="text-xs font-bold text-slate-400">Flight Hours</span><span className="text-sm font-black text-slate-800">{selectedDefect.flightHours?.toLocaleString() || 'N/A'}</span></div>
                                    <div className="flex justify-between"><span className="text-xs font-bold text-slate-400">Cycles</span><span className="text-sm font-black text-slate-800">{selectedDefect.cycles?.toLocaleString() || 'N/A'}</span></div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Assignment & Timeline</h3>
                                <div className="p-4 bg-slate-50 rounded-2xl space-y-3">
                                    <div className="flex justify-between"><span className="text-xs font-bold text-slate-400">Technician</span><span className="text-sm font-black text-slate-800">{selectedDefect.technician}</span></div>
                                    <div className="flex justify-between"><span className="text-xs font-bold text-slate-400">Reported</span><span className="text-sm font-black text-slate-800">{formatDate(selectedDefect.reportedDate)}</span></div>
                                    <div className="flex justify-between"><span className="text-xs font-bold text-slate-400">Resolved</span><span className="text-sm font-black text-slate-800">{formatDate(selectedDefect.resolvedDate) || 'Pending'}</span></div>
                                    <div className="flex justify-between"><span className="text-xs font-bold text-slate-400">Status</span><span>{getStatusBadge(selectedDefect.status)}</span></div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 space-y-4">
                            <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl">
                                <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">Description</p>
                                <p className="text-sm font-medium text-amber-800">{selectedDefect.description}</p>
                            </div>
                            {selectedDefect.correctiveAction && (
                                <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl">
                                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Corrective Action</p>
                                    <p className="text-sm font-medium text-blue-800">{selectedDefect.correctiveAction}</p>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-slate-100">
                            <button onClick={() => { setShowDetailModal(false); handleDeleteDefect(selectedDefect.id); }}
                                    className="px-6 py-3.5 border border-red-200 text-red-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-50 transition-all flex items-center gap-2">
                                <Trash2 size={14} /> Delete
                            </button>
                            <button onClick={() => { setShowDetailModal(false); openEditModal(selectedDefect); }}
                                    className="px-8 py-3.5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-ram-red transition-all shadow-lg active:scale-95 flex items-center gap-2">
                                <Edit3 size={14} /> Edit Defect
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Reliability;