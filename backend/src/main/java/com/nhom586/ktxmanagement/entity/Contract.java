package com.nhom586.ktxmanagement.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "contracts")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Contract {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_code", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;

    @Column(name = "room_price", nullable = false)
    private Integer roomPrice = 0;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "period_id", nullable = false)
    private RegistrationPeriod period;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ContractStatus status = ContractStatus.ACTIVE;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public enum ContractStatus {
        ACTIVE, EXPIRED, CANCELLED
    }
}