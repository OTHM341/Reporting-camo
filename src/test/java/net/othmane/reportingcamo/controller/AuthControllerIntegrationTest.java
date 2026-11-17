package net.othmane.reportingcamo.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import net.othmane.reportingcamo.dto.LoginRequest;
import net.othmane.reportingcamo.dto.RegisterRequest;
import net.othmane.reportingcamo.entity.Role;
import net.othmane.reportingcamo.repository.RoleRepository;
import net.othmane.reportingcamo.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
@DisplayName("Auth Controller Integration Tests")
class AuthControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @BeforeEach
    void setUp() {

        userRepository.deleteAll();

        if (!roleRepository.existsByName("TECHNICIAN")) {

            roleRepository.save(
                    Role.builder()
                            .name("TECHNICIAN")
                            .build()
            );
        }
    }

    @Test
    @DisplayName("POST /auth/register - should register user")
    void register_shouldReturn200() throws Exception {

        RegisterRequest request = new RegisterRequest();

        request.setUsername("newuser");
        request.setEmail("newuser@test.com");
        request.setPassword("Password@123");
        request.setFirstName("New");
        request.setLastName("User");

        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message")
                        .value("User registered successfully"));
    }

    @Test
    @DisplayName("POST /auth/login - should authenticate user")
    void login_shouldReturnToken() throws Exception {

        RegisterRequest register = new RegisterRequest();

        register.setUsername("loginuser");
        register.setEmail("login@test.com");
        register.setPassword("Password@123");
        register.setFirstName("Login");
        register.setLastName("User");

        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(register)))
                .andExpect(status().isOk());
        LoginRequest login = new LoginRequest();

        login.setUsername("loginuser");
        login.setPassword("Password@123");

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(login)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists())
                .andExpect(jsonPath("$.username").value("loginuser"))
                .andExpect(jsonPath("$.email").value("login@test.com"))
                .andExpect(jsonPath("$.roles").isArray());
    }

    @Test
    @DisplayName("POST /auth/login - should return 400 when credentials are invalid")
    void login_shouldReturn400_whenCredentialsInvalid() throws Exception {

        LoginRequest login = new LoginRequest();

        login.setUsername("wronguser");
        login.setPassword("WrongPassword@123");

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(login)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("POST /auth/register - should return 400 when username already exists")
    void register_shouldReturn400_whenUsernameExists() throws Exception {

        RegisterRequest request = new RegisterRequest();

        request.setUsername("duplicate");
        request.setEmail("duplicate@test.com");
        request.setPassword("Password@123");
        request.setFirstName("Duplicate");
        request.setLastName("User");

        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());

        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message")
                        .value("Username is already taken"));
    }

    @Test
    @DisplayName("POST /auth/register - should return 400 when email already exists")
    void register_shouldReturn400_whenEmailExists() throws Exception {

        RegisterRequest request1 = new RegisterRequest();

        request1.setUsername("user1");
        request1.setEmail("same@test.com");
        request1.setPassword("Password@123");
        request1.setFirstName("User");
        request1.setLastName("One");

        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request1)))
                .andExpect(status().isOk());

        RegisterRequest request2 = new RegisterRequest();

        request2.setUsername("user2");
        request2.setEmail("same@test.com");
        request2.setPassword("Password@123");
        request2.setFirstName("User");
        request2.setLastName("Two");

        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request2)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message")
                        .value("Email is already in use"));
    }
}