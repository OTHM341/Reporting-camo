import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import PrivateRoute from './PrivateRoute';
import RoleRoute from './RoleRoute';
import { useAuth } from '../context/useAuth';

// Public Pages
import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';

// Shared Protected Pages
import Dashboard from '../pages/Dashboard';
import Aircraft from '../pages/Aircraft';
import Flights from '../pages/Flights';
import Maintenance from '../pages/Maintenance';
import Defects from '../pages/Defects';
import Employees from '../pages/Employees';
import Technicians from '../pages/Technicians';
import WorkOrders from '../pages/WorkOrders';
import WorkPackages from '../pages/WorkPackages';
import Profile from '../pages/Profile';
import Reliability from '../pages/Reliability';
import NotFound from '../pages/NotFound';

// Admin Pages
import AdminUsers from '../pages/AdminUsers';
import AdminImport from '../pages/AdminImport';

// Manager Specific Pages
import ManagerFlights from '../pages/ManagerFlights';
import ManagerMaintenance from '../pages/ManagerMaintenance';
import ManagerDefects from '../pages/ManagerDefects';
import ManagerWorkforce from '../pages/ManagerWorkforce';
import ManagerReports from '../pages/ManagerReports';

// Technician Specific Pages
import TechnicianDashboard from '../pages/TechnicianDashboard';
import TechnicianTasks from '../pages/TechnicianTasks';
import TechnicianWorkPackages from '../pages/TechnicianWorkPackages';
import TechnicianDefects from '../pages/TechnicianDefects';
import TechnicianWorkOrders from '../pages/TechnicianWorkOrders';
import TechnicianReportDefect from '../pages/TechnicianReportDefect';

const AppRouter = () => {
    const { isAuthenticated } = useAuth();

    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={isAuthenticated() ? <Navigate to="/dashboard" /> : <Login />} />
            <Route path="/register" element={isAuthenticated() ? <Navigate to="/dashboard" /> : <Register />} />

            {/* Protected Routes */}
            <Route element={<PrivateRoute />}>
                <Route element={<MainLayout />}>
                    
                    <Route path="/dashboard" element={<Dashboard />} />
                    
                    {/* Shared Core Modules */}
                    <Route path="/aircraft" element={<Aircraft />} />
                    <Route path="/flights" element={<Flights />} />
                    <Route path="/maintenance" element={<Maintenance />} />
                    <Route path="/defects" element={<Defects />} />
                    <Route path="/work-orders" element={<WorkOrders />} />
                    <Route path="/work-packages" element={<WorkPackages />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/reliability" element={<Reliability />} />

                    {/* Admin Only Routes */}
                    <Route element={<RoleRoute allowedRoles={['ADMIN']} />}>
                        <Route path="/admin/users" element={<AdminUsers />} />
                        <Route path="/admin/import" element={<AdminImport />} />
                    </Route>

                    {/* Manager Specific Routes */}
                    <Route element={<RoleRoute allowedRoles={['MANAGER']} />}>
                        <Route path="/manager/flights" element={<ManagerFlights />} />
                        <Route path="/manager/maintenance" element={<ManagerMaintenance />} />
                        <Route path="/manager/workforce" element={<ManagerWorkforce />} />
                        <Route path="/manager/reports" element={<ManagerReports />} />
                    </Route>

                    {/* Technician Specific Routes */}
                    <Route element={<RoleRoute allowedRoles={['TECHNICIAN']} />}>
                        <Route path="/technician/dashboard" element={<TechnicianDashboard />} />
                        <Route path="/technician/tasks" element={<TechnicianTasks />} />
                        <Route path="/technician/work-packages" element={<TechnicianWorkPackages />} />
                        <Route path="/technician/defects" element={<TechnicianDefects />} />
                        <Route path="/technician/work-orders" element={<TechnicianWorkOrders />} />
                        <Route path="/technician/report-defect" element={<TechnicianReportDefect />} />
                    </Route>

                    {/* Admin/Manager Only */}
                    <Route element={<RoleRoute allowedRoles={['ADMIN', 'MANAGER']} />}>
                        <Route path="/employees" element={<Employees />} />
                        <Route path="/technicians" element={<Technicians />} />
                    </Route>
                </Route>
            </Route>

            <Route path="*" element={<NotFound />} />
        </Routes>
    );
};

export default AppRouter;