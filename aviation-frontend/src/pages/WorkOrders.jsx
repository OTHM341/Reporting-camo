import { useEffect, useState, useMemo } from 'react';
import {
    ClipboardList, Wrench, Users, Calendar, ArrowRight, Loader2,
    CheckCircle2, AlertCircle, Clock, Trash2, Plus, Filter, Search,
    X, ChevronDown, ChevronUp, Plane, User, CalendarDays, Flag,
    FileText, Activity, Hash, MoreHorizontal, Edit3, Eye, Save,
    Ban, RotateCcw, AlertTriangle, Check, RefreshCw
} from 'lucide-react';
import { workOrderAPI, logApiError } from '../services/api';
import Logo from '../components/UI/Logo';

// ─── Helpers ────────────────────────────────────────────────

const STATUS_CONFIG = {
    OPEN: { label: 'Open', color: 'text-slate-500', bg: 'bg-slate-50', ring: 'ring-slate-200', icon: AlertCircle },
    ASSIGNED: { label: 'Assigned', color: 'text-amber-600', bg: 'bg-amber-50', ring: 'ring-amber-200', icon: User },
    IN_PROGRESS: { label: 'In Progress', color: 'text-blue-600', bg: 'bg-blue-50', ring: 'ring-blue-200', icon: Clock },
    REVIEW: { label: 'Under Review', color: 'text-violet-600', bg: 'bg-violet-50', ring: 'ring-violet-200', icon: Eye },
    COMPLETED: { label: 'Completed', color: 'text-emerald-600', bg: 'bg-emerald-50', ring: 'ring-emerald-200', icon: CheckCircle2 },
    CANCELLED: { label: 'Cancelled', color: 'text-red-600', bg: 'bg-red-50', ring: 'ring-red-200', icon: Ban },
};

const PRIORITY_CONFIG = {
    LOW: { label: 'Low', color: 'text-slate-500', bg: 'bg-slate-100', border: 'border-slate-200' },
    NORMAL: { label: 'Normal', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
    HIGH: { label: 'High', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100' },
    URGENT: { label: 'AOG', color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-100' },
};

const getProgress = (order) => {
    if (order.progress !== undefined && order.progress !== null) return order.progress;
    const status = order.status;
    if (status === 'COMPLETED') return 100;
    if (status === 'CANCELLED') return 0;
    if (status === 'OPEN') return Math.floor(Math.random() * 5);
    if (status === 'ASSIGNED') return Math.floor(Math.random() * 10) + 5;
    if (status === 'IN_PROGRESS') return Math.floor(Math.random() * 40) + 30;
    if (status === 'REVIEW') return Math.floor(Math.random() * 15) + 80;
    const hash = order.id?.toString().split('').reduce((a, c) => a + c.charCodeAt(0), 0) || 0;
    return (hash % 85) + 10;
};

const formatDate = (dateStr) => {
    if (!dateStr) return 'TBD';
    const d = new Date(dateStr);
    if (isNaN(d)) return dateStr;
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const getDaysRemaining = (dueDate) => {
    if (!dueDate) return null;
    const due = new Date(dueDate);
    const now = new Date();
    const diff = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
    return diff;
};

// ─── Toast Notification Component ───────────────────────────
const Toast = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const bgClass = type === 'success' ? 'bg-emerald-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500';
    const icon = type === 'success' ? <Check size={16} /> : type === 'error' ? <AlertTriangle size={16} /> : <RefreshCw size={16} />;

    return (
        <div className={`fixed bottom-6 right-6 z-[60] ${bgClass} text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right duration-300`}>
            {icon}
            <span className="text-xs font-black uppercase tracking-widest">{message}</span>
            <button onClick={onClose} className="ml-2 hover:opacity-70"><X size={14} /></button>
        </div>
    );
};

// ─── Component ───────────────────────────────────────────────

const WorkOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [expandedId, setExpandedId] = useState(null);
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [priorityFilter, setPriorityFilter] = useState('ALL');
    const [sortBy, setSortBy] = useState('dueDate');
    const [sortDir, setSortDir] = useState('asc');

    // Edit mode state
    const [editingOrder, setEditingOrder] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [isSaving, setIsSaving] = useState(false);

    // Delete confirmation
    const [deletingOrder, setDeletingOrder] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Toast
    const [toast, setToast] = useState(null);

    const [formData, setFormData] = useState({
        orderNumber: '',
        maintenanceType: '',
        assignedTo: '',
        dueDate: '',
        priority: 'NORMAL',
        description: '',
        estimatedHours: ''
    });

    useEffect(() => { fetchWorkOrders(); }, []);

    async function fetchWorkOrders() {
        try {
            setLoading(true);
            const response = await workOrderAPI.getAll();
            const enriched = (response.data || []).map(o => ({
                ...o,
                _progress: getProgress(o),
                _daysRemaining: getDaysRemaining(o.dueDate),
            }));
            setOrders(enriched);
            setError(null);
        } catch (err) {
            logApiError('Work Order Load', err);
            setError('Operational database synchronization failed.');
        } finally {
            setLoading(false);
        }
    }

    // ─── Filtering & Sorting ──────────────────────────────────

    const filteredOrders = useMemo(() => {
        let result = orders.filter(o => {
            const matchesSearch =
                o.id?.toString().includes(searchTerm) ||
                o.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                o.maintenanceType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                o.assignedTechnicianName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                o.description?.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesStatus = statusFilter === 'ALL' || o.status === statusFilter;
            const matchesPriority = priorityFilter === 'ALL' || o.priority === priorityFilter;

            return matchesSearch && matchesStatus && matchesPriority;
        });

        const priorityWeight = { URGENT: 4, HIGH: 3, NORMAL: 2, LOW: 1 };
        result.sort((a, b) => {
            let cmp = 0;
            switch (sortBy) {
                case 'priority':
                    cmp = (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0);
                    break;
                case 'status':
                    cmp = (a.status || '').localeCompare(b.status || '');
                    break;
                case 'dueDate':
                    cmp = new Date(a.dueDate || '9999') - new Date(b.dueDate || '9999');
                    break;
                case 'id':
                default:
                    cmp = (a.id || 0) - (b.id || 0);
                    break;
            }
            return sortDir === 'desc' ? -cmp : cmp;
        });

        return result;
    }, [orders, searchTerm, statusFilter, priorityFilter, sortBy, sortDir]);

    const stats = useMemo(() => ({
        total: orders.length,
        inProgress: orders.filter(o => o.status === 'IN_PROGRESS').length,
        critical: orders.filter(o => o.priority === 'CRITICAL').length,
        completed: orders.filter(o => o.status === 'COMPLETED').length,
        overdue: orders.filter(o => o._daysRemaining !== null && o._daysRemaining < 0 && o.status !== 'COMPLETED').length,
    }), [orders]);

    // ─── Handlers ───────────────────────────────────────────

    const handleCreateWO = () => setShowModal(true);

    const handleSubmitForm = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                orderNumber: formData.orderNumber,
                maintenanceType: formData.maintenanceType,
                dueDate: formData.dueDate || null,
                priority: formData.priority,
                description: formData.description,
                estimatedHours: formData.estimatedHours ? parseFloat(formData.estimatedHours) : null,
                status: 'OPEN'
            };
            
            // Only include assignedTo if it's a valid number
            if (formData.assignedTo && formData.assignedTo.trim() !== '') {
                payload.assignedTo = parseInt(formData.assignedTo);
            }
            
            await workOrderAPI.create(payload);
            await fetchWorkOrders();
            setShowModal(false);
            setFormData({ orderNumber: '', maintenanceType: '', assignedTo: '', dueDate: '', priority: 'NORMAL', description: '', estimatedHours: '' });
            showToast('Work Order created successfully', 'success');
        } catch (err) {
            logApiError('Work Order Create', err);
            const errorMsg = err.response?.data?.message || err.response?.data?.error || err.message;
            setError(`Create failed: ${errorMsg}`);
            showToast(`Failed to create: ${errorMsg}`, 'error');
        }
    };

    const toggleExpand = (id) => {
        setExpandedId(expandedId === id ? null : id);
    };

    const handleViewDetails = (order, e) => {
        if (e) e.stopPropagation();
        setSelectedOrder(order);
    };

    const showToast = (message, type) => {
        setToast({ message, type });
    };

    // ─── EDIT ───────────────────────────────────────────────
    const handleEdit = (order, e) => {
        if (e) e.stopPropagation();
        setEditingOrder(order);
        setEditForm({
            id: order.id,
            orderNumber: order.orderNumber || '',
            maintenanceType: order.maintenanceType || '',
            assignedTo: order.assignedTo ? order.assignedTo.toString() : '',
            dueDate: order.dueDate ? new Date(order.dueDate).toISOString().split('T')[0] : '',
            priority: order.priority || 'NORMAL',
            status: order.status || 'OPEN',
            description: order.description || '',
            estimatedHours: order.estimatedHours ? order.estimatedHours.toString() : ''
        });
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const payload = {
                orderNumber: editForm.orderNumber,
                maintenanceType: editForm.maintenanceType,
                dueDate: editForm.dueDate || null,
                priority: editForm.priority,
                status: editForm.status,
                description: editForm.description,
                estimatedHours: editForm.estimatedHours ? parseFloat(editForm.estimatedHours) : null
            };
            
            // Only include assignedTo if it's a valid number
            if (editForm.assignedTo && editForm.assignedTo.toString().trim() !== '') {
                payload.assignedTo = parseInt(editForm.assignedTo);
            }

            console.log('UPDATE payload:', payload);
            const response = await workOrderAPI.update(editForm.id, payload);
            console.log('UPDATE response:', response);

            await fetchWorkOrders();
            setEditingOrder(null);
            setEditForm({});
            showToast(`WO-${editForm.id} updated successfully`, 'success');
        } catch (err) {
            console.error('UPDATE error:', err);
            logApiError('Work Order Update', err);
            const errorMsg = err.response?.data?.message || err.response?.data?.error || err.message;
            setError(`Update failed: ${errorMsg}`);
            showToast(`Failed to update: ${errorMsg}`, 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleEditCancel = () => {
        setEditingOrder(null);
        setEditForm({});
    };

    // ─── DELETE ─────────────────────────────────────────────
    const handleDeleteClick = (order, e) => {
        if (e) e.stopPropagation();
        setDeletingOrder(order);
    };

    const handleDeleteConfirm = async () => {
        if (!deletingOrder) return;
        setIsDeleting(true);
        try {
            console.log('DELETE id:', deletingOrder.id);
            const response = await workOrderAPI.delete(deletingOrder.id);
            console.log('DELETE response:', response);
            
            await fetchWorkOrders();
            setDeletingOrder(null);

            // Close related modals
            if (selectedOrder && selectedOrder.id === deletingOrder.id) {
                setSelectedOrder(null);
            }
            if (expandedId === deletingOrder.id) {
                setExpandedId(null);
            }

            showToast(`WO-${deletingOrder.id} deleted successfully`, 'success');
        } catch (err) {
            console.error('DELETE error:', err);
            logApiError('Work Order Delete', err);
            const errorMsg = err.response?.data?.message || err.response?.data?.error || err.message;
            
            // Check for permission error
            if (err.response?.status === 403) {
                setError('Delete failed: You need ADMIN role to delete work orders');
                showToast('Permission denied: ADMIN role required', 'error');
            } else if (err.response?.status === 404) {
                setError('Delete failed: Work order not found');
                showToast('Work order not found', 'error');
            } else {
                setError(`Delete failed: ${errorMsg}`);
                showToast(`Failed to delete: ${errorMsg}`, 'error');
            }
        } finally {
            setIsDeleting(false);
        }
    };

    const handleDeleteCancel = () => {
        setDeletingOrder(null);
    };

    const handleSort = (field) => {
        if (sortBy === field) {
            setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortDir('asc');
        }
    };

    // ─── Render Helpers ─────────────────────────────────────

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

    const getPriorityBadge = (priority) => {
        const cfg = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.MEDIUM;
        return (
            <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
                {cfg.label}
            </span>
        );
    };

    // ─── Loading State ──────────────────────────────────────

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8">
                <div className="relative">
                    <Loader2 className="w-12 h-12 animate-spin text-ram-red mb-6" />
                    <div className="absolute inset-0 w-12 h-12 animate-ping bg-ram-red/10 rounded-full" />
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] animate-pulse">Querying Work Registry...</p>
            </div>
        );
    }

    // ─── Main Render ────────────────────────────────────────

    return (
        <div className="min-h-screen bg-[#F8FAFC] p-6 lg:p-12 font-sans">

            {/* Toast */}
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            {/* ─── Header ─────────────────────────────────────── */}
            <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-200 pb-8">
                <div>
                    <div className="flex items-center gap-3 mb-3">
                        <Logo className="h-10" />
                        <div className="h-6 w-px bg-slate-200" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Maintenance Control</span>
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">
                        Work <span className="text-ram-red italic">Orders</span>
                    </h1>
                    <p className="text-xs text-slate-400 font-bold mt-2 tracking-wide">
                        {stats.total} total orders · {stats.overdue > 0 && <span className="text-red-500">{stats.overdue} overdue</span>}
                    </p>
                </div>
                <button
                    onClick={handleCreateWO}
                    className="flex items-center gap-2 px-6 py-3.5 bg-ram-red text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:shadow-xl shadow-ram-red/20 transition-all active:scale-95 hover:-translate-y-0.5"
                >
                    <Plus size={14} strokeWidth={3} /> Open Work Order
                </button>
            </header>

            {/* ─── Insight Grid ───────────────────────────────── */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                {[
                    { label: 'Active Orders', value: stats.total, icon: ClipboardList, color: 'text-blue-600', bg: 'bg-blue-50', ring: 'ring-blue-100' },
                    { label: 'In-Intervention', value: stats.inProgress, icon: Wrench, color: 'text-ram-red', bg: 'bg-red-50', ring: 'ring-red-100' },
                    { label: 'AOG Critical', value: stats.critical, icon: AlertCircle, color: 'text-orange-600', bg: 'bg-orange-50', ring: 'ring-orange-100' },
                    { label: 'Closed (MTD)', value: stats.completed, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', ring: 'ring-emerald-100' },
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

            {/* ─── Filters & Search ───────────────────────────── */}
            <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm mb-6 flex flex-col lg:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <input
                        type="text"
                        placeholder="Search by Order ID, Tail, Task or Supervisor..."
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

                    <select
                        value={priorityFilter}
                        onChange={(e) => setPriorityFilter(e.target.value)}
                        className="px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-100 transition-all cursor-pointer outline-none focus:ring-2 focus:ring-ram-red/10"
                    >
                        <option value="ALL">All Priorities</option>
                        {Object.entries(PRIORITY_CONFIG).map(([key, cfg]) => (
                            <option key={key} value={key}>{cfg.label}</option>
                        ))}
                    </select>

                    <button
                        onClick={() => handleSort('dueDate')}
                        className={`px-4 py-3 border rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${sortBy === 'dueDate' ? 'bg-ram-red text-white border-ram-red' : 'bg-slate-50 text-slate-500 border-slate-100 hover:bg-slate-100'}`}
                    >
                        <CalendarDays size={12} />
                        Due Date {sortBy === 'dueDate' && (sortDir === 'asc' ? '↑' : '↓')}
                    </button>

                    <button
                        onClick={() => handleSort('priority')}
                        className={`px-4 py-3 border rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${sortBy === 'priority' ? 'bg-ram-red text-white border-ram-red' : 'bg-slate-50 text-slate-500 border-slate-100 hover:bg-slate-100'}`}
                    >
                        <Flag size={12} />
                        Priority {sortBy === 'priority' && (sortDir === 'asc' ? '↑' : '↓')}
                    </button>
                </div>
            </div>

            {/* ─── Orders Feed ────────────────────────────────── */}
            <div className="space-y-3">
                {filteredOrders.length > 0 ? filteredOrders.map((order) => {
                    const isExpanded = expandedId === order.id;
                    const daysLeft = order._daysRemaining;
                    const isOverdue = daysLeft !== null && daysLeft < 0;

                    return (
                        <div
                            key={order.id}
                            className={`bg-white border rounded-3xl p-6 shadow-sm hover:shadow-lg transition-all group ${isExpanded ? 'border-ram-red/30 shadow-lg' : 'border-slate-100 hover:border-ram-red/20'}`}
                        >
                            {/* Main Row */}
                            <div className="flex flex-wrap items-center justify-between gap-6 cursor-pointer" onClick={() => toggleExpand(order.id)}>

                                {/* Left: Icon + Identity */}
                                <div className="flex items-center gap-5 min-w-[280px]">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-sm ${isExpanded ? 'bg-ram-red text-white' : 'bg-slate-50 text-ram-red group-hover:bg-ram-red group-hover:text-white'}`}>
                                        <Wrench size={24} strokeWidth={2} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3 mb-1.5">
                                            <span className="text-xl font-black text-slate-900 tracking-tighter">WO-{order.id}</span>
                                            {getPriorityBadge(order.priority)}
                                        </div>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="text-sm font-black text-ram-red">{order.orderNumber || 'TBD'}</span>
                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">—</span>
                                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{order.maintenanceType || 'GENERAL INTERVENTION'}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Center: Progress */}
                                <div className="flex-1 min-w-[200px] max-w-md">
                                    <div className="flex justify-between items-center mb-2">
                                        {getStatusBadge(order.status)}
                                        <span className={`text-xs font-black tabular-nums ${order.status === 'COMPLETED' ? 'text-emerald-600' : 'text-slate-700'}`}>
                                            {order.status === 'CANCELLED' ? '—' : `${order._progress}%`}
                                        </span>
                                    </div>
                                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full transition-all duration-1000 ease-out ${
                                                order.status === 'COMPLETED' ? 'bg-emerald-500' :
                                                    order.status === 'CANCELLED' ? 'bg-slate-300' :
                                                        'bg-ram-red'
                                            }`}
                                            style={{ width: order.status === 'CANCELLED' ? '0%' : `${order._progress}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Right: Meta + Actions */}
                                <div className="flex items-center gap-8">
                                    <div className="text-right hidden md:block">
                                        <p className="text-[9px] font-black text-slate-400 uppercase mb-1 tracking-widest">Assigned To</p>
                                        <div className="flex items-center gap-1.5 justify-end">
                                            <User size={12} className="text-slate-400" />
                                            <p className="text-xs font-bold text-slate-700">{order.assignedTechnicianName || 'UNASSIGNED'}</p>
                                        </div>
                                    </div>
                                    <div className="text-right hidden md:block">
                                        <p className="text-[9px] font-black text-slate-400 uppercase mb-1 tracking-widest">Due Date</p>
                                        <div className="flex items-center gap-1.5 justify-end">
                                            <CalendarDays size={12} className={isOverdue ? 'text-red-500' : 'text-slate-400'} />
                                            <p className={`text-xs font-bold ${isOverdue ? 'text-red-500' : 'text-slate-700'}`}>
                                                {formatDate(order.dueDate)}
                                                {isOverdue && <span className="ml-1 text-[9px] font-black">({daysLeft}d)</span>}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={(e) => handleViewDetails(order, e)}
                                            className="w-11 h-11 bg-slate-100 text-slate-600 rounded-2xl flex items-center justify-center hover:bg-ram-red hover:text-white transition-all shadow-sm active:scale-90"
                                            title="View Details"
                                        >
                                            <Eye size={18} strokeWidth={2} />
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); toggleExpand(order.id); }}
                                            className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all shadow-sm active:scale-90 ${isExpanded ? 'bg-ram-red text-white' : 'bg-slate-900 text-white hover:bg-ram-red'}`}
                                            title={isExpanded ? 'Collapse' : 'Expand'}
                                        >
                                            {isExpanded ? <ChevronUp size={18} strokeWidth={2.5} /> : <ArrowRight size={18} strokeWidth={2.5} />}
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
                                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Aircraft & Task</h4>
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl">
                                                    <Hash size={16} className="text-slate-400" />
                                                    <div>
                                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Order Number</p>
                                                        <p className="text-sm font-bold text-slate-800">{order.orderNumber || 'TBD'}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl">
                                                    <FileText size={16} className="text-slate-400" />
                                                    <div>
                                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Maintenance Type</p>
                                                        <p className="text-sm font-bold text-slate-800">{order.maintenanceType || 'GENERAL INTERVENTION'}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl">
                                                    <Hash size={16} className="text-slate-400" />
                                                    <div>
                                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Work Order ID</p>
                                                        <p className="text-sm font-bold text-slate-800">WO-{order.id}</p>
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
                                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Assigned Technician</p>
                                                        <p className="text-sm font-bold text-slate-800">{order.assignedTechnicianName || 'UNASSIGNED'}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl">
                                                    <CalendarDays size={16} className={isOverdue ? 'text-red-400' : 'text-slate-400'} />
                                                    <div>
                                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Due Date</p>
                                                        <p className={`text-sm font-bold ${isOverdue ? 'text-red-600' : 'text-slate-800'}`}>
                                                            {formatDate(order.dueDate)}
                                                            {isOverdue && <span className="ml-2 text-[10px] font-black bg-red-100 text-red-700 px-2 py-0.5 rounded">OVERDUE {Math.abs(daysLeft)} DAYS</span>}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl">
                                                    <Activity size={16} className="text-slate-400" />
                                                    <div>
                                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Current Status</p>
                                                        <div className="mt-1">{getStatusBadge(order.status)}</div>
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
                                                    <span className="text-lg font-black text-slate-900 tabular-nums">{order._progress}%</span>
                                                </div>
                                                <div className="h-3 bg-white rounded-full overflow-hidden shadow-inner">
                                                    <div
                                                        className={`h-full rounded-full transition-all duration-1000 ${
                                                            order.status === 'COMPLETED' ? 'bg-emerald-500' :
                                                                order.status === 'CANCELLED' ? 'bg-slate-300' :
                                                                    'bg-ram-red'
                                                        }`}
                                                        style={{ width: `${order._progress}%` }}
                                                    />
                                                </div>
                                                <div className="flex justify-between mt-2 text-[9px] font-black text-slate-400 uppercase tracking-wider">
                                                    <span>0%</span>
                                                    <span>50%</span>
                                                    <span>100%</span>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-3 gap-2">
                                                <button
                                                    onClick={(e) => handleEdit(order, e)}
                                                    className="flex items-center justify-center gap-2 px-3 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-ram-red transition-all active:scale-95"
                                                >
                                                    <Edit3 size={12} /> Edit
                                                </button>
                                                <button
                                                    onClick={(e) => handleViewDetails(order, e)}
                                                    className="flex items-center justify-center gap-2 px-3 py-3 border border-slate-200 text-slate-700 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:border-ram-red hover:text-ram-red transition-all active:scale-95"
                                                >
                                                    <Eye size={12} /> View
                                                </button>
                                                <button
                                                    onClick={(e) => handleDeleteClick(order, e)}
                                                    className="flex items-center justify-center gap-2 px-3 py-3 border border-red-200 text-red-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-50 hover:border-red-300 transition-all active:scale-95"
                                                >
                                                    <Trash2 size={12} /> Delete
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                }) : (
                    <div className="bg-white border border-dashed border-slate-200 rounded-[3rem] p-20 text-center">
                        <ClipboardList className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.4em]">No active work orders detected.</p>
                        <p className="text-slate-300 text-xs mt-2">Try adjusting your filters or search criteria.</p>
                    </div>
                )}
            </div>

            {/* ─── Create Modal ─────────────────────────────────── */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-[2.5rem] p-10 max-w-lg w-full shadow-2xl animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-2xl font-black uppercase tracking-tight">Open Work Order</h2>
                                <p className="text-xs text-slate-400 font-bold mt-1">Initialize a new maintenance intervention</p>
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                className="w-10 h-10 bg-slate-100 rounded-2xl flex items-center justify-center hover:bg-slate-200 transition-all"
                            >
                                <X size={18} className="text-slate-500" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmitForm} className="space-y-5">
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Order Number</label>
                                <input
                                    type="text"
                                    value={formData.orderNumber}
                                    onChange={e => setFormData({...formData, orderNumber: e.target.value})}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-ram-red/10 outline-none transition-all"
                                    placeholder="e.g. WO-2024-001"
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Maintenance Type</label>
                                <input
                                    type="text"
                                    value={formData.maintenanceType}
                                    onChange={e => setFormData({...formData, maintenanceType: e.target.value})}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-ram-red/10 outline-none transition-all"
                                    placeholder="e.g. C-Check, Engine Overhaul..."
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Assigned To (Technician ID)</label>
                                    <input
                                        type="number"
                                        value={formData.assignedTo}
                                        onChange={e => setFormData({...formData, assignedTo: e.target.value})}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-ram-red/10 outline-none transition-all"
                                        placeholder="Leave empty to unassign"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Due Date</label>
                                    <input
                                        type="date"
                                        value={formData.dueDate}
                                        onChange={e => setFormData({...formData, dueDate: e.target.value})}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-ram-red/10 outline-none transition-all"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Estimated Hours</label>
                                    <input
                                        type="number"
                                        step="0.5"
                                        value={formData.estimatedHours}
                                        onChange={e => setFormData({...formData, estimatedHours: e.target.value})}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-ram-red/10 outline-none transition-all"
                                        placeholder="e.g. 8.0"
                                    />
                                </div>
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
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={e => setFormData({...formData, description: e.target.value})}
                                    rows={3}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-ram-red/10 outline-none transition-all resize-none"
                                    placeholder="Additional details..."
                                    required
                                />
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
                                    className="px-8 py-3.5 bg-ram-red text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-ram-red/20 active:scale-95"
                                >
                                    Initialize
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ─── EDIT Modal ───────────────────────────────────── */}
            {editingOrder && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-[2.5rem] p-10 max-w-lg w-full shadow-2xl animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-ram-red rounded-2xl flex items-center justify-center text-white">
                                    <Edit3 size={20} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black uppercase tracking-tight">Edit WO-{editForm.id}</h2>
                                    <p className="text-xs text-slate-400 font-bold mt-1">Update work order details</p>
                                </div>
                            </div>
                            <button
                                onClick={handleEditCancel}
                                className="w-10 h-10 bg-slate-100 rounded-2xl flex items-center justify-center hover:bg-slate-200 transition-all"
                            >
                                <X size={18} className="text-slate-500" />
                            </button>
                        </div>

                        <form onSubmit={handleEditSubmit} className="space-y-5">
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Order Number *</label>
                                <input
                                    type="text"
                                    value={editForm.orderNumber}
                                    onChange={e => setEditForm({...editForm, orderNumber: e.target.value})}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-ram-red/10 outline-none transition-all"
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Maintenance Type</label>
                                <input
                                    type="text"
                                    value={editForm.maintenanceType}
                                    onChange={e => setEditForm({...editForm, maintenanceType: e.target.value})}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-ram-red/10 outline-none transition-all"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Assigned To (Technician ID)</label>
                                    <input
                                        type="number"
                                        value={editForm.assignedTo}
                                        onChange={e => setEditForm({...editForm, assignedTo: e.target.value})}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-ram-red/10 outline-none transition-all"
                                        placeholder="Leave empty to unassign"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Due Date</label>
                                    <input
                                        type="date"
                                        value={editForm.dueDate}
                                        onChange={e => setEditForm({...editForm, dueDate: e.target.value})}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-ram-red/10 outline-none transition-all"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Estimated Hours</label>
                                    <input
                                        type="number"
                                        step="0.5"
                                        value={editForm.estimatedHours}
                                        onChange={e => setEditForm({...editForm, estimatedHours: e.target.value})}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-ram-red/10 outline-none transition-all"
                                    />
                                </div>
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
                            </div>
                            <div className="grid grid-cols-2 gap-4">
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
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Description *</label>
                                <textarea
                                    value={editForm.description}
                                    onChange={e => setEditForm({...editForm, description: e.target.value})}
                                    rows={3}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-ram-red/10 outline-none transition-all resize-none"
                                    placeholder="Additional details..."
                                    required
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={handleEditCancel}
                                    className="px-8 py-3.5 font-black text-xs uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-all rounded-2xl hover:bg-slate-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="px-8 py-3.5 bg-ram-red text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-ram-red/20 active:scale-95 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                                    {isSaving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ─── Details Modal ────────────────────────────────── */}
            {selectedOrder && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-[2.5rem] p-10 max-w-2xl w-full shadow-2xl animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-ram-red rounded-2xl flex items-center justify-center text-white">
                                    <Wrench size={24} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black uppercase tracking-tight">WO-{selectedOrder.id}</h2>
                                    <div className="flex items-center gap-2 mt-1">
                                        {getPriorityBadge(selectedOrder.priority)}
                                        {getStatusBadge(selectedOrder.status)}
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedOrder(null)}
                                className="w-10 h-10 bg-slate-100 rounded-2xl flex items-center justify-center hover:bg-slate-200 transition-all"
                            >
                                <X size={18} className="text-slate-500" />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Work Order Information</h3>
                                <div className="p-4 bg-slate-50 rounded-2xl space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-xs font-bold text-slate-400">Order Number</span>
                                        <span className="text-sm font-black text-slate-800">{selectedOrder.orderNumber || 'TBD'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-xs font-bold text-slate-400">Maintenance Type</span>
                                        <span className="text-sm font-black text-slate-800">{selectedOrder.maintenanceType || 'GENERAL INTERVENTION'}</span>
                                    </div>
                                    {selectedOrder.description && (
                                        <div className="pt-2 border-t border-slate-200">
                                            <span className="text-xs font-bold text-slate-400 block mb-1">Description</span>
                                            <span className="text-xs font-bold text-slate-600 leading-relaxed">{selectedOrder.description}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Assignment</h3>
                                <div className="p-4 bg-slate-50 rounded-2xl space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-xs font-bold text-slate-400">Assigned Technician</span>
                                        <span className="text-sm font-black text-slate-800">{selectedOrder.assignedTechnicianName || 'UNASSIGNED'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-xs font-bold text-slate-400">Due Date</span>
                                        <span className={`text-sm font-black ${selectedOrder._daysRemaining < 0 ? 'text-red-600' : 'text-slate-800'}`}>
                                            {formatDate(selectedOrder.dueDate)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-xs font-bold text-slate-400">Estimated Hours</span>
                                        <span className="text-sm font-black text-slate-800">{selectedOrder.estimatedHours || '—'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-xs font-bold text-slate-400">Progress</span>
                                        <span className="text-sm font-black text-slate-800">{selectedOrder._progress}%</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Progress Timeline</h3>
                            <div className="p-4 bg-slate-50 rounded-2xl">
                                <div className="h-4 bg-white rounded-full overflow-hidden shadow-inner">
                                    <div
                                        className={`h-full rounded-full transition-all duration-1000 ${
                                            selectedOrder.status === 'COMPLETED' ? 'bg-emerald-500' :
                                                selectedOrder.status === 'CANCELLED' ? 'bg-slate-300' :
                                                    'bg-ram-red'
                                        }`}
                                        style={{ width: `${selectedOrder._progress}%` }}
                                    />
                                </div>
                                <div className="flex justify-between mt-3 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                                    <span>Created</span>
                                    <span>In Progress</span>
                                    <span>Completed</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-slate-100">
                            <button
                                onClick={() => { handleDeleteClick(selectedOrder); setSelectedOrder(null); }}
                                className="px-6 py-3.5 border border-red-200 text-red-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-50 transition-all flex items-center gap-2"
                            >
                                <Trash2 size={14} /> Delete
                            </button>
                            <button
                                onClick={() => { handleEdit(selectedOrder); setSelectedOrder(null); }}
                                className="px-8 py-3.5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-ram-red transition-all shadow-lg active:scale-95 flex items-center gap-2"
                            >
                                <Edit3 size={14} /> Edit Work Order
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ─── DELETE Confirmation Modal ────────────────────── */}
            {deletingOrder && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-[2.5rem] p-10 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <AlertTriangle size={28} className="text-red-500" />
                            </div>
                            <h2 className="text-2xl font-black uppercase tracking-tight text-slate-900">Delete Work Order?</h2>
                            <p className="text-xs text-slate-400 font-bold mt-2 leading-relaxed">
                                You are about to permanently delete <span className="text-ram-red font-black">WO-{deletingOrder.id}</span>.<br/>
                                This action cannot be undone.
                            </p>
                        </div>

                        <div className="bg-slate-50 rounded-2xl p-4 mb-8">
                            <div className="flex justify-between text-sm mb-2">
                                <span className="font-bold text-slate-400">Order Number</span>
                                <span className="font-black text-slate-800">{deletingOrder.orderNumber || 'TBD'}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="font-bold text-slate-400">Maintenance Type</span>
                                <span className="font-black text-slate-800">{deletingOrder.maintenanceType || 'GENERAL INTERVENTION'}</span>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={handleDeleteCancel}
                                disabled={isDeleting}
                                className="flex-1 px-6 py-3.5 border border-slate-200 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteConfirm}
                                disabled={isDeleting}
                                className="flex-1 px-6 py-3.5 bg-red-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-red-600/20 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isDeleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                                {isDeleting ? 'Deleting...' : 'Confirm Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WorkOrders;