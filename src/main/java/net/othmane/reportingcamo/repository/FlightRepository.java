package net.othmane.reportingcamo.repository;

import net.othmane.reportingcamo.entity.Flight;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface FlightRepository extends JpaRepository<Flight, Integer> {

    List<Flight> findByStatus(Flight.FlightStatus status);

    List<Flight> findByAircraftId(Integer aircraftId);

    Optional<Flight> findByFlightNumber(String flightNumber);

    @Query("SELECT f FROM Flight f WHERE f.scheduledDeparture BETWEEN :start AND :end")
    List<Flight> findFlightsByDateRange(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT COUNT(f) FROM Flight f WHERE f.status = 'SCHEDULED' OR f.status = 'DEPARTED'")
    long countActiveFlights();

    @Query("SELECT COUNT(f) FROM Flight f WHERE f.status = 'DELAYED'")
    long countDelayedFlights();

    @Query("SELECT COUNT(f) FROM Flight f WHERE f.status = 'CANCELLED'")
    long countCancelledFlights();

    @Query("SELECT COALESCE(AVG(f.delayMinutes), 0) FROM Flight f WHERE f.actualDeparture IS NOT NULL")
    double calculateAverageDelay();

    @Query("SELECT COUNT(f) FROM Flight f WHERE f.status = 'ARRIVED' AND f.delayMinutes = 0")
    long countOnTimeFlights();

    @Query("SELECT COUNT(f) FROM Flight f WHERE f.status = 'ARRIVED'")
    long countArrivedFlights();
}