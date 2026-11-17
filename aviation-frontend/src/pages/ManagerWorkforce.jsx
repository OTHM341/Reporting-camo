import { useEffect, useState, useMemo } from 'react';
import {
    Users,
    CheckCircle,
    Clock,
    Wrench,
    Search,
    ArrowUpRight,
    ArrowDownRight,
    Briefcase,
    CalendarDays,
    Plus,
    Filter,
    Mail,
    ShieldCheck,
    Loader2,
    Activity,
    BarChart3,
    Pencil  // ← AJOUTÉ ICI
} from 'lucide-react';
import { employeeAPI, logApiError } from '../services/api';
import Header from '../components/Layout/Header';
import Logo from '../components/UI/Logo';

const ManagerWorkforce = () => {
    const [technicians, setTechnicians] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterSpecialization, setFilterSpecialization] = useState('All');

    useEffect(() => {
        fetchTechnicians();
    }, []);

    async function fetchTechnicians() {
        try {
            setLoading(true);
            const response = await employeeAPI.getAll();
            const techs = (response.data || []).filter(e => e.role === 'TECHNICIAN');
            setTechnicians(techs);
            setError(null);
        } catch (err) {
            logApiError('Workforce Load', err);
            setError('Failed to synchronize workforce database.');
        } finally {
            setLoading(false);
        }
    }

    const filteredTechnicians = useMemo(() =>
            technicians.filter(tech => {
                const name = `${tech.firstName} ${tech.lastName}`.toLowerCase();
                const matchesSearch = name.includes(searchTerm.toLowerCase()) ||
                    tech.email?.toLowerCase().includes(searchTerm.toLowerCase());
                const matchesSpecialization = filterSpecialization === 'All' || tech.department === filterSpecialization;
                return matchesSearch && matchesSpecialization;
            })
        , [technicians, searchTerm, filterSpecialization]);

    const kpis = useMemo(() => ([
        { label: 'Total Specialists', value: technicians.length, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Active on Duty', value: technicians.filter(t => t.status === 'ACTIVE').length, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'Workload Balance', value: '84%', icon: Activity, color: 'text-ram-red', bg: 'bg-red-50' },
        { label: 'Efficiency (MTD)', value: '92%', icon: BarChart3, color: 'text-amber-600', bg: 'bg-amber-50' },
    ]), [technicians]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8">
                <Loader2 className="w-10 h-10 animate-spin text-ram-red mb-4" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Establishing Workforce Link...</p>
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
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Resource Planning</span>
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase font-sans">Workforce <span className="text-ram-red italic">Logistics</span></h1>
                </div>
                <div className="flex gap-4">
                    <button className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all">
                        <CalendarDays size={14} /> View Rosters
                    </button>
                    <button className="flex items-center gap-2 px-6 py-3 bg-ram-red text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:shadow-lg shadow-ram-red/20 transition-all active:scale-95">
                        <Briefcase size={14} /> New Assignment
                    </button>
                </div>
            </header>

            {/* KPI Cluster */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {kpis.map((kpi, index) => (
                    <div key={index} className="bg-white border border-slate-100 p-8 rounded-[2rem] shadow-sm flex items-center justify-between group hover:border-ram-red/20 transition-all">
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{kpi.label}</p>
                            <p className="text-3xl font-black text-slate-900 tabular-nums">{kpi.value}</p>
                        </div>
                        <div className={`p-4 rounded-2xl ${kpi.bg} ${kpi.color} transition-transform group-hover:scale-110`}>
                            <kpi.icon size={24} />
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
                {/* Main Table */}
                <div className="xl:col-span-2 bg-white border border-slate-200 rounded-[2.5rem] shadow-sm overflow-hidden flex flex-col">
                    <div className="p-10 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center bg-slate-50/30 gap-6">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-ram-red shadow-sm">
                                <Users size={20} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Personnel Roster</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Live Maintenance Specialists</p>
                            </div>
                        </div>
                        <div className="relative w-full md:w-64">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                            <input
                                type="text"
                                placeholder="Search Name or ID..."
                                className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-ram-red/10 outline-none font-bold text-xs"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Specialist</th>
                                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Sector</th>
                                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Efficiency</th>
                                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                            {filteredTechnicians.length > 0 ? filteredTechnicians.map((tech) => (
                                <tr key={tech.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-10 py-8">
                                        <div className="flex items-center gap-5">
                                            <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-ram-red group-hover:text-white transition-all shadow-sm">
                                                <Users size={20} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-slate-900 uppercase">{tech.firstName} {tech.lastName}</p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase">ID: {tech.id * 1024}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8 text-xs font-black text-slate-600 uppercase tracking-widest">
                                        {tech.department || 'MAINTENANCE'}
                                    </td>
                                    <td className="px-10 py-8">
                                        <div className="flex flex-col items-center gap-2">
                                            <span className="text-xs font-black text-slate-700">92%</span>
                                            <div className="w-16 h-1 bg-slate-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-ram-red w-[92%]" />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                            <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border border-black/5 ${
                                                tech.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'
                                            }`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${tech.status === 'ACTIVE' ? 'bg-emerald-500 animate-pulse' : 'bg-current'}`} />
                                                {tech.status}
                                            </span>
                                    </td>
                                    <td className="px-10 py-8 text-right">
                                        <button className="p-3 bg-white border border-slate-100 text-slate-400 hover:text-ram-red rounded-xl shadow-sm transition-all">
                                            <Pencil size={16} />
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" className="px-10 py-24 text-center opacity-30 italic text-sm font-medium uppercase tracking-[0.4em]">No active personnel in sector.</td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Sidebar Intelligence */}
                <div className="space-y-10">
                    <div className="bg-slate-900 rounded-[3.5rem] p-10 text-white shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:scale-110 transition-transform duration-1000">
                            <ShieldCheck size={200} />
                        </div>
                        <div className="relative z-10">
                            <h4 className="text-[11px] font-black text-white/30 uppercase tracking-[0.3em] mb-12 flex items-center gap-3">
                                <Briefcase size={14} className="text-ram-red" /> Operational Health
                            </h4>
                            <div className="space-y-10">
                                {[
                                    { label: 'Workforce Stability', val: 98 },
                                    { label: 'Task Throughput', val: 86 },
                                    { label: 'Certification Level', val: 100 },
                                ].map((item, i) => (
                                    <div key={i}>
                                        <div className="flex justify-between items-end mb-4">
                                            <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{item.label}</span>
                                            <span className="text-xs font-black">{item.val}%</span>
                                        </div>
                                        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                            <div className="h-full bg-ram-red transition-all duration-1000 shadow-[0_0_15px_rgba(232,55,42,0.4)]" style={{ width: `${item.val}%` }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-[3rem] p-10 shadow-sm">
                        <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-10 flex items-center gap-3">
                            <Clock size={20} className="text-ram-red" /> Active Shifts
                        </h4>
                        <div className="space-y-6">
                            {[
                                { title: 'Technical Hangar 1', desc: '14 Specialists Active' },
                                { title: 'Avionics Lab B', desc: '4 Specialists Active' },
                                { title: 'Engine Workshop', desc: '6 Specialists Active' },
                            ].map((shift, i) => (
                                <div key={i} className="p-5 bg-slate-50 border border-slate-100 rounded-3xl group hover:border-ram-red/20 transition-all cursor-default">
                                    <p className="text-xs font-black text-slate-900 uppercase mb-1">{shift.title}</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{shift.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManagerWorkforce;