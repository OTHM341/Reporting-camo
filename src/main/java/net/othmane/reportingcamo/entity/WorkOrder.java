package net.othmane.reportingcamo.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.NotFound;
import org.hibernate.annotations.NotFoundAction;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "work_order")
@Getter
@Setter
@ToString(onlyExplicitlyIncluded = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @ToString.Include
    private Integer id;

    @Version
    private Long version;

    @Column(name = "order_number", nullable = false, unique = true, length = 30)
    @ToString.Include
    private String orderNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "maintenance_id")
    @NotFound(action = NotFoundAction.IGNORE)
    private Maintenance maintenance;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    @Builder.Default
    private Priority priority = Priority.NORMAL;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    @Builder.Default
    private WorkOrderStatus status = WorkOrderStatus.OPEN;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_to")
    @NotFound(action = NotFoundAction.IGNORE)
    private Technician assignedTo;

    @Column(name = "estimated_hours", precision = 6, scale = 2)
    private BigDecimal estimatedHours;

    @Column(name = "actual_hours", precision = 6, scale = 2)
    private BigDecimal actualHours;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Column(name = "completed_date")
    private LocalDateTime completedDate;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @ManyToMany(mappedBy = "workOrders", cascade = {jakarta.persistence.CascadeType.PERSIST, jakarta.persistence.CascadeType.MERGE})
    @Builder.Default
    private Set<WorkPackage> workPackages = new HashSet<>();

    public enum Priority {
        LOW, NORMAL, HIGH, URGENT
    }

    public enum WorkOrderStatus {
        OPEN, ASSIGNED, IN_PROGRESS, COMPLETED, CANCELLED
    }

    public boolean isOverdue() {
        return dueDate != null
                && status != WorkOrderStatus.COMPLETED
                && status != WorkOrderStatus.CANCELLED
                && dueDate.isBefore(LocalDate.now());
    }
}
