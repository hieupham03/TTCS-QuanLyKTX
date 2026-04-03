package com.nhom586.ktxmanagement.dto.request;

import com.nhom586.ktxmanagement.entity.Registration;
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
public class RegistrationStatusUpdateRequest {

    @NotNull(message = "Trạng thái không được để trống")
    Registration.RegistrationStatus status;

    String note;
}
