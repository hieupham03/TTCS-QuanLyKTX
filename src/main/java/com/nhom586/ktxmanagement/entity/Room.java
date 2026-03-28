package com.nhom586.ktxmanagement.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "rooms", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"building_id", "room_number"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Room {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    // Khóa ngoại liên kết nhiều Phòng (Room) thuộc về 1 Tòa nhà (Building)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "building_id", nullable = false)
    private Building building;

    @Column(name = "room_number", nullable = false, length = 20)
    private String roomNumber;

    @Column(nullable = false)
    private Integer capacity;

    @Enumerated(EnumType.STRING)
    @Column(name = "room_gender", nullable = false)
    private RoomGender roomGender;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RoomStatus status = RoomStatus.AVAILABLE;

    // Khai báo Enum trực tiếp trong class
    public enum RoomGender {
        MALE, FEMALE
    }

    public enum RoomStatus {
        AVAILABLE, FULL, MAINTENANCE
    }
}