import { ShieldCheck, AlertCircle, ExternalLink, Download, Search, Filter, Clock, Plane, FileText, ChevronRight } from 'lucide-react';
import Header from '../components/Layout/Header';
import Logo from '../components/UI/Logo';

const Compliance = () => {
    const directives = [
        { id: 'AD 2024-11-05', source: 'EASA', aircraft: 'B737 Fleet', desc: 'Inspection of Engine Fuel Suction Feed', limit: '30 Days', status: 'Pending', criticality: 'MANDATORY' },
        { id: 'SB 737-53A1402', source: 'BOEING', aircraft: 'CN-RGN, CN-RGO', desc: 'Fuselage Skin Inspection at Stringer 14', limit: '500 FH', status: 'In Progress', criticality: 'URGENT' },
        { id: 'AD 2023-22-01', source: 'FAA', aircraft: 'B787 Fleet', desc: 'Decompression Panel Verification', limit: 'Complied', status: 'Closed', criticality: 'CLOSED' },
        { id: 'SB 787-12-05', source: 'BOEING', aircraft: 'CN-RGB', desc: 'Software Update for Avionics System', limit: 'Next A-Check', status: 'Pending', criticality: 'OPTIONAL' },
    ];

    return (
        <div className="min-h-screen bg-[#F8FAFC] p-8 lg:p-12 font-sans">
            <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-8 border-b border-slate-200 pb-10">
                <div>
                    <div className="flex items-center gap-3 mb-3">
                        <Logo className="h-10" />
                        <div className="h-6 w-px bg-slate-200" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Regulatory Oversight</span>
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase font-barlow">Compliance <span className="text-ram-red italic">Audit</span></h1>
                </div>
                <div className="flex gap-4">
                    <button className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all">
                        <Download size={14} /> Full Audit Log
                    </button>
                    <button className="flex items-center gap-2 px-6 py-3 bg-ram-red text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:shadow-lg shadow-ram-red/20 transition-all active:scale-95">
                        <ShieldCheck size={14} /> New Directive Entry
                    </button>
                </div>
            </header>

            {/* Compliance Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                {[
                    { label: 'Overall Compliance', value: '98.8%', icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    { label: 'Open Directives', value: '14', icon: AlertCircle, color: 'text-ram-red', bg: 'bg-red-50' },
                    { label: 'Pending SBs', value: '28', icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Last Audit Date', value: '24 MAY', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
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

            {/* Control Strip */}
            <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm mb-8 flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <input 
                        type="text" 
                        placeholder="Search AD/SB Number, Aircraft or Source..."
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-ram-red/10 font-bold text-sm"
                    />
                </div>
                <button className="px-6 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-100 transition-all flex items-center gap-2">
                    <Filter size={14} /> Regulatory Source
                </button>
            </div>

            {/* Directives Table */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Regulatory Reference</th>
                                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Applicability</th>
                                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Limit / Deadline</th>
                                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Criticality</th>
                                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Access</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {directives.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-10 py-8">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-ram-red group-hover:bg-ram-red group-hover:text-white transition-all shadow-sm">
                                                <FileText size={22} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-slate-900 uppercase">{item.id}</p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.source} ISSUED</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <div className="flex items-center gap-3">
                                            <Plane size={14} className="text-slate-300" />
                                            <div>
                                                <p className="text-xs font-black text-slate-700 uppercase tracking-tight">{item.aircraft}</p>
                                                <p className="text-[10px] font-medium text-slate-400 max-w-[180px] truncate">{item.desc}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8 font-mono text-xs font-black text-slate-600">
                                        {item.limit}
                                    </td>
                                    <td className="px-10 py-8">
                                        <span className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-tighter border ${
                                            item.criticality === 'MANDATORY' ? 'bg-red-50 text-red-700 border-red-100' : 
                                            item.criticality === 'URGENT' ? 'bg-orange-50 text-orange-700 border-orange-100' : 
                                            item.criticality === 'CLOSED' ? 'bg-slate-100 text-slate-400' : 'bg-blue-50 text-blue-700 border-blue-100'
                                        }`}>
                                            {item.criticality}
                                        </span>
                                    </td>
                                    <td className="px-10 py-8">
                                        <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border border-black/5 ${
                                            item.status === 'Closed' ? 'bg-emerald-50 text-emerald-600' : 
                                            item.status === 'Pending' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
                                        }`}>
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="px-10 py-8 text-right">
                                        <button className="p-3 bg-white border border-slate-100 text-slate-400 hover:text-ram-red rounded-xl transition-all shadow-sm">
                                            <ChevronRight size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Footer Certification */}
            <div className="mt-20 pt-10 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-8 opacity-40">
                <div className="flex items-center gap-4">
                    <Logo className="h-8 grayscale" />
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Official Regulatory Portal</span>
                </div>
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <ShieldCheck size={14} className="text-emerald-500" />
                        <span className="text-[9px] font-black uppercase tracking-widest">EASA Part-CAMO Compliant</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Compliance;