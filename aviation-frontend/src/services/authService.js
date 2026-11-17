import api, { normalizeAuthToken } from './api';

/**
 * Authentication Service
 * Handles all authentication-related API calls
 */

const TOKEN_KEY = 'token';
const USER_KEY = 'user';
const REFRESH_TOKEN_KEY = 'refreshToken';

/**
 * Login user with credentials
 * @param {string} username
 * @param {string} password
 * @returns {Promise<{token, user}>}
 */
export const login = async (username, password) => {
    try {
        const response = await api.post('/auth/login', {
            username,
            password
        });

        const { token, id, email, firstName, lastName, roles } = response.data;

        // Store token and user info
        const userData = {
            id,
            username,
            email,
            firstName,
            lastName,
            roles: roles || []
        };

        storeAuthData(token, userData);

        return {
            success: true,
            token,
            user: userData
        };
    } catch (error) {
        console.error('Login failed:', error);
        return {
            success: false,
            error: error.response?.data?.message || 'Login failed. Please check your credentials.'
        };
    }
};

/**
 * Register new user
 * @param {Object} userData - { username, email, password, firstName, lastName, role }
 * @returns {Promise<{success, message, error}>}
 */
export const register = async (userData) => {
    try {
        const response = await api.post('/auth/register', {
            username: userData.username,
            email: userData.email,
            password: userData.password,
            firstName: userData.firstName,
            lastName: userData.lastName,
            roles: [userData.role || 'TECHNICIAN']
        });

        return {
            success: true,
            message: response.data?.message || 'Registration successful. Please log in.'
        };
    } catch (error) {
        console.error('Registration failed:', error);
        return {
            success: false,
            error: error.response?.data?.message || 'Registration failed. Please try again.'
        };
    }
};

/**
 * Logout user
 */
export const logout = () => {
    clearAuthData();
};

/**
 * Get stored token
 * @returns {string|null}
 */
export const getToken = () => {
    try {
        return localStorage.getItem(TOKEN_KEY);
    } catch {
        return null;
    }
};

/**
 * Get stored user data
 * @returns {Object|null}
 */
export const getStoredUser = () => {
    try {
        const user = localStorage.getItem(USER_KEY);
        return user ? JSON.parse(user) : null;
    } catch {
        return null;
    }
};

/**
 * Check if user is authenticated
 * @returns {boolean}
 */
export const isAuthenticated = () => {
    return !!getToken() && !!getStoredUser();
};

/**
 * Check if user has specific role
 * @param {string} role
 * @returns {boolean}
 */
export const hasRole = (role) => {
    const user = getStoredUser();
    return user?.roles?.includes(role) || false;
};

/**
 * Check if user has any of the specified roles
 * @param {string[]} roles
 * @returns {boolean}
 */
export const hasAnyRole = (roles) => {
    return roles.some(role => hasRole(role));
};

/**
 * Store authentication data
 * @param {string} token
 * @param {Object} user
 */
export const storeAuthData = (token, user) => {
    try {
        const normalizedToken = normalizeAuthToken(token);

        if (!normalizedToken) {
            throw new Error('Cannot store empty authentication token');
        }

        localStorage.setItem(TOKEN_KEY, normalizedToken);
        localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch (error) {
        console.error('Failed to store auth data:', error);
    }
};

/**
 * Clear authentication data
 */
export const clearAuthData = () => {
    try {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
    } catch (error) {
        console.error('Failed to clear auth data:', error);
    }
};

/**
 * Refresh token (for future implementation)
 * @param {string} refreshToken
 * @returns {Promise}
 */
export const refreshToken = async (refreshToken) => {
    try {
        const response = await api.post('/auth/refresh', { refreshToken });
        const { token } = response.data;
        localStorage.setItem(TOKEN_KEY, token);
        return { success: true, token };
    } catch (error) {
        console.error('Token refresh failed:', error);
        logout();
        return { success: false };
    }
};

/**
 * Update user profile
 * @param {Object} userData
 * @returns {Promise}
 */
export const updateProfile = async (userData) => {
    try {
        await api.put('/auth/profile', userData);
        const updatedUser = { ...getStoredUser(), ...userData };
        localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
        return { success: true, user: updatedUser };
    } catch (error) {
        console.error('Profile update failed:', error);
        return { success: false, error: error.response?.data?.message || 'Update failed' };
    }
};

/**
 * Change password
 * @param {string} oldPassword
 * @param {string} newPassword
 * @returns {Promise}
 */
export const changePassword = async (oldPassword, newPassword) => {
    try {
        await api.post('/auth/change-password', {
            oldPassword,
            newPassword
        });
        return { success: true };
    } catch (error) {
        console.error('Password change failed:', error);
        return { 
            success: false, 
            error: error.response?.data?.message || 'Password change failed'
        };
    }
};

export default {
    login,
    register,
    logout,
    getToken,
    getStoredUser,
    isAuthenticated,
    hasRole,
    hasAnyRole,
    refreshToken,
    updateProfile,
    changePassword
};

