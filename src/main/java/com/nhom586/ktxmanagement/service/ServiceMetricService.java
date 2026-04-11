package com.nhom586.ktxmanagement.service;

import com.nhom586.ktxmanagement.dto.request.ServiceMetricRequest;
import com.nhom586.ktxmanagement.entity.*;
import com.nhom586.ktxmanagement.repository.*;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ServiceMetricService {

    ServiceMetricRepository serviceMetricRepository;
    ServicePriceRepository servicePriceRepository;
    RoomRepository roomRepository;
    InvoiceRepository invoiceRepository;
    ContractRepository contractRepository;

    public List<ServiceMetric> getAllServiceMetrics() {
        return serviceMetricRepository.findAll();
    }

    public ServiceMetric getServiceMetricById(Integer id) {
        return serviceMetricRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy chỉ số dịch vụ với ID: " + id));
    }

    public List<ServiceMetric> getServiceMetricsByRoom(Integer roomId) {
        return serviceMetricRepository.findByRoomId(roomId);
    }

    /**
     * Nhập chỉ số điện/nước tháng mới và tự động tạo hóa đơn (Invoice).
     *
     * Luồng:
     * 1. Kiểm tra phòng tồn tại.
     * 2. Kiểm tra tháng này chưa có chỉ số (tránh nhập trùng).
     * 3. Validate chỉ số mới >= chỉ số cũ.
     * 4. Lấy đơn giá điện/nước snapshot từ ServicePrice.
     * 5. Lưu ServiceMetric với snapshot đơn giá.
     * 6. Tính tổng tiền (tiền phòng + điện + nước) và tạo Invoice UNPAID.
     */
    @Transactional
    public ServiceMetric createServiceMetric(ServiceMetricRequest request) {
        // 1. Kiểm tra phòng
        Room room = roomRepository.findById(request.getRoomId())
                .orElseThrow(() -> new RuntimeException("Phòng không tồn tại: " + request.getRoomId()));

        // 2. Kiểm tra đã nhập chỉ số tháng này chưa
        if (serviceMetricRepository.findByRoomIdAndBillingMonth(request.getRoomId(), request.getBillingMonth()).isPresent()) {
            throw new RuntimeException("Phòng " + room.getRoomNumber()
                    + " đã được nhập chỉ số cho tháng " + request.getBillingMonth() + " rồi.");
        }

        // 3. Validate chỉ số hợp lý
        if (request.getNewElectricity() < request.getOldElectricity()) {
            throw new RuntimeException("Chỉ số điện mới không thể nhỏ hơn chỉ số cũ.");
        }
        if (request.getNewWater() < request.getOldWater()) {
            throw new RuntimeException("Chỉ số nước mới không thể nhỏ hơn chỉ số cũ.");
        }

        // 4. Lấy đơn giá SNAPSHOT từ bảng ServicePrice
        ServicePrice electricityPriceConfig = servicePriceRepository.findByType("ELECTRICITY")
                .orElseThrow(() -> new RuntimeException("Chưa cấu hình đơn giá điện (type=ELECTRICITY)."));
        ServicePrice waterPriceConfig = servicePriceRepository.findByType("WATER")
                .orElseThrow(() -> new RuntimeException("Chưa cấu hình đơn giá nước (type=WATER)."));

        // 5. Lưu ServiceMetric (snapshot đơn giá ghi vào luôn)
        ServiceMetric metric = new ServiceMetric();
        metric.setRoom(room);
        metric.setBillingMonth(request.getBillingMonth());
        metric.setOldElectricity(request.getOldElectricity());
        metric.setNewElectricity(request.getNewElectricity());
        metric.setOldWater(request.getOldWater());
        metric.setNewWater(request.getNewWater());
        metric.setElectricityPrice(electricityPriceConfig.getPrice());
        metric.setWaterPrice(waterPriceConfig.getPrice());
        ServiceMetric savedMetric = serviceMetricRepository.save(metric);

        // 6. Tính tổng tiền & tạo Invoice
        int electricityUsed = request.getNewElectricity() - request.getOldElectricity();
        int waterUsed = request.getNewWater() - request.getOldWater();
        int electricityCost = electricityUsed * electricityPriceConfig.getPrice();
        int waterCost = waterUsed * waterPriceConfig.getPrice();

        // Lấy giá phòng từ hợp đồng ACTIVE đầu tiên của phòng đó
        int roomPrice = contractRepository.findByRoomId(room.getId()).stream()
                .filter(c -> c.getStatus() == Contract.ContractStatus.ACTIVE)
                .findFirst()
                .map(Contract::getRoomPrice)
                .orElse(0);

        int totalAmount = roomPrice + electricityCost + waterCost;

        Invoice invoice = new Invoice();
        invoice.setRoom(room);
        invoice.setServiceMetric(savedMetric);
        invoice.setBillingMonth(request.getBillingMonth());
        invoice.setRoomPrice(roomPrice);
        invoice.setTotalAmount(totalAmount);
        invoice.setStatus(Invoice.InvoiceStatus.UNPAID);
        invoiceRepository.save(invoice);

        return savedMetric;
    }
}
