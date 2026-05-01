package com.nhom586.ktxmanagement.controller;

import com.nhom586.ktxmanagement.dto.request.ContractCreationRequest;
import com.nhom586.ktxmanagement.dto.request.ContractStatusUpdateRequest;
import com.nhom586.ktxmanagement.entity.Contract;
import com.nhom586.ktxmanagement.service.ContractService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * API quản lý Hợp đồng lưu trú (Contract).
 * Base URL: /api/contracts
 *
 * Contract là kết quả pháp lý xác nhận sinh viên đã được xếp phòng chính thức.
 * Thông thường, Contract được tạo TỰ ĐỘNG khi Admin duyệt đơn đăng ký (Registration → APPROVED).
 * Admin cũng có thể tạo Contract thủ công nếu cần (ví dụ: bỏ qua bước đơn đăng ký).
 *
 * Trạng thái hợp đồng (status):
 *   ACTIVE    → Đang có hiệu lực. Sinh viên đang ở trong phòng.
 *   EXPIRED   → Hết hạn (cuối kỳ).
 *   CANCELLED → Đã hủy (sinh viên trả phòng giữa chừng).
 *
 * Lưu ý: Số lượng Contract ACTIVE trong một phòng KHÔNG được vượt quá sức chứa (capacity).
 */
@RestController
@RequestMapping("/api/contracts")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ContractController {

    ContractService contractService;

    /**
     * GET /api/contracts
     * Lấy toàn bộ danh sách hợp đồng (Admin).
     */
    @GetMapping
    public List<Contract> getAllContracts() {
        return contractService.getAllContracts();
    }

    /**
     * GET /api/contracts/{id}
     * Lấy chi tiết một hợp đồng theo ID.
     *
     * Path variable: id (Integer) - ID hợp đồng.
     * Response: Contract object gồm { id, student, room, roomPrice, period, status, createdAt }.
     */
    @GetMapping("/{id}")
    public Contract getContractById(@PathVariable("id") Integer id) {
        return contractService.getContractById(id);
    }

    /**
     * GET /api/contracts/student/{studentCode}
     * Lấy tất cả hợp đồng của một sinh viên theo MSSV.
     *
     * Path variable: studentCode (String) - MSSV, ví dụ "SV2024001".
     * Dùng khi: Sinh viên xem lịch sử hợp đồng; Admin tra cứu sinh viên đang ở phòng nào.
     * Gợi ý FE: Lọc ra bản ghi có status = ACTIVE để hiển thị "Phòng hiện tại".
     */
    @PreAuthorize("hasRole('ADMIN') or #studentCode == authentication.name")
    @GetMapping("/student/{studentCode}")
    public List<Contract> getContractsByStudent(@PathVariable("studentCode") String studentCode) {
        return contractService.getContractsByStudent(studentCode);
    }

    /**
     * GET /api/contracts/room/{roomId}
     * Lấy tất cả hợp đồng của một phòng theo ID phòng.
     *
     * Path variable: roomId (Integer) - ID phòng.
     * Dùng khi: Admin xem danh sách sinh viên đang ở trong một phòng cụ thể.
     */
    @GetMapping("/room/{roomId}")
    public List<Contract> getContractsByRoom(@PathVariable("roomId") Integer roomId) {
        return contractService.getContractsByRoom(roomId);
    }

    /**
     * GET /api/contracts/period/{periodId}
     * Lấy tất cả hợp đồng thuộc một đợt đăng ký.
     *
     * Path variable: periodId (Integer) - ID đợt đăng ký.
     * Dùng khi: Admin xem tổng hợp sinh viên đang ở trong kỳ học nào đó.
     */
    @GetMapping("/period/{periodId}")
    public List<Contract> getContractsByPeriod(@PathVariable("periodId") Integer periodId) {
        return contractService.getContractsByPeriod(periodId);
    }

    /**
     * GET /api/contracts/status/{status}
     * Lấy danh sách hợp đồng lọc theo trạng thái.
     *
     * Path variable: status (String) - "ACTIVE" | "EXPIRED" | "CANCELLED".
     * Ví dụ: GET /api/contracts/status/ACTIVE → tất cả sinh viên đang ở KTX.
     */
    @GetMapping("/status/{status}")
    public List<Contract> getContractsByStatus(@PathVariable("status") Contract.ContractStatus status) {
        return contractService.getContractsByStatus(status);
    }

    /**
     * POST /api/contracts
     * Tạo hợp đồng thủ công (Admin, không qua bước đơn đăng ký).
     *
     * Dùng khi: Admin muốn trực tiếp xếp phòng cho sinh viên mà không cần đơn đăng ký.
     *
     * Request body:
     * {
     *   "studentCode": "SV2024001", <- (bắt buộc) MSSV
     *   "roomId": 5,                <- (bắt buộc) ID phòng
     *   "periodId": 1,              <- (bắt buộc) ID đợt đăng ký
     *   "roomPrice": 1800000        <- (bắt buộc) Giá phòng/tháng (VNĐ), phải > 0
     * }
     *
     * Điều kiện: Sinh viên chưa có hợp đồng trong đợt này; Phòng chưa đầy.
     * Response: Contract object với status = ACTIVE.
     */
    @PostMapping
    public ResponseEntity<Contract> createContract(@RequestBody @Valid ContractCreationRequest request) {
        Contract created = contractService.createContract(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * PUT /api/contracts/{id}/status
     * Cập nhật trạng thái hợp đồng (Admin).
     *
     * Path variable: id (Integer) - ID hợp đồng.
     * Request body: { "status": "EXPIRED" | "CANCELLED" | "ACTIVE" }
     * Dùng khi: Cuối kỳ Admin chạy cập nhật hàng loạt sang EXPIRED.
     */
    @PutMapping("/{id}/status")
    public Contract updateContractStatus(@PathVariable("id") Integer id,
                                          @RequestBody @Valid ContractStatusUpdateRequest request) {
        return contractService.updateContractStatus(id, request);
    }

    /**
     * PATCH /api/contracts/{id}/cancel
     * Hủy hợp đồng (Admin).
     *
     * Path variable: id (Integer) - ID hợp đồng cần hủy.
     * Dùng khi: Sinh viên xin trả phòng giữa kỳ; Admin xử lý vi phạm nội quy.
     * Khi hủy → chỗ trong phòng được giải phóng, sinh viên khác có thể đăng ký vào.
     * Lưu ý: Hợp đồng đã CANCELLED không thể hủy thêm lần nữa.
     */
    @PatchMapping("/{id}/cancel")
    public Contract cancelContract(@PathVariable("id") Integer id) {
        return contractService.cancelContract(id);
    }

    /**
     * DELETE /api/contracts/{id}
     * Xóa cứng hợp đồng (Admin).
     * Dùng khi tạo nhầm hợp đồng.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public String deleteContract(@PathVariable("id") Integer id) {
        contractService.deleteContract(id);
        return "Hợp đồng đã được xóa thành công";
    }
}
