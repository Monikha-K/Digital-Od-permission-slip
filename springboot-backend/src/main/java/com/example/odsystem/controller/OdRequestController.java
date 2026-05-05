package com.example.odsystem.controller;

import com.example.odsystem.dto.ApprovalActionRequest;
import com.example.odsystem.model.OdRequest;
import com.example.odsystem.model.User;
import com.example.odsystem.service.OdRequestService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/od")
public class OdRequestController {

    private final OdRequestService service;

    public OdRequestController(OdRequestService service) {
        this.service = service;
    }

    /**
     * POST /api/od
     * Student creates a new OD request (multipart with documents)
     */
    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<OdRequest> create(
            @AuthenticationPrincipal User user,
            @RequestParam String eventName,
            @RequestParam String collegeName,
            @RequestParam String department,
            @RequestParam Integer year,
            @RequestParam String fromDate,
            @RequestParam(required = false) String toDate,
            @RequestParam Long mentorId,
            @RequestParam Long classAdvisorId,
            @RequestParam String description,
            @RequestPart(value = "registrationForm", required = false) MultipartFile regForm,
            @RequestPart(value = "paymentProof",     required = false) MultipartFile paymentProof,
            @RequestPart(value = "eventPoster",      required = false) MultipartFile poster) {

        OdRequest created = service.createRequest(
                user.getId(), eventName, collegeName, department, year,
                fromDate, toDate, mentorId, classAdvisorId, description,
                regForm, paymentProof, poster);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * GET /api/od/my-requests
     * Student fetches their own OD requests
     */
    @GetMapping("/my-requests")
    public ResponseEntity<List<OdRequest>> getMyRequests(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(service.getMyRequests(user.getId()));
    }

    /**
     * GET /api/od/faculty-requests?as=mentor|advisor
     * Faculty fetches all OD requests assigned to them
     * ClassAdvisor can filter by ?as=mentor or ?as=advisor
     */
    @GetMapping("/faculty-requests")
    public ResponseEntity<List<OdRequest>> getFacultyRequests(
            @AuthenticationPrincipal User user,
            @RequestParam(required = false) String as) {
        return ResponseEntity.ok(service.getFacultyRequests(user, as));
    }

    /**
     * PUT /api/od/{id}/action
     * Faculty approves or rejects an OD request
     */
    @PutMapping("/{id}/action")
    public ResponseEntity<OdRequest> approveOrReject(
            @AuthenticationPrincipal User user,
            @PathVariable Long id,
            @RequestBody ApprovalActionRequest req) {
        return ResponseEntity.ok(
                service.approveOrReject(id, user, req.getAction(), req.getReason()));
    }

    /**
     * PUT /api/od/{id}/proof
     * Student uploads proof documents after OD completion
     */
    @PutMapping(value = "/{id}/proof", consumes = "multipart/form-data")
    public ResponseEntity<OdRequest> uploadProof(
            @AuthenticationPrincipal User user,
            @PathVariable Long id,
            @RequestPart("geoTaggedPhoto") MultipartFile geoPhoto,
            @RequestPart("certificate")    MultipartFile certificate) {
        return ResponseEntity.ok(service.uploadProof(id, user.getId(), geoPhoto, certificate));
    }

    /**
     * GET /api/od/all?department=CSE&status=Pending
     * Admin fetches all OD requests with optional filters
     */
    @GetMapping("/all")
    public ResponseEntity<List<OdRequest>> getAllRequests(
            @RequestParam(required = false) String department,
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(service.getAllRequests(department, status));
    }
}
