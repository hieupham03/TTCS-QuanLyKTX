package com.nhom586.ktxmanagement.dto.response;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class DashboardReportResponse {
    // Rooms Current Status
    long totalRooms;
    long availableRooms;
    long fullRooms;
    long maintenanceRooms;
    
    // Students / Contracts (Current Active)
    long activeStudents; 
    
    // Invoices / Finance (Filtered by Month if provided, else all-time)
    long unpaidInvoicesCount;
    long paidInvoicesCount;
    long totalRevenue;
    
    // Repair Requests Current Status
    long pendingRepairRequests;
    long inProgressRepairRequests;

    // Registrations Current Status
    long pendingRegistrations;
}
