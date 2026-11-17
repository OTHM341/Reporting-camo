/**
 * Aircraft Service - Complete API Integration Example
 * Demonstrates all CRUD operations with proper error handling
 */

import api from './api';

/**
 * Fetch all aircraft
 */
export const getAllAircraft = async () => {
    try {
        const response = await api.get('/aircraft');
        return { 
            success: true, 
            data: response.data 
        };
    } catch (error) {
        console.error('Error fetching aircraft:', error);
        return { 
            success: false, 
            error: error.response?.data?.message || 'Failed to fetch aircraft' 
        };
    }
};

/**
 * Fetch single aircraft by ID
 */
export const getAircraftById = async (id) => {
    try {
        const response = await api.get(`/aircraft/${id}`);
        return { 
            success: true, 
            data: response.data 
        };
    } catch (error) {
        return { 
            success: false, 
            error: error.response?.data?.message || 'Aircraft not found' 
        };
    }
};

/**
 * Create new aircraft
 */
export const createAircraft = async (aircraftData) => {
    try {
        const response = await api.post('/aircraft', {
            registrationNumber: aircraftData.registrationNumber,
            model: aircraftData.model,
            manufacturer: aircraftData.manufacturer,
            yearManufactured: aircraftData.yearManufactured,
            maintenanceStatus: aircraftData.maintenanceStatus || 'OPERATIONAL',
            hoursFlown: aircraftData.hoursFlown || 0
        });

        return { 
            success: true, 
            data: response.data,
            message: 'Aircraft created successfully'
        };
    } catch (error) {
        console.error('Error creating aircraft:', error);
        return { 
            success: false, 
            error: error.response?.data?.message || 'Failed to create aircraft' 
        };
    }
};

/**
 * Update aircraft (full update)
 */
export const updateAircraft = async (id, aircraftData) => {
    try {
        const response = await api.put(`/aircraft/${id}`, {
            registrationNumber: aircraftData.registrationNumber,
            model: aircraftData.model,
            manufacturer: aircraftData.manufacturer,
            yearManufactured: aircraftData.yearManufactured,
            maintenanceStatus: aircraftData.maintenanceStatus,
            hoursFlown: aircraftData.hoursFlown
        });

        return { 
            success: true, 
            data: response.data,
            message: 'Aircraft updated successfully'
        };
    } catch (error) {
        console.error('Error updating aircraft:', error);
        return { 
            success: false, 
            error: error.response?.data?.message || 'Failed to update aircraft' 
        };
    }
};

/**
 * Partial update aircraft (PATCH)
 * Useful for updating specific fields only
 */
export const patchAircraft = async (id, updates) => {
    try {
        const response = await api.patch(`/aircraft/${id}`, updates);
        return { 
            success: true, 
            data: response.data,
            message: 'Aircraft updated successfully'
        };
    } catch (error) {
        return { 
            success: false, 
            error: error.response?.data?.message || 'Failed to update aircraft' 
        };
    }
};

/**
 * Delete aircraft
 */
export const deleteAircraft = async (id) => {
    try {
        await api.delete(`/aircraft/${id}`);
        return { 
            success: true,
            message: 'Aircraft deleted successfully'
        };
    } catch (error) {
        return { 
            success: false, 
            error: error.response?.data?.message || 'Failed to delete aircraft' 
        };
    }
};

/**
 * Search aircraft by registration number
 */
export const searchAircraftByRegistration = async (registrationNumber) => {
    try {
        const response = await api.get('/aircraft', {
            params: { registration: registrationNumber }
        });
        return { 
            success: true, 
            data: response.data 
        };
    } catch {
        return { 
            success: false, 
            error: 'Search failed' 
        };
    }
};

/**
 * Get aircraft maintenance status
 */
export const getMaintenanceStatus = async (id) => {
    try {
        const response = await api.get(`/aircraft/${id}/maintenance`);
        return { 
            success: true, 
            data: response.data 
        };
    } catch {
        return { 
            success: false, 
            error: 'Failed to get maintenance status' 
        };
    }
};

export default {
    getAllAircraft,
    getAircraftById,
    createAircraft,
    updateAircraft,
    patchAircraft,
    deleteAircraft,
    searchAircraftByRegistration,
    getMaintenanceStatus
};

