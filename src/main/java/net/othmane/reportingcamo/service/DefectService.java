package net.othmane.reportingcamo.service;

import lombok.RequiredArgsConstructor;
import net.othmane.reportingcamo.dto.DefectDTO;
import net.othmane.reportingcamo.entity.Aircraft;
import net.othmane.reportingcamo.entity.Defect;
import net.othmane.reportingcamo.entity.Employee;
import net.othmane.reportingcamo.entity.Flight;
import net.othmane.reportingcamo.exception.ResourceNotFoundException;
import net.othmane.reportingcamo.repository.AircraftRepository;
import net.othmane.reportingcamo.repository.DefectRepository;
import net.othmane.reportingcamo.repository.EmployeeRepository;
import net.othmane.reportingcamo.repository.FlightRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DefectService {

    private final DefectRepository defectRepository;
    private final AircraftRepository aircraftRepository;
    private final FlightRepository flightRepository;
    private final EmployeeRepository employeeRepository;

    @Transactional(readOnly = true)
    public List<DefectDTO> getAllDefects() {
        return defectRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public DefectDTO getDefectById(Integer id) {
        Defect defect = defectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Defect", "id", id));
        return mapToDTO(defect);
    }

    @Transactional
    public DefectDTO createDefect(DefectDTO dto) {
        Aircraft aircraft = aircraftRepository.findById(dto.getAircraftId())
                .orElseThrow(() -> new ResourceNotFoundException("Aircraft", "id", dto.getAircraftId()));

        Flight flight = null;
        if (dto.getFlightId() != null) {
            flight = flightRepository.findById(dto.getFlightId())
                    .orElseThrow(() -> new ResourceNotFoundException("Flight", "id", dto.getFlightId()));
        }

        Employee reporter = null;
        if (dto.getReportedByEmail() != null && !dto.getReportedByEmail().isEmpty()) {
            reporter = employeeRepository.findByEmail(dto.getReportedByEmail())
                    .orElseThrow(() -> new ResourceNotFoundException("Employee", "email", dto.getReportedByEmail()));
        } else if (dto.getReportedBy() != null) {
            reporter = employeeRepository.findById(dto.getReportedBy())
                    .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", dto.getReportedBy()));
        }

        Defect defect = Defect.builder()
                .aircraft(aircraft)
                .flight(flight)
                .description(dto.getDescription())
                .category(dto.getCategory())
                .severity(dto.getSeverity() != null ? Defect.DefectSeverity.valueOf(dto.getSeverity().toUpperCase()) : Defect.DefectSeverity.MINOR)
                .reportedBy(reporter)
                .reportedDate(LocalDateTime.now())
                .status(dto.getStatus() != null ? Defect.DefectStatus.valueOf(dto.getStatus().toUpperCase()) : Defect.DefectStatus.OPEN)
                .build();

        Defect saved = defectRepository.save(defect);
        return mapToDTO(saved);
    }

    @Transactional
    public DefectDTO updateDefect(Integer id, DefectDTO dto) {
        Defect defect = defectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Defect", "id", id));

        Aircraft aircraft = aircraftRepository.findById(dto.getAircraftId())
                .orElseThrow(() -> new ResourceNotFoundException("Aircraft", "id", dto.getAircraftId()));

        Flight flight = null;
        if (dto.getFlightId() != null) {
            flight = flightRepository.findById(dto.getFlightId())
                    .orElseThrow(() -> new ResourceNotFoundException("Flight", "id", dto.getFlightId()));
        }

        Employee reporter = null;
        if (dto.getReportedByEmail() != null && !dto.getReportedByEmail().isEmpty()) {
            reporter = employeeRepository.findByEmail(dto.getReportedByEmail())
                    .orElseThrow(() -> new ResourceNotFoundException("Employee", "email", dto.getReportedByEmail()));
        } else if (dto.getReportedBy() != null) {
            reporter = employeeRepository.findById(dto.getReportedBy())
                    .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", dto.getReportedBy()));
        }

        defect.setAircraft(aircraft);
        defect.setFlight(flight);
        defect.setDescription(dto.getDescription());
        defect.setCategory(dto.getCategory());
        defect.setSeverity(dto.getSeverity() != null ? Defect.DefectSeverity.valueOf(dto.getSeverity().toUpperCase()) : defect.getSeverity());
        defect.setReportedBy(reporter);
        defect.setStatus(dto.getStatus() != null ? Defect.DefectStatus.valueOf(dto.getStatus().toUpperCase()) : defect.getStatus());
        defect.setResolution(dto.getResolution());

        if (Defect.DefectStatus.RESOLVED.name().equals(dto.getStatus()) || Defect.DefectStatus.CLOSED.name().equals(dto.getStatus())) {
            defect.setResolvedDate(LocalDateTime.now());
        }

        Defect updated = defectRepository.save(defect);
        return mapToDTO(updated);
    }

    @Transactional
    public void deleteDefect(Integer id) {
        if (!defectRepository.existsById(id)) {
            throw new ResourceNotFoundException("Defect", "id", id);
        }
        defectRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<DefectDTO> getDefectsByAircraft(Integer aircraftId) {
        return defectRepository.findByAircraftId(aircraftId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<DefectDTO> getDefectsByStatus(String status) {
        Defect.DefectStatus defectStatus = Defect.DefectStatus.valueOf(status.toUpperCase());
        return defectRepository.findByStatus(defectStatus).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<DefectDTO> getCriticalDefects() {
        return defectRepository.findBySeverity(Defect.DefectSeverity.CRITICAL).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public DefectDTO resolveDefect(Integer id, String resolution) {
        Defect defect = defectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Defect", "id", id));

        defect.setStatus(Defect.DefectStatus.RESOLVED);
        defect.setResolution(resolution);
        defect.setResolvedDate(LocalDateTime.now());

        Defect updated = defectRepository.save(defect);
        return mapToDTO(updated);
    }

    private DefectDTO mapToDTO(Defect defect) {
        DefectDTO dto = new DefectDTO();
        dto.setId(defect.getId());
        dto.setAircraftId(defect.getAircraft() != null ? defect.getAircraft().getId() : null);
        dto.setAircraftRegistration(defect.getAircraft() != null ? defect.getAircraft().getRegistration() : null);
        dto.setFlightId(defect.getFlight() != null ? defect.getFlight().getId() : null);
        dto.setFlightNumber(defect.getFlight() != null ? defect.getFlight().getFlightNumber() : null);
        dto.setDescription(defect.getDescription());
        dto.setCategory(defect.getCategory());
        dto.setSeverity(defect.getSeverity() != null ? defect.getSeverity().name() : null);
        dto.setReportedBy(defect.getReportedBy() != null ? defect.getReportedBy().getId() : null);
        dto.setReporterName(defect.getReportedBy() != null ? defect.getReportedBy().getFullName() : null);
        dto.setReportedDate(defect.getReportedDate());
        dto.setStatus(defect.getStatus() != null ? defect.getStatus().name() : null);
        dto.setResolution(defect.getResolution());
        dto.setResolvedDate(defect.getResolvedDate());
        dto.setCritical(defect.isCritical());
        dto.setResolved(defect.isResolved());
        return dto;
    }
}
