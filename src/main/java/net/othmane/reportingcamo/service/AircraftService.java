package net.othmane.reportingcamo.service;

import lombok.RequiredArgsConstructor;
import net.othmane.reportingcamo.dto.AircraftDTO;
import net.othmane.reportingcamo.entity.Aircraft;
import net.othmane.reportingcamo.exception.ResourceNotFoundException;
import net.othmane.reportingcamo.repository.AircraftRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AircraftService {

    private final AircraftRepository aircraftRepository;

    @Transactional(readOnly = true)
    public List<AircraftDTO> getAllAircraft() {
        return aircraftRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AircraftDTO getAircraftById(Integer id) {
        Aircraft aircraft = aircraftRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Aircraft", "id", id));
        return mapToDTO(aircraft);
    }

    @Transactional(readOnly = true)
    public List<AircraftDTO> getAircraftByStatus(String status) {
        Aircraft.AircraftStatus aircraftStatus;
        try {
            aircraftStatus = Aircraft.AircraftStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid aircraft status: " + status);
        }
        return aircraftRepository.findByStatus(aircraftStatus).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public AircraftDTO createAircraft(AircraftDTO dto) {
        if (aircraftRepository.existsByRegistration(dto.getRegistration())) {
            throw new IllegalArgumentException("Aircraft with registration " + dto.getRegistration() + " already exists");
        }

        Aircraft aircraft = Aircraft.builder()
                .registration(dto.getRegistration())
                .type(dto.getType())
                .model(dto.getModel())
                .manufacturer(dto.getManufacturer())
                .yearOfManufacture(dto.getYearOfManufacture())
                .totalFlightHours(dto.getTotalFlightHours())
                .status(parseStatus(dto.getStatus()))
                .lastMaintenanceDate(dto.getLastMaintenanceDate())
                .nextMaintenanceDue(dto.getNextMaintenanceDue())
                .serialNumber(dto.getSerialNumber())
                .seatingCapacity(dto.getSeatingCapacity())
                .lengthM(dto.getLengthM())
                .cruiseAltitudeM(dto.getCruiseAltitudeM())
                .cruiseSpeedKmh(dto.getCruiseSpeedKmh())
                .cabinConfiguration(parseCabin(dto.getCabinConfiguration()))
                .autonomyKm(dto.getAutonomyKm())
                .primaryRole(parseRole(dto.getPrimaryRole()))
                .build();

        Aircraft saved = aircraftRepository.save(aircraft);
        return mapToDTO(saved);
    }

    @Transactional
    public AircraftDTO updateAircraft(Integer id, AircraftDTO dto) {
        Aircraft aircraft = aircraftRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Aircraft", "id", id));

        if (!aircraft.getRegistration().equals(dto.getRegistration()) && 
            aircraftRepository.existsByRegistration(dto.getRegistration())) {
            throw new IllegalArgumentException("Aircraft with registration " + dto.getRegistration() + " already exists");
        }

        aircraft.setRegistration(dto.getRegistration());
        aircraft.setType(dto.getType());
        aircraft.setModel(dto.getModel());
        aircraft.setManufacturer(dto.getManufacturer());
        aircraft.setYearOfManufacture(dto.getYearOfManufacture());
        aircraft.setTotalFlightHours(dto.getTotalFlightHours());
        aircraft.setStatus(parseStatus(dto.getStatus()));
        aircraft.setLastMaintenanceDate(dto.getLastMaintenanceDate());
        aircraft.setNextMaintenanceDue(dto.getNextMaintenanceDue());
        aircraft.setSerialNumber(dto.getSerialNumber());
        aircraft.setSeatingCapacity(dto.getSeatingCapacity());
        aircraft.setLengthM(dto.getLengthM());
        aircraft.setCruiseAltitudeM(dto.getCruiseAltitudeM());
        aircraft.setCruiseSpeedKmh(dto.getCruiseSpeedKmh());
        aircraft.setCabinConfiguration(parseCabin(dto.getCabinConfiguration()));
        aircraft.setAutonomyKm(dto.getAutonomyKm());
        aircraft.setPrimaryRole(parseRole(dto.getPrimaryRole()));

        Aircraft updated = aircraftRepository.save(aircraft);
        return mapToDTO(updated);
    }

    @Transactional
    public void deleteAircraft(Integer id) {
        if (!aircraftRepository.existsById(id)) {
            throw new ResourceNotFoundException("Aircraft", "id", id);
        }
        aircraftRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<AircraftDTO> getAircraftDueForMaintenance() {
        return aircraftRepository.findAircraftDueForMaintenance().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    private Aircraft.AircraftStatus parseStatus(String status) {
        if (status == null || status.isBlank()) return Aircraft.AircraftStatus.ACTIVE;
        try { return Aircraft.AircraftStatus.valueOf(status.toUpperCase()); }
        catch (Exception e) { return Aircraft.AircraftStatus.ACTIVE; }
    }

    private Aircraft.CabinConfiguration parseCabin(String config) {
        if (config == null || config.isBlank()) return Aircraft.CabinConfiguration.ECONOMY;
        try { return Aircraft.CabinConfiguration.valueOf(config.toUpperCase()); }
        catch (Exception e) { return Aircraft.CabinConfiguration.ECONOMY; }
    }

    private Aircraft.AircraftRole parseRole(String role) {
        if (role == null || role.isBlank()) return Aircraft.AircraftRole.PASSENGER;
        try { return Aircraft.AircraftRole.valueOf(role.toUpperCase()); }
        catch (Exception e) { return Aircraft.AircraftRole.PASSENGER; }
    }

    private AircraftDTO mapToDTO(Aircraft aircraft) {
        AircraftDTO dto = new AircraftDTO();
        dto.setId(aircraft.getId());
        dto.setRegistration(aircraft.getRegistration());
        dto.setType(aircraft.getType());
        dto.setModel(aircraft.getModel());
        dto.setManufacturer(aircraft.getManufacturer());
        dto.setYearOfManufacture(aircraft.getYearOfManufacture());
        dto.setTotalFlightHours(aircraft.getTotalFlightHours());
        dto.setStatus(aircraft.getStatus() != null ? aircraft.getStatus().name() : null);
        dto.setLastMaintenanceDate(aircraft.getLastMaintenanceDate());
        dto.setNextMaintenanceDue(aircraft.getNextMaintenanceDue());
        dto.setMaintenanceDue(aircraft.needsMaintenance());
        dto.setSerialNumber(aircraft.getSerialNumber());
        dto.setSeatingCapacity(aircraft.getSeatingCapacity());
        dto.setLengthM(aircraft.getLengthM());
        dto.setCruiseAltitudeM(aircraft.getCruiseAltitudeM());
        dto.setCruiseSpeedKmh(aircraft.getCruiseSpeedKmh());
        dto.setCabinConfiguration(aircraft.getCabinConfiguration() != null ? aircraft.getCabinConfiguration().name() : null);
        dto.setAutonomyKm(aircraft.getAutonomyKm());
        dto.setPrimaryRole(aircraft.getPrimaryRole() != null ? aircraft.getPrimaryRole().name() : null);
        return dto;
    }
}