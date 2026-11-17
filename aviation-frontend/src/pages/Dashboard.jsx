import { useState, useEffect, useMemo } from 'react';
import {
    Plane, AlertTriangle, CheckCircle2, Clock, ArrowUpRight, ArrowDownRight,
    MapPin, Wind, ChevronRight, Zap, ShieldAlert,
    BarChart3, Users, Wrench, Timer, Target, Globe, Server,
    Database, ShieldCheck, Cpu, ExternalLink, Lock, Radio, Wifi, HardDrive,
    Cloud, ChevronDown, Filter, RefreshCw, FileText, AlertOctagon,
    Layers, Gauge, ArrowRight
} from 'lucide-react';
import { aircraftAPI, flightAPI, defectAPI, maintenanceAPI, logApiError } from '../services/api';
import { useAppData } from '../context/AppDataContext';
import Logo from '../components/UI/Logo';


const AnimatedCounter = ({ value, duration = 1000, suffix = '', prefix = '' }) => {
    const [count, setCount] = useState(0);
    useEffect(() => {
        let start = 0;
        const end = parseInt(value) || 0;
        if (end === 0) { setCount(0); return; }
        const inc = Math.max(1, Math.floor(end / (duration / 16)));
        const timer = setInterval(() => {
            start = Math.min(start + inc, end);
            setCount(start);
            if (start >= end) clearInterval(timer);
        }, 16);
        return () => clearInterval(timer);
    }, [value, duration]);
    return <span>{prefix}{count}{suffix}</span>;
};

// ═══════════════════════════════════════════════════════════════
//  SPARKLINE AREA CHART
// ═══════════════════════════════════════════════════════════════
const SparkArea = ({ data, color = '#dc2626', w = 55, h = 22 }) => {
    if (!data || data.length < 2) return <div style={{ width: w, height: h }} />;
    const max = Math.max(...data), min = Math.min(...data);
    const range = max - min || 1;
    const step = w / (data.length - 1);
    const pts = data.map((v, i) => `${i * step},${h - 3 - ((v - min) / range) * (h - 6)}`).join(' ');
    const area = `0,${h} ${pts} ${w},${h}`;
    const gid = `g-${color.slice(1)}-${Math.random().toString(36).slice(2, 6)}`;
    return (
        <svg width={w} height={h} className="overflow-visible">
            <defs><linearGradient id={gid} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity="0.25" /><stop offset="100%" stopColor={color} stopOpacity="0" /></linearGradient></defs>
            <polygon points={area} fill={`url(#${gid})`} />
            <polyline fill="none" stroke={color} strokeWidth="1.5" points={pts} strokeLinecap="round" strokeLinejoin="round" />
            <circle cx={w} cy={h - 3 - ((data[data.length - 1] - min) / range) * (h - 6)} r="2.5" fill={color} stroke="white" strokeWidth="1.5" />
        </svg>
    );
};

// ═══════════════════════════════════════════════════════════════
//  GLASS KPI CARD
// ═══════════════════════════════════════════════════════════════
const KpiCard = ({ label, value, sub, trend, trendUp, icon: Icon, color = 'red', spark }) => {
    const colors = {
        red: { a: '#dc2626', bg: 'from-red-500/5', border: 'border-red-200', light: '#fef2f2' },
        amber: { a: '#d97706', bg: 'from-amber-500/5', border: 'border-amber-200', light: '#fffbeb' },
        green: { a: '#059669', bg: 'from-emerald-500/5', border: 'border-emerald-200', light: '#ecfdf5' },
        blue: { a: '#2563eb', bg: 'from-blue-500/5', border: 'border-blue-200', light: '#eff6ff' },
        violet: { a: '#7c3aed', bg: 'from-violet-500/5', border: 'border-violet-200', light: '#f5f3ff' },
        slate: { a: '#475569', bg: 'from-slate-500/5', border: 'border-slate-200', light: '#f8fafc' },
    };
    const c = colors[color];
    return (
        <div className={`relative bg-white/90 backdrop-blur-sm rounded-xl p-3.5 border ${c.border} hover:shadow-lg hover:shadow-${color}-500/5 transition-all duration-300 group overflow-hidden`}>
            <div className={`absolute inset-0 bg-gradient-to-br ${c.bg} to-transparent opacity-0 group-hover:opacity-100 transition-opacity`} />
            <div className="absolute top-0 right-0 w-20 h-20 rounded-full opacity-30 -translate-y-1/2 translate-x-1/2 group-hover:scale-125 transition-transform duration-500" style={{ backgroundColor: c.light }} />
            <div className="relative z-10">
                <div className="flex justify-between items-start mb-2">
                    <div className="p-1.5 rounded-lg" style={{ backgroundColor: c.light }}><Icon size={15} style={{ color: c.a }} /></div>
                    {spark && <SparkArea data={spark} color={c.a} />}
                </div>
                <div className="flex items-end justify-between gap-2">
                    <div className="min-w-0">
                        <div className="text-xl font-black text-slate-900 tracking-tight truncate">{typeof value === 'number' ? <AnimatedCounter value={value} suffix={sub?.includes('%') ? '%' : ''} /> : value}</div>
                        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-0.5 truncate">{label}</div>
                    </div>
                    {trend && (
                        <div className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[9px] font-black shrink-0 ${trendUp ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                            {trendUp ? <ArrowUpRight size={9} /> : <ArrowDownRight size={9} />}{trend}
                        </div>
                    )}
                </div>
                {sub && !sub.includes('%') && <div className="text-[9px] font-semibold text-slate-400 mt-1.5 pt-1.5 border-t border-slate-100 truncate">{sub}</div>}
            </div>
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════
//  STATUS PILL
// ═══════════════════════════════════════════════════════════════
const StatusPill = ({ status }) => {
    const map = {
        DEPARTED: { c: '#2563eb', bg: '#eff6ff', l: 'DEP', dot: 'bg-blue-500' },
        ARRIVED: { c: '#059669', bg: '#ecfdf5', l: 'ARR', dot: 'bg-emerald-500' },
        DELAYED: { c: '#d97706', bg: '#fffbeb', l: 'DLY', dot: 'bg-amber-500' },
        CANCELLED: { c: '#dc2626', bg: '#fef2f2', l: 'CXL', dot: 'bg-red-500' },
        SCHEDULED: { c: '#64748b', bg: '#f8fafc', l: 'SCH', dot: 'bg-slate-400' },
        BOARDING: { c: '#7c3aed', bg: '#f5f3ff', l: 'BRD', dot: 'bg-violet-500' },
        IN_FLIGHT: { c: '#0891b2', bg: '#ecfeff', l: 'IFR', dot: 'bg-cyan-500' },
    };
    const c = map[status] || map.SCHEDULED;
    const live = ['DEPARTED', 'BOARDING', 'IN_FLIGHT'].includes(status);
    return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider" style={{ color: c.c, backgroundColor: c.bg }}>
            <span className={`w-1 h-1 rounded-full ${c.dot} ${live ? 'animate-pulse' : ''}`} />{c.l}
        </span>
    );
};

// ═══════════════════════════════════════════════════════════════
//  SEVERITY CHIP
// ═══════════════════════════════════════════════════════════════
const SevChip = ({ severity }) => {
    const map = {
        CRITICAL: { c: '#dc2626', bg: '#fef2f2', i: AlertOctagon },
        MAJOR: { c: '#dc2626', bg: '#fef2f2', i: AlertTriangle },
        MINOR: { c: '#d97706', bg: '#fffbeb', i: AlertTriangle },
        INFO: { c: '#2563eb', bg: '#eff6ff', i: FileText },
    };
    const c = map[severity] || map.INFO;
    const I = c.i;
    return <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter" style={{ color: c.c, backgroundColor: c.bg }}><I size={8} />{severity}</span>;
};

// ═══════════════════════════════════════════════════════════════
//  PROGRESS BAR
// ═══════════════════════════════════════════════════════════════
const Bar = ({ value, color, h = 'h-1' }) => (
    <div className={`w-full ${h} bg-slate-100 rounded-full overflow-hidden`}><div className={`${h} rounded-full transition-all duration-700`} style={{ width: `${value}%`, backgroundColor: color }} /></div>
);

// ═══════════════════════════════════════════════════════════════
//  FLIGHT ROW
// ═══════════════════════════════════════════════════════════════
const FlightRow = ({ flight }) => {
    const [open, setOpen] = useState(false);
    const edge = { DEPARTED: 'border-l-blue-500', ARRIVED: 'border-l-emerald-500', DELAYED: 'border-l-amber-500', CANCELLED: 'border-l-red-500', SCHEDULED: 'border-l-slate-400', BOARDING: 'border-l-violet-500', IN_FLIGHT: 'border-l-cyan-500' };
    return (
        <div className={`border-l-[3px] ${edge[flight.status] || 'border-l-slate-300'} bg-white hover:bg-slate-50/60 transition-colors`}>
            <div className="px-3 py-2.5 flex items-center justify-between cursor-pointer" onClick={() => setOpen(!open)}>
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex flex-col min-w-[52px]">
                        <span className="text-xs font-black text-slate-900">{flight.id}</span>
                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">{flight.reg}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600">
                        <span className="text-slate-900">{flight.route.split('→')[0]?.trim()}</span>
                        <ArrowRight size={10} className="text-slate-300" />
                        <span className="text-slate-900">{flight.route.split('→')[1]?.trim()}</span>
                    </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                        <div className="font-mono text-[11px] font-bold text-slate-700">{flight.time}</div>
                        {flight.delay > 0 && <div className="text-[8px] font-bold text-red-500">+{flight.delay}m</div>}
                    </div>
                    <StatusPill status={flight.status} />
                    <ChevronDown size={12} className={`text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
                </div>
            </div>
            {open && (
                <div className="px-3 pb-2.5 pt-0 border-t border-slate-50">
                    <div className="flex gap-4 mt-2 text-[9px] text-slate-500 font-medium">
                        <span className="flex items-center gap-1"><MapPin size={9} /> Gate A12</span>
                        <span className="flex items-center gap-1"><Users size={9} /> 142 PAX</span>
                        <span className="flex items-center gap-1"><Wind size={9} /> WX OK</span>
                        <span className="flex items-center gap-1"><Plane size={9} /> {flight.aircraft}</span>
                    </div>
                </div>
            )}
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════
//  MAIN DASHBOARD
// ═══════════════════════════════════════════════════════════════
const Dashboard = () => {
    const { state: globalState } = useAppData();
    const [flights, setFlights] = useState([]);
    const [aircraft, setAircraft] = useState([]);
    const [defects, setDefects] = useState([]);
    const [maintenance, setMaintenance] = useState([]);
    const [loading, setLoading] = useState(true);
    const [time, setTime] = useState(new Date());
    const [refreshing, setRefreshing] = useState(false);
    const [filter, setFilter] = useState('ALL');

    useEffect(() => { const t = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(t); }, []);

    const load = async (spin = false) => {
        if (spin) setRefreshing(true);
        try {
            const [fr, ar, dr, mr] = await Promise.all([flightAPI.getAll(), aircraftAPI.getAll(), defectAPI.getAll(), maintenanceAPI.getAll()]);
            setFlights(fr.data || []); setAircraft(ar.data || []); setDefects(dr.data || []); setMaintenance(mr.data || []);
        } catch (e) { logApiError('Dashboard', e); }
        finally { setLoading(false); if (spin) setTimeout(() => setRefreshing(false), 600); }
    };
    useEffect(() => { load(); const i = setInterval(() => load(), 30000); return () => clearInterval(i); }, []);

    // Merge global store maintenance data the same way Maintenance.jsx does,
    // so the totals shown here always match the Maintenance page.
    useEffect(() => {
        if (globalState.maintenance && globalState.maintenance.length > 0) {
            setMaintenance(prev => {
                const mappedGlobalMaintenance = globalState.maintenance.map(m => ({
                    id: m.ID || m.id,
                    aircraftRegistration: m.Aircraft || m.aircraftRegistration,
                    aircraftType: m.Aircraft_Type || m.aircraftType,
                    maintenanceType: m.Maintenance_Type || m.maintenanceType,
                    description: m.Task_Description || m.description,
                    startDate: m.Scheduled_Date || m.startDate,
                    status: m.Status || m.status,
                    technicianName: m.Technician || m.technicianName,
                    numTechnicians: m.Num_Technicians || m.numTechnicians,
                    estimatedDurationHours: m.Estimated_Duration_Hours || m.estimatedDurationHours,
                    priority: m.Priority || m.priority,
                    estimatedCostMAD: m.Estimated_Cost_MAD || m.estimatedCostMAD,
                    location: m.Location || m.location,
                    complianceReference: m.Compliance_Reference || m.complianceReference,
                }));
                const existingIds = new Set(prev.map(m => m.id));
                const newMaintenance = mappedGlobalMaintenance.filter(m => !existingIds.has(m.id));
                return [...prev, ...newMaintenance];
            });
        }
    }, [globalState.maintenance]);

    const kpi = useMemo(() => {
        const total = aircraft.length;
        const active = aircraft.filter(a => ['ACTIVE', 'IN_FLIGHT'].includes(a.status)).length;
        const mx = aircraft.filter(a => a.status === 'MAINTENANCE').length;
        const aog = aircraft.filter(a => ['GROUNDED', 'AOG'].includes(a.status)).length;
        const arr = flights.filter(f => f.status === 'ARRIVED');
        const otp = arr.length ? Math.round((arr.filter(f => !f.delayMinutes || f.delayMinutes < 15).length / arr.length) * 100) : 95;
        const open = defects.filter(d => d.status === 'OPEN').length;
        const crit = defects.filter(d => ['MAJOR', 'CRITICAL'].includes(d.severity) && d.status === 'OPEN').length;
        // Same total as Maintenance.jsx's stats.total (= maintenance.length)
        const maintTotal = maintenance.length;
        const maintInProgress = maintenance.filter(m => m.status === 'IN_PROGRESS').length;
        return {
            total, active, mx, aog, otp,
            today: flights.length,
            live: flights.filter(f => ['DEPARTED', 'BOARDING', 'IN_FLIGHT'].includes(f.status)).length,
            open, crit,
            dly: flights.filter(f => f.status === 'DELAYED').length,
            cxl: flights.filter(f => f.status === 'CANCELLED').length,
            avail: total ? Math.round((active / total) * 100) : 0,
            maintTotal, maintInProgress
        };
    }, [aircraft, flights, defects, maintenance]);

    const pflights = useMemo(() => {
        const f = filter === 'ALL' ? flights : flights.filter(x => x.status === filter);
        return f.slice(0, 12).map(f => ({
            id: f.flightNumber || 'N/A', route: `${f.origin || '---'} → ${f.destination || '---'}`,
            status: f.status || 'SCHEDULED', reg: f.aircraftRegistration || 'TBD',
            time: f.scheduledDeparture ? new Date(f.scheduledDeparture).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '--:--',
            delay: f.delayMinutes || 0, aircraft: f.aircraftType || 'B738'
        }));
    }, [flights, filter]);

    const alerts = useMemo(() => defects.filter(d => d.status === 'OPEN').sort((a, b) => {
        const o = { CRITICAL: 0, MAJOR: 1, MINOR: 2, INFO: 3 };
        return (o[a.severity] || 4) - (o[b.severity] || 4);
    }).slice(0, 6), [defects]);

    const filters = ['ALL', ...new Set(flights.map(f => f.status).filter(Boolean))];

    if (loading) return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
            <div className="relative mb-5">
                <div className="w-14 h-14 border-2 border-slate-200 border-t-red-600 rounded-full animate-spin" />
                <Cpu className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 text-red-600 animate-pulse" />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Syncing...</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* HEADER */}
            <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
                <div className="max-w-[1600px] mx-auto px-3 lg:px-5">
                    <div className="flex items-center justify-between h-12">
                        <div className="flex items-center gap-3">
                            <Logo className="h-7" />
                            <div className="h-4 w-px bg-slate-200 hidden sm:block" />
                            <div className="hidden sm:flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Live</span>
                            </div>
                            <h1 className="text-xs font-black text-slate-900 uppercase tracking-tight hidden md:block">Technical <span className="text-red-600">Ops</span></h1>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => load(true)} className={`p-1.5 rounded-lg hover:bg-slate-100 transition-colors ${refreshing ? 'animate-spin' : ''}`}>
                                <RefreshCw size={13} className="text-slate-500" />
                            </button>
                            <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 bg-slate-100 rounded-md">
                                <Clock size={11} className="text-slate-500" />
                                <span className="font-mono text-[11px] font-bold text-slate-700">{time.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-1 max-w-[1600px] mx-auto w-full px-3 lg:px-5 py-4">
                {/* KPI ROW */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 mb-4">
                    <KpiCard label="Fleet Avail." value={kpi.total} sub={`${kpi.active} actifs`} trend="+2%" trendUp icon={Plane} color="green" spark={[82, 85, 84, 87, 89, 88, 90, 91]} />
                    <KpiCard label="On-Time %" value={kpi.otp} sub={`${kpi.today} flights`} trend="+1.2%" trendUp icon={Target} color="blue" spark={[91, 92, 90, 93, 94, 93, 95, 95]} />
                    <KpiCard label="Open Defects" value={kpi.open} sub={`${kpi.crit} critical`} trend={kpi.crit ? "Alert" : "OK"} trendUp={!kpi.crit} icon={ShieldAlert} color="red" spark={[14, 12, 15, 11, 13, 10, 12, 11]} />
                    <KpiCard label="Active" value={kpi.active} sub={`${kpi.active}/64 AC`} trend="Live" trendUp icon={Radio} color="violet" spark={[9, 11, 10, 12, 13, 11, 14, 12]} />                    <KpiCard label="Maint." value={kpi.maintTotal} sub={`${kpi.maintInProgress} in progress`} trend="Stable" trendUp icon={Wrench} color="amber" spark={[4, 5, 4, 6, 5, 4, 5, 4]} />
                    <KpiCard label="Network" value={kpi.today} sub={`${kpi.cxl} cxl`} trend="+5%" trendUp icon={Globe} color="slate" spark={[48, 50, 49, 52, 54, 51, 55, 53]} />
                </div>

                {/* MAIN GRID */}
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
                    {/* LEFT - 8 COLS */}
                    <div className="xl:col-span-8 space-y-4">
                        {/* FLIGHTS */}
                        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                            <div className="px-3 py-2.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                                <div className="flex items-center gap-2">
                                    <Globe size={13} className="text-blue-600" />
                                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-tight">Flight Monitor</h3>

                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Filter size={10} className="text-slate-400" />
                                    <select value={filter} onChange={e => setFilter(e.target.value)} className="text-[9px] font-bold text-slate-600 bg-white border border-slate-200 rounded-md px-1.5 py-0.5 uppercase tracking-wider focus:outline-none focus:ring-1 focus:ring-blue-500/30">
                                        {filters.map(f => <option key={f} value={f}>{f}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="divide-y divide-slate-100">
                                {pflights.length ? pflights.map((f, i) => <FlightRow key={i} flight={f} />) : (
                                    <div className="px-3 py-10 text-center"><Plane size={20} className="text-slate-300 mx-auto mb-1" /><p className="text-[10px] text-slate-400">No flights</p></div>
                                )}
                            </div>
                            {flights.length > pflights.length && (
                                <div className="px-3 py-2 border-t border-slate-100 bg-slate-50/30 text-center">
                                    <button className="text-[9px] font-black text-slate-500 uppercase tracking-wider hover:text-red-600 transition-colors flex items-center justify-center gap-1 mx-auto">
                                        View All {flights.length} <ChevronRight size={10} />
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* BOTTOM ROW */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm">
                                <div className="flex items-center gap-1.5 mb-3">
                                    <BarChart3 size={12} className="text-slate-400" />
                                    <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-wider">Fleet Status</h4>
                                </div>
                                <div className="space-y-2.5">
                                    {[
                                        { l: 'Active / In-Flight', v: kpi.active, m: kpi.total, c: '#059669' },
                                        { l: 'Maintenance', v: kpi.mx, m: kpi.total, c: '#d97706' },
                                        { l: 'Grounded / AOG', v: kpi.aog, m: kpi.total, c: '#dc2626' },
                                    ].map((x, i) => (
                                        <div key={i}>
                                            <div className="flex justify-between text-[9px] font-bold text-slate-500 mb-1">
                                                <span>{x.l}</span>
                                                <span>{x.v}<span className="text-slate-300">/{x.m}</span></span>
                                            </div>
                                            <Bar value={x.m ? (x.v / x.m) * 100 : 0} color={x.c} h="h-1.5" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm">
                                <div className="flex items-center gap-1.5 mb-3">
                                    <Gauge size={12} className="text-slate-400" />
                                    <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-wider">Ops Metrics</h4>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    {[
                                        { l: 'OTP', v: `${kpi.otp}%`, i: Target, col: 'text-emerald-600', bg: 'bg-emerald-50' },
                                        { l: 'Delayed', v: kpi.dly, i: Clock, col: 'text-amber-600', bg: 'bg-amber-50' },
                                        { l: 'Cancelled', v: kpi.cxl, i: AlertTriangle, col: 'text-red-600', bg: 'bg-red-50' },
                                        { l: 'Turn', v: '45m', i: Timer, col: 'text-blue-600', bg: 'bg-blue-50' },
                                    ].map((x, i) => (
                                        <div key={i} className={`${x.bg} rounded-lg p-2.5 border border-black/[0.03]`}>
                                            <x.i size={13} className={`${x.col} mb-1`} />
                                            <div className="text-base font-black text-slate-900">{x.v}</div>
                                            <div className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">{x.l}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT - 4 COLS */}
                    <div className="xl:col-span-4 space-y-3">
                        {/* ALERTS */}
                        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                            <div className="px-3 py-2.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                                <div className="flex items-center gap-2">
                                    <Zap size={13} className="text-red-600" />
                                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-tight">Intelligence</h4>
                                </div>
                                <span className="text-[9px] font-black text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">{kpi.open} Open</span>
                            </div>
                            <div className="divide-y divide-slate-100">
                                {alerts.length ? alerts.map((d, i) => (
                                    <div key={i} className="px-3 py-2.5 hover:bg-slate-50 transition-colors cursor-pointer group">
                                        <div className="flex items-center justify-between gap-2 mb-1">
                                            <div className="flex items-center gap-1.5 min-w-0">
                                                <span className="text-[10px] font-black text-slate-900 truncate">{d.aircraftRegistration || 'ASSET'}</span>
                                                <span className="text-[8px] font-bold text-slate-400 shrink-0">{d.system || 'SYS'}</span>
                                            </div>
                                            <SevChip severity={d.severity} />
                                        </div>
                                        <p className="text-[10px] font-medium text-slate-500 leading-snug line-clamp-2 group-hover:text-slate-700">{d.description}</p>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="text-[8px] font-bold text-slate-400 flex items-center gap-0.5"><Clock size={7} /> 17 juin – 27 juin 2026</span>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="px-3 py-6 text-center">
                                        <CheckCircle2 size={20} className="text-emerald-400 mx-auto mb-1.5" />
                                        <p className="text-[9px] font-black text-emerald-600 uppercase tracking-wider">Nominal</p>
                                    </div>
                                )}
                            </div>
                            <button className="w-full py-2 bg-slate-900 text-white text-[9px] font-black uppercase tracking-[0.15em] hover:bg-red-600 transition-colors flex items-center justify-center gap-1.5">
                                <FileText size={11} /> Archive <ExternalLink size={9} />
                            </button>
                        </div>

                        {/* SYSTEM HEALTH */}
                        <div className="bg-slate-900 rounded-xl p-3.5 text-white shadow-lg relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-28 h-28 bg-red-600/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                            <div className="relative z-10">
                                <div className="flex items-center gap-1.5 mb-3">
                                    <Server size={12} className="text-red-400" />
                                    <h4 className="text-[10px] font-black text-white/30 uppercase tracking-[0.15em]">System Health</h4>
                                </div>
                                <div className="space-y-3">
                                    {[
                                        { l: 'Database', v: 98, i: Database, c: '#22c55e' },
                                        { l: 'Security', v: 100, i: Lock, c: '#22c55e' },
                                        { l: 'API Gateway', v: 94, i: Wifi, c: '#22c55e' },
                                        { l: 'Storage', v: 87, i: HardDrive, c: '#eab308' },
                                        { l: 'CDN', v: 99, i: Cloud, c: '#22c55e' },
                                    ].map((x, i) => (
                                        <div key={i}>
                                            <div className="flex justify-between items-center mb-1">
                                                <div className="flex items-center gap-1.5">
                                                    <x.i size={10} className="text-white/25" />
                                                    <span className="text-[9px] font-bold text-white/40 uppercase tracking-wider">{x.l}</span>
                                                </div>
                                                <span className="text-[10px] font-black" style={{ color: x.c }}>{x.v}%</span>
                                            </div>
                                            <Bar value={x.v} color={x.c} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* QUICK ACTIONS */}
                        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm">
                            <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-2">Quick Actions</h4>
                            <div className="grid grid-cols-2 gap-1.5">
                                {[
                                    { l: 'New Defect', i: AlertTriangle, col: 'text-red-600', bg: 'bg-red-50' },
                                    { l: 'Schedule MX', i: Wrench, col: 'text-amber-600', bg: 'bg-amber-50' },
                                    { l: 'Fleet Rpt', i: FileText, col: 'text-blue-600', bg: 'bg-blue-50' },
                                    { l: 'Ops Brief', i: Layers, col: 'text-violet-600', bg: 'bg-violet-50' },
                                    { l: 'Rapport BI', i: BarChart3, col: 'text-yellow-600', bg: 'bg-yellow-50', external: 'https://app.powerbi.com/groups/me/reports/e88aa7db-5ea4-4552-b309-7fdcd7231665/b9c0f3a452b1708e5bae?experience=power-bi&redirectedFromSignup=1,1' },
                                ].map((x, i) => (
                                    x.external ? (
                                        <a key={i} href={x.external} target="_blank" rel="noopener noreferrer" className={`${x.bg} rounded-lg p-2 hover:shadow-sm transition-all text-left group border border-black/[0.03] block no-underline`}>
                                            <x.i size={12} className={`${x.col} mb-1 group-hover:scale-110 transition-transform`} />
                                            <div className="text-[8px] font-black text-slate-700 uppercase tracking-wider flex items-center gap-0.5">
                                                {x.l} <ExternalLink size={7} className="text-slate-400" />
                                            </div>
                                        </a>
                                    ) : (
                                        <button key={i} className={`${x.bg} rounded-lg p-2 hover:shadow-sm transition-all text-left group border border-black/[0.03]`}>
                                            <x.i size={12} className={`${x.col} mb-1 group-hover:scale-110 transition-transform`} />
                                            <div className="text-[8px] font-black text-slate-700 uppercase tracking-wider">{x.l}</div>
                                        </button>
                                    )
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* FOOTER */}
            <footer className="bg-white border-t border-slate-200 mt-auto">
                <div className="max-w-[1600px] mx-auto px-3 lg:px-5 py-3">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
                        <div className="flex items-center gap-2">
                            <Logo className="h-4 grayscale opacity-40" />
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em]">CAMO Network</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1"><ShieldCheck size={10} className="text-emerald-500" /><span className="text-[8px] font-black text-slate-500 uppercase tracking-wider">EASA Part-CAMO</span></div>
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider">© 2024 RAM</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Dashboard;