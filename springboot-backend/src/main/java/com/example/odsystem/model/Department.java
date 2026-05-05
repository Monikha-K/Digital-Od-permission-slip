package com.example.odsystem.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "departments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Department {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Department codes: CSE, AIDS, ECE, EEE, MECH, CYBER, CSBS, AIML, IT
     */
    @Column(nullable = false, unique = true, length = 10)
    private String name;

    // Department-level approvers
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hod_id")
    private User hod;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "innovation_head_id")
    private User innovationHead;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cfi_id")
    private User cfi;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
