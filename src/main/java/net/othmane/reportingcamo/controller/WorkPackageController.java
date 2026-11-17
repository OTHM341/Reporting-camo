package net.othmane.reportingcamo.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import net.othmane.reportingcamo.dto.WorkPackageDTO;
import net.othmane.reportingcamo.service.WorkPackageService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/work-packages")
@RequiredArgsConstructor
public class WorkPackageController {

    private final WorkPackageService workPackageService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'TECHNICIAN')")
    public ResponseEntity<List<WorkPackageDTO>> getAllWorkPackages() {
        return ResponseEntity.ok(workPackageService.getAllWorkPackages());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'TECHNICIAN')")
    public ResponseEntity<WorkPackageDTO> getWorkPackageById(@PathVariable Integer id) {
        return ResponseEntity.ok(workPackageService.getWorkPackageById(id));
    }

    @GetMapping("/maintenance/{maintenanceId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'TECHNICIAN')")
    public ResponseEntity<List<WorkPackageDTO>> getWorkPackagesByMaintenance(@PathVariable Integer maintenanceId) {
        return ResponseEntity.ok(workPackageService.getWorkPackagesByMaintenance(maintenanceId));
    }

    @GetMapping("/status/{status}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'TECHNICIAN')")
    public ResponseEntity<List<WorkPackageDTO>> getWorkPackagesByStatus(@PathVariable String status) {
        return ResponseEntity.ok(workPackageService.getWorkPackagesByStatus(status));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<WorkPackageDTO> createWorkPackage(@Valid @RequestBody WorkPackageDTO dto) {
        return new ResponseEntity<>(workPackageService.createWorkPackage(dto), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<WorkPackageDTO> updateWorkPackage(@PathVariable Integer id,
                                                             @Valid @RequestBody WorkPackageDTO dto) {
        return ResponseEntity.ok(workPackageService.updateWorkPackage(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteWorkPackage(@PathVariable Integer id) {
        workPackageService.deleteWorkPackage(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{packageId}/work-orders/{workOrderId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<WorkPackageDTO> addWorkOrderToPackage(
            @PathVariable Integer packageId,
            @PathVariable Integer workOrderId) {
        return ResponseEntity.ok(workPackageService.addWorkOrderToPackage(packageId, workOrderId));
    }

    @DeleteMapping("/{packageId}/work-orders/{workOrderId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<WorkPackageDTO> removeWorkOrderFromPackage(
            @PathVariable Integer packageId,
            @PathVariable Integer workOrderId) {
        return ResponseEntity.ok(workPackageService.removeWorkOrderFromPackage(packageId, workOrderId));
    }
}