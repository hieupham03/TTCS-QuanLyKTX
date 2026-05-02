package com.nhom586.ktxmanagement.service;

import com.nhom586.ktxmanagement.dto.request.RepairRequestCreationRequest;
import com.nhom586.ktxmanagement.dto.request.RepairRequestStatusUpdateRequest;
import com.nhom586.ktxmanagement.entity.Contract;
import com.nhom586.ktxmanagement.entity.RepairRequest;
import com.nhom586.ktxmanagement.entity.Room;
import com.nhom586.ktxmanagement.entity.Student;
import com.nhom586.ktxmanagement.repository.ContractRepository;
import com.nhom586.ktxmanagement.repository.RepairRequestRepository;
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
public class RepairRequestService {

    RepairRequestRepository repairRequestRepository;
    StudentRepository studentRepository;
    RoomRepository roomRepository;
    ContractRepository contractRepository;

    public List<RepairRequest> getAllRepairRequests() {
        return repairRequestRepository.findAll();
    }

    public RepairRequest getRepairRequestById(Integer id) {
        return repairRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Yêu cầu sửa chữa không tồn tại: " + id));
    }

    public List<RepairRequest> getRepairRequestsByStudent(String studentCode) {
        return repairRequestRepository.findByStudentStudentCode(studentCode);
    }

    public List<RepairRequest> getRepairRequestsByRoom(Integer roomId) {
        return repairRequestRepository.findByRoomId(roomId);
    }

    public List<RepairRequest> getRepairRequestsByStatus(RepairRequest.RepairStatus status) {
        return repairRequestRepository.findByStatus(status);
    }

    @Transactional
    public RepairRequest createRepairRequest(RepairRequestCreationRequest request) {
        Student student = studentRepository.findById(request.getStudentCode())
                .orElseThrow(() -> new RuntimeException("Sinh viên không tồn tại: " + request.getStudentCode()));

        Room room = roomRepository.findById(request.getRoomId())
                .orElseThrow(() -> new RuntimeException("Phòng không tồn tại: " + request.getRoomId()));

        // Check if the student is currently staying in the room
        boolean isActiveInRoom = contractRepository.findByStudentStudentCode(request.getStudentCode()).stream()
                .anyMatch(c -> c.getRoom().getId().equals(request.getRoomId()) && c.getStatus() == Contract.ContractStatus.ACTIVE);

        if (!isActiveInRoom) {
            throw new RuntimeException("Sinh viên không có hợp đồng đang hoạt động tại phòng này. Không thể báo hỏng.");
        }

        RepairRequest repairRequest = new RepairRequest();
        repairRequest.setStudent(student);
        repairRequest.setRoom(room);
        repairRequest.setDescription(request.getDescription());
        repairRequest.setStatus(RepairRequest.RepairStatus.PENDING);

        return repairRequestRepository.save(repairRequest);
    }

    @Transactional
    public RepairRequest updateRepairRequestStatus(Integer id, RepairRequestStatusUpdateRequest request) {
        RepairRequest repairRequest = getRepairRequestById(id);
        repairRequest.setStatus(request.getStatus());
        return repairRequestRepository.save(repairRequest);
    }

    public void deleteRepairRequest(Integer id) {
        RepairRequest repairRequest = getRepairRequestById(id);
        repairRequestRepository.delete(repairRequest);
    }
}
