package net.othmane.reportingcamo.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    @Transactional
    public LoginResponse authenticate(LoginRequest request) {
        log.info("Authentication attempt for username: {}", request.getUsername());

        try {
            // Check if user exists
            AppUser user = userRepository.findByUsername(request.getUsername())
                    .orElseThrow(() -> {
                        log.error("User not found: {}", request.getUsername());
                        return new BadRequestException("Invalid username or password");
                    });

            log.debug("User found: {}, Active: {}", user.getUsername(), user.getActive());

            // Authenticate
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = jwtUtils.generateJwtToken(authentication);

            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

            log.info("Authentication successful for user: {}", userDetails.getUsername());

            return LoginResponse.builder()
                    .token(jwt)
                    .id(userDetails.getId())
                    .username(userDetails.getUsername())
                    .email(userDetails.getEmail())
                    .firstName(userDetails.getFirstName())
                    .lastName(userDetails.getLastName())
                    .roles(userDetails.getAuthorities().stream()
                            .map(auth -> auth.getAuthority().replace("ROLE_", ""))
                            .collect(Collectors.toSet()))
                    .build();
        } catch (Exception e) {
            log.error("Authentication failed for username: {}. Error: {}", request.getUsername(), e.getMessage());
            throw e;
        }
    }

    @Transactional
    public void register(RegisterRequest request) {
        log.info("Registration attempt for username: {}, email: {}", request.getUsername(), request.getEmail());

        if (userRepository.existsByUsername(request.getUsername())) {
            log.warn("Registration failed: Username already exists: {}", request.getUsername());
            throw new BadRequestException("Username is already taken");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            log.warn("Registration failed: Email already exists: {}", request.getEmail());
            throw new BadRequestException("Email is already in use");
        }

        String encodedPassword = passwordEncoder.encode(request.getPassword());
        log.debug("Password encoded successfully for user: {}", request.getUsername());

        AppUser user = AppUser.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(encodedPassword)
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .build();

        Set<String> validRoleNames = Set.of("ADMIN", "MANAGER", "TECHNICIAN");
        Set<Role> roles = new HashSet<>();

        if (request.getRoles() != null && !request.getRoles().isEmpty()) {
            for (String roleName : request.getRoles()) {
                String normalizedRoleName = normalizeRoleName(roleName);

                if (!validRoleNames.contains(normalizedRoleName)) {
                    log.warn("Invalid role '{}' rejected for user: {}", roleName, request.getUsername());
                    throw new BadRequestException("Invalid role: " + roleName);
                }

                roles.add(getOrCreateRole(normalizedRoleName));
            }
        }

        if (roles.isEmpty()) {
            roles.add(getOrCreateRole("TECHNICIAN"));
            log.debug("Assigned default role TECHNICIAN to user: {}", request.getUsername());
        } else {
            log.debug("Assigned roles {} to user: {}",
                    roles.stream().map(Role::getName).collect(Collectors.toSet()),
                    request.getUsername());
        }

        user.setRoles(roles);
        AppUser savedUser = userRepository.save(user);
        log.info("User registered successfully: {} with ID: {}", savedUser.getUsername(), savedUser.getId());
    }

    private Role getOrCreateRole(String roleName) {
        return roleRepository.findByName(roleName)
                .orElseGet(() -> roleRepository.save(Role.builder().name(roleName).build()));
    }

    private String normalizeRoleName(String roleName) {
        if (roleName == null) {
            return "";
        }

        return roleName.trim()
                .replaceFirst("(?i)^ROLE_", "")
                .toUpperCase(Locale.ROOT);
    }
}
