package com.nhom586.ktxmanagement.dto.request;

import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ServicePriceRequest {
    String type;   // Ví dụ: "ELECTRICITY", "WATER"
    Integer price; // Đơn giá (VNĐ / đơn vị)
    String unit;   // Đơn vị tính, ví dụ: "kWh", "m3"
}
