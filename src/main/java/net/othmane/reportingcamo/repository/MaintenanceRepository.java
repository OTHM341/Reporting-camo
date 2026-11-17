package net.othmane.reportingcamo.repository;

import net.othmane.reportingcamo.entity.Maintenance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MaintenanceRepository extends JpaRepository<Maintenance, Integer> {

    List<Maintenance> findByAircraftId(Integer aircraftId);

    List<Maintenance> findByStatus(Maintenance.MaintenanceStatus status);

    @Query("SELECT COUNT(m) FROM Maintenance m WHERE m.status = 'COMPLETED'")
    long countCompletedMaintenance();

    @Query("SELECT COUNT(m) FROM Maintenance m")
    long countTotalMaintenance();
}
