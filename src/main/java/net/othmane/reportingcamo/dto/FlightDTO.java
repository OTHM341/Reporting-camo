package net.othmane.reportingcamo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class FlightDTO {

    private Integer id;

    @NotBlank(message = "Flight number is required")
    private String flightNumber;

    @NotNull(message = "Aircraft ID is required")
    private Integer aircraftId;
    private String aircraftRegistration;

    @NotBlank(message = "Origin is required")
    private String origin;

    @NotBlank(message = "Destination is required")
    private String destination;

    @NotNull(message = "Scheduled departure is required")
    private LocalDateTime scheduledDeparture;

    @NotNull(message = "Scheduled arrival is required")
    private LocalDateTime scheduledArrival;

    private LocalDateTime actualDeparture;
    private LocalDateTime actualArrival;
    private String status;
    private String gate;
    private Integer delayMinutes;
    private boolean delayed;
    private boolean onTime;
}
