package com.nhom586.ktxmanagement.dto.request;

import com.nhom586.ktxmanagement.entity.RepairRequest;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RepairRequestStatusUpdateRequest {
    RepairRequest.RepairStatus status;
}
