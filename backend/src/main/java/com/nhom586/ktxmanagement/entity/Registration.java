package com.nhom586.ktxmanagement.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "registrations", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"period_id", "student_code"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Registration {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "period_id", nullable = false)
    private RegistrationPeriod period;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_code", nullable = false)
    private Student student;

    @Enumerated(EnumType.STRING)
    @Column(name = "request_type")
    private RequestType requestType = RequestType.NEW_REGISTER;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requested_room")
    private Room requestedRoom;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RegistrationStatus status = RegistrationStatus.PENDING;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(columnDefinition = "TEXT")
    private String note;

    public enum RequestType {
        NEW_REGISTER, EXTENSION
    }

    public enum RegistrationStatus {
        PENDING, APPROVED, REJECTED
    }
}