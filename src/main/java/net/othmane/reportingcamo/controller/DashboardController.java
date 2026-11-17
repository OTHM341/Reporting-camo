package net.othmane.reportingcamo.controller;

import lombok.RequiredArgsConstructor;
import net.othmane.reportingcamo.dto.DashboardKPIDTO;
import net.othmane.reportingcamo.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/kpis")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'TECHNICIAN')")
    public ResponseEntity<DashboardKPIDTO> getDashboardKPIs() {
        return ResponseEntity.ok(dashboardService.getDashboardKPIs());
    }
}
