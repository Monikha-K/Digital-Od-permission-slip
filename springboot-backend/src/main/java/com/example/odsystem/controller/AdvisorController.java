package com.example.odsystem.controller;

import com.example.odsystem.dto.WarningRequest;
import com.example.odsystem.model.OdRequest;
import com.example.odsystem.model.User;
import com.example.odsystem.model.Warning;
import com.example.odsystem.service.AdvisorService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/advisor")
public class AdvisorController {

    private final AdvisorService service;

    public AdvisorController(AdvisorService service) {
        this.service = service;
    }

    /**
     * GET /api/advisor/proof-submissions
     * ClassAdvisor views all approved ODs assigned to them,
     * with proof submission status for each
     */
    @GetMapping("/proof-submissions")
    public ResponseEntity<List<OdRequest>> getProofSubmissions(
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(service.getProofSubmissions(user.getId()));
    }

    /**
     * POST /api/advisor/warn/{odRequestId}
     * ClassAdvisor sends a warning to a student (max 3)
     */
    @PostMapping("/warn/{odRequestId}")
    public ResponseEntity<Map<String, Object>> warnStudent(
            @AuthenticationPrincipal User user,
            @PathVariable Long odRequestId,
            @RequestBody WarningRequest req) {
        Warning warning = service.warnStudent(user.getId(), odRequestId, req.getMessage());
        return ResponseEntity.ok(Map.of(
                "message", "Warning sent",
                "warningCount", warning.getStudent().getWarningCount()
        ));
    }

    /**
     * POST /api/advisor/report/{odRequestId}
     * ClassAdvisor reports a student to admin (requires 3 prior warnings)
     */
    @PostMapping("/report/{odRequestId}")
    public ResponseEntity<Map<String, String>> reportStudent(
            @AuthenticationPrincipal User user,
            @PathVariable Long odRequestId,
            @RequestBody WarningRequest req) {
        service.reportStudent(user.getId(), odRequestId, req.getMessage());
        return ResponseEntity.ok(Map.of("message", "Report submitted to admin"));
    }

    /**
     * GET /api/advisor/my-warnings
     * Student fetches their own warnings and reports (marks all as read)
     */
    @GetMapping("/my-warnings")
    public ResponseEntity<List<Warning>> getMyWarnings(
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(service.getMyWarnings(user.getId()));
    }
}
