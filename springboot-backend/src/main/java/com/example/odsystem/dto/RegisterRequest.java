package com.example.odsystem.dto;

import lombok.Data;

@Data
public class RegisterRequest {
    private String name;
    private String email;
    private String password;
    // "Student" or "Faculty"
    private String role;
    private String department;

    // Student fields
    private String rollNumber;
    private Integer year;

    // Faculty fields
    private String staffId;
    private Boolean isClassAdvisor;
    private Integer advisorYear;
}
