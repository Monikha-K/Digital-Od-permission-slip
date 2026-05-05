package com.example.odsystem.repository;

import com.example.odsystem.model.OdRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OdRequestRepository extends JpaRepository<OdRequest, Long> {

    List<OdRequest> findByStudentIdOrderByCreatedAtDesc(Long studentId);

    List<OdRequest> findByMentorIdOrderByCreatedAtDesc(Long mentorId);

    List<OdRequest> findByClassAdvisorIdOrderByCreatedAtDesc(Long advisorId);

    List<OdRequest> findByInnovationHeadIdOrderByCreatedAtDesc(Long innovationHeadId);

    List<OdRequest> findByHodIdOrderByCreatedAtDesc(Long hodId);

    List<OdRequest> findByCfiIdOrderByCreatedAtDesc(Long cfiId);

    List<OdRequest> findByAdvisorIdAndFinalStatusOrderByCreatedAtDesc(Long advisorId, OdRequest.FinalStatus status);

    List<OdRequest> findByDepartmentOrderByCreatedAtDesc(String department);

    List<OdRequest> findByFinalStatusOrderByCreatedAtDesc(OdRequest.FinalStatus status);

    List<OdRequest> findByDepartmentAndFinalStatusOrderByCreatedAtDesc(String department, OdRequest.FinalStatus status);

    long countByFinalStatus(OdRequest.FinalStatus status);

    long countByStudentIdAndFinalStatus(Long studentId, OdRequest.FinalStatus status);

    @Query("SELECT o.department, COUNT(o) FROM OdRequest o GROUP BY o.department")
    List<Object[]> countByDepartmentGrouped();

    // ClassAdvisor: requests where they are mentor OR advisor
    @Query("SELECT o FROM OdRequest o WHERE o.mentor.id = :userId OR o.classAdvisor.id = :userId ORDER BY o.createdAt DESC")
    List<OdRequest> findByMentorOrAdvisor(@Param("userId") Long userId);
}
