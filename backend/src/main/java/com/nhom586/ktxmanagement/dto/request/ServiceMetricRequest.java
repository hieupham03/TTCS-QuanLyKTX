package com.nhom586.ktxmanagement.dto.request;

import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ServiceMetricRequest {
    Integer roomId;

    // Tháng, định dạng "YYYY-MM", ví dụ "2024-04"
    String billingMonth;

    // Chỉ số điện
    Integer oldElectricity;
    Integer newElectricity;

    // Chỉ số nước
    Integer oldWater;
    Integer newWater;
}
