package net.othmane.reportingcamo.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name="aircraft", indexes = {
    @Index(name = "idx_aircraft_registration", columnList = "registration", unique = true),
    @Index(name = "idx_aircraft_status", columnList = "status"),
    @Index(name = "idx_aircraft_next_maintenance", columnList = "next_maintenance_due")
})
@Getter
@Setter
@ToString(onlyExplicitlyIncluded = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Aircraft {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @ToString.Include
    private Integer id;

    @Version
    private Long version;

    @Column(nullable = false, unique = true, length = 20)
    @ToString.Include
    private String registration;

    @Column(nullable = false, length = 50)
    private String type;

    @Column(length = 100)
    private String model;

    @Column(length = 100)
    private String manufacturer;

    @Column(name = "year_of_manufacture")
    private Integer yearOfManufacture;

    @Column(name = "total_flight_hours", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal totalFlightHours = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    @Builder.Default
    private AircraftStatus status = AircraftStatus.ACTIVE;

    @Column(name = "last_maintenance_date")
    private LocalDate lastMaintenanceDate;

    @Column(name = "next_maintenance_due")
    private LocalDate nextMaintenanceDue;

    @Column(name = "serial_number", length = 50)
    private String serialNumber;

    @Column(name = "seating_capacity", length = 50)
    private String seatingCapacity;

    @Column(name = "length_m", precision = 10, scale = 2)
    private BigDecimal lengthM;

    @Column(name = "cruise_altitude_m")
    private Integer cruiseAltitudeM;

    @Column(name = "cruise_speed_kmh")
    private Integer cruiseSpeedKmh;

    @Enumerated(EnumType.STRING)
    @Column(name = "cabin_configuration", length = 20)
    @Builder.Default
    private CabinConfiguration cabinConfiguration = CabinConfiguration.ECONOMY;

    @Column(name = "autonomy_km")
    private Integer autonomyKm;

    @Enumerated(EnumType.STRING)
    @Column(name = "primary_role", length = 20)
    @Builder.Default
    private AircraftRole primaryRole = AircraftRole.PASSENGER;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public enum AircraftStatus {
        ACTIVE, MAINTENANCE, GROUNDED, RETIRED
    }

    public enum CabinConfiguration {
        ECONOMY, BUSINESS, FIRST, MIXED, ALL_CARGO
    }

    public enum AircraftRole {
        PASSENGER, FREIGHT, VIP, MILITARY, TRAINING
    }

    public boolean needsMaintenance() {
        return status == AircraftStatus.MAINTENANCE
                || (nextMaintenanceDue != null && nextMaintenanceDue.isBefore(LocalDate.now()));
    }
}
