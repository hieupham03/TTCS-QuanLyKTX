package com.nhom586.ktxmanagement.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "service_prices")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ServicePrice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, unique = true, length = 20)
    private String type;

    @Column(nullable = false)
    private Integer price = 0;

    @Column(nullable = false, length = 20)
    private String unit;
}