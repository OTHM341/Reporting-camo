package net.othmane.reportingcamo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class MaintenanceDTO {

    private Integer id;

    @NotNull(message = "Aircraft ID is required")
    private Integer aircraftId;
    private String aircraftRegistration;

    @NotBlank(message = "Maintenance type is required")
    private String maintenanceType;

    private String description;

    @NotNull(message = "Start date is required")
    private LocalDate startDate;

    private LocalDate endDate;
    private String status;
    private Integer technicianId;
    private String technicianName;
    private BigDecimal cost;
    private boolean overdue;
    private boolean completed;
}
