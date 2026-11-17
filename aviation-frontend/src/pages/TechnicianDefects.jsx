import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    AlertTriangle,
    Search,
    Filter,
    Eye,
    Plus,
    CheckCircle2,
    Clock,
    Plane,
    ShieldAlert,
    XCircle,
    Loader2
} from 'lucide-react';
import { useAuth } from '../context/useAuth';
import { defectAPI, aircraftAPI, logApiError } from '../services/api';
import { filterDefectsByUser, canEditDefect, canDeleteDefect } from '../utils/roleUtils';
import Logo from '../components/UI/Logo';

const TechnicianDefects = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [defects, setDefects] = useState([]);
    const [aircraft, setAircraft] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterSeverity, setFilterSeverity] = useState('All');
    const [filterStatus, setFilterStatus] = useState('All');
    const [selectedDefect, setSelectedDefect] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [defectsRes, aircraftRes] = await Promise.all([
                defectAPI.getAll(),
                aircraftAPI.getAll()
            ]);
            
            const allDefects = defectsRes.data || [];
            const myDefects = filterDefectsByUser(allDefects, user);
            
            setDefects(myDefects);
            setAircraft(aircraftRes.data || []);
        } catch (err) {
            logApiError('Technician Defects Load', err);
        } finally {
            setLoading(false);
        }
    };

    const filteredDefects = defects.filter(defect => {
        const matchesSearch = 
            defect.id?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
            defect.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            defect.aircraftRegistration?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesSeverity = filterSeverity === 'All' || defect.severity === filterSeverity;
        const matchesStatus = filterStatus === 'All' || defect.status === filterStatus;
        
        return matchesSearch && matchesSeverity && matchesStatus;
    });

    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'CRITICAL': return 'bg-red-100 text-red-700 border-red-200';
            case 'MAJOR': return 'bg-orange-100 text-orange-700 border-orange-200';
            case 'MINOR': return 'bg-blue-100 text-blue-700 border-blue-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'OPEN': return 'bg-red-100 text-red-700 border-red-200';
            case 'IN_PROGRESS': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'RESOLVED': return 'bg-green-100 text-green-700 border-green-200';
            case 'CLOSED': return 'bg-gray-100 text-gray-700 border-gray-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const counts = {
        total: defects.length,
        open: defects.filter(d => d.status === 'OPEN').length,
        inProgress: defects.filter(d => d.status === 'IN_PROGRESS').length,
        resolved: defects.filter(d => d.status === 'RESOLVED').length,
        critical: defects.filter(d => d.severity === 'CRITICAL').length,
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-slate-50">
                <Loader2 className="w-10 h-10 animate-spin text-ram-red mb-4" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Loading Defect Records...</p>
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
                            <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">Defect Management</span>
                        </div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">
                            My Reported <span className="text-ram-red italic">Defects</span>
                        </h1>
                    </div>
                </div>

                <button
                    onClick={() => navigate('/technician/report-defect')}
                    className="flex items-center gap-3 px-6 py-3 bg-ram-red text-white rounded-xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-ram-red-dark transition-all shadow-lg shadow-ram-red/20"
                >
                    <Plus size={16} />
                    Report New Defect
                </button>
            </header>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <AlertTriangle className="w-5 h-5 text-slate-400" />
                        <span className="text-3xl font-black text-slate-900">{counts.total}</span>
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Reported</p>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <XCircle className="w-5 h-5 text-red-500" />
                        <span className="text-3xl font-black text-slate-900">{counts.open}</span>
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Open</p>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <Clock className="w-5 h-5 text-yellow-500" />
                        <span className="text-3xl font-black text-slate-900">{counts.inProgress}</span>
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">In Progress</p>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                        <span className="text-3xl font-black text-slate-900">{counts.resolved}</span>
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Resolved</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6 shadow-sm flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by ID, aircraft, or description..."
                        className="pl-10 pr-4 py-2.5 w-full text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-ram-red focus:border-transparent"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <select
                        className="text-sm border border-slate-200 rounded-lg py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-ram-red focus:border-transparent flex-1 md:flex-none"
                        value={filterSeverity}
                        onChange={(e) => setFilterSeverity(e.target.value)}
                    >
                        <option value="All">All Severities</option>
                        <option value="CRITICAL">Critical</option>
                        <option value="MAJOR">Major</option>
                        <option value="MINOR">Minor</option>
                    </select>
                    <select
                        className="text-sm border border-slate-200 rounded-lg py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-ram-red focus:border-transparent flex-1 md:flex-none"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="All">All Statuses</option>
                        <option value="OPEN">Open</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="RESOLVED">Resolved</option>
                        <option value="CLOSED">Closed</option>
                    </select>
                </div>
            </div>

            {/* Defects List */}
            <div className="space-y-4">
                {filteredDefects.length > 0 ? (
                    filteredDefects.map((defect) => (
                        <div
                            key={defect.id}
                            className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all group"
                        >
                            <div className="flex flex-col lg:flex-row justify-between gap-6">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-3">
                                        <span className="text-lg font-black text-slate-900">DEF-{defect.id}</span>
                                        <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${getSeverityColor(defect.severity)}`}>
                                            {defect.severity}
                                        </span>
                                        <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${getStatusColor(defect.status)}`}>
                                            {defect.status.replace('_', ' ')}
                                        </span>
                                    </div>
                                    
                                    <div className="flex items-center gap-2 mb-3 text-sm font-bold text-slate-600">
                                        <Plane className="w-4 h-4 text-ram-red" />
                                        {defect.aircraftRegistration || 'Unknown Aircraft'}
                                    </div>
                                    
                                    <p className="text-sm text-slate-700 leading-relaxed mb-4 line-clamp-2">
                                        {defect.description}
                                    </p>
                                    
                                    <div className="flex items-center gap-4 text-xs text-slate-500">
                                        <div className="flex items-center gap-1.5">
                                            <Clock className="w-3.5 h-3.5" />
                                            {defect.reportedDate ? new Date(defect.reportedDate).toLocaleDateString() : 'Unknown'}
                                        </div>
                                        {defect.resolvedDate && (
                                            <div className="flex items-center gap-1.5">
                                                <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                                                Resolved: {new Date(defect.resolvedDate).toLocaleDateString()}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 lg:border-l lg:pl-6 border-slate-100">
                                    <button
                                        onClick={() => setSelectedDefect(defect)}
                                        className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-200 transition-colors"
                                    >
                                        <Eye size={16} />
                                        View Details
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="bg-white border border-dashed border-slate-200 rounded-xl p-12 text-center">
                        <ShieldAlert className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-lg font-black text-slate-900 mb-2">No Defects Found</h3>
                        <p className="text-sm text-slate-500 mb-6">
                            {searchTerm || filterSeverity !== 'All' || filterStatus !== 'All'
                                ? 'Try adjusting your filters or search term.'
                                : 'You haven\'t reported any defects yet.'}
                        </p>
                        {!searchTerm && filterSeverity === 'All' && filterStatus === 'All' && (
                            <button
                                onClick={() => navigate('/technician/report-defect')}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-ram-red text-white rounded-xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-ram-red-dark transition-all"
                            >
                                <Plus size={16} />
                                Report Your First Defect
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Defect Detail Modal */}
            {selectedDefect && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-slate-200">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-xl font-black text-slate-900 mb-2">DEF-{selectedDefect.id}</h2>
                                    <div className="flex items-center gap-2">
                                        <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${getSeverityColor(selectedDefect.severity)}`}>
                                            {selectedDefect.severity}
                                        </span>
                                        <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${getStatusColor(selectedDefect.status)}`}>
                                            {selectedDefect.status.replace('_', ' ')}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedDefect(null)}
                                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                                >
                                    <XCircle className="w-5 h-5 text-slate-400" />
                                </button>
                            </div>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Aircraft</label>
                                <p className="text-sm font-bold text-slate-900">{selectedDefect.aircraftRegistration || 'Unknown'}</p>
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Description</label>
                                <p className="text-sm text-slate-700 leading-relaxed">{selectedDefect.description}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Reported Date</label>
                                    <p className="text-sm font-bold text-slate-900">
                                        {selectedDefect.reportedDate ? new Date(selectedDefect.reportedDate).toLocaleString() : 'Unknown'}
                                    </p>
                                </div>
                                {selectedDefect.resolvedDate && (
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Resolved Date</label>
                                        <p className="text-sm font-bold text-slate-900">
                                            {new Date(selectedDefect.resolvedDate).toLocaleString()}
                                        </p>
                                    </div>
                                )}
                            </div>
                            {selectedDefect.resolution && (
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Resolution</label>
                                    <p className="text-sm text-slate-700 leading-relaxed">{selectedDefect.resolution}</p>
                                </div>
                            )}
                        </div>
                        <div className="p-6 border-t border-slate-200 bg-slate-50 rounded-b-2xl">
                            <button
                                onClick={() => setSelectedDefect(null)}
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

export default TechnicianDefects;
