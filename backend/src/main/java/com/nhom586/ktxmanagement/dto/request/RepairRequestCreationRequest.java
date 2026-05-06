package com.nhom586.ktxmanagement.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RepairRequestCreationRequest {
    String studentCode;
    Integer roomId;
    String description;
}
