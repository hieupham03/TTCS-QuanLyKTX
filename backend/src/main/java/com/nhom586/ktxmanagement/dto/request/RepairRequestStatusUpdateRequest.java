package com.nhom586.ktxmanagement.dto.request;

import com.nhom586.ktxmanagement.entity.RepairRequest;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RepairRequestStatusUpdateRequest {
    RepairRequest.RepairStatus status;
}
