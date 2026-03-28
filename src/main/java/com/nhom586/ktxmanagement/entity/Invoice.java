package com.nhom586.ktxmanagement.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "invoices", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"room_id", "billing_month"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Invoice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;

    // Liên kết trực tiếp với bảng chỉ số của tháng đó
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_metric_id", nullable = false)
    private ServiceMetric serviceMetric;

    @Column(name = "billing_month", nullable = false, length = 10)
    private String billingMonth;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private InvoiceStatus status = InvoiceStatus.UNPAID;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public enum InvoiceStatus {
        UNPAID, PAID
    }
}