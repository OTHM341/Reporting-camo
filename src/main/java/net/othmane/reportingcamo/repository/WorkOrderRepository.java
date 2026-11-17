package net.othmane.reportingcamo.repository;

import net.othmane.reportingcamo.entity.WorkOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WorkOrderRepository extends JpaRepository<WorkOrder, Integer> {

    List<WorkOrder> findByMaintenanceId(Integer maintenanceId);

    List<WorkOrder> findByAssignedToId(Integer technicianId);

    List<WorkOrder> findByStatus(WorkOrder.WorkOrderStatus status);

    List<WorkOrder> findByPriority(WorkOrder.Priority priority);

    @Query("SELECT COUNT(w) FROM WorkOrder w WHERE w.status = 'OPEN' OR w.status = 'ASSIGNED' OR w.status = 'IN_PROGRESS'")
    long countOpenWorkOrders();

    @Query("SELECT COUNT(w) FROM WorkOrder w WHERE w.dueDate < CURRENT_DATE AND w.status NOT IN ('COMPLETED', 'CANCELLED')")
    long countOverdueWorkOrders();
}
