package com.nhom586.ktxmanagement.service;

import com.nhom586.ktxmanagement.dto.request.AccountCreationRequest;
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
    @Autowired
    private AccountService accountService;

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
            
            // Tự động tạo tài khoản cho sinh viên khi duyệt đơn
            autoCreateAccountForStudent(saved.getStudent());
            
            return saved;
        }

        return registrationRepository.save(registration);
    }

    // Tạo tài khoản tự động cho sinh viên khi đơn được duyệt
    private void autoCreateAccountForStudent(Student student) {
        // Kiểm tra xem sinh viên đã có tài khoản chưa
        if (student.getAccount() != null) {
            return; // Tài khoản đã tồn tại, không tạo lại
        }

        try {
            // Tạo request để tạo tài khoản
            AccountCreationRequest accountRequest = new AccountCreationRequest();
            accountRequest.setUsername(student.getStudentCode()); // Username = StudentCode
            accountRequest.setEmail(student.getEmail()); // Email từ Student
            accountRequest.setPasswordHash(student.getCccd() + "@KTX"); // Password mặc định

            // Gọi AccountService để tạo tài khoản
            accountService.createAccount(accountRequest);
        } catch (RuntimeException e) {
            // Nếu username hoặc email đã tồn tại, log lỗi nhưng không ngắt quy trình approval
            System.err.println("Lỗi tạo tài khoản cho sinh viên " + student.getStudentCode() + ": " + e.getMessage());
        }
    }
}
