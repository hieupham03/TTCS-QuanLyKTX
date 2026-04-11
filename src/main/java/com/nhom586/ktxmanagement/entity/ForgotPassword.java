package com.nhom586.ktxmanagement.entity;


import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.Date;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
public class ForgotPassword {

    @Id
    @GeneratedValue(strategy =  GenerationType.UUID)
    String  id;

    @Column(nullable = false)
    Integer otp;

    @Column(nullable = false)
    Date  expirationTime;

    @OneToOne
    Account account;

}
