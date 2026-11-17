package net.othmane.reportingcamo.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.othmane.reportingcamo.entity.*;
import net.othmane.reportingcamo.repository.*;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class ImportController {

    private final AircraftRepository aircraftRepository;
    private final EmployeeRepository employeeRepository;
    private final FlightRepository flightRepository;
    private final MaintenanceRepository maintenanceRepository;
    private final DefectRepository defectRepository;

    @PostMapping("/validate-all-imports")
    @Transactional
    public ResponseEntity<?> validateAllImports(@RequestBody Map<String, List<Map<String, Object>>> payload) {
        log.info("Starting global validation for RAM data sync...");

        try {
            // 1. Process Fleet
            if (payload.containsKey("fleet") && payload.get("fleet") != null) {
                for (Map<String, Object> item : payload.get("fleet")) {
                    try {
                        String reg = getString(item, "Immatriculation");
                        if (reg == null) continue;
                        Aircraft ac = aircraftRepository.findByRegistration(reg).orElseGet(Aircraft::new);
                        ac.setRegistration(reg);
                        ac.setType(getString(item, "Type", "B737"));
                        ac.setModel(getString(item, "Modèle", getString(item, "Modele", "Standard")));
                        String stat = getString(item, "Statut", "Actif");
                        ac.setStatus(stat.equalsIgnoreCase("Actif") ? Aircraft.AircraftStatus.ACTIVE : Aircraft.AircraftStatus.MAINTENANCE);
                        aircraftRepository.save(ac);
                    } catch (Exception e) { log.warn("Error row fleet: {}", e.getMessage()); }
                }
            }

            // 2. Process Personnel
            if (payload.containsKey("personnel") && payload.get("personnel") != null) {
                for (Map<String, Object> item : payload.get("personnel")) {
                    try {
                        String matricule = getString(item, "Matricule");
                        if (matricule == null) continue;
                        Employee emp = employeeRepository.findByEmployeeNumber(matricule).orElseGet(Employee::new);
                        emp.setEmployeeNumber(matricule);
                        emp.setLastName(getString(item, "Nom", "Unknown"));
                        emp.setFirstName(getString(item, "Prenom", "User"));
                        emp.setEmail(getString(item, "Email"));
                        emp.setDepartment(getString(item, "Departement", "Maintenance"));
                        emp.setPosition(getString(item, "Fonction", "Technician"));
                        emp.setStatus(Employee.EmployeeStatus.ACTIVE);
                        employeeRepository.save(emp);
                    } catch (Exception e) { log.warn("Error row personnel: {}", e.getMessage()); }
                }
            }

            // 3. Process Flights
            if (payload.containsKey("flights") && payload.get("flights") != null) {
                for (Map<String, Object> item : payload.get("flights")) {
                    try {
                        String fnum = getString(item, "Flight_Number");
                        if (fnum == null) continue;
                        Flight f = flightRepository.findByFlightNumber(fnum).orElseGet(Flight::new);
                        f.setFlightNumber(fnum);
                        f.setOrigin(getString(item, "Origin", "CMN"));
                        f.setDestination(getString(item, "Destination", "RAK"));
                        f.setGate(getString(item, "Gate", "A1"));
                        
                        String acReg = getString(item, "Aircraft");
                        if (acReg != null) aircraftRepository.findByRegistration(acReg).ifPresent(f::setAircraft);
                        
                        if (f.getScheduledDeparture() == null) f.setScheduledDeparture(LocalDateTime.now().plusHours(1));
                        if (f.getScheduledArrival() == null) f.setScheduledArrival(LocalDateTime.now().plusHours(3));
                        
                        f.setStatus(parseFlightStatus(getString(item, "Status")));
                        flightRepository.save(f);
                    } catch (Exception e) { log.warn("Error row flight: {}", e.getMessage()); }
                }
            }

            // 4. Process Maintenance
            if (payload.containsKey("maintenance") && payload.get("maintenance") != null) {
                for (Map<String, Object> item : payload.get("maintenance")) {
                    try {
                        Maintenance m = new Maintenance();
                        String acReg = getString(item, "Aircraft");
                        if (acReg != null) aircraftRepository.findByRegistration(acReg).ifPresent(m::setAircraft);
                        
                        m.setMaintenanceType(parseMaintType(getString(item, "Maintenance_Type")));
                        m.setDescription(getString(item, "Task_Description", "Scheduled Check"));
                        m.setStartDate(LocalDate.now());
                        m.setStatus(Maintenance.MaintenanceStatus.PLANNED);
                        
                        Object cost = item.get("Estimated_Cost_MAD");
                        m.setCost(cost != null ? new BigDecimal(cost.toString()) : BigDecimal.ZERO);
                        
                        maintenanceRepository.save(m);
                    } catch (Exception e) { log.warn("Error row maintenance: {}", e.getMessage()); }
                }
            }

            // 5. Process Defects
            if (payload.containsKey("defects") && payload.get("defects") != null) {
                for (Map<String, Object> item : payload.get("defects")) {
                    try {
                        Defect d = new Defect();
                        String acReg = getString(item, "Aircraft");
                        if (acReg != null) aircraftRepository.findByRegistration(acReg).ifPresent(d::setAircraft);
                        
                        d.setDescription(getString(item, "Description", "Issue reported"));
                        d.setSeverity(parseSeverity(getString(item, "Severity")));
                        d.setStatus(Defect.DefectStatus.OPEN);
                        d.setReportedDate(LocalDateTime.now());
                        
                        defectRepository.save(d);
                    } catch (Exception e) { log.warn("Error row defect: {}", e.getMessage()); }
                }
            }

            return ResponseEntity.ok(Map.of("success", true, "message", "Data synchronized successfully"));

        } catch (Exception e) {
            log.error("Global import failed: {}", e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of("success", false, "error", e.getMessage()));
        }
    }

    private String getString(Map<String, Object> map, String key) { return getString(map, key, null); }
    private String getString(Map<String, Object> map, String key, String def) {
        Object v = map.get(key);
        return v != null ? String.valueOf(v) : def;
    }

    private Flight.FlightStatus parseFlightStatus(String s) {
        if (s == null) return Flight.FlightStatus.SCHEDULED;
        try { return Flight.FlightStatus.valueOf(s.toUpperCase()); } catch (Exception e) { return Flight.FlightStatus.SCHEDULED; }
    }

    private Maintenance.MaintenanceType parseMaintType(String s) {
        if (s == null) return Maintenance.MaintenanceType.LINE;
        String n = s.toUpperCase().replace("-", "_").replace(" ", "_");
        try { return Maintenance.MaintenanceType.valueOf(n); } catch (Exception e) { return Maintenance.MaintenanceType.LINE; }
    }

    private Defect.DefectSeverity parseSeverity(String s) {
        if (s == null) return Defect.DefectSeverity.MINOR;
        try { return Defect.DefectSeverity.valueOf(s.toUpperCase()); } catch (Exception e) { return Defect.DefectSeverity.MINOR; }
    }
}