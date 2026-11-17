package net.othmane.reportingcamo.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;

@Data
public class EmployeeDTO {

    private Integer id;

    @Pattern(regexp = "^[A-Z]{2}-\\d{4}$", message = "Employee number must follow format RAM-XXXX")
    @Size(max = 20, message = "Employee number must not exceed 20 characters")
    private String employeeNumber;

    @NotBlank(message = "First name is required")
    private String firstName;

    @NotBlank(message = "Last name is required")
    private String lastName;

    private String email;
    private String phone;
    private String department;
    private String position;
    private LocalDate hireDate;
    private String status;
    private String fullName;
    private String role;
    private Integer technicianId;
}
