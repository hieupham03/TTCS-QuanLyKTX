package com.nhom586.ktxmanagement.service;

import com.nhom586.ktxmanagement.dto.request.InvoiceStatusUpdateRequest;
import com.nhom586.ktxmanagement.dto.response.InvoiceDetailResponse;
import com.nhom586.ktxmanagement.entity.Contract;
import com.nhom586.ktxmanagement.entity.Invoice;
import com.nhom586.ktxmanagement.repository.ContractRepository;
import com.nhom586.ktxmanagement.repository.InvoiceRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class InvoiceService {

    InvoiceRepository invoiceRepository;
    ContractRepository contractRepository;

    // Lấy toàn bộ hóa đơn (dùng cho Admin xem tổng quan)
    public List<Invoice> getAllInvoices() {
        return invoiceRepository.findAll();
    }

    // Lấy hóa đơn theo ID
    public Invoice getInvoiceById(Integer id) {
        return invoiceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Hóa đơn không tồn tại với ID: " + id));
    }

    // Lấy danh sách hóa đơn theo phòng
    public List<Invoice> getInvoicesByRoom(Integer roomId) {
        return invoiceRepository.findByRoomId(roomId);
    }

    // Lấy danh sách hóa đơn theo tháng (Admin dùng để xem hóa đơn tháng X)
    public List<Invoice> getInvoicesByBillingMonth(String billingMonth) {
        return invoiceRepository.findByBillingMonth(billingMonth);
    }

    // Lấy danh sách hóa đơn theo trạng thái (UNPAID / PAID)
    public List<Invoice> getInvoicesByStatus(Invoice.InvoiceStatus status) {
        return invoiceRepository.findByStatus(status);
    }


    public List<InvoiceDetailResponse> getFullInvoiceDetails(String buildingName, String roomNumber, String month) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        assert auth != null;
        String currentUsername = auth.getName();
        boolean isAdmin = auth.getAuthorities().stream()
                .anyMatch(a -> Objects.equals(a.getAuthority(), "ROLE_ADMIN"));

        if (isAdmin) {
            return invoiceRepository.getFullInvoiceDetails(buildingName, roomNumber, month);
        } else {
            // SINH VIÊN: Lấy thông tin phòng hiện tại từ hợp đồng
            Contract activeContract = contractRepository.findByStudentAccountUsernameAndStatus(
                            currentUsername, Contract.ContractStatus.ACTIVE)
                    .orElseThrow(() -> new RuntimeException("Sinh viên không thuộc phòng này"));

            String myBuildingName = activeContract.getRoom().getBuilding().getName();
            String myRoomNumber = activeContract.getRoom().getRoomNumber();


            if ((buildingName != null && !buildingName.equals(myBuildingName)) ||
                    (roomNumber != null && !roomNumber.equals(myRoomNumber))) {
                throw new RuntimeException("Không được phép truy cập");
            }

            // Ép buộc trả về kết quả của chính phòng sinh viên đó
            return invoiceRepository.getFullInvoiceDetails(myBuildingName, myRoomNumber, month);
        }
    }


    /**
     * Xác nhận thanh toán hóa đơn (chuyển UNPAID → PAID).
     * Chỉ dùng khi Admin xác nhận thu tiền trực tiếp hoặc qua chuyển khoản.
     * Một hóa đơn đã PAID không thể đổi trạng thái ngược lại.
     */
    @Transactional
    public Invoice updateInvoiceStatus(Integer id, InvoiceStatusUpdateRequest request) {
        Invoice invoice = getInvoiceById(id);

        // Chặn việc "hoàn trả" một hóa đơn đã PAID
        if (invoice.getStatus() == Invoice.InvoiceStatus.PAID
                && request.getStatus() == Invoice.InvoiceStatus.UNPAID) {
            throw new RuntimeException("Không thể hoàn trả trạng thái hóa đơn đã thanh toán.");
        }

        invoice.setStatus(request.getStatus());
        return invoiceRepository.save(invoice);
    }
}
