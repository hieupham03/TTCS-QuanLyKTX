package com.nhom586.ktxmanagement.controller;

import com.nhom586.ktxmanagement.dto.request.ServiceMetricRequest;
import com.nhom586.ktxmanagement.entity.ServiceMetric;
import com.nhom586.ktxmanagement.service.ServiceMetricService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * API quản lý Chỉ số Dịch vụ - Đồng hồ điện/nước (ServiceMetric).
 * Base URL: /api/service-metrics
 *
 * Mỗi tháng, nhân viên KTX đi đọc chỉ số đồng hồ điện và nước từng phòng
 * rồi nhập vào đây. Hệ thống sẽ TỰ ĐỘNG tính tiền và tạo Hóa đơn (Invoice).
 *
 * Cơ chế tính tiền khi nhập chỉ số:
 *   Tiêu thụ điện (kWh) = newElectricity - oldElectricity
 *   Tiêu thụ nước (m³)  = newWater - oldWater
 *   Tiền điện = tiêu thụ điện × đơn giá ELECTRICITY (lấy từ ServicePrice lúc nhập)
 *   Tiền nước = tiêu thụ nước × đơn giá WATER (lấy từ ServicePrice lúc nhập)
 *   Tiền phòng = roomPrice lấy từ Contract ACTIVE của phòng đó
 *   TỔNG (totalAmount) = tiền phòng + tiền điện + tiền nước
 *
 * ⚠️ Điều kiện bắt buộc trước khi dùng API POST:
 *    1. Phải có bảng giá điện/nước: POST /api/service-prices với type ELECTRICITY và WATER.
 *    2. Phòng phải có Contract ACTIVE (đang có sinh viên ở).
 *    3. Mỗi phòng chỉ được nhập 1 lần cho mỗi tháng.
 */
@RestController
@RequestMapping("/api/service-metrics")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ServiceMetricController {

    ServiceMetricService serviceMetricService;

    /**
     * GET /api/service-metrics
     * GET /api/service-metrics?roomId=5
     *
     * Lấy lịch sử chỉ số điện/nước.
     * Nếu có param roomId → lọc theo phòng.
     * Nếu không có param → lấy toàn bộ (Admin xem tổng quan).
     *
     * Query param (tuỳ chọn):
     *   roomId (Integer) → lọc chỉ số theo phòng.
     *
     * Dùng khi: Xem lịch sử điện nước của từng phòng theo từng tháng.
     */
    @GetMapping
    public List<ServiceMetric> getAllServiceMetrics(
            @RequestParam(required = false) Integer roomId) {
        if (roomId != null) {
            return serviceMetricService.getServiceMetricsByRoom(roomId);
        }
        return serviceMetricService.getAllServiceMetrics();
    }

    /**
     * GET /api/service-metrics/{id}
     * Lấy chi tiết một bản ghi chỉ số theo ID.
     *
     * Path variable: id (Integer) - ID bản ghi chỉ số.
     * Response: ServiceMetric object gồm:
     * {
     *   id, room, billingMonth,
     *   oldElectricity, newElectricity, electricityPrice, <- snapshot giá điện lúc nhập
     *   oldWater, newWater, waterPrice,                   <- snapshot giá nước lúc nhập
     *   createdAt
     * }
     */
    @GetMapping("/{id}")
    public ServiceMetric getServiceMetricById(@PathVariable Integer id) {
        return serviceMetricService.getServiceMetricById(id);
    }

    /**
     * POST /api/service-metrics
     * Nhập chỉ số đồng hồ điện/nước cho một phòng trong tháng → Tự động tạo Hóa đơn.
     *
     * Request body:
     * {
     *   "roomId": 5,              <- (bắt buộc) ID phòng cần nhập chỉ số
     *   "billingMonth": "2024-05",<- (bắt buộc) tháng lập chỉ số, định dạng "YYYY-MM"
     *   "oldElectricity": 1200,   <- (bắt buộc) chỉ số điện đầu kỳ (số nguyên, kWh)
     *   "newElectricity": 1350,   <- (bắt buộc) chỉ số điện cuối kỳ (phải >= oldElectricity)
     *   "oldWater": 80,           <- (bắt buộc) chỉ số nước đầu kỳ (m³)
     *   "newWater": 95            <- (bắt buộc) chỉ số nước cuối kỳ (phải >= oldWater)
     * }
     *
     * Sau khi gọi API này thành công:
     *   ✅ Một bản ghi ServiceMetric được lưu với snapshot giá điện/nước tại thời điểm nhập.
     *   ✅ Một Invoice (hóa đơn) được TỰ ĐỘNG tạo với totalAmount đã tính sẵn, status = UNPAID.
     *   ❌ Gọi lại lần 2 cho cùng roomId + billingMonth → Hệ thống báo lỗi (không cho nhập trùng).
     */
    @PostMapping
    public ServiceMetric createServiceMetric(@RequestBody ServiceMetricRequest request) {
        return serviceMetricService.createServiceMetric(request);
    }
}
