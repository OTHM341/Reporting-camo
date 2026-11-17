package net.othmane.reportingcamo.service;

import lombok.RequiredArgsConstructor;
import net.othmane.reportingcamo.dto.FlightDTO;
import net.othmane.reportingcamo.entity.Aircraft;
import net.othmane.reportingcamo.entity.Flight;
import net.othmane.reportingcamo.exception.ResourceNotFoundException;
import net.othmane.reportingcamo.repository.AircraftRepository;
import net.othmane.reportingcamo.repository.FlightRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FlightService {

    private final FlightRepository flightRepository;
    private final AircraftRepository aircraftRepository;

    @Transactional(readOnly = true)
    public List<FlightDTO> getAllFlights() {
        return flightRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public FlightDTO getFlightById(Integer id) {
        Flight flight = flightRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Flight", "id", id));
        return mapToDTO(flight);
    }

    @Transactional
    public FlightDTO createFlight(FlightDTO dto) {
        Aircraft aircraft = aircraftRepository.findById(dto.getAircraftId())
                .orElseThrow(() -> new ResourceNotFoundException("Aircraft", "id", dto.getAircraftId()));

        Flight flight = Flight.builder()
                .flightNumber(dto.getFlightNumber())
                .aircraft(aircraft)
                .origin(dto.getOrigin())
                .destination(dto.getDestination())
                .scheduledDeparture(dto.getScheduledDeparture())
                .scheduledArrival(dto.getScheduledArrival())
                .actualDeparture(dto.getActualDeparture())
                .actualArrival(dto.getActualArrival())
                .status(parseFlightStatus(dto.getStatus()))
                .gate(dto.getGate())
                .delayMinutes(dto.getDelayMinutes() != null ? dto.getDelayMinutes() : 0)
                .build();

        Flight saved = flightRepository.save(flight);
        return mapToDTO(saved);
    }

    @Transactional
    public FlightDTO updateFlight(Integer id, FlightDTO dto) {
        Flight flight = flightRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Flight", "id", id));

        Aircraft aircraft = aircraftRepository.findById(dto.getAircraftId())
                .orElseThrow(() -> new ResourceNotFoundException("Aircraft", "id", dto.getAircraftId()));

        flight.setFlightNumber(dto.getFlightNumber());
        flight.setAircraft(aircraft);
        flight.setOrigin(dto.getOrigin());
        flight.setDestination(dto.getDestination());
        flight.setScheduledDeparture(dto.getScheduledDeparture());
        flight.setScheduledArrival(dto.getScheduledArrival());
        flight.setActualDeparture(dto.getActualDeparture());
        flight.setActualArrival(dto.getActualArrival());
        flight.setStatus(parseFlightStatus(dto.getStatus()));
        flight.setGate(dto.getGate());
        flight.setDelayMinutes(dto.getDelayMinutes());

        Flight updated = flightRepository.save(flight);
        return mapToDTO(updated);
    }

    @Transactional
    public void deleteFlight(Integer id) {
        if (!flightRepository.existsById(id)) {
            throw new ResourceNotFoundException("Flight", "id", id);
        }
        flightRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<FlightDTO> getFlightsByStatus(String status) {
        Flight.FlightStatus flightStatus = parseFlightStatus(status);
        return flightRepository.findByStatus(flightStatus).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<FlightDTO> getFlightsByDateRange(LocalDateTime start, LocalDateTime end) {
        return flightRepository.findFlightsByDateRange(start, end).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public FlightDTO updateFlightStatus(Integer id, String status, Integer delayMinutes) {
        Flight flight = flightRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Flight", "id", id));

        flight.setStatus(parseFlightStatus(status));
        if (delayMinutes != null) {
            flight.setDelayMinutes(delayMinutes);
        }

        Flight updated = flightRepository.save(flight);
        return mapToDTO(updated);
    }

    private Flight.FlightStatus parseFlightStatus(String status) {
        if (status == null || status.isBlank()) return Flight.FlightStatus.SCHEDULED;
        try {
            return Flight.FlightStatus.valueOf(status.toUpperCase().replace(" ", "_"));
        } catch (IllegalArgumentException e) {
            return Flight.FlightStatus.SCHEDULED;
        }
    }

    private FlightDTO mapToDTO(Flight flight) {
        FlightDTO dto = new FlightDTO();
        dto.setId(flight.getId());
        dto.setFlightNumber(flight.getFlightNumber());
        dto.setAircraftId(flight.getAircraft() != null ? flight.getAircraft().getId() : null);
        dto.setAircraftRegistration(flight.getAircraft() != null ? flight.getAircraft().getRegistration() : null);
        dto.setOrigin(flight.getOrigin());
        dto.setDestination(flight.getDestination());
        dto.setScheduledDeparture(flight.getScheduledDeparture());
        dto.setScheduledArrival(flight.getScheduledArrival());
        dto.setActualDeparture(flight.getActualDeparture());
        dto.setActualArrival(flight.getActualArrival());
        dto.setStatus(flight.getStatus() != null ? flight.getStatus().name() : null);
        dto.setGate(flight.getGate());
        dto.setDelayMinutes(flight.getDelayMinutes());
        dto.setDelayed(flight.isDelayed());
        dto.setOnTime(flight.isOnTime());
        return dto;
    }
}