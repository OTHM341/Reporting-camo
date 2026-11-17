package net.othmane.reportingcamo.service;

import lombok.RequiredArgsConstructor;
import net.othmane.reportingcamo.dto.WorkPackageDTO;
import net.othmane.reportingcamo.entity.AppUser;
import net.othmane.reportingcamo.entity.Maintenance;
import net.othmane.reportingcamo.entity.WorkOrder;
import net.othmane.reportingcamo.entity.WorkPackage;
import net.othmane.reportingcamo.exception.ResourceNotFoundException;
import net.othmane.reportingcamo.repository.MaintenanceRepository;
import net.othmane.reportingcamo.repository.UserRepository;
import net.othmane.reportingcamo.repository.WorkOrderRepository;
import net.othmane.reportingcamo.repository.WorkPackageRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WorkPackageService {

    private final WorkPackageRepository workPackageRepository;
    private final MaintenanceRepository maintenanceRepository;
    private final WorkOrderRepository workOrderRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<WorkPackageDTO> getAllWorkPackages() {
        String username = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        AppUser user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        boolean isTech = user.getRoles().stream()
                .anyMatch(role -> role.getName().contains("TECHNICIAN"));

        boolean isAdminOrManager = user.getRoles().stream()
                .anyMatch(role -> role.getName().contains("ADMIN")
                        || role.getName().contains("MANAGER"));

        if (isTech && !isAdminOrManager) {
            return workPackageRepository.findAll().stream()
                    .filter(workPackage -> workPackage.getWorkOrders() != null
                            && workPackage.getWorkOrders().stream()
                            .anyMatch(workOrder -> workOrder.getAssignedTo() != null
                                    && workOrder.getAssignedTo().getEmployee() != null
                                    && workOrder.getAssignedTo().getEmployee().getEmail() != null
                                    && workOrder.getAssignedTo().getEmployee().getEmail()
                                    .equalsIgnoreCase(user.getEmail())))
                    .map(this::mapToDTO)
                    .collect(Collectors.toList());
        }

        return workPackageRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public WorkPackageDTO getWorkPackageById(Integer id) {
        WorkPackage workPackage = workPackageRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Work Package", "id", id));
        return mapToDTO(workPackage);
    }

    @Transactional
    public WorkPackageDTO createWorkPackage(WorkPackageDTO dto) {
        Maintenance maintenance = null;
        if (dto.getMaintenanceId() != null) {
            maintenance = maintenanceRepository.findById(dto.getMaintenanceId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Maintenance", "id", dto.getMaintenanceId()));
        }

        WorkPackage workPackage = WorkPackage.builder()
                .packageNumber(dto.getPackageNumber())
                .maintenance(maintenance)
                .title(dto.getTitle())
                .description(dto.getDescription())
                .status(dto.getStatus() != null
                        ? WorkPackage.PackageStatus.valueOf(dto.getStatus().toUpperCase())
                        : WorkPackage.PackageStatus.PLANNED)
                .startDate(dto.getStartDate())
                .endDate(dto.getEndDate())
                .build();

        WorkPackage saved = workPackageRepository.save(workPackage);
        return mapToDTO(saved);
    }

    @Transactional
    public WorkPackageDTO updateWorkPackage(Integer id, WorkPackageDTO dto) {
        WorkPackage workPackage = workPackageRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Work Package", "id", id));

        Maintenance maintenance = null;
        if (dto.getMaintenanceId() != null) {
            maintenance = maintenanceRepository.findById(dto.getMaintenanceId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Maintenance", "id", dto.getMaintenanceId()));
        }

        workPackage.setPackageNumber(dto.getPackageNumber());
        workPackage.setMaintenance(maintenance);
        workPackage.setTitle(dto.getTitle());
        workPackage.setDescription(dto.getDescription());

        if (dto.getStatus() != null) {
            workPackage.setStatus(
                    WorkPackage.PackageStatus.valueOf(dto.getStatus().toUpperCase()));
        }

        workPackage.setStartDate(dto.getStartDate());
        workPackage.setEndDate(dto.getEndDate());

        WorkPackage updated = workPackageRepository.save(workPackage);
        return mapToDTO(updated);
    }

    @Transactional
    public void deleteWorkPackage(Integer id) {
        if (!workPackageRepository.existsById(id)) {
            throw new ResourceNotFoundException("Work Package", "id", id);
        }
        workPackageRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<WorkPackageDTO> getWorkPackagesByMaintenance(Integer maintenanceId) {
        return workPackageRepository.findByMaintenanceId(maintenanceId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<WorkPackageDTO> getWorkPackagesByStatus(String status) {
        WorkPackage.PackageStatus packageStatus =
                WorkPackage.PackageStatus.valueOf(status.toUpperCase());

        return workPackageRepository.findByStatus(packageStatus).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public WorkPackageDTO addWorkOrderToPackage(Integer packageId, Integer workOrderId) {
        WorkPackage workPackage = workPackageRepository.findById(packageId)
                .orElseThrow(() -> new ResourceNotFoundException("Work Package", "id", packageId));

        WorkOrder workOrder = workOrderRepository.findById(workOrderId)
                .orElseThrow(() -> new ResourceNotFoundException("Work Order", "id", workOrderId));

        workPackage.getWorkOrders().add(workOrder);
        WorkPackage updated = workPackageRepository.save(workPackage);
        return mapToDTO(updated);
    }

    @Transactional
    public WorkPackageDTO removeWorkOrderFromPackage(Integer packageId, Integer workOrderId) {
        WorkPackage workPackage = workPackageRepository.findById(packageId)
                .orElseThrow(() -> new ResourceNotFoundException("Work Package", "id", packageId));

        WorkOrder workOrder = workOrderRepository.findById(workOrderId)
                .orElseThrow(() -> new ResourceNotFoundException("Work Order", "id", workOrderId));

        workPackage.getWorkOrders().remove(workOrder);
        WorkPackage updated = workPackageRepository.save(workPackage);
        return mapToDTO(updated);
    }

    private WorkPackageDTO mapToDTO(WorkPackage workPackage) {
        WorkPackageDTO dto = new WorkPackageDTO();
        dto.setId(workPackage.getId());
        dto.setPackageNumber(workPackage.getPackageNumber());
        dto.setMaintenanceId(workPackage.getMaintenance() != null
                ? workPackage.getMaintenance().getId() : null);
        dto.setMaintenanceType(workPackage.getMaintenance() != null
                && workPackage.getMaintenance().getMaintenanceType() != null
                ? workPackage.getMaintenance().getMaintenanceType().name() : null);
        dto.setTitle(workPackage.getTitle());
        dto.setDescription(workPackage.getDescription());
        dto.setStatus(workPackage.getStatus() != null
                ? workPackage.getStatus().name() : null);
        dto.setStartDate(workPackage.getStartDate());
        dto.setEndDate(workPackage.getEndDate());
        dto.setWorkOrderIds(workPackage.getWorkOrders() != null
                ? workPackage.getWorkOrders().stream()
                  .map(WorkOrder::getId)
                  .collect(Collectors.toList())
                : null);
        return dto;
    }
}