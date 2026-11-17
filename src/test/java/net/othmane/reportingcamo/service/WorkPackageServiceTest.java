
package net.othmane.reportingcamo.service;

import net.othmane.reportingcamo.dto.WorkPackageDTO;
import net.othmane.reportingcamo.entity.*;
import net.othmane.reportingcamo.repository.*;

import net.othmane.reportingcamo.exception.ResourceNotFoundException;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class WorkPackageServiceTest {

    @Mock
    private WorkPackageRepository workPackageRepository;

    @Mock
    private WorkOrderRepository workOrderRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private WorkPackageService workPackageService;

    @Mock
    private SecurityContext securityContext;

    @Mock
    private Authentication authentication;

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    private Role createRole(String name) {
        Role role = new Role();
        role.setName(name);
        return role;
    }

    private void mockAuthenticatedUser(AppUser user) {
        SecurityContextHolder.setContext(securityContext);

        when(securityContext.getAuthentication())
                .thenReturn(authentication);

        when(authentication.getName())
                .thenReturn(user.getUsername());

        when(userRepository.findByUsername(user.getUsername()))
                .thenReturn(Optional.of(user));
    }

    private Technician createTechnician(String email) {
        Employee employee = new Employee();
        employee.setEmail(email);

        Technician technician = new Technician();
        technician.setEmployee(employee);

        return technician;
    }

    @Test
    @DisplayName("Should return all work packages for admin")
    void getAllWorkPackages_shouldReturnAll_forAdmin() {

        AppUser admin = new AppUser();
        admin.setUsername("admin");
        admin.setEmail("admin@test.com");
        admin.setRoles(Set.of(createRole("ADMIN")));

        WorkPackage package1 = new WorkPackage();
        WorkPackage package2 = new WorkPackage();

        mockAuthenticatedUser(admin);

        when(workPackageRepository.findAll())
                .thenReturn(List.of(package1, package2));

        List<WorkPackageDTO> result =
                workPackageService.getAllWorkPackages();

        assertNotNull(result);
        assertEquals(2, result.size());

        verify(workPackageRepository).findAll();
    }

    @Test
    @DisplayName("Should return only assigned work packages for technician")
    void getAllWorkPackages_shouldReturnFiltered_forTechnician() {

        AppUser technicianUser = new AppUser();
        technicianUser.setUsername("technician");
        technicianUser.setEmail("tech@test.com");
        technicianUser.setRoles(Set.of(createRole("TECHNICIAN")));

        Technician technician = createTechnician("tech@test.com");

        WorkOrder assignedWorkOrder = new WorkOrder();
        assignedWorkOrder.setAssignedTo(technician);

        WorkPackage assignedPackage = new WorkPackage();
        assignedPackage.setWorkOrders(
                new HashSet<>(Set.of(assignedWorkOrder))
        );

        Technician otherTechnician = createTechnician("other@test.com");

        WorkOrder otherWorkOrder = new WorkOrder();
        otherWorkOrder.setAssignedTo(otherTechnician);

        WorkPackage otherPackage = new WorkPackage();
        otherPackage.setWorkOrders(
                new HashSet<>(Set.of(otherWorkOrder))
        );

        mockAuthenticatedUser(technicianUser);

        when(workPackageRepository.findAll())
                .thenReturn(List.of(assignedPackage, otherPackage));

        List<WorkPackageDTO> result =
                workPackageService.getAllWorkPackages();

        assertNotNull(result);
        assertEquals(1, result.size());

        verify(workPackageRepository).findAll();
    }

    @Test
    @DisplayName("Should return empty list when technician has no assigned work packages")
    void getAllWorkPackages_shouldReturnEmpty_forTechnicianWithNoAssignedWOsInPackages() {

        AppUser technicianUser = new AppUser();
        technicianUser.setUsername("technician");
        technicianUser.setEmail("tech@test.com");
        technicianUser.setRoles(Set.of(createRole("TECHNICIAN")));

        Technician otherTechnician = createTechnician("other@test.com");

        WorkOrder workOrder = new WorkOrder();
        workOrder.setAssignedTo(otherTechnician);

        WorkPackage workPackage = new WorkPackage();
        workPackage.setWorkOrders(
                new HashSet<>(Set.of(workOrder))
        );

        mockAuthenticatedUser(technicianUser);

        when(workPackageRepository.findAll())
                .thenReturn(List.of(workPackage));

        List<WorkPackageDTO> result =
                workPackageService.getAllWorkPackages();

        assertNotNull(result);
        assertTrue(result.isEmpty());

        verify(workPackageRepository).findAll();
    }

    @Test
    @DisplayName("Should create a work package")
    void createWorkPackage_shouldReturnCreatedPackage() {

        WorkPackageDTO dto = new WorkPackageDTO();
        dto.setPackageNumber("WP-001");
        dto.setTitle("Maintenance package");
        dto.setDescription("Test maintenance package");

        when(workPackageRepository.save(any(WorkPackage.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        WorkPackageDTO result =
                workPackageService.createWorkPackage(dto);

        assertNotNull(result);
        assertEquals("WP-001", result.getPackageNumber());
        assertEquals("Maintenance package", result.getTitle());

        verify(workPackageRepository).save(any(WorkPackage.class));
    }

    @Test
    @DisplayName("Should add work order to package")
    void addWorkOrderToPackage_shouldAddWorkOrder() {

        Integer packageId = 1;
        Integer workOrderId = 2;

        WorkPackage workPackage = new WorkPackage();
        workPackage.setWorkOrders(new HashSet<>());

        WorkOrder workOrder = new WorkOrder();

        when(workPackageRepository.findById(packageId))
                .thenReturn(Optional.of(workPackage));

        when(workOrderRepository.findById(workOrderId))
                .thenReturn(Optional.of(workOrder));

        when(workPackageRepository.save(any(WorkPackage.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        WorkPackageDTO result =
                workPackageService.addWorkOrderToPackage(
                        packageId, workOrderId
                );

        assertNotNull(result);
        assertEquals(1, workPackage.getWorkOrders().size());

        verify(workPackageRepository).save(workPackage);
    }

    @Test
    @DisplayName("Should throw exception when package does not exist")
    void addWorkOrderToPackage_shouldThrowException_whenPackageNotFound() {

        Integer packageId = 99;
        Integer workOrderId = 2;

        when(workPackageRepository.findById(packageId))
                .thenReturn(Optional.empty());

        assertThrows(
                ResourceNotFoundException.class,
                () -> workPackageService.addWorkOrderToPackage(
                        packageId, workOrderId
                )
        );

        verify(workPackageRepository).findById(packageId);
        verifyNoInteractions(workOrderRepository);
    }
}