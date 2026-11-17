package net.othmane.reportingcamo.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Slf4j
@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 10)
public class ApiFailureLoggingFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        long startedAt = System.currentTimeMillis();

        try {
            filterChain.doFilter(request, response);
        } catch (ServletException | IOException | RuntimeException ex) {
            log.error("API request failed before response method={} uri={} query={} user={} remote={} origin={} durationMs={} error={}",
                    request.getMethod(),
                    request.getRequestURI(),
                    request.getQueryString(),
                    currentUser(request),
                    request.getRemoteAddr(),
                    request.getHeader("Origin"),
                    System.currentTimeMillis() - startedAt,
                    ex.getMessage(),
                    ex);
            throw ex;
        } finally {
            if (response.getStatus() >= 400) {
                log.warn("API request rejected/failed method={} uri={} query={} status={} user={} remote={} origin={} durationMs={}",
                        request.getMethod(),
                        request.getRequestURI(),
                        request.getQueryString(),
                        response.getStatus(),
                        currentUser(request),
                        request.getRemoteAddr(),
                        request.getHeader("Origin"),
                        System.currentTimeMillis() - startedAt);
            }
        }
    }

    private String currentUser(HttpServletRequest request) {
        Object authenticatedUsername = request.getAttribute("authenticatedUsername");
        if (authenticatedUsername instanceof String username && !username.isBlank()) {
            return username;
        }

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            return "anonymous";
        }

        String username = authentication.getName();
        return username != null ? username : "anonymous";
    }
}
