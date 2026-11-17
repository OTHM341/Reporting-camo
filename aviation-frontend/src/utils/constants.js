// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

// Status Constants
export const AIRCRAFT_STATUS = {
    ACTIVE: 'ACTIVE',
    MAINTENANCE: 'MAINTENANCE',
    RETIRED: 'RETIRED',
};

export const FLIGHT_STATUS = {
    SCHEDULED: 'SCHEDULED',
    BOARDING: 'BOARDING',
    DEPARTED: 'DEPARTED',
    ARRIVED: 'ARRIVED',
    DELAYED: 'DELAYED',
    CANCELLED: 'CANCELLED',
};

export const MAINTENANCE_STATUS = {
    PLANNED: 'PLANNED',
    IN_PROGRESS: 'IN_PROGRESS',
    COMPLETED: 'COMPLETED',
    CANCELLED: 'CANCELLED',
};

export const DEFECT_STATUS = {
    OPEN: 'OPEN',
    IN_PROGRESS: 'IN_PROGRESS',
    RESOLVED: 'RESOLVED',
    CLOSED: 'CLOSED',
};

export const DEFECT_SEVERITY = {
    MINOR: 'MINOR',
    MAJOR: 'MAJOR',
    CRITICAL: 'CRITICAL',
};

export const WORK_ORDER_STATUS = {
    OPEN: 'OPEN',
    ASSIGNED: 'ASSIGNED',
    IN_PROGRESS: 'IN_PROGRESS',
    COMPLETED: 'COMPLETED',
    CANCELLED: 'CANCELLED',
};

export const WORK_ORDER_PRIORITY = {
    LOW: 'LOW',
    NORMAL: 'NORMAL',
    HIGH: 'HIGH',
    URGENT: 'URGENT',
};

// Departments
export const DEPARTMENTS = [
    'FLIGHT_OPS',
    'MAINTENANCE',
    'GROUND_OPS',
    'ADMIN',
];

// Colors
export const STATUS_COLORS = {
    ACTIVE: 'bg-green-100 text-green-800',
    SCHEDULED: 'bg-blue-100 text-blue-800',
    DEPARTED: 'bg-purple-100 text-purple-800',
    ARRIVED: 'bg-green-100 text-green-800',
    DELAYED: 'bg-yellow-100 text-yellow-800',
    CANCELLED: 'bg-red-100 text-red-800',
    OPEN: 'bg-red-100 text-red-800',
    IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
    COMPLETED: 'bg-green-100 text-green-800',
    CLOSED: 'bg-gray-100 text-gray-800',
    CRITICAL: 'bg-red-100 text-red-800',
    MAJOR: 'bg-orange-100 text-orange-800',
    MINOR: 'bg-blue-100 text-blue-800',
};