import { useState, useEffect } from 'react';
import {
    ClipboardList,
    Search,
    Filter,
    Play,
    Pause,
    CheckCircle,
    ExternalLink,
    Wrench,
    Plane,
    Clock,
    AlertTriangle,
    Loader2,
    MessageSquare,
    Upload,
    X
} from 'lucide-react';
import { useAuth } from '../context/useAuth';
import { workOrderAPI, logApiError } from '../services/api';
import { filterWorkOrdersByUser, canEditWorkOrder } from '../utils/roleUtils';
import Logo from '../components/UI/Logo';

const TechnicianWorkOrders = () => {
    const { user } = useAuth();
    const [workOrders, setWorkOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [filterPriority, setFilterPriority] = useState('All');
    const [selectedWorkOrder, setSelectedWorkOrder] = useState(null);
    const [notes, setNotes] = useState({});
    const [showNotesModal, setShowNotesModal] = useState(false);

    useEffect(() => {
        fetchWorkOrders();
    }, []);

    const fetchWorkOrders = async () => {
        try {
            setLoading(true);
            const response = await workOrderAPI.getAll();
            const allWorkOrders = response.data || [];
            const myWorkOrders = filterWorkOrdersByUser(allWorkOrders, user);
            setWorkOrders(myWorkOrders);
        } catch (err) {
            logApiError('Technician Work Orders Load', err);
        } finally {
            setLoading(false);
        }
    };

    const filteredWorkOrders = workOrders.filter(wo => {
        const matchesSearch = 
            wo.id?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
            wo.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            wo.description?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = filterStatus === 'All' || wo.status === filterStatus;
        const matchesPriority = filterPriority === 'All' || wo.priority === filterPriority;
        
        return matchesSearch && matchesStatus && matchesPriority;
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'OPEN': return 'bg-gray-100 text-gray-700 border-gray-200';
            case 'ASSIGNED': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'IN_PROGRESS': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'COMPLETED': return 'bg-green-100 text-green-700 border-green-200';
            case 'CANCELLED': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'URGENT': return 'bg-red-100 text-red-700 border-red-200';
            case 'HIGH': return 'bg-orange-100 text-orange-700 border-orange-200';
            case 'NORMAL': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'LOW': return 'bg-gray-100 text-gray-700 border-gray-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const handleUpdateStatus = async (workOrderId, newStatus) => {
        try {
            await workOrderAPI.update(workOrderId, { status: newStatus });
            await fetchWorkOrders();
        } catch (err) {
            logApiError('Work Order Status Update', err);
        }
    };

    const handleAddNote = async (workOrderId) => {
        const note = notes[workOrderId];
        if (!note || !note.trim()) return;

        try {
            // In a real implementation, this would call a notes API
            // For now, we'll just update the work order with the note in description
            const workOrder = workOrders.find(wo => wo.id === workOrderId);
            if (workOrder) {
                const updatedDescription = `${workOrder.description}\n\n[Note]: ${note}`;
                await workOrderAPI.update(workOrderId, { description: updatedDescription });
                setNotes({ ...notes, [workOrderId]: '' });
                await fetchWorkOrders();
            }
        } catch (err) {
            logApiError('Add Note', err);
        }
    };

    const counts = {
        total: workOrders.length,
        open: workOrders.filter(wo => wo.status === 'OPEN').length,
        inProgress: workOrders.filter(wo => wo.status === 'IN_PROGRESS').length,
        completed: workOrders.filter(wo => wo.status === 'COMPLETED').length,
        urgent: workOrders.filter(wo => wo.priority === 'URGENT').length,
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-slate-50">
                <Loader2 className="w-10 h-10 animate-spin text-ram-red mb-4" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Loading Work Orders...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] p-8 font-sans">
            {/* Header */}
            <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-200 pb-8">
                <div className="flex items-center gap-6">
                    <div className="transition-transform hover:scale-105">
                        <Logo className="h-12" />
                    </div>
                    <div className="h-10 w-px bg-slate-200 hidden md:block" />
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <span className="px-2 py-0.5 bg-ram-red text-white text-[8px] font-black uppercase tracking-widest rounded border border-ram-red flex items-center gap-1.5">
                                <div className="w-1 h-1 bg-white rounded-full animate-pulse" />
                                Technician View
                            </span>
                            <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">Work Order Management</span>
                        </div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">
                            My Assigned <span className="text-ram-red italic">Work Orders</span>
                        </h1>
                    </div>
                </div>
            </header>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <ClipboardList className="w-5 h-5 text-slate-400" />
                        <span className="text-3xl font-black text-slate-900">{counts.total}</span>
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Assigned</p>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <Play className="w-5 h-5 text-yellow-500" />
                        <span className="text-3xl font-black text-slate-900">{counts.inProgress}</span>
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">In Progress</p>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span className="text-3xl font-black text-slate-900">{counts.completed}</span>
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Completed</p>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                        <span className="text-3xl font-black text-slate-900">{counts.urgent}</span>
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Urgent</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6 shadow-sm flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by WO#, aircraft, or description..."
                        className="pl-10 pr-4 py-2.5 w-full text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-ram-red focus:border-transparent"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <select
                        className="text-sm border border-slate-200 rounded-lg py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-ram-red focus:border-transparent flex-1 md:flex-none"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="All">All Statuses</option>
                        <option value="OPEN">Open</option>
                        <option value="ASSIGNED">Assigned</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="COMPLETED">Completed</option>
                    </select>
                    <select
                        className="text-sm border border-slate-200 rounded-lg py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-ram-red focus:border-transparent flex-1 md:flex-none"
                        value={filterPriority}
                        onChange={(e) => setFilterPriority(e.target.value)}
                    >
                        <option value="All">All Priorities</option>
                        <option value="URGENT">Urgent</option>
                        <option value="HIGH">High</option>
                        <option value="NORMAL">Normal</option>
                        <option value="LOW">Low</option>
                    </select>
                </div>
            </div>

            {/* Work Orders List */}
            <div className="space-y-4">
                {filteredWorkOrders.length > 0 ? (
                    filteredWorkOrders.map((workOrder) => (
                        <div
                            key={workOrder.id}
                            className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all group"
                        >
                            <div className="flex flex-col lg:flex-row justify-between gap-6">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-3">
                                        <span className="text-lg font-black text-slate-900">{workOrder.orderNumber || `WO-${workOrder.id}`}</span>
                                        <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${getPriorityColor(workOrder.priority)}`}>
                                            {workOrder.priority}
                                        </span>
                                        <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${getStatusColor(workOrder.status)}`}>
                                            {workOrder.status.replace('_', ' ')}
                                        </span>
                                    </div>
                                    
                                    <p className="text-sm text-slate-700 leading-relaxed mb-4 line-clamp-2">
                                        {workOrder.description}
                                    </p>
                                    
                                    <div className="flex flex-wrap gap-4 text-xs text-slate-500 mb-4">
                                        {workOrder.dueDate && (
                                            <div className="flex items-center gap-1.5">
                                                <Clock className="w-3.5 h-3.5" />
                                                Due: {new Date(workOrder.dueDate).toLocaleDateString()}
                                            </div>
                                        )}
                                        {workOrder.estimatedHours && (
                                            <div className="flex items-center gap-1.5">
                                                <Wrench className="w-3.5 h-3.5" />
                                                Est: {workOrder.estimatedHours}h
                                            </div>
                                        )}
                                        {workOrder.actualHours && (
                                            <div className="flex items-center gap-1.5">
                                                <Clock className="w-3.5 h-3.5" />
                                                Act: {workOrder.actualHours}h
                                            </div>
                                        )}
                                    </div>

                                    {/* Notes Input */}
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="Add a note..."
                                            className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-ram-red focus:border-transparent"
                                            value={notes[workOrder.id] || ''}
                                            onChange={(e) => setNotes({ ...notes, [workOrder.id]: e.target.value })}
                                        />
                                        <button
                                            onClick={() => handleAddNote(workOrder.id)}
                                            className="px-3 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-200 transition-colors flex items-center gap-1"
                                        >
                                            <MessageSquare size={14} />
                                            Add Note
                                        </button>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 lg:border-l lg:pl-6 border-slate-100">
                                    {workOrder.status === 'OPEN' || workOrder.status === 'ASSIGNED' ? (
                                        <button
                                            onClick={() => handleUpdateStatus(workOrder.id, 'IN_PROGRESS')}
                                            className="flex items-center gap-2 px-4 py-2 bg-ram-red text-white rounded-lg text-sm font-bold hover:bg-ram-red-dark transition-colors"
                                        >
                                            <Play size={16} />
                                            Start Work
                                        </button>
                                    ) : workOrder.status === 'IN_PROGRESS' ? (
                                        <>
                                            <button
                                                onClick={() => handleUpdateStatus(workOrder.id, 'COMPLETED')}
                                                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 transition-colors"
                                            >
                                                <CheckCircle size={16} />
                                                Complete
                                            </button>
                                            <button
                                                onClick={() => handleUpdateStatus(workOrder.id, 'OPEN')}
                                                className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-500"
                                                title="Pause Work"
                                            >
                                                <Pause size={16} />
                                            </button>
                                        </>
                                    ) : (
                                        <button className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-bold cursor-default">
                                            <CheckCircle size={16} />
                                            Completed
                                        </button>
                                    )}
                                    <button
                                        onClick={() => setSelectedWorkOrder(workOrder)}
                                        className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-400 group-hover:text-ram-red transition-colors"
                                    >
                                        <ExternalLink size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="bg-white border border-dashed border-slate-200 rounded-xl p-12 text-center">
                        <ClipboardList className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-lg font-black text-slate-900 mb-2">No Work Orders Found</h3>
                        <p className="text-sm text-slate-500">
                            {searchTerm || filterStatus !== 'All' || filterPriority !== 'All'
                                ? 'Try adjusting your filters or search term.'
                                : 'You don\'t have any work orders assigned to you yet.'}
                        </p>
                    </div>
                )}
            </div>

            {/* Work Order Detail Modal */}
            {selectedWorkOrder && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-slate-200">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-xl font-black text-slate-900 mb-2">{selectedWorkOrder.orderNumber || `WO-${selectedWorkOrder.id}`}</h2>
                                    <div className="flex items-center gap-2">
                                        <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${getPriorityColor(selectedWorkOrder.priority)}`}>
                                            {selectedWorkOrder.priority}
                                        </span>
                                        <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${getStatusColor(selectedWorkOrder.status)}`}>
                                            {selectedWorkOrder.status.replace('_', ' ')}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedWorkOrder(null)}
                                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5 text-slate-400" />
                                </button>
                            </div>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Description</label>
                                <p className="text-sm text-slate-700 leading-relaxed">{selectedWorkOrder.description}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Estimated Hours</label>
                                    <p className="text-sm font-bold text-slate-900">{selectedWorkOrder.estimatedHours || 'N/A'}</p>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Actual Hours</label>
                                    <p className="text-sm font-bold text-slate-900">{selectedWorkOrder.actualHours || 'N/A'}</p>
                                </div>
                            </div>
                            {selectedWorkOrder.dueDate && (
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Due Date</label>
                                    <p className="text-sm font-bold text-slate-900">{new Date(selectedWorkOrder.dueDate).toLocaleString()}</p>
                                </div>
                            )}
                            <div className="pt-4 border-t border-slate-200">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Upload Evidence</label>
                                <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-ram-red/30 transition-colors cursor-pointer">
                                    <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                                    <p className="text-sm text-slate-500">Click to upload photos or documents</p>
                                    <p className="text-xs text-slate-400 mt-1">PNG, JPG, PDF up to 5MB</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 border-t border-slate-200 bg-slate-50 rounded-b-2xl">
                            <button
                                onClick={() => setSelectedWorkOrder(null)}
                                className="w-full py-3 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-slate-800 transition-all"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TechnicianWorkOrders;
