package com.nhom586.ktxmanagement.service;

import com.nhom586.ktxmanagement.dto.request.ServicePriceRequest;
import com.nhom586.ktxmanagement.entity.ServicePrice;
import com.nhom586.ktxmanagement.repository.ServicePriceRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ServicePriceService {

    ServicePriceRepository servicePriceRepository;

    // Lấy toàn bộ danh sách bảng giá
    public List<ServicePrice> getAllServicePrices() {
        return servicePriceRepository.findAll();
    }

    // Lấy bảng giá theo ID
    public ServicePrice getServicePriceById(Integer id) {
        return servicePriceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bảng giá dịch vụ với ID: " + id));
    }

    // Lấy bảng giá theo loại (ví dụ "ELECTRICITY", "WATER")
    public ServicePrice getServicePriceByType(String type) {
        return servicePriceRepository.findByType(type)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bảng giá cho loại dịch vụ: " + type));
    }

    // Tạo mới một bảng giá dịch vụ
    @Transactional
    public ServicePrice createServicePrice(ServicePriceRequest request) {
        // Không cho phép tạo trùng type
        if (servicePriceRepository.findByType(request.getType()).isPresent()) {
            throw new RuntimeException("Loại dịch vụ '" + request.getType() + "' đã tồn tại. Vui lòng dùng API cập nhật.");
        }

        ServicePrice servicePrice = new ServicePrice();
        servicePrice.setType(request.getType().toUpperCase());
        servicePrice.setPrice(request.getPrice());
        servicePrice.setUnit(request.getUnit());

        return servicePriceRepository.save(servicePrice);
    }

    // Cập nhật giá dịch vụ theo ID
    @Transactional
    public ServicePrice updateServicePrice(Integer id, ServicePriceRequest request) {
        ServicePrice servicePrice = getServicePriceById(id);
        servicePrice.setPrice(request.getPrice());
        servicePrice.setUnit(request.getUnit());
        // Không cho phép đổi type để tránh lộn dữ liệu lịch sử
        return servicePriceRepository.save(servicePrice);
    }
}
