import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';


export const USE_MOCK_DATA = false;



export const normalizeAuthToken = (value) => {
    if (typeof value !== 'string') return null;

    const token = value.trim().replace(/^Bearer\s+/i, '').trim();

    if (!token || token === 'null' || token === 'undefined') return null;

    return token;
};


const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 30000,
});


api.interceptors.request.use((config) => {
    const token = normalizeAuthToken(localStorage.getItem('token'));

    if (token) {
        config.headers = {
            ...config.headers,
            Authorization: `Bearer ${token}`,
        };
    }

    return config;
});


api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;

        if (status === 401 || status === 403) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');

            if (window.location.pathname !== '/') {
                window.location.href = '/';
            }
        }

        return Promise.reject(error);
    }
);


export const authAPI = {
    login: (credentials) => api.post('/auth/login', credentials),
    register: ({ username, email, password, firstName, lastName, role }) =>
        api.post('/auth/register', {
            username: username.trim(),
            email: email.trim(),
            password,
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            roles: [role || 'TECHNICIAN'],
        }),
    getAllUsers: () => api.get('/admin/users'),
    updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
    deleteUser: (id) => api.delete(`/admin/users/${id}`),
    toggleUserStatus: (id) => api.patch(`/admin/users/${id}/toggle-status`),
};


export const systemAPI = {
    checkDatabase: () => api.get('/admin/system/db-check'),
    initializeRoles: () => api.post('/admin/system/init-roles'),
    importAircraft: (data) => api.post('/admin/import/aircraft', data),
    importPersonnel: (data) => api.post('/admin/import/personnel', data),
    syncFlights: () => api.post('/admin/system/sync-flights'),
};


export const aircraftAPI = {
    getAll: () => api.get('/aircraft'),
    getById: (id) => api.get(`/aircraft/${id}`),
    create: (data) => api.post('/aircraft', data),
    update: (id, data) => api.put(`/aircraft/${id}`, data),
    delete: (id) => api.delete(`/aircraft/${id}`),
};


export const flightAPI = {
    getAll: () => api.get('/flight'),
    create: (data) => api.post('/flight', data),
    update: (id, data) => api.put(`/flight/${id}`, data),
    delete: (id) => api.delete(`/flight/${id}`),
};


export const employeeAPI = {
    getAll: () => api.get('/employee'),
    create: (data) => api.post('/employee', data),
    update: (id, data) => api.put(`/employee/${id}`, data),
    delete: (id) => api.delete(`/employee/${id}`),
};


export const defectAPI = {
    getAll: () => api.get('/defect'),
    create: (data) => api.post('/defect', data),
    update: (id, data) => api.put(`/defect/${id}`, data),
    delete: (id) => api.delete(`/defect/${id}`),
};


export const maintenanceAPI = {
    getAll: () => api.get('/maintenance'),
    create: (data) => api.post('/maintenance', data),
    update: (id, data) => api.put(`/maintenance/${id}`, data),
    delete: (id) => api.delete(`/maintenance/${id}`),
};


export const workOrderAPI = {
    getAll: () => api.get('/work-orders'),
    create: (data) => api.post('/work-orders', data),
    update: (id, data) => api.put(`/work-orders/${id}`, data),
    delete: (id) => api.delete(`/work-orders/${id}`),
};


export const workPackageAPI = {
    getAll: () => api.get('/work-packages'),
    create: (data) => api.post('/work-packages', data),
    update: (id, data) => api.put(`/work-packages/${id}`, data),
    delete: (id) => api.delete(`/work-packages/${id}`),
};


export const dashboardAPI = {
    getKPIs: () => api.get('/dashboard/kpis'),
};


export const logApiError = (scope, error) => {
    console.error(
        `[${scope}] DB-Link Error:`,
        error.response?.data || error.message
    );
};

export default api;