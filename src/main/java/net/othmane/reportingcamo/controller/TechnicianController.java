package net.othmane.reportingcamo.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import net.othmane.reportingcamo.dto.TechnicianDTO;
import net.othmane.reportingcamo.service.TechnicianService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/technicians")
@RequiredArgsConstructor
public class TechnicianController {

    private final TechnicianService technicianService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'TECHNICIAN')")
    public ResponseEntity<List<TechnicianDTO>> getAllTechnicians() {
        return ResponseEntity.ok(technicianService.getAllTechnicians());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'TECHNICIAN')")
    public ResponseEntity<TechnicianDTO> getTechnicianById(@PathVariable Integer id) {
        return ResponseEntity.ok(technicianService.getTechnicianById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<TechnicianDTO> createTechnician(@Valid @RequestBody TechnicianDTO dto) {
        return new ResponseEntity<>(technicianService.createTechnician(dto), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<TechnicianDTO> updateTechnician(@PathVariable Integer id,
                                                          @Valid @RequestBody TechnicianDTO dto) {
        return ResponseEntity.ok(technicianService.updateTechnician(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteTechnician(@PathVariable Integer id) {
        technicianService.deleteTechnician(id);
        return ResponseEntity.noContent().build();
    }
}
