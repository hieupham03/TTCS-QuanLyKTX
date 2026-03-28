package com.nhom586.ktxmanagement.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "buildings")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Building {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, unique = true, length = 50)
    private String name;

    @Column(name = "room_price", nullable = false)
    private Integer roomPrice = 0;

    @Column(columnDefinition = "TEXT")
    private String description;
}