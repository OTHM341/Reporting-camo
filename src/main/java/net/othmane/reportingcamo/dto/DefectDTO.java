package net.othmane.reportingcamo.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class DefectDTO {

    private Integer id;

    @NotNull(message = "Aircraft ID is required")
    private Integer aircraftId;
    private String aircraftRegistration;

    private Integer flightId;
    private String flightNumber;

    @NotBlank(message = "Description is required")
    @Size(min = 10, max = 2000, message = "Description must be between 10 and 2000 characters")
    private String description;

    @Size(max = 50, message = "Category must not exceed 50 characters")
    private String category;

    @Pattern(regexp = "MINOR|MAJOR|CRITICAL", message = "Severity must be MINOR, MAJOR, or CRITICAL")
    private String severity;
    private Integer reportedBy;

    @Email(message = "Reporter email must be valid")
    @Size(max = 255, message = "Email must not exceed 255 characters")
    private String reportedByEmail;
    private String reporterName;
    private LocalDateTime reportedDate;

    @Pattern(regexp = "OPEN|IN_PROGRESS|RESOLVED|CLOSED", message = "Status must be OPEN, IN_PROGRESS, RESOLVED, or CLOSED")
    private String status;

    @Size(max = 2000, message = "Resolution must not exceed 2000 characters")
    private String resolution;
    private LocalDateTime resolvedDate;
    private boolean critical;
    private boolean resolved;
}
