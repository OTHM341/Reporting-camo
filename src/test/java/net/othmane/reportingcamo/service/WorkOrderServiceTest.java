package net.othmane.reportingcamo.service;

import net.othmane.reportingcamo.dto.WorkOrderDTO;
import net.othmane.reportingcamo.entity.Technician;
import net.othmane.reportingcamo.entity.WorkOrder;
import net.othmane.reportingcamo.repository.EmployeeRepository;
import net.othmane.reportingcamo.repository.MaintenanceRepository;
import net.othmane.reportingcamo.repository.TechnicianRepository;
import net.othmane.reportingcamo.repository.UserRepository;
import net.othmane.reportingcamo.repository.WorkOrderRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Work Order Service Unit Tests")
class WorkOrderServiceTest {

    @Mock
    private WorkOrderRepository workOrderRepository;

    @Mock
    private MaintenanceRepository maintenanceRepository;

    @Mock
    private TechnicianRepository technicianRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private EmployeeRepository employeeRepository;

    @InjectMocks
    private WorkOrderService workOrderService;

    private WorkOrder workOrder;
    private Technician technician;
    private WorkOrderDTO workOrderDTO;

    @BeforeEach
    void setUp() {
        technician = Technician.builder()
                .id(1)
                .build();

        workOrder = WorkOrder.builder()
                .id(1)
                .orderNumber("WO-001")
                .status(WorkOrder.WorkOrderStatus.OPEN)
                .assignedTo(technician)
                .build();

        workOrderDTO = new WorkOrderDTO();
        workOrderDTO.setOrderNumber("WO-001");
        workOrderDTO.setAssignedTo(1);
        workOrderDTO.setStatus("OPEN");
    }

    @Test
    @DisplayName("Should assign work order when technician has less than 6 active orders")
    void assignWorkOrder_shouldAssign_whenUnderLimit() {
        when(workOrderRepository.findById(1)).thenReturn(Optional.of(workOrder));
        when(technicianRepository.findById(1)).thenReturn(Optional.of(technician));

        List<WorkOrder> activeOrders = Arrays.asList(
                new WorkOrder(), new WorkOrder(), new WorkOrder()
        );
        when(workOrderRepository.findByAssignedToId(1)).thenReturn(activeOrders);
        when(workOrderRepository.save(any(WorkOrder.class))).thenReturn(workOrder);

        WorkOrderDTO result = workOrderService.assignWorkOrder(1, 1);

        assertThat(result.getStatus()).isEqualTo("ASSIGNED");
        verify(workOrderRepository, times(1)).save(any(WorkOrder.class));
    }

    @Test
    @DisplayName("Should throw exception when technician reached 6 active orders limit")
    void assignWorkOrder_shouldThrowException_whenOverLimit() {
        when(workOrderRepository.findById(1)).thenReturn(Optional.of(workOrder));
        when(technicianRepository.findById(1)).thenReturn(Optional.of(technician));

        List<WorkOrder> fullLoad = new ArrayList<>();
        for (int i = 0; i < 6; i++) {
            WorkOrder wo = new WorkOrder();
            wo.setStatus(WorkOrder.WorkOrderStatus.IN_PROGRESS);
            fullLoad.add(wo);
        }
        when(workOrderRepository.findByAssignedToId(1)).thenReturn(fullLoad);

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> workOrderService.assignWorkOrder(1, 1)
        );

        assertThat(exception.getMessage()).contains("6 Work Orders actifs");
        verify(workOrderRepository, never()).save(any(WorkOrder.class));
    }
}