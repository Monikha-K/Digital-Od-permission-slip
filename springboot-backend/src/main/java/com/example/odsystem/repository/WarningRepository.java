package com.example.odsystem.repository;

import com.example.odsystem.model.Warning;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WarningRepository extends JpaRepository<Warning, Long> {

    List<Warning> findByStudentIdOrderByCreatedAtDesc(Long studentId);

    List<Warning> findByTypeOrderByCreatedAtDesc(Warning.WarningType type);

    long countByStudentIdAndType(Long studentId, Warning.WarningType type);
}
