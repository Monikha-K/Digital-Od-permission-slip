package com.example.odsystem.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "approvals")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Approval {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "od_request_id", nullable = false)
    private OdRequest odRequest;

    /**
     * Approval flow roles: mentor, classAdvisor, innovationHead, hod, cfi
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ApprovalRole role;

    /**
     * Status: Pending, Approved, Rejected
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    @Builder.Default
    private ApprovalStatus status = ApprovalStatus.Pending;

    @Column(columnDefinition = "TEXT")
    private String remark;

    private LocalDateTime actionDate;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public enum ApprovalRole {
        mentor, classAdvisor, innovationHead, hod, cfi
    }

    public enum ApprovalStatus {
        Pending, Approved, Rejected
    }
}
