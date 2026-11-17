package net.othmane.reportingcamo.service;

import lombok.RequiredArgsConstructor;
import net.othmane.reportingcamo.dto.WorkOrderDTO;
import net.othmane.reportingcamo.entity.AppUser;
import net.othmane.reportingcamo.entity.Maintenance;
import net.othmane.reportingcamo.entity.Technician;
import net.othmane.reportingcamo.entity.WorkOrder;
import net.othmane.reportingcamo.exception.ResourceNotFoundException;
import net.othmane.reportingcamo.repository.MaintenanceRepository;
import net.othmane.reportingcamo.repository.TechnicianRepository;
import net.othmane.reportingcamo.repository.UserRepository;
import net.othmane.reportingcamo.repository.WorkOrderRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WorkOrderService {

    private final WorkOrderRepository workOrderRepository;
    private final MaintenanceRepository maintenanceRepository;
    private final TechnicianRepository technicianRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<WorkOrderDTO> getAllWorkOrders() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        AppUser user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        boolean isTech = user.getRoles().stream().anyMatch(r -> r.getName().equals("ROLE_TECHNICIAN") || r.getName().equals("TECHNICIAN"));
        boolean isAdminOrManager = user.getRoles().stream().anyMatch(r -> 
                r.getName().equals("ROLE_ADMIN") || r.getName().equals("ROLE_MANAGER") || 
                r.getName().equals("ADMIN") || r.getName().equals("MANAGER"));

        if (isTech && !isAdminOrManager) {
            // Un technicien ne voit que ses propres workorders (limité à 4-6 par la logique métier)
            return workOrderRepository.findAll().stream()
                    .filter(wo -> wo.getAssignedTo() != null && 
                                 wo.getAssignedTo().getEmployee() != null && 
                                 wo.getAssignedTo().getEmployee().getEmail().equals(user.getEmail()))
                    .map(this::mapToDTO)
                    .collect(Collectors.toList());
        }

        // Admin et Manager voient tout
        return workOrderRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public WorkOrderDTO getWorkOrderById(Integer id) {
        WorkOrder workOrder = workOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Work Order", "id", id));
        return mapToDTO(workOrder);
    }

    @Transactional
    public WorkOrderDTO createWorkOrder(WorkOrderDTO dto) {
        Maintenance maintenance = null;
        if (dto.getMaintenanceId() != null) {
            maintenance = maintenanceRepository.findById(dto.getMaintenanceId())
                    .orElseThrow(() -> new ResourceNotFoundException("Maintenance", "id", dto.getMaintenanceId()));
        }

        Technician technician = null;
        if (dto.getAssignedTo() != null) {
            technician = technicianRepository.findById(dto.getAssignedTo())
                    .orElseThrow(() -> new ResourceNotFoundException("Technician", "id", dto.getAssignedTo()));
            
            // Logique de limitation pour les techniciens (4 à 6 workorders max)
            long activeOrders = workOrderRepository.findByAssignedToId(technician.getId()).stream()
                    .filter(wo -> wo.getStatus() != WorkOrder.WorkOrderStatus.COMPLETED && wo.getStatus() != WorkOrder.WorkOrderStatus.CANCELLED)
                    .count();
            
            if (activeOrders >= 6) {
                throw new RuntimeException("Le technicien a déjà atteint la limite maximale de 6 Work Orders actifs.");
            }
        }

        WorkOrder workOrder = WorkOrder.builder()
                .orderNumber(dto.getOrderNumber())
                .maintenance(maintenance)
                .description(dto.getDescription())
                .priority(dto.getPriority() != null ? WorkOrder.Priority.valueOf(dto.getPriority().toUpperCase()) : WorkOrder.Priority.NORMAL)
                .status(dto.getStatus() != null ? WorkOrder.WorkOrderStatus.valueOf(dto.getStatus().toUpperCase()) : WorkOrder.WorkOrderStatus.OPEN)
                .assignedTo(technician)
                .estimatedHours(dto.getEstimatedHours())
                .actualHours(dto.getActualHours())
                .dueDate(dto.getDueDate())
                .build();

        WorkOrder saved = workOrderRepository.save(workOrder);
        return mapToDTO(saved);
    }

    @Transactional
    public WorkOrderDTO updateWorkOrder(Integer id, WorkOrderDTO dto) {
        WorkOrder workOrder = workOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Work Order", "id", id));

        Maintenance maintenance = null;
        if (dto.getMaintenanceId() != null) {
            maintenance = maintenanceRepository.findById(dto.getMaintenanceId())
                    .orElseThrow(() -> new ResourceNotFoundException("Maintenance", "id", dto.getMaintenanceId()));
        }

        Technician technician = null;
        if (dto.getAssignedTo() != null) {
            technician = technicianRepository.findById(dto.getAssignedTo())
                    .orElseThrow(() -> new ResourceNotFoundException("Technician", "id", dto.getAssignedTo()));
        }

        workOrder.setOrderNumber(dto.getOrderNumber());
        workOrder.setMaintenance(maintenance);
        workOrder.setDescription(dto.getDescription());
        if (dto.getPriority() != null) {
            workOrder.setPriority(WorkOrder.Priority.valueOf(dto.getPriority().toUpperCase()));
        }
        if (dto.getStatus() != null) {
            workOrder.setStatus(WorkOrder.WorkOrderStatus.valueOf(dto.getStatus().toUpperCase()));
        }
        workOrder.setAssignedTo(technician);
        workOrder.setEstimatedHours(dto.getEstimatedHours());
        workOrder.setActualHours(dto.getActualHours());
        workOrder.setDueDate(dto.getDueDate());

        if (WorkOrder.WorkOrderStatus.COMPLETED.name().equals(dto.getStatus()) && workOrder.getCompletedDate() == null) {
            workOrder.setCompletedDate(LocalDateTime.now());
        }

        WorkOrder updated = workOrderRepository.save(workOrder);
        return mapToDTO(updated);
    }

    @Transactional
    public void deleteWorkOrder(Integer id) {
        WorkOrder workOrder = workOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Work Order", "id", id));
        
        if (workOrder.getWorkPackages() != null) {
            workOrder.getWorkPackages().forEach(workPackage -> {
                workPackage.getWorkOrders().remove(workOrder);
            });
            workOrder.getWorkPackages().clear();
        }
        
        workOrderRepository.delete(workOrder);
    }

    @Transactional(readOnly = true)
    public List<WorkOrderDTO> getWorkOrdersByMaintenance(Integer maintenanceId) {
        return workOrderRepository.findByMaintenanceId(maintenanceId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<WorkOrderDTO> getWorkOrdersByStatus(String status) {
        WorkOrder.WorkOrderStatus workOrderStatus = WorkOrder.WorkOrderStatus.valueOf(status.toUpperCase());
        return workOrderRepository.findByStatus(workOrderStatus).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<WorkOrderDTO> getWorkOrdersByTechnician(Integer technicianId) {
        return workOrderRepository.findByAssignedToId(technicianId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public WorkOrderDTO assignWorkOrder(Integer id, Integer technicianId) {
        WorkOrder workOrder = workOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Work Order", "id", id));

        Technician technician = technicianRepository.findById(technicianId)
                .orElseThrow(() -> new ResourceNotFoundException("Technician", "id", technicianId));

        // Vérification de la limite de charge (4-6)
        long activeOrders = workOrderRepository.findByAssignedToId(technician.getId()).stream()
                .filter(wo -> wo.getStatus() != WorkOrder.WorkOrderStatus.COMPLETED && wo.getStatus() != WorkOrder.WorkOrderStatus.CANCELLED)
                .count();

        if (activeOrders >= 6) {
            throw new RuntimeException("Impossible d'assigner : ce technicien a déjà 6 Work Orders actifs.");
        }

        workOrder.setAssignedTo(technician);
        workOrder.setStatus(WorkOrder.WorkOrderStatus.ASSIGNED);

        WorkOrder updated = workOrderRepository.save(workOrder);
        return mapToDTO(updated);
    }

    @Transactional
    public WorkOrderDTO completeWorkOrder(Integer id, BigDecimal actualHours) {
        WorkOrder workOrder = workOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Work Order", "id", id));

        workOrder.setStatus(WorkOrder.WorkOrderStatus.COMPLETED);
        workOrder.setActualHours(actualHours);
        workOrder.setCompletedDate(LocalDateTime.now());

        WorkOrder updated = workOrderRepository.save(workOrder);
        return mapToDTO(updated);
    }

    private WorkOrderDTO mapToDTO(WorkOrder workOrder) {
        WorkOrderDTO dto = new WorkOrderDTO();
        dto.setId(workOrder.getId());
        dto.setOrderNumber(workOrder.getOrderNumber());
        dto.setMaintenanceId(workOrder.getMaintenance() != null ? workOrder.getMaintenance().getId() : null);
        dto.setMaintenanceType(workOrder.getMaintenance() != null && workOrder.getMaintenance().getMaintenanceType() != null 
                ? workOrder.getMaintenance().getMaintenanceType().name() : null);
        dto.setDescription(workOrder.getDescription());
        dto.setPriority(workOrder.getPriority() != null ? workOrder.getPriority().name() : null);
        dto.setStatus(workOrder.getStatus() != null ? workOrder.getStatus().name() : null);
        dto.setAssignedTo(workOrder.getAssignedTo() != null ? workOrder.getAssignedTo().getId() : null);
        dto.setAssignedTechnicianName(workOrder.getAssignedTo() != null && workOrder.getAssignedTo().getEmployee() != null
                ? workOrder.getAssignedTo().getEmployee().getFullName() : null);
        dto.setEstimatedHours(workOrder.getEstimatedHours());
        dto.setActualHours(workOrder.getActualHours());
        dto.setDueDate(workOrder.getDueDate());
        dto.setCompletedDate(workOrder.getCompletedDate());
        dto.setOverdue(workOrder.isOverdue());
        return dto;
    }
}