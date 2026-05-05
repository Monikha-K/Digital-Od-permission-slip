package com.example.odsystem.service;

import com.example.odsystem.exception.BadRequestException;
import com.example.odsystem.exception.ResourceNotFoundException;
import com.example.odsystem.exception.UnauthorizedException;
import com.example.odsystem.model.OdRequest;
import com.example.odsystem.model.User;
import com.example.odsystem.model.Warning;
import com.example.odsystem.repository.OdRequestRepository;
import com.example.odsystem.repository.UserRepository;
import com.example.odsystem.repository.WarningRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class AdvisorService {

    private final OdRequestRepository odRepo;
    private final UserRepository userRepo;
    private final WarningRepository warningRepo;

    public AdvisorService(OdRequestRepository odRepo,
                          UserRepository userRepo,
                          WarningRepository warningRepo) {
        this.odRepo      = odRepo;
        this.userRepo    = userRepo;
        this.warningRepo = warningRepo;
    }

    // All approved ODs where this user is the class advisor
    public List<OdRequest> getProofSubmissions(Long advisorId) {
        return odRepo.findByAdvisorIdAndFinalStatusOrderByCreatedAtDesc(
                advisorId, OdRequest.FinalStatus.Approved);
    }

    // Send a warning to a student
    public Warning warnStudent(Long advisorId, Long odRequestId, String message) {
        OdRequest request = odRepo.findById(odRequestId)
                .orElseThrow(() -> new ResourceNotFoundException("OD Request not found"));

        if (!request.getClassAdvisor().getId().equals(advisorId)) {
            throw new UnauthorizedException("Not authorized to warn this student");
        }

        User student = request.getStudent();
        if (student.getWarningCount() >= 3) {
            throw new BadRequestException("Student already has 3 warnings. Use Report instead.");
        }

        Warning warning = Warning.builder()
                .student(student)
                .advisor(request.getClassAdvisor())
                .odRequest(request)
                .type(Warning.WarningType.warn)
                .message(message != null ? message : "Please submit your proof documents.")
                .build();

        warningRepo.save(warning);

        student.setWarningCount(student.getWarningCount() + 1);
        userRepo.save(student);

        return warning;
    }

    // Report a student to admin (requires 3 prior warnings)
    public Warning reportStudent(Long advisorId, Long odRequestId, String message) {
        OdRequest request = odRepo.findById(odRequestId)
                .orElseThrow(() -> new ResourceNotFoundException("OD Request not found"));

        if (!request.getClassAdvisor().getId().equals(advisorId)) {
            throw new UnauthorizedException("Not authorized to report this student");
        }

        User student = request.getStudent();
        if (student.getWarningCount() < 3) {
            throw new BadRequestException("Student must have 3 warnings before reporting");
        }

        Warning report = Warning.builder()
                .student(student)
                .advisor(request.getClassAdvisor())
                .odRequest(request)
                .type(Warning.WarningType.report)
                .message(message != null ? message : "Reported to admin for non-compliance.")
                .build();

        return warningRepo.save(report);
    }

    // Student fetches their own warnings (marks all as read)
    public List<Warning> getMyWarnings(Long studentId) {
        List<Warning> warnings = warningRepo.findByStudentIdOrderByCreatedAtDesc(studentId);
        warnings.forEach(w -> {
            if (!w.getIsRead()) {
                w.setIsRead(true);
                warningRepo.save(w);
            }
        });
        return warnings;
    }

    // Proof submission status helper
    public String getProofStatus(OdRequest req) {
        if (req.getDocuments() != null && req.getDocuments().getGeoTagPhotoPath() != null) {
            return "submitted";
        }
        LocalDate today = LocalDate.now();
        LocalDate end   = req.getToDate();
        if (!end.isBefore(today)) {
            long daysLeft = today.until(end).getDays();
            return "timeleft:" + daysLeft;
        }
        long daysPast = end.until(today).getDays();
        return daysPast > 30 ? "overdue" : "notsubmitted";
    }
}
