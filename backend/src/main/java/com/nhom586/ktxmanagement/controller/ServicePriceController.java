package com.nhom586.ktxmanagement.controller;

import com.nhom586.ktxmanagement.dto.request.ServicePriceRequest;
import com.nhom586.ktxmanagement.entity.ServicePrice;
import com.nhom586.ktxmanagement.service.ServicePriceService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * API quản lý Đơn giá Dịch vụ (ServicePrice).
 * Base URL: /api/service-prices
 *
 * Bảng giá dịch vụ lưu đơn giá điện và nước hiện hành.
 * Admin cấu hình 2 bản ghi cố định với type = "ELECTRICITY" và type = "WATER".
 * Giá này được dùng để tính hóa đơn hàng tháng khi nhập chỉ số đồng hồ.
 *
 * ⚠️ Quan trọng về Snapshot: Khi nhập chỉ số (ServiceMetric), giá điện/nước
 *    tại THỜI ĐIỂM đó được chép vào bản ghi chỉ số và hóa đơn (Invoice).
 *    Vì vậy, thay đổi giá sau này KHÔNG ảnh hưởng hóa đơn tháng cũ.
 *
 * Các type hiện tại trong hệ thống:
 *   "ELECTRICITY" - đơn giá điện (VNĐ / kWh)
 *   "WATER"       - đơn giá nước (VNĐ / m³)
 */
@RestController
@RequestMapping("/api/service-prices")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ServicePriceController {

    ServicePriceService servicePriceService;

    /**
     * GET /api/service-prices
     * Lấy toàn bộ danh sách bảng giá hiện hành.
     *
     * Response: Mảng ServicePrice[], thường có 2 phần tử: ELECTRICITY và WATER.
     * Dùng khi: FE cần hiển thị đơn giá điện/nước hiện tại trên trang Admin.
     */
    @GetMapping
    public List<ServicePrice> getAllServicePrices() {
        return servicePriceService.getAllServicePrices();
    }

    /**
     * GET /api/service-prices/{id}
     * Lấy thông tin một mức giá theo ID.
     *
     * Path variable: id (Integer) - ID của bản ghi giá.
     */
    @GetMapping("/{id}")
    public ServicePrice getServicePriceById(@PathVariable Integer id) {
        return servicePriceService.getServicePriceById(id);
    }

    /**
     * POST /api/service-prices
     * Tạo mới một mức giá dịch vụ (Admin, thường chỉ làm lần đầu).
     *
     * Request body:
     * {
     *   "type": "ELECTRICITY", <- tên loại dịch vụ (viết HOA), duy nhất trong hệ thống
     *   "price": 3500,         <- đơn giá (VNĐ trên mỗi đơn vị)
     *   "unit": "kWh"          <- đơn vị tính
     * }
     *
     * Lưu ý: Không tạo được 2 bản ghi cùng type. Nếu type đã tồn tại → dùng API PUT để cập nhật.
     */
    @PostMapping
    public ServicePrice createServicePrice(@RequestBody ServicePriceRequest request) {
        return servicePriceService.createServicePrice(request);
    }

    /**
     * PUT /api/service-prices/{id}
     * Cập nhật đơn giá dịch vụ (Admin).
     *
     * Path variable: id (Integer) - ID bản ghi giá cần sửa.
     * Request body: { "price": 4000, "unit": "kWh" }
     * Lưu ý: KHÔNG thể thay đổi "type" vì đây là định danh phân biệt điện/nước.
     *         Chỉ cập nhật được price và unit.
     */
    @PutMapping("/{id}")
    public ServicePrice updateServicePrice(@PathVariable Integer id, @RequestBody ServicePriceRequest request) {
        return servicePriceService.updateServicePrice(id, request);
    }
}
