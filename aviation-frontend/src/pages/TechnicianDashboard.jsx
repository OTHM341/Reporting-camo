import { useState, useEffect, useMemo } from 'react';
import {
    ClipboardList,
    CheckCircle,
    Clock,
    AlertTriangle,
    Pause,
    ExternalLink,
    Plane,
    Search,
    Loader2,
    ShieldAlert,
    Activity,
    Wrench,
    Navigation,
    Layers,
    CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/useAuth';
import { workOrderAPI, defectAPI, logApiError } from '../services/api';
import Logo from '../components/UI/Logo';
import { filterDefectsByUser, filterWorkOrdersByUser, getTechnicianName } from '../utils/roleUtils';

const TechnicianDashboard = () => {
    const { user } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [recentDefects, setRecentDefects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dutyStatus, setDutyStatus] = useState('On Duty');
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        fetchTechnicianData();
        return () => clearInterval(timer);
    }, []);

    async function fetchTechnicianData() {
        try {
            setLoading(true);
            const [ordersRes, defectsRes] = await Promise.all([
                workOrderAPI.getAll(),
                defectAPI.getAll()
            ]);

            // Use role utilities for consistent filtering
            const allWorkOrders = ordersRes.data || [];
            const allDefects = defectsRes.data || [];
            
            const myTasks = filterWorkOrdersByUser(allWorkOrders, user);
            const myDefects = filterDefectsByUser(allDefects, user);

            setTasks(myTasks);
            setRecentDefects(myDefects);
        } catch (err) {
            logApiError('Technician Dashboard Load', err);
        } finally {
            setLoading(false);
        }
    }

    const activeTask = useMemo(() => tasks.find(t => t.status === 'IN_PROGRESS') || tasks[0], [tasks]);

    const kpis = useMemo(() => ([
        { label: 'Assigned Orders', value: tasks.length, icon: ClipboardList, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Completed (MTD)', value: tasks.filter(t => t.status === 'COMPLETED').length, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'Reported Defects', value: recentDefects.length, icon: ShieldAlert, color: 'text-ram-red', bg: 'bg-red-50' },
        { label: 'In Progress', value: tasks.filter(t => t.status === 'IN_PROGRESS').length, icon: Activity, color: 'text-amber-600', bg: 'bg-amber-50' },
    ]), [tasks, recentDefects]);

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-slate-50">
                <Loader2 className="w-10 h-10 animate-spin text-ram-red mb-4" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Synchronizing Workforce Terminal...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] p-8 lg:p-12 font-sans">
            {/* Header Area */}
            <header className="mb-12 flex flex-col xl:flex-row xl:items-center justify-between gap-8 border-b border-slate-200 pb-10">
                <div className="flex items-center gap-8">
                    <div className="transition-transform hover:scale-105">
                        <Logo className="h-14" />
                    </div>
                    <div className="h-12 w-px bg-slate-200 hidden lg:block" />
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="px-2 py-0.5 bg-ram-red text-white text-[8px] font-black uppercase tracking-widest rounded border border-ram-red flex items-center gap-1.5">
                                <div className="w-1 h-1 bg-white rounded-full animate-pulse" />
                                On Duty
                            </span>
                            <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">Technician Terminal</span>
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">
                            Welcome back, <span className="text-ram-red italic">{user?.firstName}</span>
                        </h1>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="bg-white border border-slate-200 rounded-2xl px-6 py-3 flex items-center gap-8 shadow-sm">
                        <div className="flex flex-col items-end border-r border-slate-100 pr-6">
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Station Time</span>
                            <span className="font-mono text-lg font-black text-slate-700 leading-none">{currentTime.toLocaleTimeString('fr-FR', {hour:'2-digit', minute:'2-digit', second:'2-digit'})}</span>
                        </div>
                        <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-200">
                            {['On Duty', 'Break', 'Off'].map(s => (
                                <button
                                    key={s}
                                    onClick={() => setDutyStatus(s)}
                                    className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
                                        dutyStatus === s ? 'bg-ram-red text-white shadow-md shadow-ram-red/20' : 'text-slate-400 hover:text-slate-600'
                                    }`}
                                >{s}</button>
                            ))}
                        </div>
                    </div>
                </div>
            </header>

            {/* KPI Cluster */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {kpis.map((kpi, i) => (
                    <div key={i} className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm flex items-center justify-between group hover:border-ram-red/20 transition-all">
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
                {/* Current Mission Hero */}
                <div className="xl:col-span-2 space-y-8">
                    {activeTask ? (
                        <div className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:scale-110 transition-transform duration-1000">
                                <Plane size={300} />
                            </div>
                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-12">
                                    <div>
                                        <span className="px-3 py-1 bg-ram-red/20 text-ram-red text-[9px] font-black uppercase tracking-[0.2em] rounded-lg border border-ram-red/30 mb-4 inline-block">Current Assignment</span>
                                        <h2 className="text-5xl font-black tracking-tighter uppercase mb-2">WO-{activeTask.id}</h2>
                                        <div className="flex items-center gap-4 text-white/50 text-xs font-bold uppercase tracking-widest">
                                            <span className="flex items-center gap-2 text-ram-red"><Plane size={14} /> {activeTask.aircraftRegistration}</span>
                                            <div className="w-1 h-1 bg-white/20 rounded-full" />
                                            <span>{activeTask.title}</span>
                                        </div>
                                    </div>
                                    <div className="bg-white/5 p-4 rounded-[2rem] border border-white/10 backdrop-blur-xl flex flex-col items-center min-w-[120px]">
                                        <span className="text-[9px] font-black text-white/30 uppercase mb-1">Time on Task</span>
                                        <span className="text-xl font-mono font-black text-white">00:42:15</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                                    <button className="flex items-center justify-center gap-3 py-5 bg-ram-red text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl hover:bg-white hover:text-ram-red transition-all shadow-xl shadow-ram-red/20 active:scale-95">
                                        <CheckCircle size={18} /> Complete Mission
                                    </button>
                                    <button className="flex items-center justify-center gap-3 py-5 bg-white/10 border border-white/10 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl hover:bg-white/20 transition-all active:scale-95">
                                        <Pause size={18} /> Suspend Work
                                    </button>
                                </div>
                                
                                <div className="p-6 bg-white/5 rounded-3xl border border-white/5">
                                    <div className="flex justify-between items-end mb-4">
                                        <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Task Integrity Index</span>
                                        <span className="text-sm font-black">{activeTask.progress}%</span>
                                    </div>
                                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                        <div className="h-full bg-ram-red transition-all duration-1000 shadow-[0_0_15px_rgba(196,30,58,0.5)]" style={{ width: `${activeTask.progress}%` }} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white border border-dashed border-slate-200 rounded-[3rem] p-20 text-center">
                            <Activity size={48} className="text-slate-200 mx-auto mb-6" />
                            <p className="text-slate-400 font-black text-xs uppercase tracking-[0.4em]">No Active Mission Assigned</p>
                        </div>
                    )}

                    {/* Quick Access Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white border border-slate-100 p-8 rounded-[2.5rem] shadow-sm group hover:border-ram-red/20 transition-all">
                            <div className="flex justify-between items-center mb-8">
                                <div className="p-4 bg-red-50 rounded-2xl text-ram-red group-hover:scale-110 transition-transform">
                                    <ShieldAlert size={24} />
                                </div>
                                <ArrowRight size={20} className="text-slate-200 group-hover:text-ram-red transition-all" />
                            </div>
                            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-2">Technical Logging</h3>
                            <p className="text-xs text-slate-500 font-medium leading-relaxed">Report newly discovered defects or airworthiness concerns immediately.</p>
                        </div>

                        <div className="bg-white border border-slate-100 p-8 rounded-[2.5rem] shadow-sm group hover:border-blue-600/20 transition-all">
                            <div className="flex justify-between items-center mb-8">
                                <div className="p-4 bg-blue-50 rounded-2xl text-blue-600 group-hover:scale-110 transition-transform">
                                    <Search size={24} />
                                </div>
                                <ArrowRight size={20} className="text-slate-200 group-hover:text-blue-600 transition-all" />
                            </div>
                            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-2">Technical Library</h3>
                            <p className="text-xs text-slate-500 font-medium leading-relaxed">Access MEL, CDL, and maintenance manuals for fleet specifications.</p>
                        </div>
                    </div>
                </div>

                {/* Right Sidebar Intelligence */}
                <div className="space-y-8">
                    <div className="bg-white border border-slate-200 rounded-[3rem] p-10 shadow-sm">
                        <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-10 flex items-center gap-3">
                            <Activity size={20} className="text-ram-red" /> Assigned Cluster
                        </h4>
                        <div className="space-y-6">
                            {tasks.slice(0, 4).map((task, i) => (
                                <div key={i} className="group p-5 bg-slate-50 border border-slate-100 rounded-3xl hover:bg-white hover:border-ram-red/20 transition-all cursor-pointer">
                                    <div className="flex justify-between items-start mb-3">
                                        <span className="text-[10px] font-black text-slate-900 uppercase">WO-{task.id}</span>
                                        <div className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tighter ${
                                            task.priority === 'CRITICAL' ? 'bg-red-500 text-white' : 'bg-slate-200 text-slate-600'
                                        }`}>
                                            {task.priority}
                                        </div>
                                    </div>
                                    <p className="text-xs font-bold text-slate-600 uppercase mb-2 group-hover:text-ram-red transition-colors tracking-tighter">{task.aircraftRegistration}</p>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                            <span className="text-[9px] font-black text-slate-400 uppercase">{task.status}</span>
                                        </div>
                                        <ExternalLink size={12} className="text-slate-300 group-hover:text-ram-red" />
                                    </div>
                                </div>
                            ))}
                            {tasks.length === 0 && (
                                <p className="text-[10px] font-bold text-slate-400 uppercase text-center py-10 tracking-[0.2em]">Queue Clear</p>
                            )}
                        </div>
                    </div>

                    <div className="bg-[#1E293B] rounded-[3rem] p-10 text-white shadow-xl relative overflow-hidden">
                         <div className="absolute bottom-[-10%] right-[-10%] opacity-5">
                            <ShieldAlert size={150} />
                         </div>
                         <h4 className="text-[11px] font-black text-white/30 uppercase tracking-[0.3em] mb-8">Safety Awareness</h4>
                         <p className="text-xs font-medium leading-relaxed text-white/80 italic border-l-4 border-ram-red pl-6 mb-8">
                            "Human performance is the strongest link in our safety chain. Ensure rigorous check-list compliance."
                         </p>
                         <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                            <Clock size={16} className="text-ram-red" />
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest">Handover Alert</p>
                                <p className="text-[9px] text-white/40 font-bold uppercase">45 mins to shift change</p>
                            </div>
                         </div>
                    </div>
                </div>
            </div>

            <footer className="mt-20 pt-10 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-8 opacity-40">
                <div className="flex items-center gap-4">
                    <Logo className="h-8 grayscale" />
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em]">Integrated CAMO Network Infrastructure</span>
                </div>
                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-2">
                        <Lock size={14} className="text-slate-400" />
                        <span className="text-[9px] font-black uppercase tracking-widest">Encrypted Station Node 4</span>
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-widest">© 2024 Royal Air Maroc</span>
                </div>
            </footer>
        </div>
    );
};

export default TechnicianDashboard;