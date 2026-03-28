package com.nhom586.ktxmanagement.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "registration_periods")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegistrationPeriod {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, length = 50)
    private String semester;

    @Column(name = "registration_start_date", nullable = false)
    private LocalDateTime registrationStartDate;

    @Column(name = "registration_end_date", nullable = false)
    private LocalDateTime registrationEndDate;

    @Column(name = "stay_start_date", nullable = false)
    private LocalDate stayStartDate;

    @Column(name = "stay_end_date", nullable = false)
    private LocalDate stayEndDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PeriodStatus status = PeriodStatus.OPEN;

    public enum PeriodStatus {
        OPEN, CLOSED
    }
}