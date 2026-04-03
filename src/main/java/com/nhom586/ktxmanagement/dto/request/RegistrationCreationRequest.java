package com.nhom586.ktxmanagement.dto.request;

import com.nhom586.ktxmanagement.entity.Registration;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RegistrationCreationRequest {

    @NotNull(message = "Đợt đăng ký không được để trống")
    Integer periodId;

    @NotBlank(message = "Mã sinh viên không được để trống")
    String studentCode;

    Registration.RequestType requestType;

    Integer requestedRoomId;

    String note;
}
