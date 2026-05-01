package com.nhom586.ktxmanagement.dto.request;

import com.nhom586.ktxmanagement.entity.Invoice;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class InvoiceStatusUpdateRequest {
    Invoice.InvoiceStatus status;
}
