package com.example.odsystem.dto;

import lombok.Data;

@Data
public class ApprovalActionRequest {
    // "approve" or "reject"
    private String action;
    private String reason;
}
