package com.example.odsystem.controller;

import com.example.odsystem.dto.DashboardStatsResponse;
import com.example.odsystem.model.User;
import com.example.odsystem.model.Warning;
import com.example.odsystem.service.AdminService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService service;

    public AdminController(AdminService service) {
        this.service = service;
    }

    /**
     * GET /api/admin/users?role=Student&department=CSE
     */
    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers(
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String department) {
        return ResponseEntity.ok(service.getAllUsers(role, department));
    }

    /**
     * DELETE /api/admin/users/{id}
     */
    @DeleteMapping("/users/{id}")
    public ResponseEntity<Map<String, String>> deleteUser(@PathVariable Long id) {
        service.deleteUser(id);
        return ResponseEntity.ok(Map.of("message", "User deleted successfully"));
    }

    /**
     * PUT /api/admin/users/{id}/block
     */
    @PutMapping("/users/{id}/block")
    public ResponseEntity<User> blockUser(@PathVariable Long id) {
        return ResponseEntity.ok(service.blockUser(id));
    }

    /**
     * PUT /api/admin/users/{id}/unblock
     */
    @PutMapping("/users/{id}/unblock")
    public ResponseEntity<User> unblockUser(@PathVariable Long id) {
        return ResponseEntity.ok(service.unblockUser(id));
    }

    /**
     * GET /api/admin/reports
     * Returns all student reports submitted by advisors
     */
    @GetMapping("/reports")
    public ResponseEntity<List<Warning>> getReports() {
        return ResponseEntity.ok(service.getReports());
    }

    /**
     * GET /api/admin/stats
     */
    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsResponse> getStats() {
        return ResponseEntity.ok(service.getDashboardStats());
    }

    /**
     * GET /api/admin/mentors/{department}
     * Returns all Mentors and ClassAdvisors in a department
     */
    @GetMapping("/mentors/{department}")
    public ResponseEntity<List<User>> getMentors(@PathVariable String department) {
        return ResponseEntity.ok(service.getMentorsByDepartment(department));
    }

    /**
     * GET /api/admin/advisors/{department}/{year}
     * Returns ClassAdvisors for a specific department and year
     */
    @GetMapping("/advisors/{department}/{year}")
    public ResponseEntity<List<User>> getAdvisors(
            @PathVariable String department,
            @PathVariable Integer year) {
        return ResponseEntity.ok(service.getAdvisorsByDepartmentAndYear(department, year));
    }
}
