// Royal Air Maroc - Professional Fleet Data Simulation
// This file provides a large dataset for institutional demonstrations

export const mockAircraft = [
    { id: 1, registration: 'CN-RGN', type: 'Boeing 737-800', model: '737-800', manufacturer: 'Boeing', status: 'ACTIVE', totalFlightHours: 45200, nextMaintenanceDue: '2024-06-15', location: 'CMN' },
    { id: 2, registration: 'CN-RGB', type: 'Boeing 787-9', model: '787-9', manufacturer: 'Boeing', status: 'MAINTENANCE', totalFlightHours: 32000, nextMaintenanceDue: '2024-05-20', location: 'CMN' },
    { id: 3, registration: 'CN-RGO', type: 'Boeing 737-800', model: '737-800', manufacturer: 'Boeing', status: 'ACTIVE', totalFlightHours: 18450, nextMaintenanceDue: '2024-08-10', location: 'ORY' },
    { id: 4, registration: 'CN-RGP', type: 'Boeing 737 MAX 8', model: '737 MAX', manufacturer: 'Boeing', status: 'ACTIVE', totalFlightHours: 12100, nextMaintenanceDue: '2024-07-22', location: 'CMN' },
    { id: 5, registration: 'CN-ROM', type: 'Embraer E190', model: 'E190', manufacturer: 'Embraer', status: 'ACTIVE', totalFlightHours: 28900, nextMaintenanceDue: '2024-06-30', location: 'AGA' },
    { id: 6, registration: 'CN-ROW', type: 'ATR 72-600', model: 'ATR 72', manufacturer: 'ATR', status: 'INACTIVE', totalFlightHours: 35600, nextMaintenanceDue: '2024-05-15', location: 'CMN' },
    { id: 7, registration: 'CN-RGX', type: 'Boeing 787-8', model: '787-8', manufacturer: 'Boeing', status: 'ACTIVE', totalFlightHours: 21300, nextMaintenanceDue: '2024-09-05', location: 'JFK' },
    { id: 8, registration: 'CN-ROH', type: 'Boeing 737-700', model: '737-700', manufacturer: 'Boeing', status: 'ACTIVE', totalFlightHours: 51200, nextMaintenanceDue: '2024-06-01', location: 'CMN' },
    { id: 9, registration: 'CN-RGZ', type: 'Boeing 787-9', model: '787-9', manufacturer: 'Boeing', status: 'ACTIVE', totalFlightHours: 15600, nextMaintenanceDue: '2024-10-12', location: 'CDG' },
    { id: 10, registration: 'CN-RNA', type: 'Boeing 737-800', model: '737-800', manufacturer: 'Boeing', status: 'MAINTENANCE', totalFlightHours: 42100, nextMaintenanceDue: '2024-05-25', location: 'CMN' },
];

export const mockFlights = [
    { id: 1, flightNumber: 'AT800', aircraftId: 1, aircraftRegistration: 'CN-RGN', origin: 'CMN', destination: 'JFK', scheduledDeparture: '2024-05-25T10:30:00', scheduledArrival: '2024-05-25T14:45:00', status: 'DEPARTED', gate: 'D12', delayMinutes: 5 },
    { id: 2, flightNumber: 'AT202', aircraftId: 2, aircraftRegistration: 'CN-ROB', origin: 'CMN', destination: 'CDG', scheduledDeparture: '2024-05-25T11:45:00', scheduledArrival: '2024-05-25T14:50:00', status: 'SCHEDULED', gate: 'E08', delayMinutes: 0 },
    { id: 3, flightNumber: 'AT303', aircraftId: 3, aircraftRegistration: 'CN-RGO', origin: 'CMN', destination: 'LHR', scheduledDeparture: '2024-05-25T12:00:00', scheduledArrival: '2024-05-25T15:15:00', status: 'DELAYED', gate: 'F15', delayMinutes: 45 },
    { id: 4, flightNumber: 'AT404', aircraftId: 4, aircraftRegistration: 'CN-RGP', origin: 'CMN', destination: 'DXB', scheduledDeparture: '2024-05-25T13:00:00', scheduledArrival: '2024-05-25T20:30:00', status: 'CANCELLED', gate: 'G02', delayMinutes: 0 },
    { id: 5, flightNumber: 'AT505', aircraftId: 1, aircraftRegistration: 'CN-RGN', origin: 'MAD', destination: 'CMN', scheduledDeparture: '2024-05-25T09:00:00', scheduledArrival: '2024-05-25T10:15:00', status: 'ARRIVED', gate: 'H05', delayMinutes: 0 },
    { id: 6, flightNumber: 'AT600', aircraftId: 8, aircraftRegistration: 'CN-ROH', origin: 'CMN', destination: 'DKR', scheduledDeparture: '2024-05-25T14:30:00', scheduledArrival: '2024-05-25T17:45:00', status: 'SCHEDULED', gate: 'B12', delayMinutes: 0 },
    { id: 7, flightNumber: 'AT701', aircraftId: 5, aircraftRegistration: 'CN-ROM', origin: 'AGA', destination: 'CMN', scheduledDeparture: '2024-05-25T15:00:00', scheduledArrival: '2024-05-25T16:15:00', status: 'SCHEDULED', gate: 'A03', delayMinutes: 0 },
    { id: 8, flightNumber: 'AT900', aircraftId: 7, aircraftRegistration: 'CN-RGX', origin: 'CMN', destination: 'YUL', scheduledDeparture: '2024-05-25T08:30:00', scheduledArrival: '2024-05-25T12:00:00', status: 'ARRIVED', gate: 'D01', delayMinutes: 12 },
];

export const mockEmployees = [
    { id: 1, firstName: 'Ahmed', lastName: 'Khan', email: 'a.khan@ram.ma', role: 'TECHNICIAN', department: 'Maintenance', hireDate: '2020-03-15', status: 'ACTIVE' },
    { id: 2, firstName: 'Fatima', lastName: 'Zahra', email: 'f.zahra@ram.ma', role: 'MANAGER', department: 'Operations', hireDate: '2019-08-22', status: 'ACTIVE' },
    { id: 3, firstName: 'Youssef', lastName: 'El Amrani', email: 'y.amrani@ram.ma', role: 'TECHNICIAN', department: 'Maintenance', hireDate: '2021-01-10', status: 'ACTIVE' },
    { id: 4, firstName: 'Sara', lastName: 'Benani', email: 's.benani@ram.ma', role: 'MANAGER', department: 'Safety', hireDate: '2018-11-05', status: 'ACTIVE' },
    { id: 5, firstName: 'Omar', lastName: 'Cherkaoui', email: 'o.cherkaoui@ram.ma', role: 'TECHNICIAN', department: 'Engine Workshop', hireDate: '2022-04-12', status: 'ACTIVE' },
    { id: 6, firstName: 'Mehdi', lastName: 'Lahlou', email: 'm.lahlou@ram.ma', role: 'TECHNICIAN', department: 'Avionics', hireDate: '2020-06-20', status: 'ACTIVE' },
    { id: 7, firstName: 'Zineb', lastName: 'Tazi', email: 'z.tazi@ram.ma', role: 'TECHNICIAN', department: 'Maintenance', hireDate: '2021-09-15', status: 'ACTIVE' },
    { id: 8, firstName: 'Karim', lastName: 'Mansouri', email: 'k.karim@ram.ma', role: 'ADMIN', department: 'Administration', hireDate: '2015-02-28', status: 'ACTIVE' },
];

export const mockDefects = [
    { id: 1, aircraftId: 1, aircraftRegistration: 'CN-RGN', description: 'Engine #2 oil pressure low alert during cruise.', severity: 'CRITICAL', status: 'OPEN', reportedDate: '2024-05-24', reportedBy: 'Capt. Mansouri', priority: 'HIGH' },
    { id: 2, aircraftId: 2, aircraftRegistration: 'CN-ROB', description: 'Landing gear indicator light flickering on descent.', severity: 'MAJOR', status: 'IN_PROGRESS', reportedDate: '2024-05-23', reportedBy: 'Tech Ahmed', priority: 'MEDIUM' },
    { id: 3, aircraftId: 4, aircraftRegistration: 'CN-RGP', description: 'Cabin lighting system inoperative rows 12-15.', severity: 'MINOR', status: 'OPEN', reportedDate: '2024-05-24', reportedBy: 'Senior FA', priority: 'LOW' },
    { id: 4, aircraftId: 8, aircraftRegistration: 'CN-ROH', description: 'VHF Radio 1 periodic noise interference.', severity: 'MAJOR', status: 'RESOLVED', reportedDate: '2024-05-22', reportedBy: 'Tech Mehdi', priority: 'HIGH' },
    { id: 5, aircraftId: 5, aircraftRegistration: 'CN-ROM', description: 'Nose wheel steering slightly sluggish.', severity: 'MINOR', status: 'OPEN', reportedDate: '2024-05-24', reportedBy: 'Capt. Tazi', priority: 'MEDIUM' },
];

export const mockWorkOrders = [
    { id: 1, title: 'Engine #2 Inspection', description: 'Oil pressure sensor check and filter replacement.', aircraftRegistration: 'CN-RGN', lead: 'Ahmed K.', status: 'IN_PROGRESS', progress: 45, due: '2024-05-26', priority: 'CRITICAL' },
    { id: 2, title: 'Landing Gear Service', description: 'Sensor replacement and harness inspection.', aircraftRegistration: 'CN-ROB', lead: 'Mehdi L.', status: 'IN_PROGRESS', progress: 15, due: '2024-06-02', priority: 'HIGH' },
    { id: 3, title: 'A-Check (Standard)', description: 'Routine 500FH inspection cycle.', aircraftRegistration: 'CN-RGO', lead: 'Yassine K.', status: 'COMPLETED', progress: 100, due: '2024-05-20', priority: 'MEDIUM' },
    { id: 4, title: 'Avionics Upgrade', description: 'Software update for FMS version 4.2.', aircraftRegistration: 'CN-RGX', lead: 'Zineb T.', status: 'PLANNED', progress: 0, due: '2024-06-10', priority: 'LOW' },
];

export const mockMaintenance = [
    { id: 1, aircraftId: 1, aircraftRegistration: 'CN-RGN', type: 'A-Check', description: 'Standard 500FH cycle check', startDate: '2024-05-25', endDate: '2024-05-27', technicianName: 'Fatima Z.', status: 'IN_PROGRESS', severity: 'MEDIUM', progress: 65 },
    { id: 2, aircraftId: 2, aircraftRegistration: 'CN-ROB', type: 'Engine Swap', description: 'Planned engine rotation S/N 4421', startDate: '2024-05-20', endDate: '2024-05-22', technicianName: 'Ahmed K.', status: 'COMPLETED', severity: 'CRITICAL', progress: 100 },
    { id: 3, aircraftId: 3, aircraftRegistration: 'CN-RGO', type: 'B-Check', description: 'Intermediate 2500FH check', startDate: '2024-06-01', endDate: '2024-06-05', technicianName: 'Youssef E.', status: 'PLANNED', severity: 'HIGH', progress: 0 },
    { id: 4, aircraftId: 4, aircraftRegistration: 'CN-RGP', type: 'Avionics Insp.', description: 'Semi-annual comms check', startDate: '2024-05-26', endDate: '2024-05-26', technicianName: 'Omar C.', status: 'IN_PROGRESS', severity: 'LOW', progress: 30 },
];

export const mockWorkPackages = [
    { id: 1, packageNumber: 'WP-RAM-001', title: 'Heavy Maintenance C1', description: 'Structural inspection and cabin refresh for CN-RGN', aircraftRegistration: 'CN-RGN', tasks: 24, status: 'IN_PROGRESS', progress: 45, scheduledStartDate: '2024-06-15', scheduledEndDate: '2024-07-10', priority: 'HIGH' },
    { id: 2, packageNumber: 'WP-RAM-002', title: 'Engine Hot Section', description: 'Inspection for S/N 876543 on CN-RGB', aircraftRegistration: 'CN-RGB', tasks: 8, status: 'PLANNED', progress: 0, scheduledStartDate: '2024-05-20', scheduledEndDate: '2024-05-25', priority: 'CRITICAL' },
];

export const mockKPIs = {
    totalFlights: 1542,
    activeFlights: 8,
    onTimePerformance: 92.4,
    averageDelayMinutes: 14.5,
    openDefects: 14,
    criticalDefects: 2,
    totalAircraft: 52,
    aircraftInMaintenance: 4,
    maintenanceCompletionRate: 88.1,
    openWorkOrders: 18,
    overdueWorkOrders: 0,
    availableTechnicians: 14,
    totalEmployees: 42
};