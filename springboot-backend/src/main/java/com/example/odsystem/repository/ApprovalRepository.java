package com.example.odsystem.repository;

import com.example.odsystem.model.Approval;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ApprovalRepository extends JpaRepository<Approval, Long> {

    List<Approval> findByOdRequestId(Long odRequestId);

    Optional<Approval> findByOdRequestIdAndRole(Long odRequestId, Approval.ApprovalRole role);
}
