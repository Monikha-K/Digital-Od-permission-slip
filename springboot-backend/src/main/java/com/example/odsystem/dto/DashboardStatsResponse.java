package com.example.odsystem.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
@AllArgsConstructor
public class DashboardStatsResponse {
    private long totalStudents;
    private long totalFaculty;
    private long totalRequests;
    private long approvedRequests;
    private long pendingRequests;
    private long rejectedRequests;
    private List<Map<String, Object>> requestsByDepartment;
}
