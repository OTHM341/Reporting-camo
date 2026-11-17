package net.othmane.reportingcamo.service;

import net.othmane.reportingcamo.dto.FlightDTO;
import net.othmane.reportingcamo.entity.Aircraft;
import net.othmane.reportingcamo.entity.Flight;
import net.othmane.reportingcamo.exception.ResourceNotFoundException;
import net.othmane.reportingcamo.repository.AircraftRepository;
import net.othmane.reportingcamo.repository.FlightRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Flight Service Unit Tests")
class FlightServiceTest {

    @Mock
    private FlightRepository flightRepository;

    @Mock
    private AircraftRepository aircraftRepository;

    @InjectMocks
    private FlightService flightService;

    private Flight flight;
    private Aircraft aircraft;
    private FlightDTO flightDTO;

    @BeforeEach
    void setUp() {
        aircraft = Aircraft.builder().id(1).registration("CN-TEST").build();

        flight = Flight.builder()
                .id(1)
                .flightNumber("AT123")
                .aircraft(aircraft)
                .origin("CMN")
                .destination("CDG")
                .scheduledDeparture(LocalDateTime.now().plusHours(2))
                .scheduledArrival(LocalDateTime.now().plusHours(5))
                .status(Flight.FlightStatus.SCHEDULED)
                .build();

        flightDTO = new FlightDTO();
        flightDTO.setId(1);
        flightDTO.setFlightNumber("AT123");
        flightDTO.setAircraftId(1);
        flightDTO.setOrigin("CMN");
        flightDTO.setDestination("CDG");
        flightDTO.setScheduledDeparture(LocalDateTime.now().plusHours(2));
        flightDTO.setScheduledArrival(LocalDateTime.now().plusHours(5));
        flightDTO.setStatus("SCHEDULED");
    }

    @Test
    @DisplayName("Should return all flights")
    void getAllFlights_shouldReturnAllFlights() {
        // Given
        when(flightRepository.findAll()).thenReturn(Arrays.asList(flight));

        // When
        List<FlightDTO> result = flightService.getAllFlights();

        // Then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getFlightNumber()).isEqualTo("AT123");
        verify(flightRepository, times(1)).findAll();
    }

    @Test
    @DisplayName("Should return flight by ID")
    void getFlightById_shouldReturnFlightById() {
        // Given
        when(flightRepository.findById(1)).thenReturn(Optional.of(flight));

        // When
        FlightDTO result = flightService.getFlightById(1);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getFlightNumber()).isEqualTo("AT123");
        verify(flightRepository, times(1)).findById(1);
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when flight not found")
    void getFlightById_shouldThrowException_whenNotFound() {
        // Given
        when(flightRepository.findById(anyInt())).thenReturn(Optional.empty());

        // When & Then
        assertThrows(ResourceNotFoundException.class, () -> flightService.getFlightById(99));
    }

    @Test
    @DisplayName("Should create a new flight")
    void createFlight_shouldCreateNewFlight() {
        // Given
        when(aircraftRepository.findById(1)).thenReturn(Optional.of(aircraft));
        when(flightRepository.save(any(Flight.class))).thenReturn(flight);

        // When
        FlightDTO result = flightService.createFlight(flightDTO);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getFlightNumber()).isEqualTo("AT123");
        verify(aircraftRepository, times(1)).findById(1);
        verify(flightRepository, times(1)).save(any(Flight.class));
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when creating flight with non-existent aircraft")
    void createFlight_shouldThrowException_whenAircraftNotFound() {
        // Given
        flightDTO.setAircraftId(99);
        when(aircraftRepository.findById(99)).thenReturn(Optional.empty());

        // When & Then
        assertThrows(ResourceNotFoundException.class, () -> flightService.createFlight(flightDTO));
        verify(flightRepository, never()).save(any(Flight.class));
    }

    @Test
    @DisplayName("Should update flight status")
    void updateFlightStatus_shouldUpdateStatus() {
        // Given
        when(flightRepository.findById(1)).thenReturn(Optional.of(flight));
        when(flightRepository.save(any(Flight.class))).thenReturn(flight);

        // When
        FlightDTO result = flightService.updateFlightStatus(1, "DEPARTED", 10);

        // Then
        assertThat(result.getStatus()).isEqualTo("DEPARTED");
        verify(flightRepository, times(1)).findById(1);
        verify(flightRepository, times(1)).save(any(Flight.class));
    }
}
