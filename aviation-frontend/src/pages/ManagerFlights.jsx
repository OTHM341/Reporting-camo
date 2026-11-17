import { useState, useEffect } from 'react';
import {
    Plane,
    Clock,
    XCircle,
    CheckCircle,
    Search,
    ArrowUpRight,
    ArrowDownRight,
    Filter,
    FileDown,
    MapPin,
    AlertTriangle,
    Plus,
    X,
    Save,
    Trash2,
    Edit3,
    Download,
    TrendingUp,
    Calendar
} from 'lucide-react';
import Header from '../components/Layout/Header';
import Logo from '../components/UI/Logo';

const ManagerFlights = () => {
    const [flights, setFlights] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedFlight, setSelectedFlight] = useState(null);
    const [exportLoading, setExportLoading] = useState(false);
    const [toast, setToast] = useState(null);

    // Formulaire
    const [formData, setFormData] = useState({
        id: '',
        aircraft: '',
        origin: '',
        destination: '',
        scheduled: '',
        actual: '',
        status: 'SCHEDULED',
        delay: 0,
        type: 'Medium Haul',
        gate: '',
        terminal: '',
        passengers: 0,
        cargo: 0,
        fuel: 0,
        crew: 0,
        notes: ''
    });
    const [formErrors, setFormErrors] = useState({});

    useEffect(() => {
        const timer = setTimeout(() => {
            const mockData = [
                { id: 'AT800', aircraft: 'CN-RGN', origin: 'CMN', destination: 'JFK', scheduled: '10:30', actual: '10:35', status: 'DEPARTED', delay: 5, type: 'Long Haul', gate: 'A12', terminal: 'T1', passengers: 245, cargo: 3200, fuel: 48500, crew: 12, notes: 'Heavy cargo load' },
                { id: 'AT202', aircraft: 'CN-ROB', origin: 'CMN', destination: 'CDG', scheduled: '11:45', actual: null, status: 'SCHEDULED', delay: 0, type: 'Medium Haul', gate: 'B05', terminal: 'T2', passengers: 178, cargo: 1800, fuel: 24500, crew: 8, notes: '' },
                { id: 'AT303', aircraft: 'CN-RGO', origin: 'CMN', destination: 'LHR', scheduled: '12:00', actual: '12:45', status: 'DELAYED', delay: 45, type: 'Medium Haul', gate: 'A08', terminal: 'T1', passengers: 192, cargo: 2100, fuel: 26800, crew: 9, notes: 'Weather delay - fog' },
                { id: 'AT404', aircraft: 'CN-RGP', origin: 'CMN', destination: 'DXB', scheduled: '13:00', actual: null, status: 'CANCELLED', delay: 0, type: 'Long Haul', gate: 'C15', terminal: 'T3', passengers: 0, cargo: 0, fuel: 0, crew: 0, notes: 'Technical issue - engine' },
                { id: 'AT505', aircraft: 'CN-RGN', origin: 'MAD', destination: 'CMN', scheduled: '09:00', actual: '09:00', status: 'ARRIVED', delay: 0, type: 'Short Haul', gate: 'A03', terminal: 'T1', passengers: 134, cargo: 950, fuel: 12000, crew: 6, notes: 'On time arrival' },
                { id: 'AT600', aircraft: 'CN-ROH', origin: 'CMN', destination: 'DKR', scheduled: '14:30', actual: null, status: 'SCHEDULED', delay: 0, type: 'Medium Haul', gate: 'B12', terminal: 'T2', passengers: 156, cargo: 1400, fuel: 18500, crew: 7, notes: '' },
                { id: 'AT701', aircraft: 'CN-RGI', origin: 'CMN', destination: 'YUL', scheduled: '16:00', actual: null, status: 'SCHEDULED', delay: 0, type: 'Long Haul', gate: 'A20', terminal: 'T1', passengers: 267, cargo: 3800, fuel: 52000, crew: 14, notes: 'Pre-flight checks complete' },
                { id: 'AT802', aircraft: 'CN-ROJ', origin: 'ORY', destination: 'CMN', scheduled: '18:45', actual: null, status: 'SCHEDULED', delay: 0, type: 'Medium Haul', gate: 'B08', terminal: 'T2', passengers: 189, cargo: 1950, fuel: 25200, crew: 8, notes: '' },
            ];
            setFlights(mockData);
            setLoading(false);
        }, 800);
        return () => clearTimeout(timer);
    }, []);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const validateForm = () => {
        const errors = {};
        if (!formData.id.trim()) errors.id = 'Flight number required';
        if (!formData.aircraft.trim()) errors.aircraft = 'Aircraft required';
        if (!formData.origin.trim()) errors.origin = 'Origin required';
        if (!formData.destination.trim()) errors.destination = 'Destination required';
        if (!formData.scheduled) errors.scheduled = 'Time required';
        if (formData.origin === formData.destination && formData.origin) errors.destination = 'Same airport';
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const resetForm = () => {
        setFormData({
            id: '', aircraft: '', origin: '', destination: '', scheduled: '', actual: '',
            status: 'SCHEDULED', delay: 0, type: 'Medium Haul', gate: '', terminal: '',
            passengers: 0, cargo: 0, fuel: 0, crew: 0, notes: ''
        });
        setFormErrors({});
    };

    const handleAddFlight = () => {
        if (!validateForm()) return;
        const newFlight = {
            ...formData,
            id: formData.id.toUpperCase(),
            origin: formData.origin.toUpperCase(),
            destination: formData.destination.toUpperCase(),
            aircraft: formData.aircraft.toUpperCase(),
            actual: formData.actual || null,
            delay: parseInt(formData.delay) || 0,
            passengers: parseInt(formData.passengers) || 0,
            cargo: parseInt(formData.cargo) || 0,
            fuel: parseInt(formData.fuel) || 0,
            crew: parseInt(formData.crew) || 0
        };
        setFlights(prev => [...prev, newFlight]);
        setShowAddModal(false);
        resetForm();
        showToast(`Flight ${newFlight.id} added`);
    };

    const handleEditFlight = () => {
        if (!validateForm()) return;
        const updated = {
            ...formData,
            actual: formData.actual || null,
            delay: parseInt(formData.delay) || 0,
            passengers: parseInt(formData.passengers) || 0,
            cargo: parseInt(formData.cargo) || 0,
            fuel: parseInt(formData.fuel) || 0,
            crew: parseInt(formData.crew) || 0
        };
        setFlights(prev => prev.map(f => f.id === selectedFlight.id ? updated : f));
        setShowEditModal(false);
        setSelectedFlight(null);
        resetForm();
        showToast(`Flight ${updated.id} updated`);
    };

    const handleDeleteFlight = (flightId) => {
        if (window.confirm(`Delete flight ${flightId}?`)) {
            setFlights(prev => prev.filter(f => f.id !== flightId));
            showToast(`Flight ${flightId} deleted`, 'warning');
        }
    };

    const openEditModal = (flight) => {
        setSelectedFlight(flight);
        setFormData({ ...flight, actual: flight.actual || '', notes: flight.notes || '' });
        setFormErrors({});
        setShowEditModal(true);
    };

    const openDetailModal = (flight) => {
        setSelectedFlight(flight);
        setShowDetailModal(true);
    };

    const exportToExcel = () => {
        setExportLoading(true);
        setTimeout(() => {
            const headers = ['Flight ID;Aircraft;Origin;Destination;Type;Scheduled;Actual;Status;Delay;Gate;Terminal;PAX;Cargo;Fuel;Crew;Notes;Export Date'];
            const rows = filteredFlights.map(f => [
                f.id, f.aircraft, f.origin, f.destination, f.type,
                f.scheduled, f.actual || 'N/A', f.status, f.delay,
                f.gate || 'N/A', f.terminal || 'N/A', f.passengers || 0,
                f.cargo || 0, f.fuel || 0, f.crew || 0, f.notes || '',
                new Date().toLocaleString('fr-FR')
            ].join(';'));
            const csv = '\uFEFF' + [...headers, ...rows].join('\n');
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const ts = new Date().toISOString().slice(0,19).replace(/:/g,'-');
            link.href = URL.createObjectURL(blob);
            link.download = `RAM_Flights_${ts}.csv`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setExportLoading(false);
            showToast(`${filteredFlights.length} flights exported`);
        }, 1200);
    };

    const filteredFlights = flights.filter(flight => {
        const term = searchTerm.toLowerCase();
        const matchesSearch = flight.id.toLowerCase().includes(term) ||
            flight.aircraft.toLowerCase().includes(term) ||
            flight.destination.toLowerCase().includes(term) ||
            flight.origin.toLowerCase().includes(term) ||
            (flight.gate && flight.gate.toLowerCase().includes(term));
        const matchesStatus = filterStatus === 'All' || flight.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const delayedCount = flights.filter(f => f.status === 'DELAYED').length;
    const cancelledCount = flights.filter(f => f.status === 'CANCELLED').length;
    const onTimeRate = flights.length > 0 ? Math.round((flights.filter(f => f.status === 'ARRIVED' && f.delay === 0).length / flights.length) * 100) : 0;
    const totalPax = flights.reduce((sum, f) => sum + (f.passengers || 0), 0);

    const stats = [
        { label: "Today's Flights", value: flights.length, icon: Plane, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'On-Time Rate', value: `${onTimeRate}%`, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
        { label: 'Active Delays', value: delayedCount, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
        { label: 'Cancellations', value: cancelledCount, icon: AlertTriangle, color: 'text-ram-red', bg: 'bg-red-50' },
    ];

    const statusConfig = {
        DEPARTED: { bg: 'bg-green-100', text: 'text-green-700', icon: Plane },
        ARRIVED: { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: CheckCircle },
        DELAYED: { bg: 'bg-amber-100', text: 'text-amber-700', icon: Clock },
        CANCELLED: { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle },
        SCHEDULED: { bg: 'bg-blue-100', text: 'text-blue-700', icon: Calendar }
    };

    const inputClass = (err) => `w-full px-4 py-3 bg-slate-50 border rounded-2xl font-bold text-sm transition-all ${err ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100' : 'border-slate-200 focus:border-ram-red focus:ring-2 focus:ring-ram-red/10'} focus:outline-none`;

    const renderFlightCard = (flight) => {
        const cfg = statusConfig[flight.status] || statusConfig.SCHEDULED;
        const StatusIcon = cfg.icon;
        return (
            <div key={flight.id} className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm hover:shadow-xl hover:border-ram-red/20 transition-all group relative overflow-hidden">
                {/* Hover actions */}
                <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <button onClick={(e) => { e.stopPropagation(); openEditModal(flight); }} className="p-2 bg-slate-100 hover:bg-blue-500 hover:text-white text-slate-400 rounded-xl transition-all" title="Edit">
                        <Edit3 className="w-4 h-4" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); handleDeleteFlight(flight.id); }} className="p-2 bg-slate-100 hover:bg-red-500 hover:text-white text-slate-400 rounded-xl transition-all" title="Delete">
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>

                {/* Flight header */}
                <div className="flex items-center gap-3 mb-6">
                    <div className={`p-2 rounded-xl ${cfg.bg}`}>
                        <StatusIcon className={`w-5 h-5 ${cfg.text}`} />
                    </div>
                    <div>
                        <p className="text-xl font-black text-slate-900">{flight.id}</p>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{flight.aircraft}</p>
                    </div>
                </div>

                {/* Route visualizer */}
                <div className="flex justify-between items-center mb-8 relative">
                    <div className="text-center z-10">
                        <p className="text-3xl font-black text-slate-900 tracking-tighter">{flight.origin}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Base</p>
                    </div>
                    <div className="flex-1 flex flex-col items-center px-4 relative">
                        <div className="w-full h-[2px] bg-slate-100 relative">
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2">
                                <Plane className={`w-5 h-5 text-ram-red transition-transform duration-1000 ${flight.status === 'ARRIVED' ? 'translate-x-12' : flight.status === 'DEPARTED' ? 'translate-x-2' : flight.status === 'CANCELLED' ? 'opacity-30' : '-translate-x-12'}`} />
                            </div>
                        </div>
                        <span className="mt-2 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">{flight.type}</span>
                    </div>
                    <div className="text-center z-10">
                        <p className="text-3xl font-black text-slate-900 tracking-tighter">{flight.destination}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Dest.</p>
                    </div>
                </div>

                {/* Info grid */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <div className="flex items-center gap-2 mb-1">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Sched.</span>
                        </div>
                        <span className="text-sm font-black text-slate-700">{flight.scheduled}</span>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <div className="flex items-center gap-2 mb-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Gate</span>
                        </div>
                        <span className="text-sm font-black text-slate-700">{flight.gate || 'TBA'}</span>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <div className="flex items-center gap-2 mb-1">
                            <Plane className="w-3.5 h-3.5 text-slate-400" />
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">PAX</span>
                        </div>
                        <span className="text-sm font-black text-slate-700">{flight.passengers || 0}</span>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <div className="flex items-center gap-2 mb-1">
                            <TrendingUp className="w-3.5 h-3.5 text-slate-400" />
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Cargo</span>
                        </div>
                        <span className="text-sm font-black text-slate-700">{(flight.cargo || 0).toLocaleString()} kg</span>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                    <div className="flex items-center gap-3 flex-wrap">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest ${cfg.bg} ${cfg.text}`}>
                            {flight.status}
                        </span>
                        {flight.delay > 0 && (
                            <span className="text-[10px] font-black text-ram-red bg-red-50 px-2 py-1 rounded-lg">+{flight.delay} MIN</span>
                        )}
                        {flight.actual && (
                            <span className="text-[10px] font-bold text-slate-500">Act: {flight.actual}</span>
                        )}
                    </div>
                    <button onClick={() => openDetailModal(flight)} className="p-3 bg-slate-50 hover:bg-slate-900 hover:text-white text-slate-400 rounded-xl transition-all">
                        <ArrowUpRight className="w-5 h-5" />
                    </button>
                </div>
            </div>
        );
    };

    const renderFormFields = (isEdit = false) => (
        <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Flight Number *</label>
                    <input type="text" placeholder="AT###" className={inputClass(formErrors.id)} value={formData.id} onChange={e => setFormData({...formData, id: e.target.value})} disabled={isEdit} />
                    {formErrors.id && <p className="text-red-500 text-xs mt-1 font-bold">{formErrors.id}</p>}
                </div>
                <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Aircraft Reg *</label>
                    <input type="text" placeholder="CN-XXX" className={inputClass(formErrors.aircraft)} value={formData.aircraft} onChange={e => setFormData({...formData, aircraft: e.target.value})} />
                    {formErrors.aircraft && <p className="text-red-500 text-xs mt-1 font-bold">{formErrors.aircraft}</p>}
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Origin *</label>
                    <input type="text" placeholder="CMN" className={inputClass(formErrors.origin)} value={formData.origin} onChange={e => setFormData({...formData, origin: e.target.value.toUpperCase()})} />
                    {formErrors.origin && <p className="text-red-500 text-xs mt-1 font-bold">{formErrors.origin}</p>}
                </div>
                <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Destination *</label>
                    <input type="text" placeholder="JFK" className={inputClass(formErrors.destination)} value={formData.destination} onChange={e => setFormData({...formData, destination: e.target.value.toUpperCase()})} />
                    {formErrors.destination && <p className="text-red-500 text-xs mt-1 font-bold">{formErrors.destination}</p>}
                </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
                <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Scheduled *</label>
                    <input type="time" className={inputClass(formErrors.scheduled)} value={formData.scheduled} onChange={e => setFormData({...formData, scheduled: e.target.value})} />
                    {formErrors.scheduled && <p className="text-red-500 text-xs mt-1 font-bold">{formErrors.scheduled}</p>}
                </div>
                <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Actual</label>
                    <input type="time" className={inputClass()} value={formData.actual} onChange={e => setFormData({...formData, actual: e.target.value})} />
                </div>
                <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Type</label>
                    <select className={inputClass()} value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                        <option>Short Haul</option>
                        <option>Medium Haul</option>
                        <option>Long Haul</option>
                    </select>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Status</label>
                    <select className={inputClass()} value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                        <option>SCHEDULED</option>
                        <option>DEPARTED</option>
                        <option>DELAYED</option>
                        <option>ARRIVED</option>
                        <option>CANCELLED</option>
                    </select>
                </div>
                <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Delay (min)</label>
                    <input type="number" min="0" className={inputClass()} value={formData.delay} onChange={e => setFormData({...formData, delay: e.target.value})} />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Gate</label>
                    <input type="text" placeholder="A12" className={inputClass()} value={formData.gate} onChange={e => setFormData({...formData, gate: e.target.value})} />
                </div>
                <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Terminal</label>
                    <input type="text" placeholder="T1" className={inputClass()} value={formData.terminal} onChange={e => setFormData({...formData, terminal: e.target.value})} />
                </div>
            </div>
            <div className="grid grid-cols-4 gap-4">
                <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">PAX</label>
                    <input type="number" min="0" className={inputClass()} value={formData.passengers} onChange={e => setFormData({...formData, passengers: e.target.value})} />
                </div>
                <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Cargo</label>
                    <input type="number" min="0" className={inputClass()} value={formData.cargo} onChange={e => setFormData({...formData, cargo: e.target.value})} />
                </div>
                <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Fuel</label>
                    <input type="number" min="0" className={inputClass()} value={formData.fuel} onChange={e => setFormData({...formData, fuel: e.target.value})} />
                </div>
                <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Crew</label>
                    <input type="number" min="0" className={inputClass()} value={formData.crew} onChange={e => setFormData({...formData, crew: e.target.value})} />
                </div>
            </div>
            <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Notes</label>
                <textarea rows="3" placeholder="Operational notes..." className={`${inputClass()} resize-none`} value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} />
            </div>
        </div>
    );

    return (
        <div className="bg-slate-50 min-h-screen relative">
            <Header title="Flight Operations" subtitle="Real-time monitoring of RAM global flight network" />

            {/* Toast */}
            {toast && (
                <div className={`fixed top-6 right-6 z-[60] px-6 py-4 rounded-2xl shadow-xl flex items-center gap-3 animate-bounce ${toast.type === 'warning' ? 'bg-amber-500 text-white' : 'bg-green-600 text-white'}`}>
                    {toast.type === 'warning' ? <AlertTriangle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                    <span className="font-bold text-sm">{toast.message}</span>
                </div>
            )}

            <div className="p-8 max-w-[1600px] mx-auto">
                {/* Header avec Logo - style WorkOrders */}
                <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-200 pb-8">
                    <div>
                        <div className="flex items-center gap-3 mb-3">
                            <Logo className="h-10" />
                            <div className="h-6 w-px bg-slate-200" />
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Flight Operations Control</span>
                        </div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">
                            Flight <span className="text-ram-red italic">Operations</span>
                        </h1>
                        <p className="text-xs text-slate-400 font-bold mt-2 tracking-wide">
                            {flights.length} flights tracked · {delayedCount} delayed · {cancelledCount} cancelled
                        </p>
                    </div>
                    <button
                        onClick={() => { resetForm(); setShowAddModal(true); }}
                        className="flex items-center gap-2 px-6 py-3.5 bg-ram-red text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:shadow-xl shadow-ram-red/20 transition-all active:scale-95 hover:-translate-y-0.5"
                    >
                        <Plus size={14} strokeWidth={3} /> New Flight
                    </button>
                </header>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    {stats.map((stat, i) => (
                        <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between group hover:border-ram-red/20 transition-all">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                                <p className="text-3xl font-black text-slate-900">{stat.value}</p>
                            </div>
                            <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Secondary stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {[
                        { label: 'Scheduled', value: flights.filter(f => f.status === 'SCHEDULED').length, color: 'bg-blue-500' },
                        { label: 'Departed', value: flights.filter(f => f.status === 'DEPARTED').length, color: 'bg-green-500' },
                        { label: 'Delayed', value: delayedCount, color: 'bg-amber-500' },
                        { label: 'Total PAX', value: totalPax.toLocaleString(), color: 'bg-purple-500' },
                    ].map((item, i) => (
                        <div key={i} className="bg-white rounded-2xl p-4 border border-slate-100 flex items-center gap-3">
                            <div className={`w-2 h-8 ${item.color} rounded-full`} />
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</p>
                                <p className="text-lg font-black text-slate-900">{item.value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Control Bar */}
                <div className="flex flex-col lg:flex-row justify-between items-center mb-8 gap-4 bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm">
                    <div className="flex flex-col md:flex-row gap-4 w-full lg:w-auto">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search Flight, Aircraft, Route, Gate..."
                                className="pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-ram-red/10 w-full md:w-80 font-bold text-sm"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100">
                            <Filter className="w-4 h-4 text-slate-400" />
                            <select
                                className="bg-transparent font-bold text-xs uppercase tracking-widest text-slate-600 focus:outline-none cursor-pointer"
                                value={filterStatus}
                                onChange={e => setFilterStatus(e.target.value)}
                            >
                                <option value="All">All Statuses</option>
                                <option value="SCHEDULED">Scheduled</option>
                                <option value="DEPARTED">Departed</option>
                                <option value="DELAYED">Delayed</option>
                                <option value="ARRIVED">Arrived</option>
                                <option value="CANCELLED">Cancelled</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex gap-3 w-full lg:w-auto">
                        <button
                            onClick={exportToExcel}
                            disabled={exportLoading || filteredFlights.length === 0}
                            className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all disabled:opacity-50"
                        >
                            {exportLoading ? <div className="w-4 h-4 border-2 border-slate-300 border-t-ram-red rounded-full animate-spin" /> : <FileDown className="w-4 h-4" />}
                            {exportLoading ? 'Exporting...' : 'Export Excel'}
                        </button>
                        <button
                            onClick={() => { resetForm(); setShowAddModal(true); }}
                            className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-ram-red transition-all shadow-xl shadow-slate-900/10 active:scale-95"
                        >
                            <Plus className="w-4 h-4" /> New Flight
                        </button>
                    </div>
                </div>

                {/* Results count */}
                <div className="flex items-center justify-between mb-6">
                    <p className="text-sm font-bold text-slate-500">
                        Showing <span className="text-slate-900">{filteredFlights.length}</span> of <span className="text-slate-900">{flights.length}</span> flights
                    </p>
                </div>

                {/* Flights Grid */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[3rem] border border-slate-100 shadow-sm">
                        <div className="w-12 h-12 border-4 border-slate-100 border-t-ram-red rounded-full animate-spin mb-4" />
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Accessing RAM Flight Tracking System...</p>
                    </div>
                ) : filteredFlights.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[3rem] border border-slate-100 shadow-sm">
                        <Search className="w-12 h-12 text-slate-300 mb-4" />
                        <p className="text-lg font-black text-slate-400">No flights found</p>
                        <p className="text-sm text-slate-400 mt-1">Try adjusting your search or filters</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredFlights.map(renderFlightCard)}
                    </div>
                )}
            </div>

            {/* Add Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-[3rem] p-10 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-ram-red rounded-2xl flex items-center justify-center text-white">
                                    <Plus size={20} strokeWidth={3} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black uppercase tracking-tight">Register New Flight</h2>
                                    <p className="text-slate-500 mt-1 font-medium">Complete the operational data below</p>
                                </div>
                            </div>
                            <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-all">
                                <X className="w-6 h-6 text-slate-400" />
                            </button>
                        </div>
                        {renderFormFields(false)}
                        <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-slate-100">
                            <button onClick={() => setShowAddModal(false)} className="px-8 py-3 font-black text-xs uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-all">Cancel</button>
                            <button onClick={handleAddFlight} className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-ram-red transition-all flex items-center gap-2">
                                <Save className="w-4 h-4" /> Submit Entry
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {showEditModal && selectedFlight && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-[3rem] p-10 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-ram-red rounded-2xl flex items-center justify-center text-white">
                                    <Edit3 size={20} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black uppercase tracking-tight">Edit Flight {selectedFlight.id}</h2>
                                    <p className="text-slate-500 mt-1 font-medium">Modify operational data</p>
                                </div>
                            </div>
                            <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-all">
                                <X className="w-6 h-6 text-slate-400" />
                            </button>
                        </div>
                        {renderFormFields(true)}
                        <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-slate-100">
                            <button onClick={() => setShowEditModal(false)} className="px-8 py-3 font-black text-xs uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-all">Cancel</button>
                            <button onClick={handleEditFlight} className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-ram-red transition-all flex items-center gap-2">
                                <Save className="w-4 h-4" /> Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Detail Modal */}
            {showDetailModal && selectedFlight && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-[3rem] p-10 max-w-lg w-full shadow-2xl">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-2xl ${statusConfig[selectedFlight.status]?.bg}`}>
                                    {(() => { const Icon = statusConfig[selectedFlight.status]?.icon || Plane; return <Icon className={`w-6 h-6 ${statusConfig[selectedFlight.status]?.text}`} />; })()}
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black uppercase tracking-tight">{selectedFlight.id}</h2>
                                    <p className="text-slate-500 font-medium">{selectedFlight.aircraft} · {selectedFlight.type}</p>
                                </div>
                            </div>
                            <button onClick={() => setShowDetailModal(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-all">
                                <X className="w-6 h-6 text-slate-400" />
                            </button>
                        </div>

                        <div className="flex justify-between items-center mb-8 bg-slate-50 rounded-3xl p-6">
                            <div className="text-center">
                                <p className="text-4xl font-black text-slate-900">{selectedFlight.origin}</p>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Origin</p>
                            </div>
                            <div className="flex-1 flex flex-col items-center px-6">
                                <Plane className="w-8 h-8 text-ram-red mb-2" />
                                <div className="w-full h-[2px] bg-slate-200 rounded-full" />
                            </div>
                            <div className="text-center">
                                <p className="text-4xl font-black text-slate-900">{selectedFlight.destination}</p>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Destination</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            {[
                                { label: 'Scheduled Time', value: selectedFlight.scheduled, icon: Clock },
                                { label: 'Actual Time', value: selectedFlight.actual || 'N/A', icon: CheckCircle },
                                { label: 'Status', value: selectedFlight.status, icon: AlertTriangle },
                                { label: 'Delay', value: selectedFlight.delay > 0 ? `+${selectedFlight.delay} min` : 'On Time', icon: Clock },
                                { label: 'Gate', value: selectedFlight.gate || 'TBA', icon: MapPin },
                                { label: 'Terminal', value: selectedFlight.terminal || 'TBA', icon: MapPin },
                                { label: 'Passengers', value: selectedFlight.passengers || 0, icon: Plane },
                                { label: 'Cargo', value: `${(selectedFlight.cargo || 0).toLocaleString()} kg`, icon: TrendingUp },
                                { label: 'Fuel', value: `${(selectedFlight.fuel || 0).toLocaleString()} L`, icon: TrendingUp },
                                { label: 'Crew', value: selectedFlight.crew || 0, icon: Plane },
                            ].map((item, i) => (
                                <div key={i} className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                    <div className="flex items-center gap-2 mb-2">
                                        <item.icon className="w-3.5 h-3.5 text-slate-400" />
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{item.label}</span>
                                    </div>
                                    <span className="text-sm font-black text-slate-700">{item.value}</span>
                                </div>
                            ))}
                        </div>

                        {selectedFlight.notes && (
                            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 mb-6">
                                <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">Notes</p>
                                <p className="text-sm font-medium text-amber-800">{selectedFlight.notes}</p>
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button onClick={() => { setShowDetailModal(false); openEditModal(selectedFlight); }} className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-ram-red transition-all">
                                <Edit3 className="w-4 h-4" /> Edit
                            </button>
                            <button onClick={() => { setShowDetailModal(false); handleDeleteFlight(selectedFlight.id); }} className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-50 text-red-600 border border-red-100 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-100 transition-all">
                                <Trash2 className="w-4 h-4" /> Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManagerFlights;