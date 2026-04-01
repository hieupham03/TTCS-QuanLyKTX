package com.nhom586.ktxmanagement.dto.request;

import com.nhom586.ktxmanagement.entity.Student;
import jakarta.validation.constraints.*;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.mapstruct.Builder;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class StudentCreationRequest {
    @NotBlank(message = "Mã sinh viên không được để trống")
    @Size(min = 10, max = 10, message = "Mã sinh viên không hợp lệ")
    String studentCode;

    @NotBlank(message = "Mã căn cước công dân không được để trống")
    @Size(min = 12, max = 12, message = "Mã căn cước công dân không hợp lệ")
    String cccd;

    @NotBlank(message = "Họ tên không được để trống")
    String fullName;

    @NotNull
    Student.Gender gender;

    LocalDate dob;

    @NotBlank(message = "Lớp không được để trống")
    @Size(min = 10, max = 10, message = "Lớp không hợp lệ")
    String className;

    String phone;

    @NotBlank(message = "Email  không được để trống")
    @Email (message = "Email không hợp lệ")
    String email;
    public enum Gender {
        MALE, FEMALE
    }
}
