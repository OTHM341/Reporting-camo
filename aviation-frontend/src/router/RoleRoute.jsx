import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

/**
 * RoleRoute Component
 * Protects routes based on user roles
 * Only users with specified roles can access protected routes
 * 
 * @param {string[]} allowedRoles - Array of roles allowed to access this route
 */
const RoleRoute = ({ allowedRoles = [] }) => {
    const { loading, hasAnyRole } = useAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ram-green"></div>
            </div>
        );
    }

    const hasAllowedRole = allowedRoles.length === 0 || hasAnyRole(allowedRoles);

    if (hasAllowedRole) {
        return <Outlet />;
    }

    return <Navigate to="/" replace />;
};

export default RoleRoute;
