import { Bell, Search, User, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/useAuth';
import Logo from '../UI/Logo';

const TopBar = () => {
    const { user } = useAuth();
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const roleLabel = user?.roles?.[0] || 'User';
    const displayName = user?.firstName && user?.lastName
        ? `${user.firstName} ${user.lastName}`
        : user?.username || 'Guest';

    return (
        <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-6 lg:px-8 shrink-0">
            <div className="flex items-center gap-4">
                {/* Mobile Logo Visibility */}
                <div className="md:hidden flex items-center gap-2">
                    <Logo className="h-6" />
                </div>
                
                <div className="hidden md:flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="font-mono">
                        {currentTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="text-slate-200">|</span>
                    <span>
                        {currentTime.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}
                    </span>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative hidden sm:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Quick search..."
                        className="pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 placeholder-slate-400 outline-none focus:ring-2 focus:ring-ram-red/10 focus:border-ram-red/20 w-56 transition-all"
                    />
                </div>

                <button className="relative p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-ram-red rounded-full ring-2 ring-white"></span>
                </button>

                <div className="flex items-center gap-3 pl-4 border-l border-slate-100">
                    <div className="w-8 h-8 bg-ram-red/10 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-ram-red" />
                    </div>
                    <div className="hidden md:block text-right">
                        <div className="text-xs font-bold text-slate-900 leading-tight">{displayName}</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{roleLabel}</div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default TopBar;