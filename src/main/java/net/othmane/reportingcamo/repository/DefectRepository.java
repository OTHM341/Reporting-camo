package net.othmane.reportingcamo.repository;

import net.othmane.reportingcamo.entity.Defect;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DefectRepository extends JpaRepository<Defect, Integer> {

    List<Defect> findByAircraftId(Integer aircraftId);

    List<Defect> findByStatus(Defect.DefectStatus status);

    List<Defect> findBySeverity(Defect.DefectSeverity severity);

    @Query("SELECT COUNT(d) FROM Defect d WHERE d.status = 'OPEN' OR d.status = 'IN_PROGRESS'")
    long countOpenDefects();

    @Query("SELECT COUNT(d) FROM Defect d WHERE d.severity = 'CRITICAL' AND (d.status = 'OPEN' OR d.status = 'IN_PROGRESS')")
    long countCriticalDefects();
}
