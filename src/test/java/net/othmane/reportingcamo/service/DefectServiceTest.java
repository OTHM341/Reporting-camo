package net.othmane.reportingcamo.service;

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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Defect Service Unit Tests")
class DefectServiceTest {

    @Mock
    private DefectRepository defectRepository;
    @Mock
    private AircraftRepository aircraftRepository;
    @Mock
    private EmployeeRepository employeeRepository;
    @Mock
    private FlightRepository flightRepository;

    @InjectMocks
    private DefectService defectService;

    private Defect defect;
    private Aircraft aircraft;
    private DefectDTO defectDTO;

    @BeforeEach
    void setUp() {
        aircraft = Aircraft.builder().id(1).registration("CN-TEST").build();
        defect = Defect.builder()
                .id(1)
                .aircraft(aircraft)
                .description("Test defect")
                .severity(Defect.DefectSeverity.MINOR)
                .status(Defect.DefectStatus.OPEN)
                .build();

        defectDTO = new DefectDTO();
        defectDTO.setId(1);
        defectDTO.setAircraftId(1);
        defectDTO.setDescription("Test defect");
        defectDTO.setSeverity("MINOR");
        defectDTO.setStatus("OPEN");
    }

    @Test
    @DisplayName("Should return all defects")
    void getAllDefects_shouldReturnAllDefects() {
        when(defectRepository.findAll()).thenReturn(Arrays.asList(defect));
        List<DefectDTO> result = defectService.getAllDefects();
        assertThat(result).hasSize(1);
        verify(defectRepository, times(1)).findAll();
    }

    @Test
    @DisplayName("Should create a new defect")
    void createDefect_shouldCreateNewDefect() {
        when(aircraftRepository.findById(1)).thenReturn(Optional.of(aircraft));
        when(defectRepository.save(any(Defect.class))).thenReturn(defect);

        DefectDTO result = defectService.createDefect(defectDTO);

        assertThat(result).isNotNull();
        assertThat(result.getDescription()).isEqualTo("Test defect");
        verify(aircraftRepository, times(1)).findById(1);
        verify(defectRepository, times(1)).save(any(Defect.class));
    }

    @Test
    @DisplayName("Should resolve a defect")
    void resolveDefect_shouldResolveDefect() {
        when(defectRepository.findById(1)).thenReturn(Optional.of(defect));
        when(defectRepository.save(any(Defect.class))).thenReturn(defect);

        DefectDTO result = defectService.resolveDefect(1, "Fixed");

        assertThat(result.getStatus()).isEqualTo("RESOLVED");
        assertThat(result.getResolution()).isEqualTo("Fixed");
        verify(defectRepository, times(1)).findById(1);
        verify(defectRepository, times(1)).save(any(Defect.class));
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when resolving non-existent defect")
    void resolveDefect_shouldThrowException_whenNotFound() {
        when(defectRepository.findById(anyInt())).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> defectService.resolveDefect(99, "Fixed"));
    }

    @Test
    @DisplayName("Should return defects by aircraft")
    void getDefectsByAircraft_shouldReturnDefects() {
        when(defectRepository.findByAircraftId(1)).thenReturn(Arrays.asList(defect));
        List<DefectDTO> result = defectService.getDefectsByAircraft(1);
        assertThat(result).hasSize(1);
        verify(defectRepository, times(1)).findByAircraftId(1);
    }
}
