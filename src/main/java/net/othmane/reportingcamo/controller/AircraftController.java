package net.othmane.reportingcamo.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import net.othmane.reportingcamo.dto.AircraftDTO;
import net.othmane.reportingcamo.service.AircraftService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/aircraft")
@RequiredArgsConstructor
public class AircraftController {

    private final AircraftService aircraftService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'TECHNICIAN')")
    public ResponseEntity<List<AircraftDTO>> getAllAircraft() {
        return ResponseEntity.ok(aircraftService.getAllAircraft());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'TECHNICIAN')")
    public ResponseEntity<AircraftDTO> getAircraftById(@PathVariable Integer id) {
        return ResponseEntity.ok(aircraftService.getAircraftById(id));
    }

    @GetMapping("/status/{status}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'TECHNICIAN')")
    public ResponseEntity<List<AircraftDTO>> getAircraftByStatus(@PathVariable String status) {
        return ResponseEntity.ok(aircraftService.getAircraftByStatus(status));
    }

    @GetMapping("/due-maintenance")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'TECHNICIAN')")
    public ResponseEntity<List<AircraftDTO>> getAircraftDueForMaintenance() {
        return ResponseEntity.ok(aircraftService.getAircraftDueForMaintenance());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<AircraftDTO> createAircraft(@Valid @RequestBody AircraftDTO dto) {
        return new ResponseEntity<>(aircraftService.createAircraft(dto), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<AircraftDTO> updateAircraft(@PathVariable Integer id,
                                                      @Valid @RequestBody AircraftDTO dto) {
        return ResponseEntity.ok(aircraftService.updateAircraft(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteAircraft(@PathVariable Integer id) {
        aircraftService.deleteAircraft(id);
        return ResponseEntity.noContent().build();
    }
}
