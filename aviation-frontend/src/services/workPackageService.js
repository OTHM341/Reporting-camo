import { workPackageAPI } from './api';

/**
 * Work Package Service
 * Provides methods to interact with work packages API
 */
export const workPackageService = {
    /**
     * Get all work packages
     */
    getAll: () => workPackageAPI.getAll(),

    /**
     * Get work package by ID
     * @param {number} id - Work package ID
     */
    getById: (id) => workPackageAPI.getById(id),

    /**
     * Create a new work package
     * @param {Object} data - Work package data
     */
    create: (data) => workPackageAPI.create(data),

    /**
     * Update an existing work package
     * @param {number} id - Work package ID
     * @param {Object} data - Updated work package data
     */
    update: (id, data) => workPackageAPI.update(id, data),

    /**
     * Delete a work package
     * @param {number} id - Work package ID
     */
    delete: (id) => workPackageAPI.delete(id),

    /**
     * Get work packages by maintenance ID
     * @param {number} maintenanceId - Maintenance ID
     */
    getByMaintenance: (maintenanceId) => workPackageAPI.getByMaintenance(maintenanceId),

    /**
     * Get work packages by status
     * @param {string} status - Work package status
     */
    getByStatus: (status) => workPackageAPI.getByStatus(status),

    /**
     * Add a work order to a work package
     * @param {number} packageId - Work package ID
     * @param {number} workOrderId - Work order ID
     */
    addWorkOrder: (packageId, workOrderId) => workPackageAPI.addWorkOrder(packageId, workOrderId),

    /**
     * Remove a work order from a work package
     * @param {number} packageId - Work package ID
     * @param {number} workOrderId - Work order ID
     */
    removeWorkOrder: (packageId, workOrderId) => workPackageAPI.removeWorkOrder(packageId, workOrderId),
};

export default workPackageService;