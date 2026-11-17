package net.othmane.reportingcamo.repository;

import net.othmane.reportingcamo.entity.WorkPackage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WorkPackageRepository extends JpaRepository<WorkPackage, Integer> {

    List<WorkPackage> findByMaintenanceId(Integer maintenanceId);

    List<WorkPackage> findByStatus(WorkPackage.PackageStatus status);
}
