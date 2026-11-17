package net.othmane.reportingcamo.service;

import net.othmane.reportingcamo.dto.EmployeeDTO;
import net.othmane.reportingcamo.entity.Employee;
import net.othmane.reportingcamo.repository.EmployeeRepository;
import net.othmane.reportingcamo.repository.TechnicianRepository;
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
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Employee Service Unit Tests")
class EmployeeServiceTest {

    @Mock
    private EmployeeRepository employeeRepository;

    @Mock
    private TechnicianRepository technicianRepository;

    @InjectMocks
    private EmployeeService employeeService;

    private Employee employee;
    private EmployeeDTO employeeDTO;

    @BeforeEach
    void setUp() {
        employee = Employee.builder()
                .id(1)
                .employeeNumber("RAM-1001")
                .firstName("Karim")
                .lastName("El Amrani")
                .email("karim@ram.ma")
                .status(Employee.EmployeeStatus.ACTIVE)
                .build();

        employeeDTO = new EmployeeDTO();
        employeeDTO.setId(1);
        employeeDTO.setEmployeeNumber("RAM-1001");
        employeeDTO.setFirstName("Karim");
        employeeDTO.setLastName("El Amrani");
        employeeDTO.setEmail("karim@ram.ma");
        employeeDTO.setStatus("ACTIVE");
    }

    @Test
    @DisplayName("Should return all employees")
    void getAllEmployees_shouldReturnAll() {
        when(employeeRepository.findAll()).thenReturn(Arrays.asList(employee));
        when(technicianRepository.findByEmployeeId(1)).thenReturn(Optional.empty());

        List<EmployeeDTO> result = employeeService.getAllEmployees();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getEmployeeNumber()).isEqualTo("RAM-1001");
        verify(employeeRepository, times(1)).findAll();
    }

    @Test
    @DisplayName("Should return employee by ID")
    void getEmployeeById_shouldReturnEmployee() {
        when(employeeRepository.findById(1)).thenReturn(Optional.of(employee));
        when(technicianRepository.findByEmployeeId(1)).thenReturn(Optional.empty());

        EmployeeDTO result = employeeService.getEmployeeById(1);

        assertThat(result).isNotNull();
        assertThat(result.getFirstName()).isEqualTo("Karim");
        verify(employeeRepository, times(1)).findById(1);
    }

    @Test
    @DisplayName("Should create employee")
    void createEmployee_shouldCreate() {
        when(employeeRepository.findByEmployeeNumber(anyString())).thenReturn(Optional.empty());
        when(employeeRepository.save(any(Employee.class))).thenReturn(employee);
        when(technicianRepository.findByEmployeeId(1)).thenReturn(Optional.empty());

        EmployeeDTO result = employeeService.createEmployee(employeeDTO);

        assertThat(result).isNotNull();
        assertThat(result.getEmployeeNumber()).isEqualTo("RAM-1001");
        verify(employeeRepository, times(1)).save(any(Employee.class));
    }

    @Test
    @DisplayName("Should throw exception when creating employee with duplicate number")
    void createEmployee_shouldThrowException_whenDuplicateNumber() {
        when(employeeRepository.findByEmployeeNumber(anyString()))
                .thenReturn(Optional.of(employee));

        assertThrows(
                IllegalArgumentException.class,
                () -> employeeService.createEmployee(employeeDTO)
        );

        verify(employeeRepository, never()).save(any(Employee.class));
    }
}