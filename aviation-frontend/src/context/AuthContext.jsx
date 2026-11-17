import { useState, useEffect, useCallback } from 'react';
import * as authService from '../services/authService';
import { AuthContext } from './authContextValue';
import { USE_MOCK_DATA } from '../services/api'; // Import USE_MOCK_DATA

/**
 * Authentication Provider
 * Manages user authentication state and provides auth methods
 */
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Initialize auth state from localStorage
    useEffect(() => {
        const initializeAuth = () => {
            try {
                let storedUser = authService.getStoredUser();
                let storedToken = authService.getToken();

                // Auto-login a mock ADMIN user ONLY if USE_MOCK_DATA is true AND no user is currently stored
                if (USE_MOCK_DATA && (!storedUser || !storedToken)) {
                    const mockAdminUser = {
                        id: 999,
                        username: 'mockadmin',
                        email: 'mock.admin@ram.ma',
                        firstName: 'Mock',
                        lastName: 'Admin',
                        roles: ['ADMIN', 'MANAGER', 'TECHNICIAN'] // Grant all roles for testing
                    };
                    const mockAuthToken = 'mock-jwt-token-admin';
                    
                    authService.storeAuthData(mockAuthToken, mockAdminUser);
                    storedUser = mockAdminUser;
                    storedToken = mockAuthToken;
                }

                if (storedUser && storedToken) {
                    setUser(storedUser);
                    setToken(storedToken);
                } else {
                    setUser(null);
                    setToken(null);
                }
            } catch (err) {
                console.error('Auth initialization failed:', err);
                setUser(null);
                setToken(null);
            } finally {
                setLoading(false);
            }
        };

        initializeAuth();
    }, []);

    /**
     * Handle user login
     */
    const login = useCallback((userData, authToken) => {
        authService.storeAuthData(authToken, userData);
        setToken(authToken);
        setUser(userData);
        setError(null);
    }, []);

    /**
     * Handle user logout
     */
    const logout = useCallback(() => {
        authService.clearAuthData(); // Use clearAuthData from authService
        setUser(null);
        setToken(null);
        setError(null);
    }, []);

    /**
     * Check if user has specific role
     */
    const hasRole = useCallback((role) => {
        return user?.roles?.includes(role) || false;
    }, [user]);

    /**
     * Check if user has any of the specified roles
     */
    const hasAnyRole = useCallback((roles) => {
        return roles.some(role => hasRole(role));
    }, [hasRole]);

    /**
     * Check if user is authenticated
     */
    const isAuthenticated = useCallback(() => {
        return !!user && !!token;
    }, [user, token]);

    /**
     * Update user profile
     */
    const updateUser = useCallback((userData) => {
        const updatedUser = { ...user, ...userData };
        authService.storeAuthData(token, updatedUser);
        setUser(updatedUser);
    }, [user, token]);

    // Context value
    const value = {
        user,
        token,
        loading,
        error,
        setError,
        login,
        logout,
        hasRole,
        hasAnyRole,
        isAuthenticated,
        updateUser
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};