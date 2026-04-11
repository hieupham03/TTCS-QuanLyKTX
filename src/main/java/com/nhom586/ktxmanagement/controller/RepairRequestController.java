package com.nhom586.ktxmanagement.controller;

import com.nhom586.ktxmanagement.dto.request.RepairRequestCreationRequest;
import com.nhom586.ktxmanagement.dto.request.RepairRequestStatusUpdateRequest;
import com.nhom586.ktxmanagement.entity.RepairRequest;
import com.nhom586.ktxmanagement.service.RepairRequestService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Objects;

/**
 * API quản lý Yêu cầu sửa chữa (Repair Request).
 * Base URL: /api/repair-requests
 *
 * Sinh viên đang ở trong phòng có thể gửi yêu cầu báo hỏng cơ sở vật chất.
 * Admin/kỹ thuật viên sẽ tiếp nhận và cập nhật tiến độ xử lý.
 *
 * Trạng thái yêu cầu (status):
 *   PENDING     → Vừa gửi, chờ tiếp nhận.
 *   IN_PROGRESS → Đã tiếp nhận, đang trong quá trình sửa chữa.
 *   DONE        → Đã sửa xong.
 *
 * ⚠️ Điều kiện tạo yêu cầu: Sinh viên phải có Contract ACTIVE tại ĐÚNG phòng cần báo hỏng.
 *    (Không thể báo hỏng hộ phòng khác.)
 */
@RestController
@RequestMapping("/api/repair-requests")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class RepairRequestController {

    RepairRequestService repairRequestService;

    /**
     * GET /api/repair-requests
     * GET /api/repair-requests?studentCode=SV2024001
     * GET /api/repair-requests?roomId=5
     * GET /api/repair-requests?status=PENDING
     *
     * Lấy danh sách yêu cầu sửa chữa với bộ lọc tuỳ chọn.
     * Nếu không có param → trả toàn bộ (dùng cho trang Admin tổng quan).
     *
     * Query params (tuỳ chọn, chỉ dùng 1 tại một thời điểm):
     *   studentCode (String) → lọc theo MSSV sinh viên.
     *   roomId (Integer)     → lọc theo ID phòng.
     *   status (String)      → lọc theo trạng thái: "PENDING" | "IN_PROGRESS" | "DONE".
     */
    @PreAuthorize("hasRole('ADMIN') or ( #studentCode != null and #studentCode == authentication.name )")
    @GetMapping
    public List<RepairRequest> getAllRepairRequests(
            @RequestParam(required = false) String studentCode,
            @RequestParam(required = false) Integer roomId,
            @RequestParam(required = false) RepairRequest.RepairStatus status) {

        // Nếu là ADMIN (không truyền studentCode)
        if (studentCode == null) {
            // Chỉ ADMIN mới được dùng các bộ lọc roomId, status hoặc lấy hết
            if (Objects.requireNonNull(SecurityContextHolder.getContext().getAuthentication()).getAuthorities()
                    .stream().noneMatch(a -> Objects.equals(a.getAuthority(), "ROLE_ADMIN"))) {
                throw new AccessDeniedException("Bạn không có quyền xem danh sách tổng");
            }
        }

        if (studentCode != null) {
            return repairRequestService.getRepairRequestsByStudent(studentCode);
        } else if (roomId != null) {
            return repairRequestService.getRepairRequestsByRoom(roomId);
        } else if (status != null) {
            return repairRequestService.getRepairRequestsByStatus(status);
        }
        return repairRequestService.getAllRepairRequests();
    }

    /**
     * GET /api/repair-requests/{id}
     * Lấy chi tiết một yêu cầu sửa chữa theo ID.
     *
     * Path variable: id (Integer) - ID của yêu cầu.
     */
    @GetMapping("/{id}")
    public RepairRequest getRepairRequestById(@PathVariable Integer id) {
        return repairRequestService.getRepairRequestById(id);
    }

    /**
     * POST /api/repair-requests
     * Sinh viên gửi yêu cầu báo hỏng.
     *
     * Request body:
     * {
     *   "studentCode": "SV2024001", <- (bắt buộc) MSSV của sinh viên gửi
     *   "roomId": 5,                <- (bắt buộc) ID phòng cần sửa chữa
     *   "description": "Quạt trần bị cháy, phòng 301" <- (bắt buộc) mô tả sự cố
     * }
     *
     * ⚠️ Hệ thống sẽ kiểm tra sinh viên có Contract ACTIVE tại phòng đó không.
     *    Nếu không → trả lỗi 500 với message "Sinh viên không có hợp đồng đang hoạt động tại phòng này."
     * Response: RepairRequest object với status = PENDING.
     */
    @PostMapping
    public RepairRequest createRepairRequest(@RequestBody RepairRequestCreationRequest request) {
        return repairRequestService.createRepairRequest(request);
    }

    /**
     * PUT /api/repair-requests/{id}/status
     * Admin/kỹ thuật viên cập nhật tiến độ xử lý yêu cầu sửa chữa.
     *
     * Path variable: id (Integer) - ID của yêu cầu cần cập nhật.
     * Request body: { "status": "IN_PROGRESS" | "DONE" }
     *
     * Luồng thông thường: PENDING → IN_PROGRESS → DONE.
     */
    @PutMapping("/{id}/status")
    public RepairRequest updateRepairRequestStatus(
            @PathVariable Integer id,
            @RequestBody RepairRequestStatusUpdateRequest request) {
        return repairRequestService.updateRepairRequestStatus(id, request);
    }
}
