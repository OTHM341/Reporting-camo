package net.othmane.reportingcamo.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class WorkOrderDTO {

    private Integer id;

    @NotBlank(message = "Order number is required")
    private String orderNumber;

    private Integer maintenanceId;
    private String maintenanceType;

    @NotBlank(message = "Description is required")
    private String description;

    private String priority;
    private String status;
    private Integer assignedTo;
    private String assignedTechnicianName;
    private BigDecimal estimatedHours;
    private BigDecimal actualHours;
    private LocalDate dueDate;
    private LocalDateTime completedDate;
    private boolean overdue;
}
