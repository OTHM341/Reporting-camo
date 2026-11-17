package net.othmane.reportingcamo.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import net.othmane.reportingcamo.dto.DefectDTO;
import net.othmane.reportingcamo.service.DefectService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/defect")
@RequiredArgsConstructor
public class DefectController {

    private final DefectService defectService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'TECHNICIAN')")
    public ResponseEntity<List<DefectDTO>> getAllDefects() {
        return ResponseEntity.ok(defectService.getAllDefects());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'TECHNICIAN')")
    public ResponseEntity<DefectDTO> getDefectById(@PathVariable Integer id) {
        return ResponseEntity.ok(defectService.getDefectById(id));
    }

    @GetMapping("/aircraft/{aircraftId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'TECHNICIAN')")
    public ResponseEntity<List<DefectDTO>> getDefectsByAircraft(@PathVariable Integer aircraftId) {
        return ResponseEntity.ok(defectService.getDefectsByAircraft(aircraftId));
    }

    @GetMapping("/status/{status}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'TECHNICIAN')")
    public ResponseEntity<List<DefectDTO>> getDefectsByStatus(@PathVariable String status) {
        return ResponseEntity.ok(defectService.getDefectsByStatus(status));
    }

    @GetMapping("/critical")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'TECHNICIAN')")
    public ResponseEntity<List<DefectDTO>> getCriticalDefects() {
        return ResponseEntity.ok(defectService.getCriticalDefects());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'TECHNICIAN')")
    public ResponseEntity<DefectDTO> createDefect(@Valid @RequestBody DefectDTO dto) {
        return new ResponseEntity<>(defectService.createDefect(dto), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'TECHNICIAN')")
    public ResponseEntity<DefectDTO> updateDefect(@PathVariable Integer id,
                                                  @Valid @RequestBody DefectDTO dto) {
        return ResponseEntity.ok(defectService.updateDefect(id, dto));
    }

    @PatchMapping("/{id}/resolve")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'TECHNICIAN')")
    public ResponseEntity<DefectDTO> resolveDefect(
            @PathVariable Integer id,
            @RequestParam String resolution) {
        return ResponseEntity.ok(defectService.resolveDefect(id, resolution));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteDefect(@PathVariable Integer id) {
        defectService.deleteDefect(id);
        return ResponseEntity.noContent().build();
    }
}
