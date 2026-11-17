package net.othmane.reportingcamo.service;

import net.othmane.reportingcamo.dto.MaintenanceDTO;
import net.othmane.reportingcamo.entity.Aircraft;
import net.othmane.reportingcamo.entity.Maintenance;
import net.othmane.reportingcamo.entity.Technician;
import net.othmane.reportingcamo.exception.ResourceNotFoundException;
import net.othmane.reportingcamo.repository.AircraftRepository;
import net.othmane.reportingcamo.repository.MaintenanceRepository;
import net.othmane.reportingcamo.repository.TechnicianRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Maintenance Service Unit Tests")
class MaintenanceServiceTest {

    @Mock
    private MaintenanceRepository maintenanceRepository;
    @Mock
    private AircraftRepository aircraftRepository;
    @Mock
    private TechnicianRepository technicianRepository;

    @InjectMocks
    private MaintenanceService maintenanceService;

    private Maintenance maintenance;
    private Aircraft aircraft;
    private MaintenanceDTO maintenanceDTO;

    @BeforeEach
    void setUp() {
        aircraft = Aircraft.builder().id(1).registration("CN-TEST").build();
        maintenance = Maintenance.builder()
                .id(1)
                .aircraft(aircraft)
                .maintenanceType(Maintenance.MaintenanceType.A_CHECK)
                .startDate(LocalDate.now())
                .status(Maintenance.MaintenanceStatus.PLANNED)
                .build();

        maintenanceDTO = new MaintenanceDTO();
        maintenanceDTO.setId(1);
        maintenanceDTO.setAircraftId(1);
        maintenanceDTO.setMaintenanceType("A_CHECK");
        maintenanceDTO.setStartDate(LocalDate.now());
        maintenanceDTO.setStatus("PLANNED");
    }

    @Test
    @DisplayName("Should return all maintenances")
    void getAllMaintenance_shouldReturnAll() {
        // Given
        when(maintenanceRepository.findAll()).thenReturn(Arrays.asList(maintenance));

        // When
        List<MaintenanceDTO> result = maintenanceService.getAllMaintenance();

        // Then
        assertThat(result).hasSize(1);
        verify(maintenanceRepository, times(1)).findAll();
    }

    @Test
    @DisplayName("Should create maintenance")
    void createMaintenance_shouldCreate() {
        // Given
        when(aircraftRepository.findById(1)).thenReturn(Optional.of(aircraft));
        when(maintenanceRepository.save(any(Maintenance.class))).thenReturn(maintenance);

        // When
        MaintenanceDTO result = maintenanceService.createMaintenance(maintenanceDTO);

        // Then
        assertThat(result).isNotNull();
        verify(maintenanceRepository, times(1)).save(any(Maintenance.class));
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when maintenance ID not found")
    void getMaintenanceById_shouldThrowException_whenNotFound() {
        // Given
        when(maintenanceRepository.findById(anyInt())).thenReturn(Optional.empty());

        // When & Then
        assertThrows(ResourceNotFoundException.class, () -> maintenanceService.getMaintenanceById(99));
    }

    @Test
    @DisplayName("Should delete maintenance")
    void deleteMaintenance_shouldDelete() {
        // Given
        when(maintenanceRepository.existsById(1)).thenReturn(true);
        doNothing().when(maintenanceRepository).deleteById(1);

        // When
        maintenanceService.deleteMaintenance(1);

        // Then
        verify(maintenanceRepository, times(1)).deleteById(1);
    }
}
