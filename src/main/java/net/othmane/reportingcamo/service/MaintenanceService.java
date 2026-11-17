package net.othmane.reportingcamo.service;

import lombok.RequiredArgsConstructor;
import net.othmane.reportingcamo.dto.MaintenanceDTO;
import net.othmane.reportingcamo.entity.Aircraft;
import net.othmane.reportingcamo.entity.Maintenance;
import net.othmane.reportingcamo.entity.Technician;
import net.othmane.reportingcamo.exception.ResourceNotFoundException;
import net.othmane.reportingcamo.repository.AircraftRepository;
import net.othmane.reportingcamo.repository.MaintenanceRepository;
import net.othmane.reportingcamo.repository.TechnicianRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MaintenanceService {

    private final MaintenanceRepository maintenanceRepository;
    private final AircraftRepository aircraftRepository;
    private final TechnicianRepository technicianRepository;

    @Transactional(readOnly = true)
    public List<MaintenanceDTO> getAllMaintenance() {
        return maintenanceRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public MaintenanceDTO getMaintenanceById(Integer id) {
        Maintenance maintenance = maintenanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Maintenance", "id", id));
        return mapToDTO(maintenance);
    }

    @Transactional
    public MaintenanceDTO createMaintenance(MaintenanceDTO dto) {
        Aircraft aircraft = aircraftRepository.findById(dto.getAircraftId())
                .orElseThrow(() -> new ResourceNotFoundException("Aircraft", "id", dto.getAircraftId()));

        Technician technician = null;
        if (dto.getTechnicianId() != null) {
            technician = technicianRepository.findById(dto.getTechnicianId())
                    .orElseThrow(() -> new ResourceNotFoundException("Technician", "id", dto.getTechnicianId()));
        }

        Maintenance maintenance = Maintenance.builder()
                .aircraft(aircraft)
                .maintenanceType(parseMaintenanceType(dto.getMaintenanceType()))
                .description(dto.getDescription())
                .startDate(dto.getStartDate())
                .endDate(dto.getEndDate())
                .status(parseMaintenanceStatus(dto.getStatus()))
                .technician(technician)
                .cost(dto.getCost())
                .build();

        Maintenance saved = maintenanceRepository.save(maintenance);
        return mapToDTO(saved);
    }

    @Transactional
    public MaintenanceDTO updateMaintenance(Integer id, MaintenanceDTO dto) {
        Maintenance maintenance = maintenanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Maintenance", "id", id));

        Aircraft aircraft = aircraftRepository.findById(dto.getAircraftId())
                .orElseThrow(() -> new ResourceNotFoundException("Aircraft", "id", dto.getAircraftId()));

        Technician technician = null;
        if (dto.getTechnicianId() != null) {
            technician = technicianRepository.findById(dto.getTechnicianId())
                    .orElseThrow(() -> new ResourceNotFoundException("Technician", "id", dto.getTechnicianId()));
        }

        maintenance.setAircraft(aircraft);
        maintenance.setMaintenanceType(parseMaintenanceType(dto.getMaintenanceType()));
        maintenance.setDescription(dto.getDescription());
        maintenance.setStartDate(dto.getStartDate());
        maintenance.setEndDate(dto.getEndDate());
        maintenance.setStatus(parseMaintenanceStatus(dto.getStatus()));
        maintenance.setTechnician(technician);
        maintenance.setCost(dto.getCost());

        Maintenance updated = maintenanceRepository.save(maintenance);
        return mapToDTO(updated);
    }

    @Transactional
    public void deleteMaintenance(Integer id) {
        if (!maintenanceRepository.existsById(id)) {
            throw new ResourceNotFoundException("Maintenance", "id", id);
        }
        maintenanceRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<MaintenanceDTO> getMaintenanceByAircraft(Integer aircraftId) {
        return maintenanceRepository.findByAircraftId(aircraftId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<MaintenanceDTO> getMaintenanceByStatus(String status) {
        Maintenance.MaintenanceStatus mStatus = parseMaintenanceStatus(status);
        return maintenanceRepository.findByStatus(mStatus).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    private Maintenance.MaintenanceType parseMaintenanceType(String type) {
        if (type == null || type.isBlank()) return Maintenance.MaintenanceType.UNPLANNED;
        try {
            return Maintenance.MaintenanceType.valueOf(type.toUpperCase().replace(" ", "_"));
        } catch (IllegalArgumentException e) {
            return Maintenance.MaintenanceType.UNPLANNED;
        }
    }

    private Maintenance.MaintenanceStatus parseMaintenanceStatus(String status) {
        if (status == null || status.isBlank()) return Maintenance.MaintenanceStatus.PLANNED;
        try {
            return Maintenance.MaintenanceStatus.valueOf(status.toUpperCase().replace(" ", "_"));
        } catch (IllegalArgumentException e) {
            return Maintenance.MaintenanceStatus.PLANNED;
        }
    }

    private MaintenanceDTO mapToDTO(Maintenance maintenance) {
        MaintenanceDTO dto = new MaintenanceDTO();
        dto.setId(maintenance.getId());
        dto.setAircraftId(maintenance.getAircraft() != null ? maintenance.getAircraft().getId() : null);
        dto.setAircraftRegistration(maintenance.getAircraft() != null ? maintenance.getAircraft().getRegistration() : null);
        dto.setMaintenanceType(maintenance.getMaintenanceType() != null ? maintenance.getMaintenanceType().name() : null);
        dto.setDescription(maintenance.getDescription());
        dto.setStartDate(maintenance.getStartDate());
        dto.setEndDate(maintenance.getEndDate());
        dto.setStatus(maintenance.getStatus() != null ? maintenance.getStatus().name() : null);
        dto.setTechnicianId(maintenance.getTechnician() != null ? maintenance.getTechnician().getId() : null);
        
        // Safety check for technician and nested employee
        if (maintenance.getTechnician() != null && maintenance.getTechnician().getEmployee() != null) {
            dto.setTechnicianName(maintenance.getTechnician().getEmployee().getFullName());
        } else {
            dto.setTechnicianName("Unassigned");
        }
        
        dto.setCost(maintenance.getCost());
        dto.setOverdue(maintenance.isOverdue());
        dto.setCompleted(maintenance.isCompleted());
        return dto;
    }
}