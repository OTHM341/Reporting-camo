import { useAuth } from '../context/useAuth';
import { User, Mail, Shield, UserCircle, Briefcase, Calendar, MapPin, Settings, LogOut, CheckCircle2 } from 'lucide-react';
import Logo from '../components/UI/Logo';

const Profile = () => {
    const { user, logout } = useAuth();

    const detailItems = [
        { label: 'Username Identity', value: user?.username, icon: UserCircle },
        { label: 'Corporate Email', value: user?.email, icon: Mail },
        { label: 'Functional Unit', value: user?.department || 'TECHNICAL SERVICES', icon: Briefcase },
        { label: 'Operational Hub', value: 'CASABLANCA (CMN)', icon: MapPin },
        { label: 'Enrollment Status', value: 'VERIFIED', icon: CheckCircle2, color: 'text-emerald-500' },
    ];

    return (
        <div className="min-h-screen bg-[#F8FAFC] p-8 lg:p-12 font-sans">
            <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-8 border-b border-slate-200 pb-10">
                <div>
                    <div className="flex items-center gap-3 mb-3">
                        <Logo className="h-10" />
                        <div className="h-6 w-px bg-slate-200" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Operator Account</span>
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">My <span className="text-ram-red italic">Profile</span></h1>
                </div>
                <div className="flex gap-4">
                    <button className="px-6 py-3 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm">
                        <Settings size={14} /> Account Settings
                    </button>
                    <button 
                        onClick={logout}
                        className="px-6 py-3 bg-ram-red text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:shadow-lg shadow-ram-red/20 transition-all active:scale-95 flex items-center gap-2"
                    >
                        <LogOut size={14} /> Terminate Session
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
                {/* Profile Identity Card */}
                <div className="xl:col-span-1 space-y-8">
                    <div className="bg-white border border-slate-100 rounded-[3rem] p-12 shadow-sm flex flex-col items-center text-center relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Shield size={120} className="text-ram-red" />
                        </div>
                        
                        <div className="relative mb-8">
                            <div className="w-32 h-32 bg-slate-50 rounded-[2.5rem] border-4 border-white shadow-xl flex items-center justify-center text-slate-300 relative z-10">
                                <UserCircle size={80} className="opacity-20" />
                            </div>
                            <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-2 rounded-xl shadow-lg border-4 border-white z-20">
                                <CheckCircle2 size={16} />
                            </div>
                        </div>

                        <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-2">
                            {user?.firstName} {user?.lastName}
                        </h2>
                        <div className="flex flex-wrap justify-center gap-2 mb-8">
                            {user?.roles?.map(role => (
                                <span key={role} className="px-3 py-1 bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest rounded-lg">
                                    {role}
                                </span>
                            ))}
                        </div>
                        
                        <div className="w-full space-y-4">
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Station Access</span>
                                <span className="text-xs font-black text-slate-700">LEVEL 4-A</span>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">PostgreSQL Auth</span>
                                <span className="text-xs font-black text-emerald-600">ENCRYPTED</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Account Details & Logs */}
                <div className="xl:col-span-2 space-y-8">
                    <div className="bg-white border border-slate-100 rounded-[3rem] p-12 shadow-sm">
                        <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-10 flex items-center gap-4">
                            <Shield className="w-6 h-6 text-ram-red" /> Operational Credentials
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                            {detailItems.map((item, idx) => (
                                <div key={idx} className="group border-b border-slate-50 pb-6">
                                    <div className="flex items-center gap-4 mb-2">
                                        <div className="p-2 bg-slate-50 rounded-lg text-slate-400 group-hover:bg-ram-red/10 group-hover:text-ram-red transition-all">
                                            <item.icon size={16} />
                                        </div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</p>
                                    </div>
                                    <p className={`text-sm font-black uppercase tracking-tight pl-10 ${item.color || 'text-slate-700'}`}>
                                        {item.value || 'NOT_SPECIFIED'}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-slate-900 rounded-[3rem] p-12 text-white shadow-2xl relative overflow-hidden">
                        <Logo className="absolute bottom-[-20%] right-[-10%] h-64 opacity-5" />
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-8">
                                <h4 className="text-lg font-black uppercase tracking-tight flex items-center gap-3">
                                    <Calendar className="w-5 h-5 text-ram-red" /> Session Security Log
                                </h4>
                                <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.4em]">Audit Trail Active</span>
                            </div>
                            <div className="space-y-4">
                                {[
                                    { event: 'Induction Verified', time: 'SYSTEM_START' },
                                    { event: 'PostgreSQL Cluster Synced', time: 'ACTIVE_LINK' },
                                    { event: 'Institutional Key Provisioned', time: 'SECURE_NODE' },
                                ].map((log, i) => (
                                    <div key={i} className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5">
                                        <span className="text-xs font-bold text-white/60">{log.event}</span>
                                        <span className="font-mono text-[10px] text-ram-red">{log.time}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <footer className="mt-20 pt-10 border-t border-slate-200 flex items-center justify-between opacity-40">
                <div className="flex items-center gap-4">
                    <Logo className="h-8 grayscale" />
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Personnel Management Infrastructure</span>
                </div>
                <div className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-emerald-500" />
                    <span className="text-[9px] font-black uppercase tracking-widest">Profile Identity Confirmed</span>
                </div>
            </footer>
        </div>
    );
};

export default Profile;