package com.nhom586.ktxmanagement.service;

import com.nhom586.ktxmanagement.dto.request.RegistrationCreationRequest;
import com.nhom586.ktxmanagement.dto.request.RegistrationStatusUpdateRequest;
import com.nhom586.ktxmanagement.entity.Registration;
import com.nhom586.ktxmanagement.entity.RegistrationPeriod;
import com.nhom586.ktxmanagement.entity.Room;
import com.nhom586.ktxmanagement.entity.Student;
import com.nhom586.ktxmanagement.repository.RegistrationPeriodRepository;
import com.nhom586.ktxmanagement.repository.RegistrationRepository;
import com.nhom586.ktxmanagement.repository.RoomRepository;
import com.nhom586.ktxmanagement.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class RegistrationService {

    @Autowired
    private RegistrationRepository registrationRepository;
    @Autowired
    private StudentRepository studentRepository;
    @Autowired
    private RegistrationPeriodRepository periodRepository;
    @Autowired
    private RoomRepository roomRepository;
    @Autowired
    private ContractService contractService;

    public List<Registration> getAllRegistrations() {
        return registrationRepository.findAll();
    }

    public Registration getRegistrationById(Integer id) {
        return registrationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Đơn đăng ký không tồn tại"));
    }

    public List<Registration> getRegistrationsByStudent(String studentCode) {
        return registrationRepository.findByStudentStudentCode(studentCode);
    }

    public Registration createRegistration(RegistrationCreationRequest request) {
        Student student = studentRepository.findById(request.getStudentCode())
                .orElseThrow(() -> new RuntimeException("Sinh viên không tồn tại"));

        RegistrationPeriod period = periodRepository.findById(request.getPeriodId())
                .orElseThrow(() -> new RuntimeException("Đợt đăng ký không tồn tại"));

        if (period.getStatus() != RegistrationPeriod.PeriodStatus.OPEN) {
            throw new RuntimeException("Đợt đăng ký đã đóng. Không thể đăng ký mới.");
        }

        if (registrationRepository.existsByPeriodIdAndStudentStudentCode(period.getId(), student.getStudentCode())) {
            throw new RuntimeException("Sinh viên đã có đơn đăng ký cho đợt này rồi.");
        }

        Room requestedRoom = null;
        if (request.getRequestedRoomId() != null) {
            requestedRoom = roomRepository.findById(request.getRequestedRoomId())
                    .orElseThrow(() -> new RuntimeException("Phòng không tồn tại"));
        }

        Registration registration = new Registration();
        registration.setStudent(student);
        registration.setPeriod(period);
        registration.setRequestedRoom(requestedRoom);
        if (request.getRequestType() != null) {
            registration.setRequestType(request.getRequestType());
        }
        registration.setNote(request.getNote());

        registration.setStatus(Registration.RegistrationStatus.PENDING);
        return registrationRepository.save(registration);
    }

    @Transactional
    public Registration updateRegistrationStatus(Integer id, RegistrationStatusUpdateRequest request) {
        Registration registration = getRegistrationById(id);
        registration.setStatus(request.getStatus());
        if (request.getNote() != null) {
            registration.setNote(request.getNote());
        }

        // Khi duyệt đơn (APPROVED), tự động tạo hợp đồng
        if (request.getStatus() == Registration.RegistrationStatus.APPROVED) {
            if (request.getAssignedRoomId() == null) {
                throw new RuntimeException("Vui lòng chỉ định phòng (assignedRoomId) khi duyệt đơn.");
            }
            if (request.getRoomPrice() == null || request.getRoomPrice() <= 0) {
                throw new RuntimeException("Vui lòng nhập giá phòng hợp lệ (roomPrice) khi duyệt đơn.");
            }

            Room assignedRoom = roomRepository.findById(request.getAssignedRoomId())
                    .orElseThrow(() -> new RuntimeException("Phòng được chỉ định không tồn tại: " + request.getAssignedRoomId()));

            // Lưu registration trước, sau đó tạo contract
            Registration saved = registrationRepository.save(registration);
            contractService.createContractFromRegistration(saved, assignedRoom, request.getRoomPrice());
            return saved;
        }

        return registrationRepository.save(registration);
    }
}