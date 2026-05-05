package com.example.odsystem.service;

import com.example.odsystem.dto.*;
import com.example.odsystem.exception.BadRequestException;
import com.example.odsystem.exception.ResourceNotFoundException;
import com.example.odsystem.model.User;
import com.example.odsystem.repository.OdRequestRepository;
import com.example.odsystem.repository.UserRepository;
import com.example.odsystem.security.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final OdRequestRepository odRequestRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(UserRepository userRepository,
                       OdRequestRepository odRequestRepository,
                       PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.odRequestRepository = odRequestRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    public AuthResponse register(RegisterRequest req, MultipartFile profilePhoto) {
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new BadRequestException("User already exists");
        }

        User.Role resolvedRole;
        if ("Student".equals(req.getRole())) {
            resolvedRole = User.Role.Student;
        } else if ("Faculty".equals(req.getRole())) {
            resolvedRole = Boolean.TRUE.equals(req.getIsClassAdvisor())
                    ? User.Role.ClassAdvisor : User.Role.Mentor;
        } else {
            throw new BadRequestException("Cannot register this role");
        }

        User.UserBuilder builder = User.builder()
                .name(req.getName())
                .email(req.getEmail())
                .password(passwordEncoder.encode(req.getPassword()))
                .role(resolvedRole)
                .department(req.getDepartment());

        if (resolvedRole == User.Role.Student) {
            builder.rollNumber(req.getRollNumber()).year(req.getYear());
        } else {
            builder.staffId(req.getStaffId());
            if (resolvedRole == User.Role.ClassAdvisor) {
                builder.isClassAdvisor(true).advisorYear(req.getAdvisorYear());
            }
        }

        if (profilePhoto != null && !profilePhoto.isEmpty()) {
            builder.profilePhoto(saveFile(profilePhoto, "profiles"));
        }

        User user = userRepository.save(builder.build());
        String token = jwtUtil.generateToken(user.getId());
        return new AuthResponse(token, toUserDto(user));
    }

    public AuthResponse login(LoginRequest req) {
        User user = userRepository.findByEmail(req.getEmail())
                .orElseThrow(() -> new BadRequestException("Invalid credentials"));

        if (!passwordEncoder.matches(req.getPassword(), user.getPassword())) {
            throw new BadRequestException("Invalid credentials");
        }

        String token = jwtUtil.generateToken(user.getId());
        return new AuthResponse(token, toUserDto(user));
    }

    public User getProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (user.getRole() == User.Role.Student) {
            long approvedCount = odRequestRepository
                    .countByStudentIdAndFinalStatus(userId, com.example.odsystem.model.OdRequest.FinalStatus.Approved);
            if (user.getApprovedODCount() != (int) approvedCount) {
                user.setApprovedODCount((int) approvedCount);
                userRepository.save(user);
            }
        }
        return user;
    }

    public User updateProfile(Long userId, UpdateProfileRequest req, MultipartFile photo) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (req.getEmail() != null && !req.getEmail().equals(user.getEmail())) {
            if (userRepository.existsByEmail(req.getEmail())) {
                throw new BadRequestException("Email already in use");
            }
            user.setEmail(req.getEmail());
        }
        if (req.getName()     != null) user.setName(req.getName());
        if (req.getPassword() != null) user.setPassword(passwordEncoder.encode(req.getPassword()));
        if (photo != null && !photo.isEmpty()) user.setProfilePhoto(saveFile(photo, "profiles"));

        return userRepository.save(user);
    }

    // ── helpers ──────────────────────────────────────────────────────────────

    private String saveFile(MultipartFile file, String subDir) {
        try {
            Path dir = Paths.get("uploads", subDir);
            Files.createDirectories(dir);
            String filename = System.currentTimeMillis() + "_" + file.getOriginalFilename();
            Path dest = dir.resolve(filename);
            Files.copy(file.getInputStream(), dest, StandardCopyOption.REPLACE_EXISTING);
            return dest.toString();
        } catch (IOException e) {
            throw new RuntimeException("Failed to save file: " + e.getMessage());
        }
    }

    public AuthResponse.UserDto toUserDto(User u) {
        return new AuthResponse.UserDto(
                u.getId(), u.getName(), u.getEmail(), u.getRole(),
                u.getDepartment(), u.getRollNumber(), u.getYear(),
                u.getStaffId(), u.getIsClassAdvisor(), u.getAdvisorYear(),
                u.getProfilePhoto(), u.getApprovedODCount(),
                u.getWarningCount(), u.getIsBlocked()
        );
    }
}
