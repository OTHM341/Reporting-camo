package net.othmane.reportingcamo.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class WorkPackageDTO {

    private Integer id;

    @NotBlank(message = "Package number is required")
    private String packageNumber;

    private Integer maintenanceId;
    private String maintenanceType;

    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    private String status;

    private LocalDate startDate;
    private LocalDate endDate;

    private List<Integer> workOrderIds;
}