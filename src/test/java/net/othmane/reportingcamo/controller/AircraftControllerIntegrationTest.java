package net.othmane.reportingcamo.controller;

import net.othmane.reportingcamo.entity.Aircraft;
import net.othmane.reportingcamo.repository.AircraftRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.test.context.support.WithMockUser;

import java.math.BigDecimal;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class AircraftControllerIntegrationTest {

    private static final String CONTEXT_PATH = "/api";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private AircraftRepository aircraftRepository;

    private Aircraft testAircraft;

    private MockHttpServletRequestBuilder apiRequest(
            MockHttpServletRequestBuilder request) {
        return request.contextPath(CONTEXT_PATH);
    }

    @BeforeEach
    void setUp() {
        aircraftRepository.deleteAll();

        testAircraft = new Aircraft();
        testAircraft.setRegistration("CN-TEST");
        testAircraft.setType("Boeing 737");
        testAircraft.setModel("737-800");
        testAircraft.setStatus(Aircraft.AircraftStatus.ACTIVE);
        testAircraft.setTotalFlightHours(BigDecimal.ZERO);

        testAircraft = aircraftRepository.save(testAircraft);
    }

    @Test
    @DisplayName("Should return all aircraft for admin")
    @WithMockUser(username = "admin", roles = "ADMIN")
    void getAllAircraft_shouldReturnAircraftList() throws Exception {

        mockMvc.perform(apiRequest(get("/api/aircraft"))
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].registration").value("CN-TEST"));
    }

    @Test
    @DisplayName("Should create aircraft for admin")
    @WithMockUser(username = "admin", roles = "ADMIN")
    void createAircraft_shouldReturnCreatedAircraft() throws Exception {

        String aircraftJson = """
                {
                    "registration": "CN-NEW",
                    "type": "Boeing 737",
                    "model": "737-800",
                    "status": "ACTIVE",
                    "totalFlightHours": 0
                }
                """;

        mockMvc.perform(apiRequest(post("/api/aircraft"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(aircraftJson))
                .andExpect(status().isCreated());
    }

    @Test
    @DisplayName("Should deny aircraft creation for technician")
    @WithMockUser(username = "technician", roles = "TECHNICIAN")
    void createAircraft_shouldReturnForbidden_forTechnician() throws Exception {

        String aircraftJson = """
                {
                    "registration": "CN-NEW",
                    "type": "Boeing 737",
                    "model": "737-800",
                    "status": "ACTIVE",
                    "totalFlightHours": 0
                }
                """;

        mockMvc.perform(apiRequest(post("/api/aircraft"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(aircraftJson))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Should return 404 when aircraft does not exist")
    @WithMockUser(username = "admin", roles = "ADMIN")
    void getAircraftById_shouldReturnNotFound() throws Exception {

        mockMvc.perform(apiRequest(get("/api/aircraft/999"))
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());
    }
}