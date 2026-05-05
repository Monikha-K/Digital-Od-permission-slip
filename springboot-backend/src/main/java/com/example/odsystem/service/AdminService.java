package com.example.odsystem.service;

import com.example.odsystem.dto.DashboardStatsResponse;
import com.example.odsystem.exception.ResourceNotFoundException;
import com.example.odsystem.model.OdRequest;
import com.example.odsystem.model.User;
import com.example.odsystem.model.Warning;
import com.example.odsystem.repository.OdRequestRepository;
import com.example.odsystem.repository.UserRepository;
import com.example.odsystem.repository.WarningRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class AdminService {

    private final UserRepository userRepo;
    private final OdRequestRepository odRepo;
    private final WarningRepository warningRepo;

    public AdminService(UserRepository userRepo,
                        OdRequestRepository odRepo,
                        WarningRepository warningRepo) {
        this.userRepo    = userRepo;
        this.odRepo      = odRepo;
        this.warningRepo = warningRepo;
    }

    public List<User> getAllUsers(String role, String department) {
        if (role != null && department != null) {
            return userRepo.findByRoleAndDepartment(User.Role.valueOf(role), department);
        }
        if (role != null)       return userRepo.findByRole(User.Role.valueOf(role));
        if (department != null) return userRepo.findByDepartment(department);
        return userRepo.findAll();
    }

    public void deleteUser(Long id) {
        userRepo.deleteById(id);
    }

    public User blockUser(Long id) {
        User user = userRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setIsBlocked(true);
        return userRepo.save(user);
    }

    public User unblockUser(Long id) {
        User user = userRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setIsBlocked(false);
        user.setWarningCount(0);
        return userRepo.save(user);
    }

    public List<Warning> getReports() {
        return warningRepo.findByTypeOrderByCreatedAtDesc(Warning.WarningType.report);
    }

    public DashboardStatsResponse getDashboardStats() {
        long totalStudents  = userRepo.findByRole(User.Role.Student).size();
        long totalFaculty   = userRepo.findByRole(User.Role.Mentor).size()
                            + userRepo.findByRole(User.Role.ClassAdvisor).size();
        long totalRequests  = odRepo.count();
        long approved       = odRepo.countByFinalStatus(OdRequest.FinalStatus.Approved);
        long pending        = odRepo.countByFinalStatus(OdRequest.FinalStatus.Pending);
        long rejected       = odRepo.countByFinalStatus(OdRequest.FinalStatus.Rejected);

        List<Object[]> raw  = odRepo.countByDepartmentGrouped();
        List<Map<String, Object>> byDept = new ArrayList<>();
        for (Object[] row : raw) {
            byDept.add(Map.of("department", row[0], "count", row[1]));
        }

        return new DashboardStatsResponse(
                totalStudents, totalFaculty,
                totalRequests, approved, pending, rejected,
                byDept
        );
    }

    public List<User> getMentorsByDepartment(String department) {
        List<User> result = new ArrayList<>();
        result.addAll(userRepo.findByRoleAndDepartment(User.Role.Mentor,       department));
        result.addAll(userRepo.findByRoleAndDepartment(User.Role.ClassAdvisor, department));
        return result;
    }

    public List<User> getAdvisorsByDepartmentAndYear(String department, Integer year) {
        return userRepo.findByDepartmentAndIsClassAdvisorTrueAndAdvisorYear(department, year);
    }
}
