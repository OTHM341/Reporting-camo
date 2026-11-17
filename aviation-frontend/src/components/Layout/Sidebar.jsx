import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import {
    LayoutDashboard,
    Plane,
    Route,
    Wrench,
    AlertTriangle,
    Users,
    ClipboardList,
    Package,
    LogOut,
    ChevronLeft,
    ChevronRight,
    Shield,
    FileText,
    Activity,
    Briefcase,
    Home,
    Settings,
    Database
} from 'lucide-react';
import Logo from '../UI/Logo';

const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'MANAGER', 'TECHNICIAN'] },
    
    // Admin Specific
    { path: '/admin/users', label: 'Access Control', icon: Shield, roles: ['ADMIN'] },
    { path: '/admin/import', label: 'Data Management', icon: Database, roles: ['ADMIN'] },

    { path: '/aircraft', label: 'Aircraft', icon: Plane, roles: ['ADMIN', 'MANAGER'] },
    { path: '/flights', label: 'Flights', icon: Route, roles: ['ADMIN', 'MANAGER'] },
    { path: '/maintenance', label: 'Maintenance', icon: Wrench, roles: ['ADMIN', 'MANAGER'] },
    { path: '/defects', label: 'Defects', icon: AlertTriangle, roles: ['ADMIN', 'MANAGER', 'TECHNICIAN'] },
    { path: '/work-orders', label: 'Work Orders', icon: ClipboardList, roles: ['ADMIN', 'MANAGER', 'TECHNICIAN'] },
    { path: '/work-packages', label: 'Work Packages', icon: Package, roles: ['ADMIN', 'MANAGER', 'TECHNICIAN'] },

    { path: '/manager/flights', label: 'Flight Ops', icon: Route, roles: ['MANAGER'] },
    { path: '/manager/maintenance', label: 'Maint. Oversight', icon: Wrench, roles: ['MANAGER'] },
    { path: '/reliability', label: 'Reliability', icon: AlertTriangle, roles: ['MANAGER'] },
    { path: '/manager/workforce', label: 'Workforce', icon: Briefcase, roles: ['MANAGER'] },
    { path: '/manager/reports', label: 'Reports & KPIs', icon: FileText, roles: ['MANAGER'] },
    
    { path: '/technician/tasks', label: 'My Tasks', icon: Activity, roles: ['TECHNICIAN'] },
    { path: '/technician/work-packages', label: 'My Packages', icon: Package, roles: ['TECHNICIAN'] },
    { path: '/technician/report-defect', label: 'Report Defect', icon: AlertTriangle, roles: ['TECHNICIAN'] },

    { path: '/employees', label: 'Employees', icon: Users, roles: ['ADMIN', 'MANAGER'] },
];

const Sidebar = () => {
    const [collapsed, setCollapsed] = useState(false);
    const { user, logout, hasRole } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const filteredMenu = menuItems.filter(item =>
        item.roles.some(role => hasRole?.(role))
    );

    return (
        <aside
            className={`bg-white border-r border-gray-200 h-screen flex flex-col transition-all duration-300 ${
                collapsed ? 'w-20' : 'w-64'
            }`}
        >
            {/* Logo Section */}
            <div className="h-20 flex items-center justify-between px-4 border-b border-gray-100 bg-slate-50/50">
                {!collapsed && (
                    <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/dashboard')}>
                        <div className="transition-transform hover:scale-105">
                                <Logo className="h-10" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-black text-sm tracking-tighter text-slate-900 leading-none">ROYAL AIR MAROC</span>
                            <span className="text-[10px] font-bold text-ram-red tracking-widest uppercase">Operations</span>
                        </div>
                    </div>
                )}
                {collapsed && (
                    <div className="mx-auto cursor-pointer" onClick={() => navigate('/dashboard')}>
                        <Logo className="h-10" />
                    </div>
                )}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="p-1 hover:bg-gray-100 rounded-lg text-gray-400 ml-2"
                >
                    {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto custom-scrollbar">
                {/* Back to Site Link */}
                <button
                    onClick={() => navigate('/')}
                    className={`flex items-center gap-3 w-full px-3 py-2 text-slate-400 hover:text-ram-red hover:bg-red-50 rounded-xl transition-all mb-4 ${
                        collapsed ? 'justify-center' : ''
                    }`}
                >
                    <Home className="w-5 h-5" />
                    {!collapsed && <span className="text-sm font-bold">Public Portal</span>}
                </button>

                <div className="h-px bg-slate-100 my-4 mx-2" />

                {filteredMenu.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;

                    return (
                        <button
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl transition-all group ${
                                isActive 
                                ? 'bg-ram-red text-white shadow-lg shadow-ram-red/20' 
                                : 'text-slate-500 hover:bg-slate-50 hover:text-ram-red'
                            } ${collapsed ? 'justify-center' : ''}`}
                            title={collapsed ? item.label : ''}
                        >
                            <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : 'group-hover:scale-110 transition-transform'}`} />
                            {!collapsed && <span className="text-sm font-bold tracking-tight">{item.label}</span>}
                        </button>
                    );
                })}
            </nav>

            {/* User Profile */}
            <div className="border-t border-gray-100 p-4 bg-slate-50/50">
                <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
                    <div className="w-10 h-10 bg-ram-red rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                        <Shield className="w-5 h-5 text-white" />
                    </div>
                    {!collapsed && (
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-black text-slate-900 truncate uppercase tracking-tighter">
                                {user?.firstName} {user?.lastName}
                            </p>
                            <div className="flex flex-wrap gap-1 mt-1">
                                {user?.roles?.map(role => (
                                    <span key={role} className="text-[8px] bg-white text-ram-red border border-ram-red/20 px-1.5 py-0.5 rounded-md font-black tracking-widest">
                                        {role}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                {!collapsed && (
                    <button
                        onClick={logout}
                        className="mt-4 flex items-center justify-center gap-2 text-xs font-black text-slate-400 hover:text-ram-red transition-all w-full py-2 rounded-xl hover:bg-red-50 uppercase tracking-widest"
                    >
                        <LogOut className="w-3.5 h-3.5" />
                        Sign Out
                    </button>
                )}
                {collapsed && (
                    <button
                        onClick={logout}
                        className="mt-4 w-full flex justify-center p-2 text-slate-400 hover:text-ram-red hover:bg-red-50 rounded-xl transition-colors"
                        title="Sign Out"
                    >
                        <LogOut className="w-5 h-5" />
                    </button>
                )}
            </div>
        </aside>
    );
};

export default Sidebar;