package net.othmane.reportingcamo.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class TechnicianDTO {

    private Integer id;
    private Integer employeeId;
    private String employeeNumber;

    @NotBlank(message = "First name is required")
    private String firstName;

    @NotBlank(message = "Last name is required")
    private String lastName;

    private String fullName;
    private String email;
    private String phone;
    private String department;
    private String status;
    private String licenseNumber;
    private String specialization;
    private String certificationLevel;
    private Boolean availability;
}
