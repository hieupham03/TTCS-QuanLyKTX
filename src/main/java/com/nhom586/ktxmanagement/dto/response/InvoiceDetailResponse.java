package com.nhom586.ktxmanagement.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.Date;


@Data
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
public class InvoiceDetailResponse {
    String buildingName;   // Tòa nhà
    String roomNumber;   // Tên phòng
    String billingMonth;
    Integer electricityUsage; // Lượng điện tiêu thụ (Mới - Cũ)
    Integer electricityAmount; // Tiền điện
    Integer waterUsage;       // Lượng nước tiêu thụ
    Integer waterAmount;       // Tiền nước
    Integer roomPrice;
    Integer totalAmount;
    Date createdAt;
    String status;
}
