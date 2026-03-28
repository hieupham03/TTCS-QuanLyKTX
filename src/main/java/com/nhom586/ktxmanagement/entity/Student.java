package com.nhom586.ktxmanagement.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "students")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Student {

    @Id
    @Column(name = "student_code", length = 10, nullable = false)
    private String studentCode;

    // Khóa ngoại 1-1: Mỗi Sinh viên chỉ có 1 Tài khoản đăng nhập
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id", unique = true)
    private Account account;

    @Column(nullable = false, unique = true, length = 12)
    private String cccd;

    @Column(name = "full_name", nullable = false, length = 100)
    private String fullName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Gender gender;

    @Column(name = "dob")
    private LocalDate dob;

    @Column(name = "class_name", nullable = false, length = 10)
    private String className;

    @Column(length = 10)
    private String phone;

    @Column(nullable = false, length = 100)
    private String email;

    // Khai báo Enum Giới tính
    public enum Gender {
        MALE, FEMALE
    }
}