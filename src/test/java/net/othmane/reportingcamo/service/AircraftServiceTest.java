package net.othmane.reportingcamo.service;

import net.othmane.reportingcamo.dto.AircraftDTO;
import net.othmane.reportingcamo.entity.Aircraft;
import net.othmane.reportingcamo.exception.ResourceNotFoundException;
import net.othmane.reportingcamo.repository.AircraftRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Aircraft Service Unit Tests")
class AircraftServiceTest {

    @Mock
    private AircraftRepository aircraftRepository;

    @InjectMocks
    private AircraftService aircraftService;

    private Aircraft aircraft;
    private AircraftDTO aircraftDTO;

    @BeforeEach
    void setUp() {
        aircraft = Aircraft.builder()
                .id(1)
                .registration("CN-TEST")
                .type("Boeing 737")
                .model("737-800")
                .status(Aircraft.AircraftStatus.ACTIVE)
                .build();

        aircraftDTO = new AircraftDTO();
        aircraftDTO.setId(1);
        aircraftDTO.setRegistration("CN-TEST");
        aircraftDTO.setType("Boeing 737");
        aircraftDTO.setModel("737-800");
        aircraftDTO.setStatus("ACTIVE");
    }

    @Test
    @DisplayName("Should return all aircraft")
    void getAllAircraft_shouldReturnAllAircraft() {
        // Given
        List<Aircraft> aircraftList = Arrays.asList(aircraft, new Aircraft());
        when(aircraftRepository.findAll()).thenReturn(aircraftList);

        // When
        List<AircraftDTO> result = aircraftService.getAllAircraft();

        // Then
        assertThat(result).isNotNull();
        assertThat(result).hasSize(2);
        verify(aircraftRepository, times(1)).findAll();
    }

    @Test
    @DisplayName("Should return aircraft by ID")
    void getAircraftById_shouldReturnAircraftById() {
        // Given
        when(aircraftRepository.findById(1)).thenReturn(Optional.of(aircraft));

        // When
        AircraftDTO result = aircraftService.getAircraftById(1);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getRegistration()).isEqualTo("CN-TEST");
        verify(aircraftRepository, times(1)).findById(1);
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when aircraft not found by ID")
    void getAircraftById_shouldThrowException_whenNotFound() {
        // Given
        when(aircraftRepository.findById(anyInt())).thenReturn(Optional.empty());

        // When & Then
        assertThrows(ResourceNotFoundException.class, () -> aircraftService.getAircraftById(99));
        verify(aircraftRepository, times(1)).findById(99);
    }

    @Test
    @DisplayName("Should create a new aircraft")
    void createAircraft_shouldCreateNewAircraft() {
        // Given
        AircraftDTO newAircraftDTO = new AircraftDTO();
        newAircraftDTO.setRegistration("CN-NEW");
        newAircraftDTO.setType("Airbus A320");
        newAircraftDTO.setModel("A320-200");
        newAircraftDTO.setStatus("ACTIVE");

        Aircraft newAircraft = Aircraft.builder()
                .registration("CN-NEW")
                .type("Airbus A320")
                .model("A320-200")
                .status(Aircraft.AircraftStatus.ACTIVE)
                .build();

        when(aircraftRepository.existsByRegistration(anyString())).thenReturn(false);
        when(aircraftRepository.save(any(Aircraft.class))).thenReturn(newAircraft);

        // When
        AircraftDTO result = aircraftService.createAircraft(newAircraftDTO);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getRegistration()).isEqualTo("CN-NEW");
        verify(aircraftRepository, times(1)).existsByRegistration("CN-NEW");
        verify(aircraftRepository, times(1)).save(any(Aircraft.class));
    }

    @Test
    @DisplayName("Should throw IllegalArgumentException when creating aircraft with duplicate registration")
    void createAircraft_shouldThrowException_whenDuplicateRegistration() {
        // Given
        when(aircraftRepository.existsByRegistration(anyString())).thenReturn(true);

        // When & Then
        assertThrows(IllegalArgumentException.class, () -> aircraftService.createAircraft(aircraftDTO));
        verify(aircraftRepository, times(1)).existsByRegistration(aircraftDTO.getRegistration());
        verify(aircraftRepository, never()).save(any(Aircraft.class));
    }

    @Test
    @DisplayName("Should update an existing aircraft")
    void updateAircraft_shouldUpdateAircraft() {
        // Given
        AircraftDTO updatedDTO = new AircraftDTO();
        updatedDTO.setId(1);
        updatedDTO.setRegistration("CN-UPDATED");
        updatedDTO.setType("Boeing 747");
        updatedDTO.setModel("747-400");
        updatedDTO.setStatus("MAINTENANCE");

        Aircraft updatedAircraft = Aircraft.builder()
                .id(1)
                .registration("CN-UPDATED")
                .type("Boeing 747")
                .model("747-400")
                .status(Aircraft.AircraftStatus.MAINTENANCE)
                .build();

        when(aircraftRepository.findById(1)).thenReturn(Optional.of(aircraft));
        when(aircraftRepository.existsByRegistration(anyString())).thenReturn(false); // No duplicate
        when(aircraftRepository.save(any(Aircraft.class))).thenReturn(updatedAircraft);

        // When
        AircraftDTO result = aircraftService.updateAircraft(1, updatedDTO);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getRegistration()).isEqualTo("CN-UPDATED");
        assertThat(result.getStatus()).isEqualTo("MAINTENANCE");
        verify(aircraftRepository, times(1)).findById(1);
        verify(aircraftRepository, times(1)).existsByRegistration("CN-UPDATED");
        verify(aircraftRepository, times(1)).save(any(Aircraft.class));
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when updating non-existent aircraft")
    void updateAircraft_shouldThrowException_whenNotFound() {
        // Given
        when(aircraftRepository.findById(anyInt())).thenReturn(Optional.empty());

        // When & Then
        assertThrows(ResourceNotFoundException.class, () -> aircraftService.updateAircraft(99, aircraftDTO));
        verify(aircraftRepository, times(1)).findById(99);
        verify(aircraftRepository, never()).existsByRegistration(anyString());
        verify(aircraftRepository, never()).save(any(Aircraft.class));
    }

    @Test
    @DisplayName("Should throw IllegalArgumentException when updating aircraft to duplicate registration")
    void updateAircraft_shouldThrowException_whenDuplicateRegistration() {
        // Given
        Aircraft existingAircraft = Aircraft.builder().id(2).registration("CN-OTHER").build();
        AircraftDTO updatedDTO = new AircraftDTO();
        updatedDTO.setId(1);
        updatedDTO.setRegistration("CN-OTHER"); // Trying to change to an existing registration

        when(aircraftRepository.findById(1)).thenReturn(Optional.of(aircraft)); // aircraft is CN-TEST
        when(aircraftRepository.existsByRegistration("CN-OTHER")).thenReturn(true);

        // When & Then
        assertThrows(IllegalArgumentException.class, () -> aircraftService.updateAircraft(1, updatedDTO));
        verify(aircraftRepository, times(1)).findById(1);
        verify(aircraftRepository, times(1)).existsByRegistration("CN-OTHER");
        verify(aircraftRepository, never()).save(any(Aircraft.class));
    }

    @Test
    @DisplayName("Should delete an aircraft")
    void deleteAircraft_shouldDeleteAircraft() {
        // Given
        when(aircraftRepository.existsById(1)).thenReturn(true);
        doNothing().when(aircraftRepository).deleteById(1);

        // When
        aircraftService.deleteAircraft(1);

        // Then
        verify(aircraftRepository, times(1)).existsById(1);
        verify(aircraftRepository, times(1)).deleteById(1);
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when deleting non-existent aircraft")
    void deleteAircraft_shouldThrowException_whenNotFound() {
        // Given
        when(aircraftRepository.existsById(anyInt())).thenReturn(false);

        // When & Then
        assertThrows(ResourceNotFoundException.class, () -> aircraftService.deleteAircraft(99));
        verify(aircraftRepository, times(1)).existsById(99);
        verify(aircraftRepository, never()).deleteById(anyInt());
    }

    @Test
    @DisplayName("Should return aircraft by status")
    void getAircraftByStatus_shouldReturnAircraftByStatus() {
        // Given
        List<Aircraft> activeAircraft = Arrays.asList(aircraft);
        when(aircraftRepository.findByStatus(Aircraft.AircraftStatus.ACTIVE)).thenReturn(activeAircraft);

        // When
        List<AircraftDTO> result = aircraftService.getAircraftByStatus("ACTIVE");

        // Then
        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getStatus()).isEqualTo("ACTIVE");
        verify(aircraftRepository, times(1)).findByStatus(Aircraft.AircraftStatus.ACTIVE);
    }

    @Test
    @DisplayName("Should throw IllegalArgumentException for invalid status")
    void getAircraftByStatus_shouldThrowException_forInvalidStatus() {
        // Given
        String invalidStatus = "INVALID_STATUS";

        // When & Then
        assertThrows(IllegalArgumentException.class, () -> aircraftService.getAircraftByStatus(invalidStatus));
        verify(aircraftRepository, never()).findByStatus(any(Aircraft.AircraftStatus.class));
    }

    @Test
    @DisplayName("Should return aircraft due for maintenance")
    void getAircraftDueForMaintenance_shouldReturnAircraft() {
        // Given
        List<Aircraft> dueAircraft = Arrays.asList(aircraft);
        when(aircraftRepository.findAircraftDueForMaintenance()).thenReturn(dueAircraft);

        // When
        List<AircraftDTO> result = aircraftService.getAircraftDueForMaintenance();

        // Then
        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        verify(aircraftRepository, times(1)).findAircraftDueForMaintenance();
    }
}
