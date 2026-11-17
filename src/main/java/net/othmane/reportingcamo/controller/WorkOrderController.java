package net.othmane.reportingcamo.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import net.othmane.reportingcamo.dto.WorkOrderDTO;
import net.othmane.reportingcamo.service.WorkOrderService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/work-orders")
@RequiredArgsConstructor
public class WorkOrderController {

    private final WorkOrderService workOrderService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'TECHNICIAN')")
    public ResponseEntity<List<WorkOrderDTO>> getAllWorkOrders() {
        return ResponseEntity.ok(workOrderService.getAllWorkOrders());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'TECHNICIAN')")
    public ResponseEntity<WorkOrderDTO> getWorkOrderById(@PathVariable Integer id) {
        return ResponseEntity.ok(workOrderService.getWorkOrderById(id));
    }

    @GetMapping("/maintenance/{maintenanceId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'TECHNICIAN')")
    public ResponseEntity<List<WorkOrderDTO>> getWorkOrdersByMaintenance(@PathVariable Integer maintenanceId) {
        return ResponseEntity.ok(workOrderService.getWorkOrdersByMaintenance(maintenanceId));
    }

    @GetMapping("/status/{status}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'TECHNICIAN')")
    public ResponseEntity<List<WorkOrderDTO>> getWorkOrdersByStatus(@PathVariable String status) {
        return ResponseEntity.ok(workOrderService.getWorkOrdersByStatus(status));
    }

    @GetMapping("/technician/{technicianId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'TECHNICIAN')")
    public ResponseEntity<List<WorkOrderDTO>> getWorkOrdersByTechnician(@PathVariable Integer technicianId) {
        return ResponseEntity.ok(workOrderService.getWorkOrdersByTechnician(technicianId));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<WorkOrderDTO> createWorkOrder(@Valid @RequestBody WorkOrderDTO dto) {
        return new ResponseEntity<>(workOrderService.createWorkOrder(dto), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<WorkOrderDTO> updateWorkOrder(@PathVariable Integer id,
                                                        @Valid @RequestBody WorkOrderDTO dto) {
        return ResponseEntity.ok(workOrderService.updateWorkOrder(id, dto));
    }

    @PatchMapping("/{id}/assign")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<WorkOrderDTO> assignWorkOrder(
            @PathVariable Integer id,
            @RequestParam Integer technicianId) {
        return ResponseEntity.ok(workOrderService.assignWorkOrder(id, technicianId));
    }

    @PatchMapping("/{id}/complete")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'TECHNICIAN')")
    public ResponseEntity<WorkOrderDTO> completeWorkOrder(
            @PathVariable Integer id,
            @RequestParam BigDecimal actualHours) {
        return ResponseEntity.ok(workOrderService.completeWorkOrder(id, actualHours));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteWorkOrder(@PathVariable Integer id) {
        workOrderService.deleteWorkOrder(id);
        return ResponseEntity.noContent().build();
    }
}