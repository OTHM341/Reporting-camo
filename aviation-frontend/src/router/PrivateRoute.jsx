import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

/**
 * PrivateRoute Component
 * Protects routes that require authentication
 * Redirects unauthenticated users to the home page
 */
const PrivateRoute = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ram-green"></div>
            </div>
        );
    }

    if (user) {
        return <Outlet />;
    }

    return <Navigate to="/" replace />;
};

export default PrivateRoute;
