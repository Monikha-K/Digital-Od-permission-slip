package com.example.odsystem.controller;

import com.example.odsystem.dto.*;
import com.example.odsystem.model.User;
import com.example.odsystem.service.AuthService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /**
     * POST /api/auth/register
     * Multipart: fields + optional profilePhoto file
     */
    @PostMapping(value = "/register", consumes = "multipart/form-data")
    public ResponseEntity<AuthResponse> register(
            @RequestPart("data") RegisterRequest req,
            @RequestPart(value = "profilePhoto", required = false) MultipartFile profilePhoto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(authService.register(req, profilePhoto));
    }

    /**
     * POST /api/auth/login
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest req) {
        return ResponseEntity.ok(authService.login(req));
    }

    /**
     * GET /api/auth/profile
     */
    @GetMapping("/profile")
    public ResponseEntity<User> getProfile(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(authService.getProfile(user.getId()));
    }

    /**
     * PUT /api/auth/profile
     * Multipart: optional fields + optional profilePhoto file
     */
    @PutMapping(value = "/profile", consumes = "multipart/form-data")
    public ResponseEntity<User> updateProfile(
            @AuthenticationPrincipal User user,
            @RequestPart(value = "data", required = false) UpdateProfileRequest req,
            @RequestPart(value = "profilePhoto", required = false) MultipartFile photo) {
        UpdateProfileRequest safeReq = req != null ? req : new UpdateProfileRequest();
        return ResponseEntity.ok(authService.updateProfile(user.getId(), safeReq, photo));
    }
}
