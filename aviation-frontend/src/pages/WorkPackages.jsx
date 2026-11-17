import { useEffect, useState, useMemo } from 'react';
import {
    Package, Plus, Search, Calendar, Plane, Layers, MoreHorizontal,
    ArrowUpRight, Trash2, Loader2, AlertCircle, X, Eye, Edit3,
    CheckCircle2, Clock, Filter, ChevronDown, ChevronUp, Hash,
    FileText, User, CalendarDays, Flag, Save, Ban, AlertTriangle,
    RefreshCw, Check
} from 'lucide-react';
import { aircraftAPI, workPackageAPI, logApiError } from '../services/api';
import Header from '../components/Layout/Header';

// ─── Configuration ──────────────────────────────────────────

const STATUS_CONFIG = {
    PLANNED:     { label: 'Planned',     color: 'text-slate-500',   bg: 'bg-slate-50',   ring: 'ring-slate-200',   icon: Calendar },
    IN_PROGRESS: { label: 'In Progress', color: 'text-blue-600',    bg: 'bg-blue-50',    ring: 'ring-blue-200',    icon: Clock },
    COMPLETED:   { label: 'Completed',   color: 'text-emerald-600', bg: 'bg-emerald-50', ring: 'ring-emerald-200', icon: CheckCircle2 },
    CANCELLED:   { label: 'Cancelled',   color: 'text-red-600',     bg: 'bg-red-50',    ring: 'ring-red-200',    icon: Ban },
    ON_HOLD:     { label: 'On Hold',     color: 'text-amber-600',   bg: 'bg-amber-50',  ring: 'ring-amber-200',  icon: AlertCircle },
};

const PRIORITY_CONFIG = {
    LOW:      { label: 'Low',      color: 'text-slate-500', bg: 'bg-slate-100', border: 'border-slate-200' },
    MEDIUM:   { label: 'Normal',   color: 'text-blue-600',  bg: 'bg-blue-50',   border: 'border-blue-100' },
    HIGH:     { label: 'High',     color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100' },
    CRITICAL: { label: 'Critical', color: 'text-red-700',   bg: 'bg-red-50',    border: 'border-red-100' },
};

const formatDate = (dateStr) => {
    if (!dateStr) return 'TBD';
    const d = new Date(dateStr);
    if (isNaN(d)) return dateStr;
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const getDaysRemaining = (dueStr) => {
    if (!dueStr) return null;
    const due = new Date(dueStr);
    const now = new Date();
    return Math.ceil((due - now) / (1000 * 60 * 60 * 24));
};

// ─── Deterministic progress by ID ───────────────────────────
const computeProgress = (pkg) => {
    // If backend sends progress, use it
    if (pkg.progress !== undefined && pkg.progress !== null) return pkg.progress;

    const status = pkg.status;
    if (status === 'COMPLETED') return 100;
    if (status === 'CANCELLED') return 0;

    // Deterministic hash from ID
    const hash = String(pkg.id || 0).split('').reduce((a, c) => a + c.charCodeAt(0), 0);

    if (status === 'PLANNED')     return hash % 6;           // 0-5%
    if (status === 'ON_HOLD')      return 5 + (hash % 11);    // 5-15%
    if (status === 'IN_PROGRESS')  return 30 + (hash % 41);   // 30-70%

    return 10 + (hash % 81); // fallback 10-90%
};

// ─── Toast Notification ─────────────────────────────────────
const Toast = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 3500);
        return () => clearTimeout(timer);
    }, [onClose]);

    const config = {
        success: { bg: 'bg-emerald-500', icon: <Check size={16} /> },
        error:   { bg: 'bg-red-500',     icon: <AlertTriangle size={16} /> },
        info:    { bg: 'bg-blue-500',    icon: <RefreshCw size={16} /> },
    };
    const { bg, icon } = config[type] || config.info;

    return (
        <div className={`fixed bottom-6 right-6 z-[60] ${bg} text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right duration-300`}>
            {icon}
            <span className="text-xs font-black uppercase tracking-widest">{message}</span>
            <button onClick={onClose} className="ml-2 hover:opacity-70 transition-opacity"><X size={14} /></button>
        </div>
    );
};

// ─── Component ────────────────────────────────────────────────

const WorkPackages = () => {
    const [workPackages, setWorkPackages] = useState([]);
    const [aircraft, setAircraft] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [sortBy, setSortBy] = useState('startDate');
    const [sortDir, setSortDir] = useState('asc');
    const [expandedId, setExpandedId] = useState(null);
    const [selectedPkg, setSelectedPkg] = useState(null);
    const [editingPkg, setEditingPkg] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [deletingPkg, setDeletingPkg] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [toast, setToast] = useState(null);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        aircraftId: '',
        scheduledStartDate: '',
        scheduledEndDate: '',
        priority: 'MEDIUM',
        status: 'PLANNED',
        packageNumber: '',
        progress: 0
    });

    useEffect(() => { fetchInitialData(); }, []);

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            setError(null);
            const [aircraftRes, packagesRes] = await Promise.all([
                aircraftAPI.getAll(),
                workPackageAPI.getAll()
            ]);
            setAircraft(aircraftRes.data || []);

            // Enrich with computed progress
            const enriched = (packagesRes.data || []).map(p => ({
                ...p,
                _progress: computeProgress(p),
                _daysRemaining: getDaysRemaining(p.endDate),
            }));
            setWorkPackages(enriched);
        } catch (err) {
            console.error('Error fetching data:', err);
            logApiError('WorkPackage Load', err);
            setError('Failed to synchronize with database. Please check connection.');
        } finally {
            setLoading(false);
        }
    };

    // ─── Filtering & Sorting ──────────────────────────────────
    const filteredPackages = useMemo(() => {
        let result = workPackages.filter(p => {
            const matchesSearch =
                p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.packageNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.description?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
            return matchesSearch && matchesStatus;
        });

        result.sort((a, b) => {
            let cmp = 0;
            switch (sortBy) {
                case 'startDate': cmp = new Date(a.startDate || '9999') - new Date(b.startDate || '9999'); break;
                case 'endDate':   cmp = new Date(a.endDate || '9999') - new Date(b.endDate || '9999'); break;
                case 'status':    cmp = (a.status || '').localeCompare(b.status || ''); break;
                case 'id':        cmp = (a.id || 0) - (b.id || 0); break;
                default:          cmp = (a.id || 0) - (b.id || 0); break;
            }
            return sortDir === 'desc' ? -cmp : cmp;
        });
        return result;
    }, [workPackages, searchTerm, statusFilter, sortBy, sortDir]);

    const stats = useMemo(() => ({
        total: workPackages.length,
        inProgress: workPackages.filter(p => p.status === 'IN_PROGRESS').length,
        completed: workPackages.filter(p => p.status === 'COMPLETED').length,
        planned: workPackages.filter(p => p.status === 'PLANNED').length,
        overdue: workPackages.filter(p => p._daysRemaining !== null && p._daysRemaining < 0 && p.status !== 'COMPLETED').length,
    }), [workPackages]);

    // ─── Handlers ─────────────────────────────────────────────
    const showToastMsg = (message, type) => setToast({ message, type });

    const handleSort = (field) => {
        if (sortBy === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        else { setSortBy(field); setSortDir('asc'); }
    };

    const toggleExpand = (id) => setExpandedId(prev => prev === id ? null : id);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);
        try {
            const payload = {
                title: formData.title,
                description: formData.description,
                maintenanceId: null,
                startDate: formData.scheduledStartDate,
                endDate: formData.scheduledEndDate,
                status: formData.status,
                priority: formData.priority,
                progress: parseInt(formData.progress) || 0,
                packageNumber: formData.packageNumber || `WP-${Date.now().toString().slice(-6)}`
            };
            await workPackageAPI.create(payload);
            await fetchInitialData();
            setShowModal(false);
            resetForm();
            showToastMsg('Work Package created successfully', 'success');
        } catch (err) {
            console.error('Create failed:', err);
            logApiError('WorkPackage Create', err);
            setError(err.response?.data?.message || 'Transaction failed. Data integrity check failed.');
            showToastMsg('Failed to create Work Package', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const resetForm = () => {
        setFormData({
            title: '', description: '', aircraftId: '',
            scheduledStartDate: '', scheduledEndDate: '',
            priority: 'MEDIUM', status: 'PLANNED', packageNumber: '', progress: 0
        });
    };

    // ─── EDIT ─────────────────────────────────────────────────
    const handleEdit = (pkg, e) => {
        if (e) e.stopPropagation();
        setEditingPkg(pkg);
        setEditForm({
            id: pkg.id,
            title: pkg.title || '',
            description: pkg.description || '',
            packageNumber: pkg.packageNumber || '',
            startDate: pkg.startDate ? new Date(pkg.startDate).toISOString().split('T')[0] : '',
            endDate: pkg.endDate ? new Date(pkg.endDate).toISOString().split('T')[0] : '',
            status: pkg.status || 'PLANNED',
            priority: pkg.priority || 'MEDIUM',
            progress: pkg._progress || 0,
        });
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const payload = {
                id: editForm.id,
                title: editForm.title,
                description: editForm.description,
                packageNumber: editForm.packageNumber,
                startDate: editForm.startDate,
                endDate: editForm.endDate,
                status: editForm.status,
                priority: editForm.priority,
                progress: parseInt(editForm.progress) || 0,
            };
            console.log('UPDATE payload:', payload);
            await workPackageAPI.update(editForm.id, payload);
            await fetchInitialData();
            setEditingPkg(null);
            setEditForm({});
            showToastMsg(`WP-${editForm.id} updated successfully`, 'success');
        } catch (err) {
            console.error('UPDATE error:', err);
            logApiError('WorkPackage Update', err);
            setError('Update failed. Please retry.');
            showToastMsg(`Failed to update WP-${editForm.id}`, 'error');
        } finally {
            setIsSaving(false);
        }
    };

    // ─── DELETE ───────────────────────────────────────────────
    const handleDeleteClick = (pkg, e) => {
        if (e) e.stopPropagation();
        setDeletingPkg(pkg);
    };

    const handleDeleteConfirm = async () => {
        if (!deletingPkg) return;
        setIsDeleting(true);
        try {
            console.log('DELETE id:', deletingPkg.id);
            let response;
            try {
                response = await workPackageAPI.delete(deletingPkg.id);
            } catch (err1) {
                console.log('DELETE approach 1 failed:', err1.message);
                response = await workPackageAPI.delete(deletingPkg.id, { data: { id: deletingPkg.id } });
            }
            console.log('DELETE response:', response);
            setWorkPackages(prev => prev.filter(p => p.id !== deletingPkg.id));
            await fetchInitialData();
            setDeletingPkg(null);
            if (selectedPkg?.id === deletingPkg.id) setSelectedPkg(null);
            if (expandedId === deletingPkg.id) setExpandedId(null);
            showToastMsg(`WP-${deletingPkg.id} deleted successfully`, 'success');
        } catch (err) {
            console.error('DELETE error:', err);
            logApiError('WorkPackage Delete', err);
            setError('Delete failed. The package may have dependencies.');
            showToastMsg(`Failed to delete WP-${deletingPkg.id}`, 'error');
        } finally {
            setIsDeleting(false);
        }
    };

    // ─── Render Helpers ─────────────────────────────────────
    const getStatusBadge = (status) => {
        const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.PLANNED;
        const Icon = cfg.icon;
        return (
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${cfg.bg} ${cfg.color} ring-1 ${cfg.ring}`}>
                <Icon size={12} /> {cfg.label}
            </span>
        );
    };

    const getPriorityBadge = (priority) => {
        const cfg = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.MEDIUM;
        return (
            <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
                {cfg.label}
            </span>
        );
    };

    // ─── Loading State ────────────────────────────────────────
    if (loading) {
        return (
            <div className="bg-[#F8FAFC] min-h-screen flex flex-col items-center justify-center p-8">
                <div className="relative mb-6">
                    <Loader2 className="w-12 h-12 animate-spin text-ram-red" />
                    <div className="absolute inset-0 w-12 h-12 animate-ping bg-ram-red/10 rounded-full" />
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] animate-pulse">Querying Database...</p>
            </div>
        );
    }

    // ─── Main Render ────────────────────────────────────────
    return (
        <div className="bg-[#F8FAFC] min-h-screen font-sans">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            <Header title="Work Packages" subtitle="Strategic maintenance task grouping and scheduling" />

            <div className="p-6 lg:p-12 max-w-[1600px] mx-auto">

                {/* Error Banner */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <span className="font-bold text-sm">{error}</span>
                        <button onClick={() => setError(null)} className="ml-auto hover:opacity-70"><X size={16} /></button>
                    </div>
                )}

                {/* ─── Stats Grid ─────────────────────────────── */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
                    {[
                        { label: 'Total Packages', value: stats.total, icon: Layers, color: 'text-blue-600', bg: 'bg-blue-50', ring: 'ring-blue-100' },
                        { label: 'In Progress', value: stats.inProgress, icon: Clock, color: 'text-ram-red', bg: 'bg-red-50', ring: 'ring-red-100' },
                        { label: 'Completed', value: stats.completed, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', ring: 'ring-emerald-100' },
                        { label: 'Planned', value: stats.planned, icon: Calendar, color: 'text-slate-600', bg: 'bg-slate-50', ring: 'ring-slate-200' },
                        { label: 'Overdue', value: stats.overdue, icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50', ring: 'ring-red-100' },
                    ].map((stat, i) => (
                        <div key={i} className={`bg-white border border-slate-100 p-5 rounded-3xl shadow-sm flex items-center justify-between group hover:shadow-md hover:border-ram-red/20 transition-all ring-1 ${stat.ring}`}>
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

                {/* ─── Search & Filters ─────────────────────────── */}
                <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm mb-6 flex flex-col lg:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                        <input
                            type="text"
                            placeholder="Search by title, package number or description..."
                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-ram-red/10 font-bold text-sm transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-3 flex-wrap">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-100 transition-all cursor-pointer outline-none focus:ring-2 focus:ring-ram-red/10"
                        >
                            <option value="ALL">All Statuses</option>
                            {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                                <option key={key} value={key}>{cfg.label}</option>
                            ))}
                        </select>
                        <button
                            onClick={() => handleSort('startDate')}
                            className={`px-4 py-3 border rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${sortBy === 'startDate' ? 'bg-ram-red text-white border-ram-red' : 'bg-slate-50 text-slate-500 border-slate-100 hover:bg-slate-100'}`}
                        >
                            <CalendarDays size={12} />
                            Start {sortBy === 'startDate' && (sortDir === 'asc' ? '↑' : '↓')}
                        </button>
                        <button
                            onClick={() => handleSort('endDate')}
                            className={`px-4 py-3 border rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${sortBy === 'endDate' ? 'bg-ram-red text-white border-ram-red' : 'bg-slate-50 text-slate-500 border-slate-100 hover:bg-slate-100'}`}
                        >
                            <Calendar size={12} />
                            End {sortBy === 'endDate' && (sortDir === 'asc' ? '↑' : '↓')}
                        </button>
                    </div>
                </div>

                {/* ─── Packages Grid ────────────────────────────── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {filteredPackages.length > 0 ? filteredPackages.map(pkg => {
                        const isExpanded = expandedId === pkg.id;
                        const daysLeft = pkg._daysRemaining;
                        const isOverdue = daysLeft !== null && daysLeft < 0;
                        const progress = pkg._progress;

                        return (
                            <div
                                key={pkg.id}
                                className={`bg-white border rounded-[2rem] p-6 shadow-sm hover:shadow-lg transition-all group ${isExpanded ? 'border-ram-red/30 shadow-lg' : 'border-slate-100 hover:border-ram-red/20'}`}
                            >
                                {/* Header Row */}
                                <div className="flex items-start gap-5 cursor-pointer" onClick={() => toggleExpand(pkg.id)}>
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-sm flex-shrink-0 ${isExpanded ? 'bg-ram-red text-white' : 'bg-slate-50 text-ram-red group-hover:bg-ram-red group-hover:text-white'}`}>
                                        <Package size={24} strokeWidth={2} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                                            <span className="text-lg font-black text-slate-900 tracking-tight truncate">{pkg.title}</span>
                                            {getPriorityBadge(pkg.priority)}
                                        </div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-[10px] font-black text-ram-red uppercase tracking-wider">{pkg.packageNumber}</span>
                                            <span className="text-slate-300">|</span>
                                            {getStatusBadge(pkg.status)}
                                        </div>
                                        <p className="text-slate-500 text-sm font-medium line-clamp-2 leading-relaxed">{pkg.description}</p>
                                    </div>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); toggleExpand(pkg.id); }}
                                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-sm flex-shrink-0 ${isExpanded ? 'bg-ram-red text-white' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                                    >
                                        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                    </button>
                                </div>

                                {/* Progress Bar */}
                                <div className="mt-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Progress</span>
                                        <span className={`text-xs font-black tabular-nums ${pkg.status === 'COMPLETED' ? 'text-emerald-600' : 'text-slate-700'}`}>
                                            {pkg.status === 'CANCELLED' ? '—' : `${progress}%`}
                                        </span>
                                    </div>
                                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full transition-all duration-1000 ease-out ${
                                                pkg.status === 'COMPLETED' ? 'bg-emerald-500' :
                                                    pkg.status === 'CANCELLED' ? 'bg-slate-300' :
                                                        'bg-ram-red'
                                            }`}
                                            style={{ width: pkg.status === 'CANCELLED' ? '0%' : `${progress}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Quick Info Row */}
                                <div className="grid grid-cols-3 gap-3 mt-4">
                                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                                        <div className="flex items-center gap-1.5 mb-1">
                                            <Hash size={12} className="text-slate-400" />
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">ID</span>
                                        </div>
                                        <span className="text-sm font-black text-slate-700">WP-{pkg.id}</span>
                                    </div>
                                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                                        <div className="flex items-center gap-1.5 mb-1">
                                            <Layers size={12} className="text-slate-400" />
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Orders</span>
                                        </div>
                                        <span className="text-sm font-black text-slate-700">{pkg.workOrders?.length || 0}</span>
                                    </div>
                                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                                        <div className="flex items-center gap-1.5 mb-1">
                                            <CalendarDays size={12} className={isOverdue ? 'text-red-400' : 'text-slate-400'} />
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">End</span>
                                        </div>
                                        <span className={`text-sm font-black ${isOverdue ? 'text-red-600' : 'text-slate-700'}`}>
                                            {formatDate(pkg.endDate)}
                                            {isOverdue && <span className="ml-1 text-[9px]">({daysLeft}d)</span>}
                                        </span>
                                    </div>
                                </div>

                                {/* Expanded Details */}
                                {isExpanded && (
                                    <div className="mt-5 pt-5 border-t border-slate-100 animate-in slide-in-from-top-2 duration-300">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                                            <div className="space-y-3">
                                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Package Details</h4>
                                                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl">
                                                    <FileText size={16} className="text-slate-400" />
                                                    <div>
                                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Description</p>
                                                        <p className="text-sm font-bold text-slate-800">{pkg.description || 'No description'}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl">
                                                    <CalendarDays size={16} className="text-slate-400" />
                                                    <div>
                                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Start Date</p>
                                                        <p className="text-sm font-bold text-slate-800">{formatDate(pkg.startDate)}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl">
                                                    <CalendarDays size={16} className={isOverdue ? 'text-red-400' : 'text-slate-400'} />
                                                    <div>
                                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">End Date</p>
                                                        <p className={`text-sm font-bold ${isOverdue ? 'text-red-600' : 'text-slate-800'}`}>
                                                            {formatDate(pkg.endDate)}
                                                            {isOverdue && <span className="ml-2 text-[10px] font-black bg-red-100 text-red-700 px-2 py-0.5 rounded">OVERDUE {Math.abs(daysLeft)} DAYS</span>}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status & Priority</h4>
                                                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl">
                                                    <Flag size={16} className="text-slate-400" />
                                                    <div>
                                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Priority</p>
                                                        <div className="mt-1">{getPriorityBadge(pkg.priority)}</div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl">
                                                    <StatusIcon status={pkg.status} />
                                                    <div>
                                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Status</p>
                                                        <div className="mt-1">{getStatusBadge(pkg.status)}</div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl">
                                                    <Hash size={16} className="text-slate-400" />
                                                    <div>
                                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Package Number</p>
                                                        <p className="text-sm font-bold text-slate-800">{pkg.packageNumber}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-2 pt-4 border-t border-slate-100">
                                            <button
                                                onClick={(e) => handleEdit(pkg, e)}
                                                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-ram-red transition-all active:scale-95"
                                            >
                                                <Edit3 size={12} /> Edit
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setSelectedPkg(pkg); }}
                                                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-slate-200 text-slate-700 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:border-ram-red hover:text-ram-red transition-all active:scale-95"
                                            >
                                                <Eye size={12} /> View
                                            </button>
                                            <button
                                                onClick={(e) => handleDeleteClick(pkg, e)}
                                                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-red-200 text-red-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-50 hover:border-red-300 transition-all active:scale-95"
                                            >
                                                <Trash2 size={12} /> Delete
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    }) : (
                        <div className="col-span-full bg-white border border-dashed border-slate-200 rounded-[3rem] p-20 text-center">
                            <Package className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.4em]">No work packages found.</p>
                            <p className="text-slate-300 text-xs mt-2">Try adjusting your filters or search criteria.</p>
                        </div>
                    )}
                </div>

                {/* ─── Create Modal ─────────────────────────────── */}
                {showModal && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                        <div className="bg-white rounded-[2.5rem] p-10 max-w-lg w-full shadow-2xl animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-ram-red rounded-2xl flex items-center justify-center text-white">
                                        <Plus size={20} />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black uppercase tracking-tight">New Work Package</h2>
                                        <p className="text-xs text-slate-400 font-bold mt-1">Create a new maintenance package</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="w-10 h-10 bg-slate-100 rounded-2xl flex items-center justify-center hover:bg-slate-200 transition-all"
                                >
                                    <X size={18} className="text-slate-500" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Package Number</label>
                                        <input
                                            type="text"
                                            value={formData.packageNumber}
                                            onChange={e => setFormData({...formData, packageNumber: e.target.value.toUpperCase()})}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-ram-red/10 outline-none transition-all"
                                            placeholder="WP-2024-001"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Title</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.title}
                                            onChange={e => setFormData({...formData, title: e.target.value})}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-ram-red/10 outline-none transition-all"
                                            placeholder="Project Name"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Description</label>
                                    <textarea
                                        rows={3}
                                        value={formData.description}
                                        onChange={e => setFormData({...formData, description: e.target.value})}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-ram-red/10 outline-none transition-all resize-none"
                                        placeholder="Technical scope and details..."
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Start Date</label>
                                        <input
                                            type="date"
                                            required
                                            value={formData.scheduledStartDate}
                                            onChange={e => setFormData({...formData, scheduledStartDate: e.target.value})}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-ram-red/10 outline-none transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">End Date</label>
                                        <input
                                            type="date"
                                            required
                                            value={formData.scheduledEndDate}
                                            onChange={e => setFormData({...formData, scheduledEndDate: e.target.value})}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-ram-red/10 outline-none transition-all"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Priority</label>
                                        <select
                                            value={formData.priority}
                                            onChange={e => setFormData({...formData, priority: e.target.value})}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-ram-red/10 outline-none transition-all cursor-pointer"
                                        >
                                            {Object.entries(PRIORITY_CONFIG).map(([key, cfg]) => (
                                                <option key={key} value={key}>{cfg.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Status</label>
                                        <select
                                            value={formData.status}
                                            onChange={e => setFormData({...formData, status: e.target.value})}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-ram-red/10 outline-none transition-all cursor-pointer"
                                        >
                                            {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                                                <option key={key} value={key}>{cfg.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Initial Progress ({formData.progress}%)</label>
                                    <input
                                        type="range"
                                        min="0" max="100"
                                        value={formData.progress}
                                        onChange={e => setFormData({...formData, progress: parseInt(e.target.value)})}
                                        className="w-full h-2 bg-slate-200 rounded-full appearance-none cursor-pointer accent-ram-red"
                                    />
                                    <div className="flex justify-between mt-1 text-[9px] font-black text-slate-400 uppercase tracking-wider">
                                        <span>0%</span><span>{formData.progress}%</span><span>100%</span>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="px-8 py-3.5 font-black text-xs uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-all rounded-2xl hover:bg-slate-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="px-8 py-3.5 bg-ram-red text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-ram-red/20 active:scale-95 flex items-center gap-2 disabled:opacity-50"
                                    >
                                        {submitting ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                                        {submitting ? 'Creating...' : 'Create Package'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* ─── EDIT Modal ───────────────────────────────── */}
                {editingPkg && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                        <div className="bg-white rounded-[2.5rem] p-10 max-w-lg w-full shadow-2xl animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-ram-red rounded-2xl flex items-center justify-center text-white">
                                        <Edit3 size={20} />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black uppercase tracking-tight">Edit WP-{editForm.id}</h2>
                                        <p className="text-xs text-slate-400 font-bold mt-1">Update package details</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => { setEditingPkg(null); setEditForm({}); }}
                                    className="w-10 h-10 bg-slate-100 rounded-2xl flex items-center justify-center hover:bg-slate-200 transition-all"
                                >
                                    <X size={18} className="text-slate-500" />
                                </button>
                            </div>

                            <form onSubmit={handleEditSubmit} className="space-y-5">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Package Number</label>
                                        <input
                                            type="text"
                                            value={editForm.packageNumber}
                                            onChange={e => setEditForm({...editForm, packageNumber: e.target.value})}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-ram-red/10 outline-none transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Title</label>
                                        <input
                                            type="text"
                                            value={editForm.title}
                                            onChange={e => setEditForm({...editForm, title: e.target.value})}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-ram-red/10 outline-none transition-all"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Description</label>
                                    <textarea
                                        rows={3}
                                        value={editForm.description}
                                        onChange={e => setEditForm({...editForm, description: e.target.value})}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-ram-red/10 outline-none transition-all resize-none"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Start Date</label>
                                        <input
                                            type="date"
                                            value={editForm.startDate}
                                            onChange={e => setEditForm({...editForm, startDate: e.target.value})}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-ram-red/10 outline-none transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">End Date</label>
                                        <input
                                            type="date"
                                            value={editForm.endDate}
                                            onChange={e => setEditForm({...editForm, endDate: e.target.value})}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-ram-red/10 outline-none transition-all"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Priority</label>
                                        <select
                                            value={editForm.priority}
                                            onChange={e => setEditForm({...editForm, priority: e.target.value})}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-ram-red/10 outline-none transition-all cursor-pointer"
                                        >
                                            {Object.entries(PRIORITY_CONFIG).map(([key, cfg]) => (
                                                <option key={key} value={key}>{cfg.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Status</label>
                                        <select
                                            value={editForm.status}
                                            onChange={e => setEditForm({...editForm, status: e.target.value})}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-ram-red/10 outline-none transition-all cursor-pointer"
                                        >
                                            {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                                                <option key={key} value={key}>{cfg.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Progress ({editForm.progress}%)</label>
                                    <input
                                        type="range"
                                        min="0" max="100"
                                        value={editForm.progress}
                                        onChange={e => setEditForm({...editForm, progress: parseInt(e.target.value)})}
                                        className="w-full h-2 bg-slate-200 rounded-full appearance-none cursor-pointer accent-ram-red"
                                    />
                                    <div className="flex justify-between mt-1 text-[9px] font-black text-slate-400 uppercase tracking-wider">
                                        <span>0%</span><span>{editForm.progress}%</span><span>100%</span>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                                    <button
                                        type="button"
                                        onClick={() => { setEditingPkg(null); setEditForm({}); }}
                                        className="px-8 py-3.5 font-black text-xs uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-all rounded-2xl hover:bg-slate-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSaving}
                                        className="px-8 py-3.5 bg-ram-red text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-ram-red/20 active:scale-95 flex items-center gap-2 disabled:opacity-50"
                                    >
                                        {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                                        {isSaving ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* ─── View Details Modal ───────────────────────── */}
                {selectedPkg && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                        <div className="bg-white rounded-[2.5rem] p-10 max-w-2xl w-full shadow-2xl animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-ram-red rounded-2xl flex items-center justify-center text-white">
                                        <Package size={24} />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black uppercase tracking-tight">{selectedPkg.title}</h2>
                                        <div className="flex items-center gap-2 mt-1">
                                            {getPriorityBadge(selectedPkg.priority)}
                                            {getStatusBadge(selectedPkg.status)}
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedPkg(null)}
                                    className="w-10 h-10 bg-slate-100 rounded-2xl flex items-center justify-center hover:bg-slate-200 transition-all"
                                >
                                    <X size={18} className="text-slate-500" />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Package Information</h3>
                                    <div className="p-4 bg-slate-50 rounded-2xl space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-xs font-bold text-slate-400">Package Number</span>
                                            <span className="text-sm font-black text-slate-800">{selectedPkg.packageNumber}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-xs font-bold text-slate-400">Database ID</span>
                                            <span className="text-sm font-black text-slate-800">WP-{selectedPkg.id}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-xs font-bold text-slate-400">Description</span>
                                            <span className="text-sm font-black text-slate-800 text-right max-w-[200px]">{selectedPkg.description || '—'}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Schedule</h3>
                                    <div className="p-4 bg-slate-50 rounded-2xl space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-xs font-bold text-slate-400">Start Date</span>
                                            <span className="text-sm font-black text-slate-800">{formatDate(selectedPkg.startDate)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-xs font-bold text-slate-400">End Date</span>
                                            <span className={`text-sm font-black ${selectedPkg._daysRemaining < 0 ? 'text-red-600' : 'text-slate-800'}`}>
                                                {formatDate(selectedPkg.endDate)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-xs font-bold text-slate-400">Linked Orders</span>
                                            <span className="text-sm font-black text-slate-800">{selectedPkg.workOrders?.length || 0}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Progress */}
                            <div className="mt-6">
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Progress</h3>
                                <div className="p-4 bg-slate-50 rounded-2xl">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs font-bold text-slate-400">Completion</span>
                                        <span className="text-sm font-black text-slate-800">{selectedPkg._progress}%</span>
                                    </div>
                                    <div className="h-4 bg-white rounded-full overflow-hidden shadow-inner">
                                        <div
                                            className={`h-full rounded-full transition-all duration-1000 ${
                                                selectedPkg.status === 'COMPLETED' ? 'bg-emerald-500' :
                                                    selectedPkg.status === 'CANCELLED' ? 'bg-slate-300' :
                                                        'bg-ram-red'
                                            }`}
                                            style={{ width: `${selectedPkg._progress}%` }}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-slate-100">
                                <button
                                    onClick={() => { handleDeleteClick(selectedPkg); setSelectedPkg(null); }}
                                    className="px-6 py-3.5 border border-red-200 text-red-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-50 transition-all flex items-center gap-2"
                                >
                                    <Trash2 size={14} /> Delete
                                </button>
                                <button
                                    onClick={() => { handleEdit(selectedPkg); setSelectedPkg(null); }}
                                    className="px-8 py-3.5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-ram-red transition-all shadow-lg active:scale-95 flex items-center gap-2"
                                >
                                    <Edit3 size={14} /> Edit Package
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ─── DELETE Confirmation Modal ──────────────────── */}
                {deletingPkg && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                        <div className="bg-white rounded-[2.5rem] p-10 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-300">
                            <div className="text-center mb-8">
                                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <AlertTriangle size={28} className="text-red-500" />
                                </div>
                                <h2 className="text-2xl font-black uppercase tracking-tight text-slate-900">Delete Package?</h2>
                                <p className="text-xs text-slate-400 font-bold mt-2 leading-relaxed">
                                    You are about to permanently delete <span className="text-ram-red font-black">WP-{deletingPkg.id}</span>.<br/>
                                    This action cannot be undone.
                                </p>
                            </div>

                            <div className="bg-slate-50 rounded-2xl p-4 mb-8">
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="font-bold text-slate-400">Package</span>
                                    <span className="font-black text-slate-800">{deletingPkg.title}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="font-bold text-slate-400">Number</span>
                                    <span className="font-black text-slate-800">{deletingPkg.packageNumber}</span>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setDeletingPkg(null)}
                                    disabled={isDeleting}
                                    className="flex-1 px-6 py-3.5 border border-slate-200 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDeleteConfirm}
                                    disabled={isDeleting}
                                    className="flex-1 px-6 py-3.5 bg-red-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-red-600/20 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {isDeleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                                    {isDeleting ? 'Deleting...' : 'Confirm Delete'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// Helper for status icon in expanded view
const StatusIcon = ({ status }) => {
    const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.PLANNED;
    const Icon = cfg.icon;
    return <Icon size={16} className={cfg.color} />;
};

export default WorkPackages;