package com.example.odsystem.dto;

import lombok.Data;

@Data
public class OdRequestDto {
    private String eventName;
    private String collegeName;
    private String department;
    private Integer year;
    private String fromDate;   // ISO date string: yyyy-MM-dd
    private String toDate;     // ISO date string: yyyy-MM-dd
    private Long mentorId;
    private Long classAdvisorId;
    private String description;
    private Integer days;
    // Files (registrationForm, paymentProof, eventPoster) handled as MultipartFile in controller
}
