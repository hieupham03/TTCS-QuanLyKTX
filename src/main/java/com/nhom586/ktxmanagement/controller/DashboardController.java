package com.nhom586.ktxmanagement.controller;

import com.nhom586.ktxmanagement.dto.response.DashboardReportResponse;
import com.nhom586.ktxmanagement.service.DashboardService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class DashboardController {

    DashboardService dashboardService;

    /**
     * Lấy thống kê tổng quan KTX.
     * Cần token ADMIN để truy cập.
     * @param billingMonth (Option) Tháng để lọc doanh thu/hóa đơn, định dạng yyyy-MM
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public DashboardReportResponse getDashboardReport(@RequestParam(required = false) String billingMonth) {
        return dashboardService.getDashboardReport(billingMonth);
    }
}
