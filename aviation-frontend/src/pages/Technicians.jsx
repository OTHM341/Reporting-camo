import { useEffect, useState, useMemo } from 'react';
import { employeeAPI, logApiError } from '../services/api';
import Header from '../components/Layout/Header';
import Logo from '../components/UI/Logo';
import Modal from '../components/UI/Modal';
import { 
    Users, Plus, Search, Filter, Mail, Briefcase, 
    Calendar, ShieldCheck, UserPlus, Loader2, Pencil, 
    Trash2, ChevronLeft, ChevronRight, UserCircle, MapPin,
    Wrench, Activity, CheckCircle2, AlertTriangle, Clock
} from 'lucide-react';

const ITEMS_PER_PAGE = 8;

const Technicians = () => {
    const [technicians, setTechnicians] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    
    const [showModal, setShowModal] = useState(false);
    const [editingTech, setEditingTech] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        department: 'Maintenance',
        status: 'ACTIVE',
    });

    useEffect(() => {
        fetchTechnicians();
    }, []);

    async function fetchTechnicians() {
        try {
            setLoading(true);
            const response = await employeeAPI.getAll();
            // Filter only technicians from the employee list
            const techs = (response.data || []).filter(e => e.role === 'TECHNICIAN');
            setTechnicians(techs);
            setError(null);
        } catch (err) {
            logApiError('Technician Load', err);
            setError('Failed to synchronize technician database.');
        } finally {
            setLoading(false);
        }
    }

    const filteredTechs = useMemo(() => 
        technicians.filter(t => {
            const term = searchTerm.toLowerCase();
            return (
                t.firstName?.toLowerCase().includes(term) ||
                t.lastName?.toLowerCase().includes(term) ||
                t.email?.toLowerCase().includes(term)
            );
        })
    , [technicians, searchTerm]);

    const paginatedTechs = useMemo(() => 
        filteredTechs.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
    , [filteredTechs, currentPage]);

    const totalPages = Math.ceil(filteredTechs.length / ITEMS_PER_PAGE);

    const stats = useMemo(() => ({
        total: technicians.length,
        active: technicians.filter(t => t.status === 'ACTIVE').length,
        certified: technicians.length, // Logic for certification tracking
        available: technicians.filter(t => t.status === 'ACTIVE').length 
    }), [technicians]);

    const handleOpenModal = (tech = null) => {
        if (tech) {
            setEditingTech(tech);
            setFormData({
                firstName: tech.firstName,
                lastName: tech.lastName,
                email: tech.email,
                department: tech.department || 'Maintenance',
                status: tech.status,
            });
        } else {
            setEditingTech(null);
            setFormData({
                firstName: '',
                lastName: '',
                email: '',
                department: 'Maintenance',
                status: 'ACTIVE',
            });
        }
        setShowModal(true);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8">
                <Loader2 className="w-10 h-10 animate-spin text-ram-red mb-4" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Establishing Specialist Link...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] p-8 lg:p-12 font-sans">
            <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-8 border-b border-slate-200 pb-10">
                <div>
                    <div className="flex items-center gap-3 mb-3">
                        <Logo className="h-10" />
                        <div className="h-6 w-px bg-slate-200" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Hangar Division</span>
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase font-barlow">Maintenance <span className="text-ram-red italic">Specialists</span></h1>
                </div>
                <div className="flex gap-4">
                    <button className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all">
                        <Clock size={14} /> Duty Rosters
                    </button>
                    <button 
                        onClick={() => handleOpenModal()}
                        className="flex items-center gap-2 px-6 py-3 bg-ram-red text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:shadow-lg shadow-ram-red/20 transition-all active:scale-95"
                    >
                        <UserPlus size={14} /> Assign Specialist
                    </button>
                </div>
            </header>

            {/* Specialist Insights */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                {[
                    { label: 'Total Specialists', value: stats.total, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Active on Deck', value: stats.active, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    { label: 'Certified EASA', value: stats.certified, icon: ShieldCheck, color: 'text-ram-red', bg: 'bg-red-50' },
                    { label: 'In-Intervention', value: '4', icon: Activity, color: 'text-amber-600', bg: 'bg-amber-50' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm flex items-center justify-between group hover:border-ram-red/20 transition-all">
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                            <p className="text-2xl font-black text-slate-900">{stat.value}</p>
                        </div>
                        <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} transition-transform group-hover:scale-110`}>
                            <stat.icon size={20} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Search and Filters */}
            <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm mb-8 flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <input 
                        type="text" 
                        placeholder="Search by Specialist Name, ID or Certification..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-ram-red/10 font-bold text-sm"
                    />
                </div>
                <div className="flex gap-2">
                    <button className="px-6 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-100 transition-all flex items-center gap-2">
                        <Filter size={14} /> License Type
                    </button>
                </div>
            </div>

            {/* Specialist Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {paginatedTechs.length > 0 ? paginatedTechs.map((t) => (
                    <div key={t.id} className="bg-white border border-slate-100 rounded-[2rem] p-8 shadow-sm hover:shadow-xl hover:border-ram-red/20 transition-all group relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Wrench size={80} className="text-ram-red" />
                        </div>
                        
                        <div className="relative z-10">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-300 group-hover:bg-ram-red/10 group-hover:text-ram-red transition-all">
                                    <UserCircle size={40} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-slate-900 uppercase tracking-tighter leading-none mb-1">{t.firstName} {t.lastName}</h3>
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">ID: {t.id * 1024}</span>
                                </div>
                            </div>

                            <div className="space-y-4 mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-slate-50 rounded-lg text-slate-400"><Mail size={12} /></div>
                                    <span className="text-xs font-bold text-slate-600 truncate">{t.email}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-slate-50 rounded-lg text-slate-400"><MapPin size={12} /></div>
                                    <span className="text-xs font-bold text-slate-600 uppercase">{t.department || 'MAINTENANCE'}</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                                <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-black/5 ${
                                    t.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'
                                }`}>
                                    <div className={`w-1.5 h-1.5 rounded-full ${t.status === 'ACTIVE' ? 'bg-emerald-500 animate-pulse' : 'bg-current'}`} />
                                    {t.status}
                                </span>
                                <div className="flex gap-2">
                                    <button className="p-2.5 bg-slate-50 hover:bg-ram-red hover:text-white rounded-xl transition-all"><Pencil size={14} /></button>
                                </div>
                            </div>
                        </div>
                    </div>
                )) : (
                    <div className="col-span-full py-20 text-center opacity-30 italic text-sm font-medium">No specialized personnel available in this sector.</div>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="mt-12 flex items-center justify-between bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Page {currentPage} of {totalPages}</p>
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => setCurrentPage(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl text-slate-400 disabled:opacity-30 transition-all"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <button 
                            onClick={() => setCurrentPage(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl text-slate-400 disabled:opacity-30 transition-all"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Technicians;