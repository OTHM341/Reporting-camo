import { workOrderAPI } from './api';

/**
 * Work Order Service
 * Provides methods to interact with work orders API
 */
export const workOrderService = {
    /**
     * Get all work orders
     */
    getAll: () => workOrderAPI.getAll(),

    /**
     * Get work order by ID
     * @param {number} id - Work order ID
     */
    getById: (id) => workOrderAPI.getById(id),

    /**
     * Create a new work order
     * @param {Object} data - Work order data
     */
    create: (data) => workOrderAPI.create(data),

    /**
     * Update an existing work order
     * @param {number} id - Work order ID
     * @param {Object} data - Updated work order data
     */
    update: (id, data) => workOrderAPI.update(id, data),

    /**
     * Delete a work order
     * @param {number} id - Work order ID
     */
    delete: (id) => workOrderAPI.delete(id),

    /**
     * Get work orders by maintenance ID
     * @param {number} maintenanceId - Maintenance ID
     */
    getByMaintenance: (maintenanceId) => workOrderAPI.getByMaintenance(maintenanceId),

    /**
     * Get work orders by status
     * @param {string} status - Work order status
     */
    getByStatus: (status) => workOrderAPI.getByStatus(status),

    /**
     * Get work orders by technician ID
     * @param {number} technicianId - Technician ID
     */
    getByTechnician: (technicianId) => workOrderAPI.getByTechnician(technicianId),

    /**
     * Assign a work order to a technician
     * @param {number} id - Work order ID
     * @param {number} technicianId - Technician ID
     */
    assign: (id, technicianId) => workOrderAPI.assign(id, technicianId),

    /**
     * Complete a work order
     * @param {number} id - Work order ID
     * @param {number} actualHours - Actual hours spent
     */
    complete: (id, actualHours) => workOrderAPI.complete(id, actualHours),
};

export default workOrderService;