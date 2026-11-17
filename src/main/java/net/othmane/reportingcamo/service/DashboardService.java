package net.othmane.reportingcamo.service;

import lombok.RequiredArgsConstructor;
import net.othmane.reportingcamo.dto.DashboardKPIDTO;
import net.othmane.reportingcamo.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final FlightRepository flightRepository;
    private final AircraftRepository aircraftRepository;
    private final DefectRepository defectRepository;
    private final MaintenanceRepository maintenanceRepository;
    private final WorkOrderRepository workOrderRepository;
    private final EmployeeRepository employeeRepository;
    private final TechnicianRepository technicianRepository;

    @Transactional(readOnly = true)
    public DashboardKPIDTO getDashboardKPIs() {
        long totalFlights = flightRepository.count();
        long activeFlights = flightRepository.countActiveFlights();
        long delayedFlights = flightRepository.countDelayedFlights();
        long cancelledFlights = flightRepository.countCancelledFlights();

        double onTimePerformance = 0.0;
        long arrivedFlights = flightRepository.countArrivedFlights();
        long onTimeFlights = flightRepository.countOnTimeFlights();
        if (arrivedFlights > 0) {
            onTimePerformance = (onTimeFlights * 100.0) / arrivedFlights;
        }

        double averageDelay = flightRepository.calculateAverageDelay();

        long totalAircraft = aircraftRepository.count();
        long aircraftInMaintenance = aircraftRepository.countAircraftInMaintenance();

        long openDefects = defectRepository.countOpenDefects();
        long criticalDefects = defectRepository.countCriticalDefects();

        long openWorkOrders = workOrderRepository.countOpenWorkOrders();
        long overdueWorkOrders = workOrderRepository.countOverdueWorkOrders();

        double maintenanceCompletionRate = 0.0;
        long totalMaintenance = maintenanceRepository.countTotalMaintenance();
        long completedMaintenance = maintenanceRepository.countCompletedMaintenance();
        if (totalMaintenance > 0) {
            maintenanceCompletionRate = (completedMaintenance * 100.0) / totalMaintenance;
        }

        long totalEmployees = employeeRepository.countActiveEmployees();
        long availableTechnicians = technicianRepository.countAvailableTechnicians();

        return DashboardKPIDTO.builder()
                .totalFlights(totalFlights)
                .activeFlights(activeFlights)
                .delayedFlights(delayedFlights)
                .cancelledFlights(cancelledFlights)
                .onTimePerformance(Math.round(onTimePerformance * 100.0) / 100.0)
                .averageDelayMinutes(Math.round(averageDelay * 100.0) / 100.0)
                .totalAircraft(totalAircraft)
                .aircraftInMaintenance(aircraftInMaintenance)
                .openDefects(openDefects)
                .criticalDefects(criticalDefects)
                .openWorkOrders(openWorkOrders)
                .overdueWorkOrders(overdueWorkOrders)
                .maintenanceCompletionRate(Math.round(maintenanceCompletionRate * 100.0) / 100.0)
                .totalEmployees(totalEmployees)
                .availableTechnicians(availableTechnicians)
                .build();
    }
}
