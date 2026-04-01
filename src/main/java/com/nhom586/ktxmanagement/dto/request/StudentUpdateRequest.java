package com.nhom586.ktxmanagement.dto.request;


import com.nhom586.ktxmanagement.entity.Student;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class StudentUpdateRequest {

    @NotBlank(message = "Mã căn cước công dân không được để trống")
    @Size(min = 12, max = 12, message = "Mã căn cước công dân không hợp lệ")
    String cccd;

    @NotBlank(message = "Họ tên không được để trống")
    String fullName;

    LocalDate dob;

    String phone;

    @NotBlank(message = "Email  không được để trống")
    @Email(message = "Email không hợp lệ")
    String email;

}
