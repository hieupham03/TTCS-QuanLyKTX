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
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/contracts")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ContractController {

    ContractService contractService;

    // GET /api/contracts - Lấy toàn bộ danh sách hợp đồng
    @GetMapping
    public List<Contract> getAllContracts() {
        return contractService.getAllContracts();
    }

    // GET /api/contracts/{id} - Lấy hợp đồng theo ID
    @GetMapping("/{id}")
    public Contract getContractById(@PathVariable("id") Integer id) {
        return contractService.getContractById(id);
    }

    // GET /api/contracts/student/{studentCode} - Lấy HĐ theo sinh viên
    @GetMapping("/student/{studentCode}")
    public List<Contract> getContractsByStudent(@PathVariable("studentCode") String studentCode) {
        return contractService.getContractsByStudent(studentCode);
    }

    // GET /api/contracts/room/{roomId} - Lấy HĐ theo phòng
    @GetMapping("/room/{roomId}")
    public List<Contract> getContractsByRoom(@PathVariable("roomId") Integer roomId) {
        return contractService.getContractsByRoom(roomId);
    }

    // GET /api/contracts/period/{periodId} - Lấy HĐ theo đợt đăng ký
    @GetMapping("/period/{periodId}")
    public List<Contract> getContractsByPeriod(@PathVariable("periodId") Integer periodId) {
        return contractService.getContractsByPeriod(periodId);
    }

    // GET /api/contracts/status/{status} - Lấy HĐ theo trạng thái
    @GetMapping("/status/{status}")
    public List<Contract> getContractsByStatus(@PathVariable("status") Contract.ContractStatus status) {
        return contractService.getContractsByStatus(status);
    }

    // POST /api/contracts - Tạo hợp đồng mới (Admin)
    @PostMapping
    public ResponseEntity<Contract> createContract(@RequestBody @Valid ContractCreationRequest request) {
        Contract created = contractService.createContract(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // PUT /api/contracts/{id}/status - Cập nhật trạng thái hợp đồng
    @PutMapping("/{id}/status")
    public Contract updateContractStatus(@PathVariable("id") Integer id,
                                          @RequestBody @Valid ContractStatusUpdateRequest request) {
        return contractService.updateContractStatus(id, request);
    }

    // DELETE /api/contracts/{id}/cancel - Hủy hợp đồng
    @PatchMapping("/{id}/cancel")
    public Contract cancelContract(@PathVariable("id") Integer id) {
        return contractService.cancelContract(id);
    }
}
