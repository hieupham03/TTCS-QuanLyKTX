package com.nhom586.ktxmanagement.service;

import com.nhom586.ktxmanagement.dto.response.DashboardReportResponse;
import com.nhom586.ktxmanagement.entity.*;
import com.nhom586.ktxmanagement.repository.*;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class DashboardService {
    RoomRepository roomRepository;
    ContractRepository contractRepository;
    InvoiceRepository invoiceRepository;
    RepairRequestRepository repairRequestRepository;
    RegistrationRepository registrationRepository;

    public DashboardReportResponse getDashboardReport(String billingMonth) {
        long totalRooms = roomRepository.count();
        long availableRooms = roomRepository.countByStatus(Room.RoomStatus.AVAILABLE);
        long fullRooms = roomRepository.countByStatus(Room.RoomStatus.FULL);
        long maintenanceRooms = roomRepository.countByStatus(Room.RoomStatus.MAINTENANCE);

        long activeStudents = contractRepository.countByStatus(Contract.ContractStatus.ACTIVE);

        long unpaidInvoicesCount;
        long paidInvoicesCount;
        long totalRevenue;

        if (billingMonth != null && !billingMonth.trim().isEmpty()) {
            unpaidInvoicesCount = invoiceRepository.countByStatusAndBillingMonth(Invoice.InvoiceStatus.UNPAID, billingMonth);
            paidInvoicesCount = invoiceRepository.countByStatusAndBillingMonth(Invoice.InvoiceStatus.PAID, billingMonth);
            Integer revenue = invoiceRepository.sumTotalAmountByStatusAndBillingMonth(Invoice.InvoiceStatus.PAID, billingMonth);
            totalRevenue = revenue != null ? revenue : 0;
        } else {
            unpaidInvoicesCount = invoiceRepository.countByStatus(Invoice.InvoiceStatus.UNPAID);
            paidInvoicesCount = invoiceRepository.countByStatus(Invoice.InvoiceStatus.PAID);
            Integer revenue = invoiceRepository.sumTotalAmountByStatus(Invoice.InvoiceStatus.PAID);
            totalRevenue = revenue != null ? revenue : 0;
        }

        long pendingRepairRequests = repairRequestRepository.countByStatus(RepairRequest.RepairStatus.PENDING);
        long inProgressRepairRequests = repairRequestRepository.countByStatus(RepairRequest.RepairStatus.IN_PROGRESS);

        long pendingRegistrations = registrationRepository.countByStatus(Registration.RegistrationStatus.PENDING);

        return DashboardReportResponse.builder()
                .totalRooms(totalRooms)
                .availableRooms(availableRooms)
                .fullRooms(fullRooms)
                .maintenanceRooms(maintenanceRooms)
                .activeStudents(activeStudents)
                .unpaidInvoicesCount(unpaidInvoicesCount)
                .paidInvoicesCount(paidInvoicesCount)
                .totalRevenue(totalRevenue)
                .pendingRepairRequests(pendingRepairRequests)
                .inProgressRepairRequests(inProgressRepairRequests)
                .pendingRegistrations(pendingRegistrations)
                .build();
    }
}
