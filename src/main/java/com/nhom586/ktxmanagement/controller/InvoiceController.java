package com.nhom586.ktxmanagement.controller;

import com.nhom586.ktxmanagement.dto.request.InvoiceStatusUpdateRequest;
import com.nhom586.ktxmanagement.entity.Invoice;
import com.nhom586.ktxmanagement.service.InvoiceService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * API quản lý Hóa đơn (Invoice).
 * Base URL: /api/invoices
 *
 * Hóa đơn được tạo TỰ ĐỘNG khi nhập chỉ số điện/nước (POST /api/service-metrics).
 * FE KHÔNG cần gọi API tạo hóa đơn; chỉ cần đọc và cập nhật trạng thái.
 *
 * Cấu trúc Invoice trả về:
 * {
 *   "id": 1,
 *   "room": { id, roomNumber, building... },
 *   "serviceMetric": { id, oldElectricity, newElectricity, electricityPrice,
 *                      oldWater, newWater, waterPrice, billingMonth },
 *   "billingMonth": "2024-05",
 *   "roomPrice": 1800000,  <- tiền phòng (snapshot)
 *   "totalAmount": 2550000,<- TỔNG đã tính sẵn = tiền phòng + điện + nước
 *   "status": "UNPAID",    <- "UNPAID" | "PAID"
 *   "createdAt": "..."
 * }
 */
@RestController
@RequestMapping("/api/invoices")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class InvoiceController {

    InvoiceService invoiceService;

    /**
     * GET /api/invoices
     * GET /api/invoices?roomId=5
     * GET /api/invoices?billingMonth=2024-05
     * GET /api/invoices?status=UNPAID
     *
     * Lấy danh sách hóa đơn với bộ lọc tuỳ chọn (dùng 1 param tại một thời điểm).
     * Nếu không có param → lấy toàn bộ (Admin tổng quan).
     *
     * Ví dụ:
     *   ?roomId=5              → hóa đơn của phòng 5 (sinh viên xem hóa đơn phòng mình)
     *   ?billingMonth=2024-05  → hóa đơn tháng 5/2024 (Admin xem theo tháng)
     *   ?status=UNPAID         → tất cả hóa đơn chưa thanh toán (Admin đôn đốc)
     */
    @GetMapping
    public List<Invoice> getInvoices(
            @RequestParam(required = false) Integer roomId,
            @RequestParam(required = false) String billingMonth,
            @RequestParam(required = false) Invoice.InvoiceStatus status) {

        if (roomId != null) {
            return invoiceService.getInvoicesByRoom(roomId);
        } else if (billingMonth != null) {
            return invoiceService.getInvoicesByBillingMonth(billingMonth);
        } else if (status != null) {
            return invoiceService.getInvoicesByStatus(status);
        }
        return invoiceService.getAllInvoices();
    }

    /**
     * GET /api/invoices/{id}
     * Lấy chi tiết một hóa đơn theo ID.
     */
    @GetMapping("/{id}")
    public Invoice getInvoiceById(@PathVariable Integer id) {
        return invoiceService.getInvoiceById(id);
    }

    /**
     * PUT /api/invoices/{id}/status
     * Admin xác nhận thu tiền → chuyển hóa đơn UNPAID sang PAID.
     *
     * Request body: { "status": "PAID" }
     *
     * ⚠️ Không thể đảo ngược PAID → UNPAID. Hệ thống sẽ báo lỗi nếu cố tình.
     */
    @PutMapping("/{id}/status")
    public Invoice updateInvoiceStatus(
            @PathVariable Integer id,
            @RequestBody InvoiceStatusUpdateRequest request) {
        return invoiceService.updateInvoiceStatus(id, request);
    }
}
