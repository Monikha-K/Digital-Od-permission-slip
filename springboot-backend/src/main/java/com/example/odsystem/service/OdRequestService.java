package com.example.odsystem.service;

import com.example.odsystem.exception.BadRequestException;
import com.example.odsystem.exception.ResourceNotFoundException;
import com.example.odsystem.exception.UnauthorizedException;
import com.example.odsystem.model.*;
import com.example.odsystem.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class OdRequestService {

    private static final List<Approval.ApprovalRole> FLOW = List.of(
            Approval.ApprovalRole.mentor,
            Approval.ApprovalRole.classAdvisor,
            Approval.ApprovalRole.innovationHead,
            Approval.ApprovalRole.hod,
            Approval.ApprovalRole.cfi
    );

    private final OdRequestRepository odRepo;
    private final UserRepository userRepo;
    private final DepartmentRepository deptRepo;
    private final DocumentRepository docRepo;
    private final ApprovalRepository approvalRepo;

    public OdRequestService(OdRequestRepository odRepo, UserRepository userRepo,
                            DepartmentRepository deptRepo, DocumentRepository docRepo,
                            ApprovalRepository approvalRepo) {
        this.odRepo      = odRepo;
        this.userRepo    = userRepo;
        this.deptRepo    = deptRepo;
        this.docRepo     = docRepo;
        this.approvalRepo = approvalRepo;
    }

    // ── Create OD Request ─────────────────────────────────────────────────────
    public OdRequest createRequest(Long studentId,
                                   String eventName, String collegeName,
                                   String department, Integer year,
                                   String fromDate, String toDate,
                                   Long mentorId, Long advisorId,
                                   String description,
                                   MultipartFile regForm,
                                   MultipartFile paymentProof,
                                   MultipartFile poster) {

        User student = userRepo.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        if (Boolean.TRUE.equals(student.getIsBlocked())) {
            throw new UnauthorizedException(
                    "You are blocked from applying for OD. Please contact your Class Advisor or Admin.");
        }
        if (student.getApprovedODCount() >= 10) {
            throw new BadRequestException("Maximum OD limit of 10 reached");
        }

        Department dept = deptRepo.findByName(department)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found: " + department));

        User mentor  = userRepo.findById(mentorId)
                .orElseThrow(() -> new ResourceNotFoundException("Mentor not found"));
        User advisor = userRepo.findById(advisorId)
                .orElseThrow(() -> new ResourceNotFoundException("Class Advisor not found"));

        LocalDate from = LocalDate.parse(fromDate);
        LocalDate to   = (toDate != null && !toDate.isBlank()) ? LocalDate.parse(toDate) : from;

        OdRequest request = OdRequest.builder()
                .student(student)
                .mentor(mentor)
                .classAdvisor(advisor)
                .innovationHead(dept.getInnovationHead())
                .hod(dept.getHod())
                .cfi(dept.getCfi())
                .department(department)
                .year(year)
                .eventName(eventName)
                .collegeName(collegeName)
                .fromDate(from)
                .toDate(to)
                .description(description)
                .build();

        odRepo.save(request);

        // Create document record
        Document doc = Document.builder()
                .odRequest(request)
                .registrationFormPath(saveFile(regForm,     "documents"))
                .paymentProofPath(saveFile(paymentProof,    "documents"))
                .posterPath(saveFile(poster,                "documents"))
                .build();
        docRepo.save(doc);

        // Create approval steps for all 5 roles
        for (Approval.ApprovalRole role : FLOW) {
            approvalRepo.save(Approval.builder()
                    .odRequest(request)
                    .role(role)
                    .status(Approval.ApprovalStatus.Pending)
                    .build());
        }

        return odRepo.findById(request.getId()).orElseThrow();
    }

    // ── Student: my requests ──────────────────────────────────────────────────
    public List<OdRequest> getMyRequests(Long studentId) {
        return odRepo.findByStudentIdOrderByCreatedAtDesc(studentId);
    }

    // ── Faculty: all requests assigned to them ────────────────────────────────
    public List<OdRequest> getFacultyRequests(User faculty, String as) {
        Long id = faculty.getId();
        return switch (faculty.getRole()) {
            case Mentor         -> odRepo.findByMentorIdOrderByCreatedAtDesc(id);
            case InnovationHead -> odRepo.findByInnovationHeadIdOrderByCreatedAtDesc(id);
            case HOD            -> odRepo.findByHodIdOrderByCreatedAtDesc(id);
            case CFI            -> odRepo.findByCfiIdOrderByCreatedAtDesc(id);
            case ClassAdvisor   -> {
                if ("mentor".equals(as))  yield odRepo.findByMentorIdOrderByCreatedAtDesc(id);
                if ("advisor".equals(as)) yield odRepo.findByClassAdvisorIdOrderByCreatedAtDesc(id);
                yield odRepo.findByMentorOrAdvisor(id);
            }
            default -> throw new UnauthorizedException("Invalid role");
        };
    }

    // ── Approve / Reject ──────────────────────────────────────────────────────
    public OdRequest approveOrReject(Long requestId, User faculty, String action, String reason) {
        OdRequest request = odRepo.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("OD Request not found"));

        if (request.getFinalStatus() != OdRequest.FinalStatus.Pending) {
            throw new BadRequestException("Request already " + request.getFinalStatus().name().toLowerCase());
        }

        Approval.ApprovalRole approvalRole = resolveApprovalRole(faculty, request);
        int myIndex = FLOW.indexOf(approvalRole);

        // Sequential check only for approvals
        if ("approve".equals(action)) {
            for (int i = 0; i < myIndex; i++) {
                Approval prev = approvalRepo
                        .findByOdRequestIdAndRole(requestId, FLOW.get(i))
                        .orElseThrow();
                if (prev.getStatus() != Approval.ApprovalStatus.Approved) {
                    throw new BadRequestException("Previous approval step not completed yet");
                }
            }
        }

        Approval myApproval = approvalRepo
                .findByOdRequestIdAndRole(requestId, approvalRole)
                .orElseThrow(() -> new ResourceNotFoundException("Approval record not found"));

        if (myApproval.getStatus() != Approval.ApprovalStatus.Pending) {
            throw new BadRequestException("You have already acted on this request");
        }

        myApproval.setStatus("approve".equals(action)
                ? Approval.ApprovalStatus.Approved
                : Approval.ApprovalStatus.Rejected);
        myApproval.setRemark(reason);
        myApproval.setActionDate(LocalDateTime.now());
        approvalRepo.save(myApproval);

        if ("reject".equals(action)) {
            request.setFinalStatus(OdRequest.FinalStatus.Rejected);
        } else if (approvalRole == Approval.ApprovalRole.cfi) {
            request.setFinalStatus(OdRequest.FinalStatus.Approved);
            User student = request.getStudent();
            student.setApprovedODCount(student.getApprovedODCount() + 1);
            userRepo.save(student);
        }

        return odRepo.save(request);
    }

    // ── Upload Proof ──────────────────────────────────────────────────────────
    public OdRequest uploadProof(Long requestId, Long studentId,
                                 MultipartFile geoPhoto, MultipartFile certificate) {
        OdRequest request = odRepo.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("OD Request not found"));

        if (!request.getStudent().getId().equals(studentId)) {
            throw new UnauthorizedException("Not authorized");
        }
        if (request.getFinalStatus() != OdRequest.FinalStatus.Approved) {
            throw new BadRequestException("Can only upload proof for approved OD");
        }
        if (!LocalDate.now().isAfter(request.getToDate())) {
            throw new BadRequestException("Can only upload proof after OD end date");
        }

        Document doc = docRepo.findByOdRequestId(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Document record not found"));

        doc.setGeoTagPhotoPath(saveFile(geoPhoto,    "documents"));
        doc.setCertificatePath(saveFile(certificate, "documents"));
        doc.setProofUploadedAt(LocalDateTime.now());
        docRepo.save(doc);

        return odRepo.findById(requestId).orElseThrow();
    }

    // ── Admin: all requests ───────────────────────────────────────────────────
    public List<OdRequest> getAllRequests(String department, String status) {
        if (department != null && status != null) {
            return odRepo.findByDepartmentAndFinalStatusOrderByCreatedAtDesc(
                    department, OdRequest.FinalStatus.valueOf(status));
        }
        if (department != null) return odRepo.findByDepartmentOrderByCreatedAtDesc(department);
        if (status     != null) return odRepo.findByFinalStatusOrderByCreatedAtDesc(
                OdRequest.FinalStatus.valueOf(status));
        return odRepo.findAll();
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private Approval.ApprovalRole resolveApprovalRole(User faculty, OdRequest request) {
        return switch (faculty.getRole()) {
            case Mentor         -> Approval.ApprovalRole.mentor;
            case InnovationHead -> Approval.ApprovalRole.innovationHead;
            case HOD            -> Approval.ApprovalRole.hod;
            case CFI            -> Approval.ApprovalRole.cfi;
            case ClassAdvisor   ->
                // ClassAdvisor may act as mentor if assigned as mentorId
                (request.getMentor().getId().equals(faculty.getId()))
                        ? Approval.ApprovalRole.mentor
                        : Approval.ApprovalRole.classAdvisor;
            default -> throw new UnauthorizedException("Invalid role for approval");
        };
    }

    private String saveFile(MultipartFile file, String subDir) {
        if (file == null || file.isEmpty()) return null;
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
}
