package net.othmane.reportingcamo.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DashboardKPIDTO {
    private long totalFlights;
    private long activeFlights;
    private long delayedFlights;
    private long cancelledFlights;
    private double onTimePerformance;
    private double averageDelayMinutes;
    private long totalAircraft;
    private long aircraftInMaintenance;
    private long openDefects;
    private long criticalDefects;
    private long openWorkOrders;
    private long overdueWorkOrders;
    private double maintenanceCompletionRate;
    private long totalEmployees;
    private long availableTechnicians;
}