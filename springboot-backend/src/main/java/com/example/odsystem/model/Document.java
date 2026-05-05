package com.example.odsystem.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "documents")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Document {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "od_request_id", nullable = false)
    private OdRequest odRequest;

    // Documents submitted at application time
    private String registrationFormPath;
    private String paymentProofPath;
    private String posterPath;

    // Proof documents submitted after OD completion
    private String geoTagPhotoPath;
    private String certificatePath;
    private LocalDateTime proofUploadedAt;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
