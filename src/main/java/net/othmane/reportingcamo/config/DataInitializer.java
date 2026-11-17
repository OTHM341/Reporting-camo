package net.othmane.reportingcamo.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.othmane.reportingcamo.entity.*;
import net.othmane.reportingcamo.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;
import java.util.Set;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final AircraftRepository aircraftRepository;
    private final FlightRepository flightRepository;
    private final EmployeeRepository employeeRepository;
    private final TechnicianRepository technicianRepository;
    private final MaintenanceRepository maintenanceRepository;
    private final DefectRepository defectRepository;
    private final WorkOrderRepository workOrderRepository;
    private final WorkPackageRepository workPackageRepository;
    private final PasswordEncoder passwordEncoder;

    private final Random random = new Random(42);

    @Override
    @Transactional
    public void run(String... args) {
        log.info("Checking database integrity and technical data population...");

        ensureSecurityRoles();

        if (userRepository.count() == 0) {
            log.info("Initializing administrative users...");
            initUsers();
        }

        if (aircraftRepository.count() == 0) {
            log.info("Initializing Royal Air Maroc fleet assets...");
            initRAMFleet();
        }

        if (employeeRepository.count() == 0) {
            log.info("Initializing workforce personnel registry...");
            initEmployees();
        }

        if (technicianRepository.count() == 0 && employeeRepository.count() > 0) {
            log.info("Assigning maintenance specialist certifications...");
            initTechnicians();
        }

        if (flightRepository.count() == 0 && aircraftRepository.count() > 0) {
            log.info("Initializing flight network operations...");
            initFlights();
        }

        if (maintenanceRepository.count() == 0) {
            log.info("Initializing technical check archives...");
            initMaintenance();
        }

        if (defectRepository.count() == 0) {
            log.info("Initializing technical log/defect registry...");
            initDefects();
        }

        if (workOrderRepository.count() == 0) {
            log.info("Initializing maintenance work orders...");
            initWorkOrders();
        }

        if (workPackageRepository.count() == 0) {
            log.info("Initializing strategic work packages...");
            initWorkPackages();
        }

        log.info("Database synchronization and institutional data population complete.");
    }

    private void ensureSecurityRoles() {
        ensureRole("ADMIN");
        ensureRole("MANAGER");
        ensureRole("TECHNICIAN");
    }

    private void ensureRole(String roleName) {
        if (!roleRepository.existsByName(roleName)) {
            log.info("Initializing missing security role: {}", roleName);
            roleRepository.save(Role.builder().name(roleName).build());
        }
    }

    private void initUsers() {
        Role adminRole = roleRepository.findByName("ADMIN").orElseThrow();
        Role managerRole = roleRepository.findByName("MANAGER").orElseThrow();
        Role techRole = roleRepository.findByName("TECHNICIAN").orElseThrow();

        userRepository.save(AppUser.builder()
                .username("admin")
                .email("admin@ram.ma")
                .password(passwordEncoder.encode("admin123"))
                .firstName("System")
                .lastName("Administrator")
                .roles(Set.of(adminRole))
                .build());

        userRepository.save(AppUser.builder()
                .username("manager")
                .email("manager@ram.ma")
                .password(passwordEncoder.encode("manager123"))
                .firstName("Operations")
                .lastName("Manager")
                .roles(Set.of(managerRole))
                .build());

        userRepository.save(AppUser.builder()
                .username("technician")
                .email("tech@ram.ma")
                .password(passwordEncoder.encode("tech123"))
                .firstName("Maintenance")
                .lastName("Technician")
                .roles(Set.of(techRole))
                .build());
    }

    private void initRAMFleet() {
        String[] registrations = {
                "CN-RGA", "CN-RGB", "CN-RGC", "CN-RGD", "CN-RGE",
                "CN-RGF", "CN-RGG", "CN-RGH", "CN-MAX", "CN-BOE"
        };
        String[][] types = {
                {"Boeing 737-800", "737-800", "Boeing"},
                {"Boeing 787-9", "787-9", "Boeing"},
                {"Airbus A320-200", "A320-200", "Airbus"},
                {"Embraer 190", "E190", "Embraer"}
        };

        for (int i = 0; i < registrations.length; i++) {
            String[] type = types[i % types.length];
            aircraftRepository.save(Aircraft.builder()
                    .registration(registrations[i])
                    .type(type[0])
                    .model(type[1])
                    .manufacturer(type[2])
                    .status(Aircraft.AircraftStatus.ACTIVE)
                    .totalFlightHours(new BigDecimal(1200 + (i * 500)))
                    .build());
        }
    }

    private void initEmployees() {
        String[][] staff = {
                {"Karim", "EL AMRANI", "k.elamrani@ram.ma", "ADMIN", "IT"},
                {"Fatima", "BENNANI", "f.bennani@ram.ma", "MANAGER", "Maintenance"},
                {"Ahmed", "FILALI", "a.filali@ram.ma", "TECH", "Maintenance"},
                {"Sara", "ALAOUI", "s.alaoui@ram.ma", "TECH", "Maintenance"},
                {"Youssef", "CHRAIBI", "y.chraibi@ram.ma", "TECH", "Maintenance"},
                {"Laila", "OUAZZANI", "l.ouazzani@ram.ma", "TECH", "Maintenance"},
                {"Omar", "IDRISI", "o.idrisi@ram.ma", "TECH", "Maintenance"},
                {"Nadia", "TAZI", "n.tazi@ram.ma", "TECH", "Maintenance"}
        };

        for (int i = 0; i < staff.length; i++) {
            employeeRepository.save(Employee.builder()
                    .firstName(staff[i][0])
                    .lastName(staff[i][1])
                    .email(staff[i][2])
                    .employeeNumber("RAM-" + (1000 + i))
                    .department(staff[i][4])
                    .position(staff[i][3])
                    .status(Employee.EmployeeStatus.ACTIVE)
                    .hireDate(LocalDate.now().minusYears(2))
                    .build());
        }

        employeeRepository.save(Employee.builder()
                .firstName("Maintenance")
                .lastName("Technician")
                .email("tech@ram.ma")
                .employeeNumber("RAM-9999")
                .department("MAINTENANCE")
                .position("Technician")
                .status(Employee.EmployeeStatus.ACTIVE)
                .hireDate(LocalDate.now().minusYears(1))
                .build());
    }

    private void initTechnicians() {
        List<Employee> techStaff = employeeRepository.findAll().stream()
                .filter(e -> e.getEmail() != null
                        && e.getEmail().endsWith("@ram.ma")
                        && e.getPosition() != null
                        && !e.getPosition().equalsIgnoreCase("ADMIN"))
                .toList();

        for (int i = 0; i < techStaff.size(); i++) {
            technicianRepository.save(Technician.builder()
                    .employee(techStaff.get(i))
                    .licenseNumber("AME-" + (5000 + i))
                    .specialization(i % 2 == 0 ? "B1" : "B2")
                    .certificationLevel(Technician.CertificationLevel.LEVEL_2)
                    .availability(true)
                    .build());
        }
    }

    private void initFlights() {
        List<Aircraft> fleet = aircraftRepository.findAll();
        for (int i = 0; i < 10; i++) {
            flightRepository.save(Flight.builder()
                    .flightNumber("AT" + (100 + i))
                    .origin("CMN")
                    .destination("ORY")
                    .aircraft(fleet.get(i % fleet.size()))
                    .scheduledDeparture(LocalDateTime.now().plusHours(i + 1))
                    .scheduledArrival(LocalDateTime.now().plusHours(i + 4))
                    .status(Flight.FlightStatus.SCHEDULED)
                    .build());
        }
    }

    private void initMaintenance() {
        List<Aircraft> fleet = aircraftRepository.findAll();
        List<Technician> techs = technicianRepository.findAll();

        for (int i = 0; i < fleet.size(); i++) {
            maintenanceRepository.save(Maintenance.builder()
                    .aircraft(fleet.get(i))
                    .maintenanceType(Maintenance.MaintenanceType.A_CHECK)
                    .description("Routine A-Check inspection for " + fleet.get(i).getRegistration())
                    .startDate(LocalDate.now())
                    .status(Maintenance.MaintenanceStatus.IN_PROGRESS)
                    .technician(techs.get(i % techs.size()))
                    .build());
        }
    }

    private void initDefects() {
        List<Aircraft> fleet = aircraftRepository.findAll();
        List<Employee> staff = employeeRepository.findAll();

        for (int i = 0; i < 5; i++) {
            defectRepository.save(Defect.builder()
                    .aircraft(fleet.get(i % fleet.size()))
                    .description("Faulty reading light seat " + (10 + i) + "A")
                    .severity(Defect.DefectSeverity.MINOR)
                    .status(Defect.DefectStatus.OPEN)
                    .reportedBy(staff.get(0))
                    .reportedDate(LocalDateTime.now())
                    .build());
        }
    }

    private void initWorkOrders() {
        List<Maintenance> maints = maintenanceRepository.findAll();
        List<Technician> techs = technicianRepository.findAll();

        if (maints.isEmpty()) {
            log.warn("No maintenance records found; work orders initialization skipped.");
            return;
        }
        if (techs.isEmpty()) {
            log.warn("No technicians found; work orders initialization skipped.");
            return;
        }

        Technician myTech = techs.stream()
                .filter(t -> t.getEmployee() != null
                        && "tech@ram.ma".equalsIgnoreCase(t.getEmployee().getEmail()))
                .findFirst()
                .orElse(techs.get(0));

        String[] tasks = {
                "Engine Oil Filter Replacement",
                "Landing Gear Lubrication",
                "Cabin Pressurization Leak Test",
                "VHF Radio Functional Check",
                "Emergency Exit Light Battery Swap",
                "Nose Wheel Tire Inspection"
        };

        for (int i = 0; i < tasks.length; i++) {
            workOrderRepository.save(WorkOrder.builder()
                    .orderNumber("WO-2024-00" + (i + 1))
                    .maintenance(maints.get(i % maints.size()))
                    .description(tasks[i])
                    .priority(WorkOrder.Priority.HIGH)
                    .status(WorkOrder.WorkOrderStatus.ASSIGNED)
                    .assignedTo(myTech)
                    .estimatedHours(new BigDecimal("4.5"))
                    .dueDate(LocalDate.now().plusDays(2))
                    .build());
        }
    }

    private void initWorkPackages() {
        List<Maintenance> maints = maintenanceRepository.findAll();
        List<WorkOrder> allOrders = workOrderRepository.findAll();

        if (maints.isEmpty()) {
            log.warn("No maintenance records found; work package initialization skipped.");
            return;
        }

        WorkPackage pkg = WorkPackage.builder()
                .packageNumber("PKG-RAM-737-01")
                .maintenance(maints.get(0))
                .title("Monthly A-Check Package")
                .description("Consolidated work orders for Boeing 737 short-term maintenance.")
                .status(WorkPackage.PackageStatus.IN_PROGRESS)
                .startDate(LocalDate.now())
                .endDate(LocalDate.now().plusDays(5))
                .build();

        pkg.getWorkOrders().addAll(allOrders);
        workPackageRepository.save(pkg);
    }
}