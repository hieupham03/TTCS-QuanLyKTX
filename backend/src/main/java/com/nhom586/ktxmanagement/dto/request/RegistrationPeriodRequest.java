package com.nhom586.ktxmanagement.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RegistrationPeriodRequest {

    @NotBlank(message = "Tên học kỳ không được để trống")
    String semester;

    @NotNull(message = "Ngày bắt đầu nhận đơn không được để trống")
    LocalDateTime registrationStartDate;

    @NotNull(message = "Ngày kết thúc nhận đơn không được để trống")
    LocalDateTime registrationEndDate;

    @NotNull(message = "Ngày bắt đầu lưu trú không được để trống")
    LocalDate stayStartDate;

    @NotNull(message = "Ngày kết thúc lưu trú không được để trống")
    LocalDate stayEndDate;
}
