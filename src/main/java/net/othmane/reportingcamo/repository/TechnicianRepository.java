package net.othmane.reportingcamo.repository;

import net.othmane.reportingcamo.entity.Technician;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TechnicianRepository extends JpaRepository<Technician, Integer> {

    Optional<Technician> findByEmployeeId(Integer employeeId);

    List<Technician> findByAvailabilityTrue();

    List<Technician> findBySpecialization(String specialization);

    @Query("SELECT COUNT(t) FROM Technician t WHERE t.availability = true")
    long countAvailableTechnicians();
}
