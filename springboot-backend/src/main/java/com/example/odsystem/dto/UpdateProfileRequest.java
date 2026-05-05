package com.example.odsystem.dto;

import lombok.Data;

@Data
public class UpdateProfileRequest {
    private String name;
    private String email;
    private String password;
    // profilePhoto handled as MultipartFile in controller
}
