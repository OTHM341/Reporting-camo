// src/pages/TechnicianTasks.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ClipboardList,
    CheckCircle,
    Clock,
    AlertTriangle,
    Search, 
    Play,
    Pause,
    ExternalLink,
    CheckCircle2,
    Loader2,
    MessageSquare
} from 'lucide-react';
import { useAuth } from '../context/useAuth';
import { workOrderAPI, logApiError } from '../services/api';
import { filterWorkOrdersByUser } from '../utils/roleUtils';
import Logo from '../components/UI/Logo';

const TechnicianTasks = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [filterPriority, setFilterPriority] = useState('All');
    const [notes, setNotes] = useState({});

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            setLoading(true);
            const response = await workOrderAPI.getAll();
            const allTasks = response.data || [];
            const myTasks = filterWorkOrdersByUser(allTasks, user);
            setTasks(myTasks);
        } catch (err) {
            logApiError('Technician Tasks Load', err);
        } finally {
            setLoading(false);
        }
    };

    const filteredTasks = tasks.filter(task => {
        const matchesSearch = 
            task.id?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
            task.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            task.description?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'All' || task.status === filterStatus;
        const matchesPriority = filterPriority === 'All' || task.priority === filterPriority;
        return matchesSearch && matchesStatus && matchesPriority;
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'OPEN': return 'bg-gray-100 text-gray-700 border-gray-200';
            case 'ASSIGNED': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'IN_PROGRESS': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'COMPLETED': return 'bg-green-100 text-green-700 border-green-200';
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

    const handleUpdateStatus = async (taskId, newStatus) => {
        try {
            await workOrderAPI.update(taskId, { status: newStatus });
            await fetchTasks();
        } catch (err) {
            logApiError('Task Status Update', err);
        }
    };

    const handleAddNote = async (taskId) => {
        const note = notes[taskId];
        if (!note || !note.trim()) return;
        try {
            const task = tasks.find(t => t.id === taskId);
            if (task) {
                const updatedDescription = `${task.description}\n\n[Note]: ${note}`;
                await workOrderAPI.update(taskId, { description: updatedDescription });
                setNotes({ ...notes, [taskId]: '' });
                await fetchTasks();
            }
        } catch (err) {
            logApiError('Add Note', err);
        }
    };

    const counts = {
        total: tasks.length,
        inProgress: tasks.filter(t => t.status === 'IN_PROGRESS').length,
        pending: tasks.filter(t => t.status === 'OPEN' || t.status === 'ASSIGNED').length,
        completed: tasks.filter(t => t.status === 'COMPLETED').length,
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-slate-50">
                <Loader2 className="w-10 h-10 animate-spin text-ram-red mb-4" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Loading Tasks...</p>
            </div>
        );
    }

    const handleReportDefect = () => {
        navigate('/technician/report-defect');
    };

    const handleViewDetails = (taskId) => {
        navigate('/technician/work-orders');
    };

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
                            <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">Task Management</span>
                        </div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">
                            My Assigned <span className="text-ram-red italic">Tasks</span>
                        </h1>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={handleReportDefect}
                        className="flex items-center gap-2 px-4 py-2 bg-ram-red text-white rounded-lg text-sm font-medium hover:bg-ram-darkRed">
                        <AlertTriangle className="w-4 h-4" />
                        Report New Defect
                    </button>
                </div>
            </header>

            {/* Task Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-blue-50 rounded-lg text-blue-600"><ClipboardList className="w-5 h-5" /></div>
                    <div><p className="text-xs text-slate-500 font-medium">Total Tasks</p><p className="text-xl font-bold text-slate-900">{counts.total}</p></div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-green-50 rounded-lg text-ram-green"><Play className="w-5 h-5" /></div>
                    <div><p className="text-xs text-slate-500 font-medium">In Progress</p><p className="text-xl font-bold text-slate-900">{counts.inProgress}</p></div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-orange-50 rounded-lg text-orange-600"><Clock className="w-5 h-5" /></div>
                    <div><p className="text-xs text-slate-500 font-medium">Pending</p><p className="text-xl font-bold text-slate-900">{counts.pending}</p></div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-ram-green/10 rounded-lg text-ram-green"><CheckCircle2 className="w-5 h-5" /></div>
                    <div><p className="text-xs text-slate-500 font-medium">Completed</p><p className="text-xl font-bold text-slate-900">{counts.completed}</p></div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                        type="text" 
                        placeholder="Search by WO#, aircraft, or description..." 
                        className="pl-9 pr-4 py-2 w-full text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-ram-red focus:border-transparent"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <select 
                        className="text-sm border border-slate-200 rounded-lg py-2 focus:outline-none focus:ring-2 focus:ring-ram-red focus:border-transparent flex-1 md:flex-none"
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
                        className="text-sm border border-slate-200 rounded-lg py-2 focus:outline-none focus:ring-2 focus:ring-ram-red focus:border-transparent flex-1 md:flex-none"
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

            {/* Task List */}
            <div className="space-y-4">
                {filteredTasks.length > 0 ? (
                    filteredTasks.map((task) => (
                        <div key={task.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-ram-red/30 transition-all group">
                            <div className="flex flex-col lg:flex-row justify-between gap-6">
                                <div className="flex flex-col md:flex-row gap-6 flex-1">
                                    <div className="flex flex-col justify-center items-center p-3 bg-slate-50 rounded-xl min-w-[100px]">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Due Date</span>
                                        <span className="text-sm font-bold text-slate-900">{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'TBD'}</span>
                                        <div className={`mt-2 px-2 py-0.5 rounded text-[10px] font-bold border ${getPriorityColor(task.priority)}`}>
                                            {task.priority}
                                        </div>
                                    </div>
                                    
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="text-lg font-bold text-slate-900">{task.orderNumber || `WO-${task.id}`}</h3>
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusColor(task.status)}`}>
                                                {task.status.replace('_', ' ')}
                                            </span>
                                        </div>
                                        <p className="text-sm font-medium text-slate-700 mb-3 line-clamp-2">{task.description}</p>
                                        
                                        <div className="flex flex-wrap gap-4 text-xs text-slate-500 mb-3">
                                            {task.estimatedHours && (
                                                <div className="flex items-center gap-1.5">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    Est: {task.estimatedHours}h
                                                </div>
                                            )}
                                            {task.actualHours && (
                                                <div className="flex items-center gap-1.5">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    Act: {task.actualHours}h
                                                </div>
                                            )}
                                        </div>

                                        {/* Notes Input */}
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                placeholder="Add a note..."
                                                className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-ram-red focus:border-transparent"
                                                value={notes[task.id] || ''}
                                                onChange={(e) => setNotes({ ...notes, [task.id]: e.target.value })}
                                            />
                                            <button
                                                onClick={() => handleAddNote(task.id)}
                                                className="px-3 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-200 transition-colors flex items-center gap-1"
                                            >
                                                <MessageSquare size={14} />
                                                Add Note
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 lg:border-l lg:pl-6 border-slate-100">
                                    {(task.status === 'OPEN' || task.status === 'ASSIGNED') && (
                                        <button 
                                            onClick={() => handleUpdateStatus(task.id, 'IN_PROGRESS')}
                                            className="flex-1 lg:flex-none px-4 py-2 bg-ram-red text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:bg-ram-red-dark transition-colors">
                                            <Play className="w-4 h-4" /> Start Work
                                        </button>
                                    )}
                                    {task.status === 'IN_PROGRESS' && (
                                        <>
                                            <button 
                                                onClick={() => handleUpdateStatus(task.id, 'COMPLETED')}
                                                className="flex-1 lg:flex-none px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:bg-green-700 transition-colors">
                                                <CheckCircle className="w-4 h-4" /> Complete
                                            </button>
                                            <button 
                                                onClick={() => handleUpdateStatus(task.id, 'OPEN')}
                                                className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-500" title="Pause Work">
                                                <Pause className="w-4 h-4" />
                                            </button>
                                        </>
                                    )}
                                    {task.status === 'COMPLETED' && (
                                        <button className="flex-1 lg:flex-none px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-bold flex items-center justify-center gap-2 cursor-default">
                                            <CheckCircle2 className="w-4 h-4" /> Done
                                        </button>
                                    )}
                                    <button 
                                        onClick={() => handleViewDetails(task.id)}
                                        className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-400 group-hover:text-ram-red transition-colors">
                                        <ExternalLink className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
                        <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search className="w-8 h-8 text-slate-300" />
                        </div>
                        <h3 className="text-slate-900 font-bold">No tasks found</h3>
                        <p className="text-slate-500 text-sm mt-1">
                            {searchTerm || filterStatus !== 'All' || filterPriority !== 'All'
                                ? 'Try adjusting your filters or search term.'
                                : 'You don\'t have any tasks assigned to you yet.'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TechnicianTasks;
