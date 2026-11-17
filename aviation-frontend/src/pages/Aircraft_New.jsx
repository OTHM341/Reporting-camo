import { useState, useEffect } from 'react';
import { Search, Filter, Download, Plus, X, Loader } from 'lucide-react';
import { aircraftAPI } from '../services/api';

const Aircraft = () => {
    const [fleet, setFleet] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingAircraft, setEditingAircraft] = useState(null);
    const [formData, setFormData] = useState({
        registration: '',
        type: '',
        model: '',
        manufacturer: '',
        status: 'ACTIVE',
        totalFlightHours: 0,
        numberOfAircraft: 1
    });

    useEffect(() => {
        fetchAircraft();
    }, []);

    async function fetchAircraft() {
        try {
            setLoading(true);
            const response = await aircraftAPI.getAll();
            setFleet(response.data || []);
            setError(null);
        } catch (err) {
            console.error('Error fetching aircraft:', err);
            setError('Failed to load aircraft data');
        } finally {
            setLoading(false);
        }
    }

    const handleOpenModal = (aircraft = null) => {
        if (aircraft) {
            setEditingAircraft(aircraft);
            setFormData({
                registration: aircraft.registration,
                type: aircraft.type,
                model: aircraft.model,
                manufacturer: aircraft.manufacturer,
                status: aircraft.status,
                totalFlightHours: aircraft.totalFlightHours,
                numberOfAircraft: aircraft.numberOfAircraft
            });
        } else {
            setEditingAircraft(null);
            setFormData({
                registration: '',
                type: '',
                model: '',
                manufacturer: '',
                status: 'ACTIVE',
                totalFlightHours: 0,
                numberOfAircraft: 1
            });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingAircraft(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingAircraft) {
                await aircraftAPI.update(editingAircraft.id, formData);
            } else {
                await aircraftAPI.create(formData);
            }
            await fetchAircraft();
            handleCloseModal();
        } catch (err) {
            console.error('Error saving aircraft:', err);
            setError('Failed to save aircraft');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this aircraft?')) {
            try {
                await aircraftAPI.delete(id);
                await fetchAircraft();
            } catch (err) {
                console.error('Error deleting aircraft:', err);
                setError('Failed to delete aircraft');
            }
        }
    };

    const filteredFleet = fleet.filter(ac =>
        ac.registration?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ac.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ac.manufacturer?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-8">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">FLEET INVENTORY</h1>
                    <p className="text-slate-500 text-sm font-medium">Manage and monitor {fleet.length} total aircraft across all divisions.</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 text-slate-600 font-bold text-xs bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all">
                        <Download className="w-4 h-4" /> Export CSV
                    </button>
                    <button
                        onClick={() => handleOpenModal()}
                        className="flex items-center gap-2 px-4 py-2 bg-ram-red text-white font-bold text-xs rounded-xl hover:shadow-lg hover:shadow-ram-red/20 transition-all"
                    >
                        <Plus className="w-4 h-4" /> Register Aircraft
                    </button>
                </div>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg text-sm flex justify-between items-center">
                    <span>{error}</span>
                    <button onClick={() => setError(null)}>Ã—</button>
                </div>
            )}

            {/* Search and Filter Bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-100 mb-6 flex gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by registration, MSN, or model..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-ram-red/20"
                    />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 text-slate-500 font-bold text-xs hover:bg-slate-50 rounded-xl">
                    <Filter className="w-4 h-4" /> Filters
                </button>
            </div>

            {/* Data Table */}
            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <Loader className="w-8 h-8 animate-spin text-ram-red" />
                </div>
            ) : (
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Registration</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Model / Manufacturer</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Flight Hours</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredFleet.length > 0 ? (
                                filteredFleet.map((ac) => (
                                    <tr key={ac.id} className="hover:bg-slate-50/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-black text-slate-900">{ac.registration}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-bold text-slate-700">{ac.model}</div>
                                            <div className="text-[10px] text-slate-400">{ac.manufacturer}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-xs font-bold text-slate-600">{ac.totalFlightHours} FH</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tight ${
                                                ac.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                                            }`}>
                                                {ac.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleOpenModal(ac)}
                                                    className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    âœï¸
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(ac.id)}
                                                    className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors"
                                                    title="Delete"
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
                                        No aircraft found
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
                            <h2 className="text-xl font-bold">{editingAircraft ? 'Edit Aircraft' : 'Add New Aircraft'}</h2>
                            <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Registration</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.registration}
                                    onChange={(e) => setFormData({...formData, registration: e.target.value})}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-ram-red/20 outline-none"
                                    placeholder="e.g., CN-RGN"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Type</label>
                                <input
                                    type="text"
                                    value={formData.type}
                                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-ram-red/20 outline-none"
                                    placeholder="e.g., Boeing 787"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Model</label>
                                <input
                                    type="text"
                                    value={formData.model}
                                    onChange={(e) => setFormData({...formData, model: e.target.value})}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-ram-red/20 outline-none"
                                    placeholder="e.g., 787-9"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Manufacturer</label>
                                <input
                                    type="text"
                                    value={formData.manufacturer}
                                    onChange={(e) => setFormData({...formData, manufacturer: e.target.value})}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-ram-red/20 outline-none"
                                    placeholder="e.g., Boeing"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Status</label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-ram-red/20 outline-none"
                                >
                                    <option value="ACTIVE">Active</option>
                                    <option value="MAINTENANCE">Maintenance</option>
                                    <option value="INACTIVE">Inactive</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Total Flight Hours</label>
                                <input
                                    type="number"
                                    value={formData.totalFlightHours}
                                    onChange={(e) => setFormData({...formData, totalFlightHours: parseFloat(e.target.value)})}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-ram-red/20 outline-none"
                                    placeholder="0"
                                />
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
                                    {editingAircraft ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Aircraft;

