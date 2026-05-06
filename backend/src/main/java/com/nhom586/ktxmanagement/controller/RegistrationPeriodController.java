package com.nhom586.ktxmanagement.controller;

import com.nhom586.ktxmanagement.dto.request.RegistrationPeriodRequest;
import com.nhom586.ktxmanagement.entity.RegistrationPeriod;
import com.nhom586.ktxmanagement.service.RegistrationPeriodService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * API Quản lý Đợt đăng ký KTX.
 * Base URL: /api/registration-periods
 */
@RestController
@RequestMapping("/api/registration-periods")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class RegistrationPeriodController {

    RegistrationPeriodService registrationPeriodService;

    /** GET /api/registration-periods - Lấy tất cả đợt đăng ký (Public) */
    @GetMapping
    public List<RegistrationPeriod> getAllPeriods() {
        return registrationPeriodService.getAllPeriods();
    }

    /** GET /api/registration-periods/{id} - Lấy chi tiết đợt đăng ký (Public) */
    @GetMapping("/{id}")
    public RegistrationPeriod getPeriodById(@PathVariable Integer id) {
        return registrationPeriodService.getPeriodById(id);
    }

    /** POST /api/registration-periods - Admin tạo đợt đăng ký mới */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public RegistrationPeriod createPeriod(@Valid @RequestBody RegistrationPeriodRequest request) {
        return registrationPeriodService.createPeriod(request);
    }

    /** PUT /api/registration-periods/{id} - Admin cập nhật thông tin đợt đăng ký */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public RegistrationPeriod updatePeriod(@PathVariable Integer id,
            @Valid @RequestBody RegistrationPeriodRequest request) {
        return registrationPeriodService.updatePeriod(id, request);
    }

    /** PUT /api/registration-periods/{id}/close - Admin đóng đợt đăng ký */
    @PutMapping("/{id}/close")
    @PreAuthorize("hasRole('ADMIN')")
    public RegistrationPeriod closePeriod(@PathVariable Integer id) {
        return registrationPeriodService.closePeriod(id);
    }

    /** PUT /api/registration-periods/{id}/open - Admin mở lại đợt đăng ký */
    @PutMapping("/{id}/open")
    @PreAuthorize("hasRole('ADMIN')")
    public RegistrationPeriod openPeriod(@PathVariable Integer id) {
        return registrationPeriodService.openPeriod(id);
    }

    /** DELETE /api/registration-periods/{id} - Admin xóa đợt đăng ký */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void deletePeriod(@PathVariable Integer id) {
        registrationPeriodService.deletePeriod(id);
    }
}
