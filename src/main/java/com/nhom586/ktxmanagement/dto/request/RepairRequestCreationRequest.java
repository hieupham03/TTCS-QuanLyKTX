package com.nhom586.ktxmanagement.dto.request;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RepairRequestCreationRequest {
    String studentCode;
    Integer roomId;
    String description;
}
