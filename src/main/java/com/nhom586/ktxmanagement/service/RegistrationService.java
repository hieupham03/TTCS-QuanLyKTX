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

    public Registration updateRegistrationStatus(Integer id, RegistrationStatusUpdateRequest request) {
        Registration registration = getRegistrationById(id);
        registration.setStatus(request.getStatus());
        if (request.getNote() != null) {
            registration.setNote(request.getNote());
        }

        // Logic mở rộng: Khi Status == APPROVED -> có thể gọi tạo Contract (Tuần 3)
        return registrationRepository.save(registration);
    }
}