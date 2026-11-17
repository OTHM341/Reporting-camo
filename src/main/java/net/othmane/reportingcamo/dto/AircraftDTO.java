package net.othmane.reportingcamo.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class AircraftDTO {
    private Integer id;

    @NotBlank(message = "Registration is required")
    @Pattern(regexp = "^[A-Z0-9-]{3,10}$", message = "Registration must follow valid format (e.g., CN-RGA)")
    @Size(max = 20, message = "Registration must not exceed 20 characters")
    private String registration;

    @NotBlank(message = "Type is required")
    @Size(max = 100, message = "Type must not exceed 100 characters")
    private String type;

    @Size(max = 100, message = "Model must not exceed 100 characters")
    private String model;

    @Size(max = 100, message = "Manufacturer must not exceed 100 characters")
    private String manufacturer;

    @Min(value = 1950, message = "Year of manufacture must be 1950 or later")
    private Integer yearOfManufacture;

    @DecimalMin(value = "0.0", message = "Total flight hours must be non-negative")
    private BigDecimal totalFlightHours;

    @Pattern(regexp = "ACTIVE|MAINTENANCE|GROUNDED|RETIRED", message = "Status must be ACTIVE, MAINTENANCE, GROUNDED, or RETIRED")
    private String status;
    
    private LocalDate lastMaintenanceDate;
    private LocalDate nextMaintenanceDue;
    private boolean maintenanceDue;

    // Specification fields
    @Size(max = 50, message = "Serial number must not exceed 50 characters")
    private String serialNumber;

    @Size(max = 50, message = "Seating capacity must not exceed 50 characters")
    private String seatingCapacity;

    @DecimalMin(value = "0.0", message = "Length must be non-negative")
    private BigDecimal lengthM;

    @Min(value = 0, message = "Cruise altitude must be non-negative")
    private Integer cruiseAltitudeM;

    @Min(value = 0, message = "Cruise speed must be non-negative")
    private Integer cruiseSpeedKmh;

    @Pattern(regexp = "ECONOMY|BUSINESS|FIRST|MIXED|ALL_CARGO", message = "Cabin configuration must be ECONOMY, BUSINESS, FIRST, MIXED, or ALL_CARGO")
    private String cabinConfiguration;

    @Min(value = 0, message = "Autonomy must be non-negative")
    private Integer autonomyKm;

    @Pattern(regexp = "PASSENGER|FREIGHT|VIP|MILITARY|TRAINING", message = "Primary role must be PASSENGER, FREIGHT, VIP, MILITARY, or TRAINING")
    private String primaryRole;
}