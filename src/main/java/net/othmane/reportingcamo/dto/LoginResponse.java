package net.othmane.reportingcamo.dto;

import lombok.Builder;
import lombok.Data;

import java.util.Set;

@Data
@Builder
public class LoginResponse {
    private String token;
    @Builder.Default
    private String type = "Bearer";
    private Integer id;
    private String username;
    private String email;
    private String firstName;
    private String lastName;
    private Set<String> roles;
}
