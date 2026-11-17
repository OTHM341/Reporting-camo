package net.othmane.reportingcamo.service;

import net.othmane.reportingcamo.dto.LoginRequest;
import net.othmane.reportingcamo.dto.LoginResponse;
import net.othmane.reportingcamo.dto.RegisterRequest;
import net.othmane.reportingcamo.entity.AppUser;
import net.othmane.reportingcamo.entity.Role;
import net.othmane.reportingcamo.exception.BadRequestException;
import net.othmane.reportingcamo.repository.RoleRepository;
import net.othmane.reportingcamo.repository.UserRepository;
import net.othmane.reportingcamo.security.JwtUtils;
import net.othmane.reportingcamo.security.UserDetailsImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.*;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Auth Service Unit Tests")
class AuthServiceTest {

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private UserRepository userRepository;

    @Mock
    private RoleRepository roleRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtils jwtUtils;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private AuthService authService;

    private RegisterRequest registerRequest;
    private LoginRequest loginRequest;
    private Role technicianRole;
    private AppUser appUser;
    private UserDetailsImpl userDetails;

    @BeforeEach
    void setUp() {

        registerRequest = new RegisterRequest();
        registerRequest.setUsername("testuser");
        registerRequest.setEmail("test@test.com");
        registerRequest.setPassword("Password@123");
        registerRequest.setFirstName("Test");
        registerRequest.setLastName("User");

        loginRequest = new LoginRequest();
        loginRequest.setUsername("testuser");
        loginRequest.setPassword("Password@123");

        technicianRole = Role.builder()
                .id(1)
                .name("TECHNICIAN")
                .build();

        appUser = AppUser.builder()
                .id(1)
                .username("testuser")
                .email("test@test.com")
                .password("encodedPassword")
                .firstName("Test")
                .lastName("User")
                .roles(Set.of(technicianRole))
                .build();

        userDetails = UserDetailsImpl.build(appUser);
    }

    @Test
    @DisplayName("Should register user successfully")
    void register_shouldRegisterSuccessfully() {

        when(userRepository.existsByUsername(anyString()))
                .thenReturn(false);

        when(userRepository.existsByEmail(anyString()))
                .thenReturn(false);

        when(passwordEncoder.encode(anyString()))
                .thenReturn("encodedPassword");

        when(roleRepository.findByName("TECHNICIAN"))
                .thenReturn(Optional.of(technicianRole));

        when(userRepository.save(any(AppUser.class)))
                .thenReturn(appUser);

        assertThatCode(() -> authService.register(registerRequest))
                .doesNotThrowAnyException();

        verify(userRepository).existsByUsername("testuser");
        verify(userRepository).existsByEmail("test@test.com");
        verify(passwordEncoder).encode("Password@123");
        verify(roleRepository).findByName("TECHNICIAN");
        verify(userRepository).save(any(AppUser.class));
    }

    @Test
    @DisplayName("Should throw exception when username already exists")
    void register_shouldThrowException_whenUsernameExists() {

        when(userRepository.existsByUsername(anyString()))
                .thenReturn(true);

        BadRequestException exception =
                assertThrows(
                        BadRequestException.class,
                        () -> authService.register(registerRequest)
                );

        assertThat(exception.getMessage())
                .isEqualTo("Username is already taken");

        verify(userRepository).existsByUsername("testuser");
        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should throw exception when email already exists")
    void register_shouldThrowException_whenEmailExists() {

        when(userRepository.existsByUsername(anyString()))
                .thenReturn(false);

        when(userRepository.existsByEmail(anyString()))
                .thenReturn(true);

        BadRequestException exception =
                assertThrows(
                        BadRequestException.class,
                        () -> authService.register(registerRequest)
                );

        assertThat(exception.getMessage())
                .isEqualTo("Email is already in use");

        verify(userRepository).existsByUsername(anyString());
        verify(userRepository).existsByEmail(anyString());
        verify(userRepository, never()).save(any());
    }    @Test
    @DisplayName("Should authenticate successfully")
    void authenticate_shouldReturnLoginResponse() {

        when(userRepository.findByUsername("testuser"))
                .thenReturn(Optional.of(appUser));

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(authentication);

        when(authentication.getPrincipal())
                .thenReturn(userDetails);

        when(jwtUtils.generateJwtToken(authentication))
                .thenReturn("mocked-jwt-token");

        LoginResponse response = authService.authenticate(loginRequest);

        assertThat(response).isNotNull();
        assertThat(response.getToken()).isEqualTo("mocked-jwt-token");
        assertThat(response.getUsername()).isEqualTo("testuser");
        assertThat(response.getEmail()).isEqualTo("test@test.com");
        assertThat(response.getFirstName()).isEqualTo("Test");
        assertThat(response.getLastName()).isEqualTo("User");
        assertThat(response.getRoles()).contains("TECHNICIAN");

        verify(userRepository).findByUsername("testuser");
        verify(authenticationManager)
                .authenticate(any(UsernamePasswordAuthenticationToken.class));
        verify(jwtUtils).generateJwtToken(authentication);
    }

    @Test
    @DisplayName("Should throw exception when user does not exist")
    void authenticate_shouldThrowException_whenUserNotFound() {

        when(userRepository.findByUsername("unknown"))
                .thenReturn(Optional.empty());

        LoginRequest request = new LoginRequest();
        request.setUsername("unknown");
        request.setPassword("Password@123");

        BadRequestException exception =
                assertThrows(
                        BadRequestException.class,
                        () -> authService.authenticate(request)
                );

        assertThat(exception.getMessage())
                .isEqualTo("Invalid username or password");

        verify(authenticationManager, never())
                .authenticate(any());
    }

    @Test
    @DisplayName("Should create role if TECHNICIAN role does not exist")
    void register_shouldCreateDefaultRole() {

        when(userRepository.existsByUsername(anyString()))
                .thenReturn(false);

        when(userRepository.existsByEmail(anyString()))
                .thenReturn(false);

        when(passwordEncoder.encode(anyString()))
                .thenReturn("encodedPassword");

        when(roleRepository.findByName("TECHNICIAN"))
                .thenReturn(Optional.empty());

        when(roleRepository.save(any(Role.class)))
                .thenReturn(technicianRole);

        when(userRepository.save(any(AppUser.class)))
                .thenReturn(appUser);

        assertThatCode(() -> authService.register(registerRequest))
                .doesNotThrowAnyException();

        verify(roleRepository).save(any(Role.class));
        verify(userRepository).save(any(AppUser.class));
    }

    @Test
    @DisplayName("Should reject invalid role")
    void register_shouldRejectInvalidRole() {

        registerRequest.setRoles(Set.of("INVALID_ROLE"));

        when(userRepository.existsByUsername(anyString()))
                .thenReturn(false);

        when(userRepository.existsByEmail(anyString()))
                .thenReturn(false);

        when(passwordEncoder.encode(anyString()))
                .thenReturn("encodedPassword");

        BadRequestException exception =
                assertThrows(
                        BadRequestException.class,
                        () -> authService.register(registerRequest)
                );

        assertThat(exception.getMessage())
                .contains("Invalid role");

        verify(userRepository, never()).save(any());
    }
}