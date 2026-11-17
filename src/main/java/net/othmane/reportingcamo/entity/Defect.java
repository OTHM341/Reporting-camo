package net.othmane.reportingcamo.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.NotFound;
import org.hibernate.annotations.NotFoundAction;

import java.time.LocalDateTime;

@Entity
@Table(name = "defect", indexes = {
    @Index(name = "idx_defect_aircraft", columnList = "aircraft_id"),
    @Index(name = "idx_defect_status", columnList = "status"),
    @Index(name = "idx_defect_severity", columnList = "severity"),
    @Index(name = "idx_defect_reported_date", columnList = "reported_date")
})
@Getter
@Setter
@ToString(onlyExplicitlyIncluded = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Defect {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @ToString.Include
    private Integer id;

    @Version
    private Long version;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "aircraft_id")
    @NotFound(action = NotFoundAction.IGNORE)
    private Aircraft aircraft;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "flight_id")
    @NotFound(action = NotFoundAction.IGNORE)
    private Flight flight;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(length = 50)
    private String category;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    @Builder.Default
    private DefectSeverity severity = DefectSeverity.MINOR;

    @ManyToOne(fetch = FetchType.LAZY, optional = true)
    @JoinColumn(name = "reported_by", nullable = true)
    @NotFound(action = NotFoundAction.IGNORE)
    private Employee reportedBy;

    @Column(name = "reported_date")
    @CreationTimestamp
    private LocalDateTime reportedDate;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    @Builder.Default
    private DefectStatus status = DefectStatus.OPEN;

    @Column(columnDefinition = "TEXT")
    private String resolution;

    @Column(name = "resolved_date")
    private LocalDateTime resolvedDate;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public enum DefectSeverity {
        MINOR, MAJOR, CRITICAL
    }

    public enum DefectStatus {
        OPEN, IN_PROGRESS, RESOLVED, CLOSED
    }

    public boolean isCritical() {
        return severity == DefectSeverity.CRITICAL;
    }

    public boolean isResolved() {
        return status == DefectStatus.RESOLVED || status == DefectStatus.CLOSED;
    }
}
