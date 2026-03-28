package com.nhom586.ktxmanagement.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "service_metrics")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ServiceMetric {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;

    @Column(name = "old_electricity", nullable = false)
    private Integer oldElectricity;

    @Column(name = "new_electricity", nullable = false)
    private Integer newElectricity;

    @Column(name = "old_water", nullable = false)
    private Integer oldWater;

    @Column(name = "new_water", nullable = false)
    private Integer newWater;

    @Column(name = "electricity_price", nullable = false)
    private Integer electricityPrice = 0;

    @Column(name = "water_price", nullable = false)
    private Integer waterPrice = 0;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}