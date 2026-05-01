package com.nhom586.ktxmanagement.controller;

import com.nhom586.ktxmanagement.dto.request.RegistrationCreationRequest;
import com.nhom586.ktxmanagement.dto.request.RegistrationStatusUpdateRequest;
import com.nhom586.ktxmanagement.entity.Registration;
import com.nhom586.ktxmanagement.service.RegistrationService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * API quản lý Đơn đăng ký KTX (Registration).
 * Base URL: /api/registrations
 *
 * Đây là bước đầu tiên trong luồng đăng ký ký túc xá:
 *   Sinh viên nộp đơn → Admin duyệt/từ chối → Nếu duyệt: tự động tạo Hợp đồng (Contract).
 *
 * Trạng thái đơn (status):
 *   PENDING  → Đang chờ Admin xử lý (trạng thái mặc định khi tạo mới).
 *   APPROVED → Đã được duyệt. Hệ thống tự động tạo Contract ngay lúc này.
 *   REJECTED → Bị từ chối.
 *
 * Loại đăng ký (requestType):
 *   NEW_REGISTER → Đăng ký ở mới (mặc định).
 *   EXTENSION    → Xin gia hạn sang kỳ tiếp theo.
 */
@RestController
@RequestMapping("/api/registrations")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class RegistrationController {

    RegistrationService registrationService;

    /**
     * GET /api/registrations
     * Lấy tất cả đơn đăng ký (Admin).
     *
     * Thường dùng để Admin xem danh sách toàn bộ đơn cần xử lý.
     * Response: Mảng Registration[].
     */
    @GetMapping
    public List<Registration> getAllRegistrations() {
        return registrationService.getAllRegistrations();
    }

    /**
     * GET /api/registrations/{id}
     * Lấy chi tiết một đơn đăng ký theo ID.
     *
     * Path variable: id (Integer) - ID của đơn đăng ký.
     */
    @GetMapping("/{id}")
    public Registration getRegistrationById(@PathVariable("id") Integer id) {
        return registrationService.getRegistrationById(id);
    }

    /**
     * GET /api/registrations/student/{studentCode}
     * Lấy tất cả đơn đăng ký của một sinh viên cụ thể theo MSSV.
     *
     * Path variable: studentCode (String) - MSSV, ví dụ "SV2024001".
     * Dùng khi: Sinh viên đăng nhập vào app và muốn xem lịch sử đơn của mình.
     */
    @PreAuthorize("hasRole('ADMIN') or #studentCode == authentication.name")
    @GetMapping("/student/{studentCode}")
    public List<Registration> getRegistrationsByStudent(@PathVariable("studentCode") String studentCode) {
        return registrationService.getRegistrationsByStudent(studentCode);
    }

    /**
     * POST /api/registrations
     * Sinh viên nộp đơn đăng ký KTX.
     *
     * Request body:
     * {
     *   "periodId": 1,              <- (bắt buộc) ID đợt đăng ký đang OPEN
     *   "studentCode": "SV2024001", <- (bắt buộc) MSSV của sinh viên
     *   "requestType": "NEW_REGISTER", <- (tuỳ chọn) "NEW_REGISTER" | "EXTENSION". Mặc định: NEW_REGISTER
     *   "requestedRoomId": 5,       <- (tuỳ chọn) ID phòng mong muốn (nguyện vọng)
     *   "note": "Cho em xin tầng 1" <- (tuỳ chọn) ghi chú thêm
     * }
     *
     * Điều kiện: Đợt đăng ký phải đang OPEN; sinh viên chưa có đơn trong đợt này.
     * Response: Registration object với status = PENDING.
     */
    @PostMapping
    public Registration createRegistration(@RequestBody @Valid RegistrationCreationRequest request) {
        return registrationService.createRegistration(request);
    }

    /**
     * PUT /api/registrations/{id}/status
     * Admin duyệt hoặc từ chối đơn đăng ký.
     *
     * Path variable: id (Integer) - ID của đơn cần xử lý.
     *
     * Request body:
     * {
     *   "status": "APPROVED",    <- (bắt buộc) "APPROVED" | "REJECTED"
     *   "note": "...",           <- (tuỳ chọn) lý do từ chối hoặc ghi chú
     *
     *   -- Chỉ bắt buộc khi status = "APPROVED" --
     *   "assignedRoomId": 5,     <- ID phòng Admin quyết định xếp (có thể khác nguyện vọng)
     *   "roomPrice": 1800000     <- Giá phòng theo tháng (VNĐ), lấy từ Building.roomPrice
     * }
     *
     * ⚠️ QUAN TRỌNG: Khi APPROVED, hệ thống TỰ ĐỘNG tạo một Contract (Hợp đồng)
     *    với phòng và giá đã cung cấp. Không cần gọi thêm API tạo Contract.
     */
    @PutMapping("/{id}/status")
    public Registration updateRegistrationStatus(@PathVariable("id") Integer id,
            @RequestBody @Valid RegistrationStatusUpdateRequest request) {
        return registrationService.updateRegistrationStatus(id, request);
    }
}