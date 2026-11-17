package net.othmane.reportingcamo.repository;

import net.othmane.reportingcamo.entity.Aircraft;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AircraftRepository extends JpaRepository<Aircraft, Integer> {

    Optional<Aircraft> findByRegistration(String registration);

    boolean existsByRegistration(String registration);

    List<Aircraft> findByStatus(Aircraft.AircraftStatus status);

    @Query("SELECT a FROM Aircraft a WHERE a.status = 'ACTIVE' AND a.nextMaintenanceDue <= CURRENT_DATE")
    List<Aircraft> findAircraftDueForMaintenance();

    @Query("SELECT COUNT(a) FROM Aircraft a WHERE a.status = 'ACTIVE'")
    long countActiveAircraft();

    @Query("SELECT COUNT(a) FROM Aircraft a WHERE a.status = 'MAINTENANCE'")
    long countAircraftInMaintenance();
}