package com.nhom586.ktxmanagement.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ContractCreationRequest {

    @NotBlank(message = "Mã sinh viên không được để trống")
    String studentCode;

    @NotNull(message = "ID phòng không được để trống")
    Integer roomId;

    @NotNull(message = "ID đợt đăng ký không được để trống")
    Integer periodId;

    @NotNull(message = "Giá phòng không được để trống")
    @Positive(message = "Giá phòng phải lớn hơn 0")
    Integer roomPrice;
}
