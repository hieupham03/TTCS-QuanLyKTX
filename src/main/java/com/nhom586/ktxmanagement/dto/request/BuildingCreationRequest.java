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
public class BuildingCreationRequest {

    @NotBlank(message = "Tên tòa nhà không được để trống")
    String name;

    @Positive(message = "Giá phòng phải lớn hơn 0")
    @NotNull(message = "Giá phòng không được để trống")
    Integer roomPrice;

    String description;
}
