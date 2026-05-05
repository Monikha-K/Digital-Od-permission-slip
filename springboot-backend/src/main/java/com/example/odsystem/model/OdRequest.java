package com.example.odsystem.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "od_requests")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OdRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Student who submitted the request
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    // Assigned mentor
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mentor_id", nullable = false)
    private User mentor;

    // Assigned class advisor
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "advisor_id", nullable = false)
    private User classAdvisor;

    // Department-level approvers (auto-assigned from Department)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "innovation_head_id")
    private User innovationHead;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hod_id")
    private User hod;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cfi_id")
    private User cfi;

    @Column(nullable = false, length = 10)
    private String department;

    @Column(nullable = false)
    private Integer year;

    @Column(nullable = false)
    private String eventName;

    @Column(nullable = false)
    private String collegeName;

    @Column(nullable = false)
    private LocalDate fromDate;

    @Column(nullable = false)
    private LocalDate toDate;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    /**
     * Final status: Pending, Approved, Rejected
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    @Builder.Default
    private FinalStatus finalStatus = FinalStatus.Pending;

    // One-to-one document record
    @OneToOne(mappedBy = "odRequest", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Document documents;

    // Five approval steps (mentor, classAdvisor, innovationHead, hod, cfi)
    @OneToMany(mappedBy = "odRequest", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Approval> approvals;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public enum FinalStatus {
        Pending, Approved, Rejected
    }
}
