package com.nhom586.ktxmanagement.dto.request;


import jakarta.validation.constraints.Email;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AccountUpdateRequest {

    @Email(message = "Email không hợp lệ")
    String email;

    String passwordHash;

    String isActive;
}
