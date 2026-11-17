/**
 * Mock Data for Royal Air Maroc Aviation Management Platform
 * This provides realistic test data across all modules
 */

export const mockAircraft = [
    {
        id: 1,
        registration: 'CN-RGN',
        type: 'Boeing 787',
        model: '787-9 Dreamliner',
        manufacturer: 'Boeing',
        status: 'ACTIVE',
        totalFlightHours: 12450,
        numberOfAircraft: 1,
        lastMaintenance: '2026-04-20',
        nextMaintenance: '2026-05-20'
    },
    {
        id: 2,
        registration: 'CN-RFC',
        type: 'Airbus A330',
        model: 'A330-300',
        manufacturer: 'Airbus',
        status: 'ACTIVE',
        totalFlightHours: 18920,
        numberOfAircraft: 1,
        lastMaintenance: '2026-04-15',
        nextMaintenance: '2026-05-15'
    },
    {
        id: 3,
        registration: 'CN-RFK',
        type: 'Boeing 737',
        model: '737-8 MAX',
        manufacturer: 'Boeing',
        status: 'ACTIVE',
        totalFlightHours: 8765,
        numberOfAircraft: 1,
        lastMaintenance: '2026-04-25',
        nextMaintenance: '2026-05-25'
    },
    {
        id: 4,
        registration: 'CN-RFL',
        type: 'Airbus A320',
        model: 'A320-200',
        manufacturer: 'Airbus',
        status: 'ACTIVE',
        totalFlightHours: 22100,
        numberOfAircraft: 1,
        lastMaintenance: '2026-04-10',
        nextMaintenance: '2026-05-10'
    },
    {
        id: 5,
        registration: 'CN-RFM',
        type: 'Airbus A321',
        model: 'A321-200',
        manufacturer: 'Airbus',
        status: 'MAINTENANCE',
        totalFlightHours: 19450,
        numberOfAircraft: 1,
        lastMaintenance: '2026-03-30',
        nextMaintenance: '2026-06-05'
    },
    {
        id: 6,
        registration: 'CN-RFN',
        type: 'Boeing 787',
        model: '787-9 Dreamliner',
        manufacturer: 'Boeing',
        status: 'ACTIVE',
        totalFlightHours: 9200,
        numberOfAircraft: 1,
        lastMaintenance: '2026-04-22',
        nextMaintenance: '2026-05-22'
    },
    {
        id: 7,
        registration: 'CN-RFO',
        type: 'Airbus A330',
        model: 'A330-200',
        manufacturer: 'Airbus',
        status: 'ACTIVE',
        totalFlightHours: 17800,
        numberOfAircraft: 1,
        lastMaintenance: '2026-04-18',
        nextMaintenance: '2026-05-18'
    },
];

export const mockFlights = [
    {
        id: 1,
        flightNumber: 'AT001',
        aircraftId: 1,
        aircraftRegistration: 'CN-RGN',
        origin: 'CMN',
        destination: 'CDG',
        scheduledDeparture: '2026-05-04T08:00:00Z',
        scheduledArrival: '2026-05-04T11:30:00Z',
        status: 'DEPARTED',
        gate: 'A15',
        delayMinutes: 0,
        actualDeparture: '2026-05-04T08:05:00Z',
        actualArrival: null
    },
    {
        id: 2,
        flightNumber: 'AT002',
        aircraftId: 2,
        aircraftRegistration: 'CN-RFC',
        origin: 'CMN',
        destination: 'LIH',
        scheduledDeparture: '2026-05-04T10:30:00Z',
        scheduledArrival: '2026-05-04T18:45:00Z',
        status: 'SCHEDULED',
        gate: 'A22',
        delayMinutes: 0,
        actualDeparture: null,
        actualArrival: null
    },
    {
        id: 3,
        flightNumber: 'AT003',
        aircraftId: 3,
        aircraftRegistration: 'CN-RFK',
        origin: 'CDG',
        destination: 'CMN',
        scheduledDeparture: '2026-05-04T14:00:00Z',
        scheduledArrival: '2026-05-04T20:30:00Z',
        status: 'BOARDING',
        gate: 'C8',
        delayMinutes: 5,
        actualDeparture: null,
        actualArrival: null
    },
    {
        id: 4,
        flightNumber: 'AT004',
        aircraftId: 4,
        aircraftRegistration: 'CN-RFL',
        origin: 'CMN',
        destination: 'ORY',
        scheduledDeparture: '2026-05-04T09:15:00Z',
        scheduledArrival: '2026-05-04T12:45:00Z',
        status: 'ARRIVED',
        gate: 'B5',
        delayMinutes: -3,
        actualDeparture: '2026-05-04T09:12:00Z',
        actualArrival: '2026-05-04T12:42:00Z'
    },
    {
        id: 5,
        flightNumber: 'AT005',
        aircraftId: 6,
        aircraftRegistration: 'CN-RFN',
        origin: 'CMN',
        destination: 'LHR',
        scheduledDeparture: '2026-05-04T11:00:00Z',
        scheduledArrival: '2026-05-04T13:30:00Z',
        status: 'SCHEDULED',
        gate: 'A8',
        delayMinutes: 0,
        actualDeparture: null,
        actualArrival: null
    },
    {
        id: 6,
        flightNumber: 'AT006',
        aircraftId: 7,
        aircraftRegistration: 'CN-RFO',
        origin: 'FCO',
        destination: 'CMN',
        scheduledDeparture: '2026-05-04T16:45:00Z',
        scheduledArrival: '2026-05-04T19:20:00Z',
        status: 'SCHEDULED',
        gate: 'B12',
        delayMinutes: 0,
        actualDeparture: null,
        actualArrival: null
    },
];

export const mockDefects = [
    {
        id: 1,
        description: 'Right hydraulic system pressure lower than normal',
        severity: 'MAJOR',
        aircraftId: 1,
        aircraft: { id: 1, registration: 'CN-RGN', model: 'Boeing 787-9' },
        reportedBy: 1,
        status: 'IN_PROGRESS',
        createdDate: '2026-05-02T14:30:00Z',
        scheduledRepairDate: '2026-05-05T08:00:00Z'
    },
    {
        id: 2,
        description: 'Cabin air filter replacement needed',
        severity: 'MINOR',
        aircraftId: 2,
        aircraft: { id: 2, registration: 'CN-RFC', model: 'Airbus A330-300' },
        reportedBy: 2,
        status: 'OPEN',
        createdDate: '2026-05-03T09:15:00Z',
        scheduledRepairDate: '2026-05-10T07:00:00Z'
    },
    {
        id: 3,
        description: 'IRS (Inertial Reference System) alignment error detected',
        severity: 'CRITICAL',
        aircraftId: 3,
        aircraft: { id: 3, registration: 'CN-RFK', model: 'Boeing 737-8 MAX' },
        reportedBy: 3,
        status: 'OPEN',
        createdDate: '2026-05-04T07:45:00Z',
        scheduledRepairDate: '2026-05-04T18:00:00Z'
    },
    {
        id: 4,
        description: 'Landing gear indicator light malfunction',
        severity: 'MAJOR',
        aircraftId: 4,
        aircraft: { id: 4, registration: 'CN-RFL', model: 'Airbus A320-200' },
        reportedBy: 1,
        status: 'RESOLVED',
        createdDate: '2026-04-28T11:20:00Z',
        scheduledRepairDate: '2026-04-29T08:00:00Z'
    },
    {
        id: 5,
        description: 'Engine 1 vibration higher than threshold',
        severity: 'CRITICAL',
        aircraftId: 5,
        aircraft: { id: 5, registration: 'CN-RFM', model: 'Airbus A321-200' },
        reportedBy: 2,
        status: 'IN_PROGRESS',
        createdDate: '2026-05-01T16:00:00Z',
        scheduledRepairDate: '2026-05-04T09:00:00Z'
    },
    {
        id: 6,
        description: 'APU (Auxiliary Power Unit) start valve replacement',
        severity: 'MINOR',
        aircraftId: 6,
        aircraft: { id: 6, registration: 'CN-RFN', model: 'Boeing 787-9' },
        reportedBy: 3,
        status: 'OPEN',
        createdDate: '2026-05-03T13:00:00Z',
        scheduledRepairDate: '2026-05-08T07:00:00Z'
    },
];

export const mockMaintenance = [
    {
        id: 1,
        aircraftId: 1,
        aircraftRegistration: 'CN-RGN',
        type: 'ROUTINE',
        description: '500-hour routine maintenance check',
        status: 'IN_PROGRESS',
        scheduledDate: '2026-05-04T08:00:00Z',
        completedDate: null,
        technicianId: 1,
        technicianName: 'Ahmed Hassan',
        estimatedHours: 16,
        actualHours: 8
    },
    {
        id: 2,
        aircraftId: 2,
        aircraftRegistration: 'CN-RFC',
        type: 'INSPECTION',
        description: 'Annual inspection - Full systems check',
        status: 'SCHEDULED',
        scheduledDate: '2026-05-10T08:00:00Z',
        completedDate: null,
        technicianId: 2,
        technicianName: 'Fatima Bennani',
        estimatedHours: 40,
        actualHours: 0
    },
    {
        id: 3,
        aircraftId: 3,
        aircraftRegistration: 'CN-RFK',
        type: 'REPAIR',
        description: 'Landing gear hydraulic system repair',
        status: 'IN_PROGRESS',
        scheduledDate: '2026-05-04T07:00:00Z',
        completedDate: null,
        technicianId: 3,
        technicianName: 'Mohammed El Alami',
        estimatedHours: 20,
        actualHours: 12
    },
    {
        id: 4,
        aircraftId: 4,
        aircraftRegistration: 'CN-RFL',
        type: 'ROUTINE',
        description: 'Scheduled maintenance - 1000 flight hours',
        status: 'COMPLETED',
        scheduledDate: '2026-04-28T08:00:00Z',
        completedDate: '2026-04-28T16:30:00Z',
        technicianId: 1,
        technicianName: 'Ahmed Hassan',
        estimatedHours: 18,
        actualHours: 18
    },
    {
        id: 5,
        aircraftId: 5,
        aircraftRegistration: 'CN-RFM',
        type: 'OVERHAUL',
        description: 'Engine 1 major overhaul - 10,000 flight hours',
        status: 'SCHEDULED',
        scheduledDate: '2026-05-15T08:00:00Z',
        completedDate: null,
        technicianId: 2,
        technicianName: 'Fatima Bennani',
        estimatedHours: 80,
        actualHours: 0
    },
    {
        id: 6,
        aircraftId: 6,
        aircraftRegistration: 'CN-RFN',
        type: 'INSPECTION',
        description: 'Pre-flight safety inspection',
        status: 'COMPLETED',
        scheduledDate: '2026-05-02T07:00:00Z',
        completedDate: '2026-05-02T08:15:00Z',
        technicianId: 3,
        technicianName: 'Mohammed El Alami',
        estimatedHours: 2,
        actualHours: 1.5
    },
];

export const mockEmployees = [
    {
        id: 1,
        firstName: 'Ahmed',
        lastName: 'Hassan',
        email: 'ahmed.hassan@royalairmaroc.com',
        role: 'TECHNICIAN',
        department: 'Maintenance',
        specialization: 'Hydraulics & Systems',
        certifications: ['B1', 'B2', 'B3'],
        experience_years: 12,
        status: 'ACTIVE'
    },
    {
        id: 2,
        firstName: 'Fatima',
        lastName: 'Bennani',
        email: 'fatima.bennani@royalairmaroc.com',
        role: 'TECHNICIAN',
        department: 'Maintenance',
        specialization: 'Structures & Composites',
        certifications: ['B1', 'B2', 'C'],
        experience_years: 8,
        status: 'ACTIVE'
    },
    {
        id: 3,
        firstName: 'Mohammed',
        lastName: 'El Alami',
        email: 'mohammed.alami@royalairmaroc.com',
        role: 'TECHNICIAN',
        department: 'Maintenance',
        specialization: 'Engines & Power Plants',
        certifications: ['B1', 'E'],
        experience_years: 15,
        status: 'ACTIVE'
    },
    {
        id: 4,
        firstName: 'Amina',
        lastName: 'Moroccan',
        email: 'amina.moroccan@royalairmaroc.com',
        role: 'MANAGER',
        department: 'Operations',
        specialization: 'Fleet Management',
        certifications: ['B1', 'B2', 'B3', 'C'],
        experience_years: 18,
        status: 'ACTIVE'
    },
    {
        id: 5,
        firstName: 'Karim',
        lastName: 'Rachid',
        email: 'karim.rachid@royalairmaroc.com',
        role: 'TECHNICIAN',
        department: 'Maintenance',
        specialization: 'Avionics & Systems',
        certifications: ['B1', 'B2'],
        experience_years: 6,
        status: 'ACTIVE'
    },
];

export const mockWorkOrders = [
    {
        id: 1,
        workOrderNumber: 'WO-2026-001',
        description: 'Repair right hydraulic system pressure issue',
        aircraftId: 1,
        aircraftRegistration: 'CN-RGN',
        priority: 'HIGH',
        status: 'IN_PROGRESS',
        assignedTechnicianId: 1,
        assignedTechnician: 'Ahmed Hassan',
        createdDate: '2026-05-02T14:30:00Z',
        dueDate: '2026-05-05T18:00:00Z',
        completedDate: null,
        estimatedHours: 6,
        actualHours: 3
    },
    {
        id: 2,
        workOrderNumber: 'WO-2026-002',
        description: 'Cabin air filter replacement',
        aircraftId: 2,
        aircraftRegistration: 'CN-RFC',
        priority: 'LOW',
        status: 'PENDING',
        assignedTechnicianId: 2,
        assignedTechnician: 'Fatima Bennani',
        createdDate: '2026-05-03T09:15:00Z',
        dueDate: '2026-05-10T17:00:00Z',
        completedDate: null,
        estimatedHours: 2,
        actualHours: 0
    },
    {
        id: 3,
        workOrderNumber: 'WO-2026-003',
        description: 'IRS alignment error diagnostics and repair',
        aircraftId: 3,
        aircraftRegistration: 'CN-RFK',
        priority: 'CRITICAL',
        status: 'IN_PROGRESS',
        assignedTechnicianId: 3,
        assignedTechnician: 'Mohammed El Alami',
        createdDate: '2026-05-04T07:45:00Z',
        dueDate: '2026-05-04T18:00:00Z',
        completedDate: null,
        estimatedHours: 8,
        actualHours: 5
    },
];

export const mockWorkPackages = [
    {
        id: 1,
        packageNumber: 'PKG-CMN-001',
        description: 'May scheduled maintenance - Gate 15 Check',
        location: 'CMN - Gate 15',
        status: 'ACTIVE',
        createdDate: '2026-05-01T10:00:00Z',
        startDate: '2026-05-04T08:00:00Z',
        endDate: '2026-05-08T17:00:00Z',
        priority: 'HIGH',
        tasks: [
            {
                taskId: 1,
                description: 'Landing gear inspection',
                status: 'IN_PROGRESS',
                assignedTechnician: 'Ahmed Hassan'
            },
            {
                taskId: 2,
                description: 'Hydraulic system pressure check',
                status: 'PENDING',
                assignedTechnician: 'Fatima Bennani'
            }
        ]
    },
    {
        id: 2,
        packageNumber: 'PKG-CMN-002',
        description: 'May scheduled maintenance - Gate 22 Check',
        location: 'CMN - Gate 22',
        status: 'PENDING',
        createdDate: '2026-05-02T10:00:00Z',
        startDate: '2026-05-10T08:00:00Z',
        endDate: '2026-05-14T17:00:00Z',
        priority: 'MEDIUM',
        tasks: [
            {
                taskId: 3,
                description: 'Engine oil analysis',
                status: 'PENDING',
                assignedTechnician: 'Mohammed El Alami'
            }
        ]
    },
];

export default {
    mockAircraft,
    mockFlights,
    mockDefects,
    mockMaintenance,
    mockEmployees,
    mockWorkOrders,
    mockWorkPackages
};

