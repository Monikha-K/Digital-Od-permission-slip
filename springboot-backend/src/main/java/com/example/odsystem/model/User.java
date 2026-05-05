package com.example.odsystem.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    /**
     * Roles: Admin, Student, Mentor, ClassAdvisor, InnovationHead, HOD, CFI
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Role role;

    /**
     * Departments: CSE, AIDS, ECE, EEE, MECH, CYBER, CSBS, AIML, IT
     */
    @Column(length = 10)
    private String department;

    // Student fields
    private String rollNumber;
    private Integer year;

    // Faculty fields
    private String staffId;
    private Boolean isClassAdvisor = false;
    private Integer advisorYear;

    private String profilePhoto;

    @Column(nullable = false)
    private Integer approvedODCount = 0;

    @Column(nullable = false)
    private Integer warningCount = 0;

    @Column(nullable = false)
    private Boolean isBlocked = false;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public enum Role {
        Admin, Student, Mentor, ClassAdvisor, InnovationHead, HOD, CFI
    }
}
