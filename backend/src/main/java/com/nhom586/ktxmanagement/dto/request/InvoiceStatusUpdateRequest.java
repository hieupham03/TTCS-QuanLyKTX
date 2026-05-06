package com.nhom586.ktxmanagement.dto.request;

import com.nhom586.ktxmanagement.entity.Invoice;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class InvoiceStatusUpdateRequest {
    Invoice.InvoiceStatus status;
}
