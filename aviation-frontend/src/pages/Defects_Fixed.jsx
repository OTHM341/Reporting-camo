import { useState, useEffect } from 'react';
import { Search, Filter, Loader, Plus, X } from 'lucide-react';
import { defectAPI, aircraftAPI } from '../services/api';

const Defects = () => {
    const [defects, setDefects] = useState([]);
    const [aircraft, setAircraft] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingDefect, setEditingDefect] = useState(null);
    const [formData, setFormData] = useState({
        description: '',
        severity: 'MAJOR',
        aircraftId: '',
        reportedBy: 1,
        status: 'IN_PROGRESS'
    });

    useEffect(() => {
        fetchData();
    }, []);

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
            console.error('Error fetching data:', err);
            setError('Failed to load defects data');
        } finally {
            setLoading(false);
        }
    }

    const handleOpenModal = (defect = null) => {
        if (defect) {
            setEditingDefect(defect);
            setFormData({
                description: defect.description,
                severity: defect.severity,
                aircraftId: defect.aircraft?.id,
                reportedBy: defect.reportedBy,
                status: defect.status
            });
        } else {
            setEditingDefect(null);
            setFormData({
                description: '',
                severity: 'MAJOR',
                aircraftId: '',
                reportedBy: 1,
                status: 'IN_PROGRESS'
            });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingDefect(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingDefect) {
                await defectAPI.update(editingDefect.id, formData);
            } else {
                await defectAPI.create(formData);
            }
            await fetchData();
            handleCloseModal();
        } catch (err) {
            console.error('Error saving defect:', err);
            setError('Failed to save defect');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this defect?')) {
            try {
                await defectAPI.delete(id);
                await fetchData();
            } catch (err) {
                console.error('Error deleting defect:', err);
                setError('Failed to delete defect');
            }
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'IN_PROGRESS': return 'bg-ram-red/10 text-ram-red border-ram-red/20';
            case 'DEFERRED': return 'bg-amber-50 text-amber-600 border-amber-200';
            case 'CLOSED': return 'bg-emerald-50 text-emerald-600 border-emerald-200';
            default: return 'bg-slate-50 text-slate-600';
        }
    };

    const filteredDefects = defects.filter(d =>
        d.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.aircraft?.registration?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-8">
            <header className="mb-8">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Defects & Technical Logs</h1>
                <p className="text-slate-500 text-sm font-medium">Monitoring PIREPS, MAREPS, and deferred maintenance items.</p>
                <button
                    onClick={() => handleOpenModal()}
                    className="mt-4 flex items-center gap-2 px-4 py-2 bg-ram-red text-white font-bold text-xs rounded-xl hover:shadow-lg hover:shadow-ram-red/20 transition-all"
                >
                    <Plus className="w-4 h-4" /> Report New Defect
                </button>
            </header>

            {error && (
                <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg text-sm flex justify-between items-center">
                    <span>{error}</span>
                    <button onClick={() => setError(null)}>Ã—</button>
                </div>
            )}

            <div className="bg-white p-4 rounded-2xl border border-slate-100 mb-6 flex gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by description or registration..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-ram-red/20"
                    />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 text-slate-500 font-bold text-xs hover:bg-slate-50 rounded-xl transition-all">
                    <Filter className="w-4 h-4" /> Filter Priority
                </button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <Loader className="w-8 h-8 animate-spin text-ram-red" />
                </div>
            ) : (
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Aircraft</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Severity</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredDefects.length > 0 ? (
                                filteredDefects.map((defect) => (
                                    <tr key={defect.id} className="hover:bg-slate-50/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="font-mono text-sm font-black text-ram-red">{defect.aircraft?.registration || 'N/A'}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-slate-700">{defect.description}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                                                defect.severity === 'MAJOR' ? 'bg-red-50 text-red-600' :
                                                defect.severity === 'MINOR' ? 'bg-yellow-50 text-yellow-600' :
                                                'bg-blue-50 text-blue-600'
                                            }`}>
                                                {defect.severity}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${getStatusStyle(defect.status)}`}>
                                                {defect.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleOpenModal(defect)}
                                                    className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors"
                                                >
                                                    âœï¸
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(defect.id)}
                                                    className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors"
                                                >
                                                    ðŸ—‘ï¸
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                                        No defects found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-screen overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">{editingDefect ? 'Edit Defect' : 'Report New Defect'}</h2>
                            <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Aircraft</label>
                                <select
                                    required
                                    value={formData.aircraftId}
                                    onChange={(e) => setFormData({...formData, aircraftId: e.target.value})}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-ram-red/20 outline-none"
                                >
                                    <option value="">Select Aircraft</option>
                                    {aircraft.map(ac => (
                                        <option key={ac.id} value={ac.id}>{ac.registration}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Description</label>
                                <textarea
                                    required
                                    value={formData.description}
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-ram-red/20 outline-none"
                                    placeholder="Describe the defect..."
                                    rows="4"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Severity</label>
                                <select
                                    value={formData.severity}
                                    onChange={(e) => setFormData({...formData, severity: e.target.value})}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-ram-red/20 outline-none"
                                >
                                    <option value="MINOR">Minor</option>
                                    <option value="MAJOR">Major</option>
                                    <option value="CRITICAL">Critical</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Status</label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-ram-red/20 outline-none"
                                >
                                    <option value="IN_PROGRESS">In Progress</option>
                                    <option value="DEFERRED">Deferred</option>
                                    <option value="CLOSED">Closed</option>
                                </select>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="flex-1 px-4 py-2 border border-slate-200 rounded-lg font-bold text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-ram-red text-white rounded-lg font-bold text-sm hover:shadow-lg hover:shadow-ram-red/20 transition-all"
                                >
                                    {editingDefect ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Defects;

