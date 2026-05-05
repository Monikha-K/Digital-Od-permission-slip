package com.example.odsystem.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "warnings")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Warning {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "advisor_id", nullable = false)
    private User advisor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "od_request_id", nullable = false)
    private OdRequest odRequest;

    /**
     * Type: warn (up to 3), report (after 3 warnings — sent to admin)
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private WarningType type;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isRead = false;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public enum WarningType {
        warn, report
    }
}
