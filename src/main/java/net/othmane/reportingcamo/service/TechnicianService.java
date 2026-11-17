package net.othmane.reportingcamo.service;

import lombok.RequiredArgsConstructor;
import net.othmane.reportingcamo.dto.TechnicianDTO;
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
public class TechnicianService {

    private final TechnicianRepository technicianRepository;
    private final EmployeeRepository employeeRepository;

    @Transactional(readOnly = true)
    public List<TechnicianDTO> getAllTechnicians() {
        return technicianRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public TechnicianDTO getTechnicianById(Integer id) {
        Technician technician = technicianRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Technician", "id", id));
        return mapToDTO(technician);
    }

    @Transactional
    public TechnicianDTO createTechnician(TechnicianDTO dto) {
        Employee employee = resolveEmployee(dto);

        Technician technician = Technician.builder()
                .employee(employee)
                .licenseNumber(dto.getLicenseNumber())
                .specialization(dto.getSpecialization())
                .certificationLevel(resolveCertificationLevel(dto.getCertificationLevel()))
                .availability(dto.getAvailability() != null ? dto.getAvailability() : true)
                .build();

        return mapToDTO(technicianRepository.save(technician));
    }

    @Transactional
    public TechnicianDTO updateTechnician(Integer id, TechnicianDTO dto) {
        Technician technician = technicianRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Technician", "id", id));

        Employee employee = technician.getEmployee();
        if (employee != null) {
            employee.setFirstName(dto.getFirstName());
            employee.setLastName(dto.getLastName());
            employee.setEmail(dto.getEmail());
            employee.setPhone(dto.getPhone());
            employee.setDepartment(dto.getDepartment());
            if (dto.getStatus() != null) {
                employee.setStatus(Employee.EmployeeStatus.valueOf(dto.getStatus().toUpperCase()));
            }
            employeeRepository.save(employee);
        }

        technician.setLicenseNumber(dto.getLicenseNumber());
        technician.setSpecialization(dto.getSpecialization());
        if (dto.getCertificationLevel() != null) {
            technician.setCertificationLevel(resolveCertificationLevel(dto.getCertificationLevel()));
        }
        if (dto.getAvailability() != null) {
            technician.setAvailability(dto.getAvailability());
        }

        return mapToDTO(technicianRepository.save(technician));
    }

    @Transactional
    public void deleteTechnician(Integer id) {
        if (!technicianRepository.existsById(id)) {
            throw new ResourceNotFoundException("Technician", "id", id);
        }
        technicianRepository.deleteById(id);
    }

    private Employee resolveEmployee(TechnicianDTO dto) {
        if (dto.getEmployeeId() != null) {
            Employee existing = employeeRepository.findById(dto.getEmployeeId())
                    .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", dto.getEmployeeId()));
            technicianRepository.findByEmployeeId(existing.getId())
                    .ifPresent(technician -> {
                        throw new IllegalArgumentException("Employee is already linked to a technician profile");
                    });
            return existing;
        }

        Employee employee = Employee.builder()
                .employeeNumber(dto.getEmployeeNumber() != null && !dto.getEmployeeNumber().isBlank()
                        ? dto.getEmployeeNumber().trim()
                        : "EMP-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .firstName(dto.getFirstName())
                .lastName(dto.getLastName())
                .email(dto.getEmail())
                .phone(dto.getPhone())
                .department(dto.getDepartment() != null ? dto.getDepartment() : "Maintenance")
                .position("TECHNICIAN")
                .status(dto.getStatus() != null ? Employee.EmployeeStatus.valueOf(dto.getStatus().toUpperCase()) : Employee.EmployeeStatus.ACTIVE)
                .build();
        return employeeRepository.save(employee);
    }

    private Technician.CertificationLevel resolveCertificationLevel(String certificationLevel) {
        if (certificationLevel == null || certificationLevel.isBlank()) {
            return Technician.CertificationLevel.LEVEL_1;
        }
        return Technician.CertificationLevel.valueOf(certificationLevel.toUpperCase());
    }

    private TechnicianDTO mapToDTO(Technician technician) {
        TechnicianDTO dto = new TechnicianDTO();
        dto.setId(technician.getId());
        dto.setLicenseNumber(technician.getLicenseNumber());
        dto.setSpecialization(technician.getSpecialization());
        dto.setCertificationLevel(technician.getCertificationLevel() != null ? technician.getCertificationLevel().name() : null);
        dto.setAvailability(technician.getAvailability());

        Employee employee = technician.getEmployee();
        if (employee != null) {
            dto.setEmployeeId(employee.getId());
            dto.setEmployeeNumber(employee.getEmployeeNumber());
            dto.setFirstName(employee.getFirstName());
            dto.setLastName(employee.getLastName());
            dto.setFullName(employee.getFullName());
            dto.setEmail(employee.getEmail());
            dto.setPhone(employee.getPhone());
            dto.setDepartment(employee.getDepartment());
            dto.setStatus(employee.getStatus() != null ? employee.getStatus().name() : null);
        }

        return dto;
    }
}
