package net.othmane.reportingcamo.service;

import lombok.RequiredArgsConstructor;
import net.othmane.reportingcamo.dto.EmployeeDTO;
import net.othmane.reportingcamo.entity.Employee;
import net.othmane.reportingcamo.entity.Technician;
import net.othmane.reportingcamo.exception.ResourceNotFoundException;
import net.othmane.reportingcamo.repository.EmployeeRepository;
import net.othmane.reportingcamo.repository.TechnicianRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final TechnicianRepository technicianRepository;

    @Transactional(readOnly = true)
    public List<EmployeeDTO> getAllEmployees() {
        return employeeRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public EmployeeDTO getEmployeeById(Integer id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", id));
        return mapToDTO(employee);
    }

    @Transactional
    public EmployeeDTO createEmployee(EmployeeDTO dto) {
        String employeeNumber = resolveEmployeeNumber(dto.getEmployeeNumber());

        if (employeeRepository.findByEmployeeNumber(employeeNumber).isPresent()) {
            throw new IllegalArgumentException(
                    "Un employé avec ce matricule existe déjà : " + employeeNumber
            );
        }

        Employee employee = Employee.builder()
                .employeeNumber(employeeNumber)
                .firstName(dto.getFirstName())
                .lastName(dto.getLastName())
                .email(dto.getEmail())
                .phone(dto.getPhone())
                .department(dto.getDepartment())
                .position(resolvePosition(dto))
                .hireDate(dto.getHireDate())
                .status(dto.getStatus() != null
                        ? Employee.EmployeeStatus.valueOf(dto.getStatus().toUpperCase())
                        : Employee.EmployeeStatus.ACTIVE)
                .build();

        Employee saved = employeeRepository.save(employee);
        syncTechnicianProfile(saved, dto);
        return mapToDTO(saved);
    }

    @Transactional
    public EmployeeDTO updateEmployee(Integer id, EmployeeDTO dto) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", id));

        if (dto.getEmployeeNumber() != null && !dto.getEmployeeNumber().isBlank()) {
            String newNumber = dto.getEmployeeNumber().trim();

            if (!newNumber.equals(employee.getEmployeeNumber())
                    && employeeRepository.findByEmployeeNumber(newNumber).isPresent()) {
                throw new IllegalArgumentException(
                        "Un employé avec ce matricule existe déjà : " + newNumber
                );
            }
            employee.setEmployeeNumber(newNumber);
        }

        employee.setFirstName(dto.getFirstName());
        employee.setLastName(dto.getLastName());
        employee.setEmail(dto.getEmail());
        employee.setPhone(dto.getPhone());
        employee.setDepartment(dto.getDepartment());
        employee.setPosition(resolvePosition(dto));
        employee.setHireDate(dto.getHireDate());

        if (dto.getStatus() != null) {
            employee.setStatus(Employee.EmployeeStatus.valueOf(dto.getStatus().toUpperCase()));
        }

        Employee updated = employeeRepository.save(employee);
        syncTechnicianProfile(updated, dto);
        return mapToDTO(updated);
    }

    @Transactional
    public void deleteEmployee(Integer id) {
        if (!employeeRepository.existsById(id)) {
            throw new ResourceNotFoundException("Employee", "id", id);
        }
        employeeRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<EmployeeDTO> getEmployeesByDepartment(String department) {
        return employeeRepository.findByDepartment(department).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<EmployeeDTO> getEmployeesByStatus(String status) {
        Employee.EmployeeStatus employeeStatus =
                Employee.EmployeeStatus.valueOf(status.toUpperCase());

        return employeeRepository.findByStatus(employeeStatus).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    private EmployeeDTO mapToDTO(Employee employee) {
        EmployeeDTO dto = new EmployeeDTO();
        dto.setId(employee.getId());
        dto.setEmployeeNumber(employee.getEmployeeNumber());
        dto.setFirstName(employee.getFirstName());
        dto.setLastName(employee.getLastName());
        dto.setEmail(employee.getEmail());
        dto.setPhone(employee.getPhone());
        dto.setDepartment(employee.getDepartment());
        dto.setPosition(employee.getPosition());
        dto.setHireDate(employee.getHireDate());
        dto.setStatus(employee.getStatus() != null ? employee.getStatus().name() : null);
        dto.setFullName(employee.getFullName());

        Technician technician = technicianRepository
                .findByEmployeeId(employee.getId())
                .orElse(null);

        if (technician != null) {
            dto.setRole("TECHNICIAN");
            dto.setTechnicianId(technician.getId());
        } else if (employee.getPosition() != null && !employee.getPosition().isBlank()) {
            dto.setRole(employee.getPosition().toUpperCase());
        } else {
            dto.setRole("EMPLOYEE");
        }

        return dto;
    }

    private String resolveEmployeeNumber(String employeeNumber) {
        if (employeeNumber != null && !employeeNumber.isBlank()) {
            return employeeNumber.trim();
        }
        return "EMP-" + UUID.randomUUID().toString()
                .substring(0, 8).toUpperCase();
    }

    private String resolvePosition(EmployeeDTO dto) {
        if (dto.getPosition() != null && !dto.getPosition().isBlank()) {
            return dto.getPosition();
        }
        if (dto.getRole() != null && !dto.getRole().isBlank()) {
            return dto.getRole().toUpperCase();
        }
        return null;
    }

    private void syncTechnicianProfile(Employee employee, EmployeeDTO dto) {
        if (dto.getRole() == null || !"TECHNICIAN".equalsIgnoreCase(dto.getRole())) {
            return;
        }

        technicianRepository.findByEmployeeId(employee.getId())
                .orElseGet(() -> technicianRepository.save(
                        Technician.builder()
                                .employee(employee)
                                .availability(true)
                                .build()
                ));
    }
}