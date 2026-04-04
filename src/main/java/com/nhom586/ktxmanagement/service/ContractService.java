package com.nhom586.ktxmanagement.service;

import com.nhom586.ktxmanagement.dto.request.ContractCreationRequest;
import com.nhom586.ktxmanagement.dto.request.ContractStatusUpdateRequest;
import com.nhom586.ktxmanagement.entity.Contract;
import com.nhom586.ktxmanagement.entity.Registration;
import com.nhom586.ktxmanagement.entity.RegistrationPeriod;
import com.nhom586.ktxmanagement.entity.Room;
import com.nhom586.ktxmanagement.entity.Student;
import com.nhom586.ktxmanagement.repository.ContractRepository;
import com.nhom586.ktxmanagement.repository.RegistrationPeriodRepository;
import com.nhom586.ktxmanagement.repository.RoomRepository;
import com.nhom586.ktxmanagement.repository.StudentRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ContractService {

    ContractRepository contractRepository;
    StudentRepository studentRepository;
    RoomRepository roomRepository;
    RegistrationPeriodRepository periodRepository;

    // Lấy toàn bộ danh sách hợp đồng
    public List<Contract> getAllContracts() {
        return contractRepository.findAll();
    }

    // Lấy hợp đồng theo ID
    public Contract getContractById(Integer id) {
        return contractRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Hợp đồng không tồn tại với ID: " + id));
    }

    // Lấy danh sách hợp đồng theo mã sinh viên
    public List<Contract> getContractsByStudent(String studentCode) {
        return contractRepository.findByStudentStudentCode(studentCode);
    }

    // Lấy danh sách hợp đồng theo phòng
    public List<Contract> getContractsByRoom(Integer roomId) {
        return contractRepository.findByRoomId(roomId);
    }

    // Lấy danh sách hợp đồng theo đợt
    public List<Contract> getContractsByPeriod(Integer periodId) {
        return contractRepository.findByPeriodId(periodId);
    }

    // Lấy danh sách hợp đồng theo trạng thái
    public List<Contract> getContractsByStatus(Contract.ContractStatus status) {
        return contractRepository.findByStatus(status);
    }

    // Tạo hợp đồng thủ công (Admin)
    @Transactional
    public Contract createContract(ContractCreationRequest request) {
        Student student = studentRepository.findById(request.getStudentCode())
                .orElseThrow(() -> new RuntimeException("Sinh viên không tồn tại: " + request.getStudentCode()));

        Room room = roomRepository.findById(request.getRoomId())
                .orElseThrow(() -> new RuntimeException("Phòng không tồn tại với ID: " + request.getRoomId()));

        RegistrationPeriod period = periodRepository.findById(request.getPeriodId())
                .orElseThrow(() -> new RuntimeException("Đợt đăng ký không tồn tại với ID: " + request.getPeriodId()));

        // Kiểm tra sinh viên đã có hợp đồng ACTIVE trong đợt này chưa
        if (contractRepository.existsByStudentStudentCodeAndPeriodIdAndStatusNot(
                student.getStudentCode(), period.getId(), Contract.ContractStatus.CANCELLED)) {
            throw new RuntimeException("Sinh viên đã có hợp đồng trong đợt đăng ký này.");
        }

        // Kiểm tra sức chứa phòng
        long activeContractsInRoom = contractRepository.findByRoomId(room.getId()).stream()
                .filter(c -> c.getStatus() == Contract.ContractStatus.ACTIVE)
                .count();
        if (activeContractsInRoom >= room.getCapacity()) {
            throw new RuntimeException("Phòng đã đầy, không thể tạo thêm hợp đồng.");
        }

        Contract contract = new Contract();
        contract.setStudent(student);
        contract.setRoom(room);
        contract.setPeriod(period);
        contract.setRoomPrice(request.getRoomPrice());
        contract.setStatus(Contract.ContractStatus.ACTIVE);

        return contractRepository.save(contract);
    }

    // Tạo hợp đồng tự động từ đơn đăng ký đã được duyệt (gọi nội bộ từ RegistrationService)
    @Transactional
    public Contract createContractFromRegistration(Registration registration, Room room, Integer roomPrice) {
        // Kiểm tra sinh viên đã có hợp đồng trong đợt này chưa
        if (contractRepository.existsByStudentStudentCodeAndPeriodIdAndStatusNot(
                registration.getStudent().getStudentCode(),
                registration.getPeriod().getId(),
                Contract.ContractStatus.CANCELLED)) {
            throw new RuntimeException("Sinh viên đã có hợp đồng trong đợt đăng ký này.");
        }

        // Kiểm tra sức chứa phòng
        long activeContractsInRoom = contractRepository.findByRoomId(room.getId()).stream()
                .filter(c -> c.getStatus() == Contract.ContractStatus.ACTIVE)
                .count();
        if (activeContractsInRoom >= room.getCapacity()) {
            throw new RuntimeException("Phòng đã đầy, không thể tạo thêm hợp đồng.");
        }

        Contract contract = new Contract();
        contract.setStudent(registration.getStudent());
        contract.setRoom(room);
        contract.setPeriod(registration.getPeriod());
        contract.setRoomPrice(roomPrice);
        contract.setStatus(Contract.ContractStatus.ACTIVE);

        return contractRepository.save(contract);
    }

    // Cập nhật trạng thái hợp đồng
    @Transactional
    public Contract updateContractStatus(Integer id, ContractStatusUpdateRequest request) {
        Contract contract = getContractById(id);
        contract.setStatus(request.getStatus());
        return contractRepository.save(contract);
    }

    // Hủy hợp đồng
    @Transactional
    public Contract cancelContract(Integer id) {
        Contract contract = getContractById(id);
        if (contract.getStatus() == Contract.ContractStatus.CANCELLED) {
            throw new RuntimeException("Hợp đồng này đã bị hủy trước đó.");
        }
        contract.setStatus(Contract.ContractStatus.CANCELLED);
        return contractRepository.save(contract);
    }
}
