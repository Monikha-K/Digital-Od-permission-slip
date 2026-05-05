package com.example.odsystem.dto;

import com.example.odsystem.model.User;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private UserDto user;

    @Data
    @AllArgsConstructor
    public static class UserDto {
        private Long id;
        private String name;
        private String email;
        private User.Role role;
        private String department;
        private String rollNumber;
        private Integer year;
        private String staffId;
        private Boolean isClassAdvisor;
        private Integer advisorYear;
        private String profilePhoto;
        private Integer approvedODCount;
        private Integer warningCount;
        private Boolean isBlocked;
    }
}
