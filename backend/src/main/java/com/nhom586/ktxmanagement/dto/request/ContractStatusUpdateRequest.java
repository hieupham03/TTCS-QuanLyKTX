package com.nhom586.ktxmanagement.dto.request;

import com.nhom586.ktxmanagement.entity.Contract;
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
public class ContractStatusUpdateRequest {

    @NotNull(message = "Trạng thái hợp đồng không được để trống")
    Contract.ContractStatus status;
}
