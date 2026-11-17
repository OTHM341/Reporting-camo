import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import {
  LayoutDashboard,
  Plane,
  AlertCircle,
  AlertTriangle,
  ClipboardList,
  ShieldCheck,
  BarChart3,
  Package,
  Wrench,
  Route,
  Users,
  LogOut,
  User
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout, hasRole } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const roleLabel = user?.roles?.[0] || 'User';
  const displayName = user?.firstName && user?.lastName
    ? `${user.firstName} ${user.lastName}`
    : user?.username || 'Guest';

  const allMenuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', roles: [] },
    { icon: Plane, label: 'Fleet', path: '/aircraft', roles: [] },
    { icon: Route, label: 'Flights', path: '/flights', roles: [] },
    { icon: Wrench, label: 'Maintenance', path: '/maintenance', roles: [] },
    { icon: AlertCircle, label: 'Defects', path: '/defects', roles: [] },
    { icon: ClipboardList, label: 'Work Orders', path: '/work-orders', roles: [] },
    { icon: ShieldCheck, label: 'Compliance', path: '/compliance', roles: [] },
    { icon: BarChart3, label: 'Reliability', path: '/reliability', roles: [] },
    { icon: Package, label: 'Inventory', path: '/inventory', roles: [] },
    { icon: Users, label: 'Employees', path: '/employees', roles: ['ADMIN', 'MANAGER'] },
    // Technician-specific menu items
    { icon: ClipboardList, label: 'My Tasks', path: '/technician/tasks', roles: ['TECHNICIAN'] },
    { icon: AlertTriangle, label: 'Report Defect', path: '/technician/report-defect', roles: ['TECHNICIAN'] },
    { icon: Package, label: 'My Packages', path: '/technician/work-packages', roles: ['TECHNICIAN'] },
  ];

  const menuItems = allMenuItems.filter(item => {
    if (item.roles.length === 0) return true;
    return item.roles.some(role => hasRole(role));
  });

  return (
    <aside className="w-64 bg-slate-900 h-screen sticky top-0 flex flex-col shadow-sidebar shrink-0">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8 px-2">
          <div className="w-9 h-9 bg-ram-red rounded-lg flex items-center justify-center font-black text-white shadow-lg shadow-ram-red/20 text-sm">R</div>
          <div className="flex flex-col">
            <span className="text-white font-black tracking-tighter text-lg leading-none">RAM</span>
            <span className="text-[8px] text-ram-red font-bold uppercase tracking-widest">CAMO Ops</span>
          </div>
        </div>

        <nav className="space-y-0.5">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                flex items-center gap-3 px-3.5 py-2.5 rounded-lg transition-all font-bold text-xs
                ${isActive
                  ? 'bg-ram-red text-white shadow-md shadow-ram-red/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'}
              `}
            >
              <item.icon size={16} strokeWidth={2.5} />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-4">
        <div className="mb-3 px-3.5 py-3 rounded-xl bg-white/5 border border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-ram-red/20 rounded-full flex items-center justify-center">
              <User className="w-3.5 h-3.5 text-ram-red" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-white truncate">{displayName}</div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{roleLabel}</div>
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3.5 py-2.5 w-full text-slate-500 font-bold text-xs hover:text-ram-red hover:bg-white/5 rounded-lg transition-all group"
        >
          <LogOut size={16} className="group-hover:-translate-x-0.5 transition-transform" />
          Sign Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;