package com.nhom586.ktxmanagement.service;

import com.nhom586.ktxmanagement.dto.request.AccountCreationRequest;
import com.nhom586.ktxmanagement.dto.request.RegistrationCreationRequest;
import com.nhom586.ktxmanagement.dto.request.RegistrationStatusUpdateRequest;
import com.nhom586.ktxmanagement.dto.response.MailBodyResponse;
import com.nhom586.ktxmanagement.entity.*;
import com.nhom586.ktxmanagement.repository.RegistrationPeriodRepository;
import com.nhom586.ktxmanagement.repository.RegistrationRepository;
import com.nhom586.ktxmanagement.repository.RoomRepository;
import com.nhom586.ktxmanagement.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
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
    @Autowired
    private ForgotPasswordService forgotPasswordService;
    @Autowired
    private PasswordEncoder passwordEncoder;

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
    @Transactional
    private void autoCreateAccountForStudent(Student student) {
        Account existingAccount = student.getAccount();

        // Kiểm tra xem sinh viên đã có tài khoản chưa
        if (existingAccount != null) {
            if(!existingAccount.getIsActive())
                existingAccount.setIsActive(true);
            MailBodyResponse response = MailBodyResponse.builder()
                    .to(student.getEmail())
                    .subject("Thông tin tài khoản ký túc xá")
                    .content("Chào bạn," + student.getFullName() +
                            "\n\nChúng tôi xin thông báo rằng đơn đăng ký ở ký túc xá của bạn đã được phê duyệt.\n" +
                            "Bạn có thể sử dụng tài khoản đã được cấp để đăng nhập vào hệ thống.\n\n" +
                            "Nếu cần hỗ trợ thêm, vui lòng liên hệ với ban quản lý ký túc xá.\n\n" +
                            "Trân trọng!")
                    .build();
            return;
        }

        try {
            String username = student.getStudentCode();
            String password = student.getCccd() + "@KTX";

            AccountCreationRequest accountRequest = new AccountCreationRequest();
            accountRequest.setUsername(username);
            accountRequest.setEmail(student.getEmail());
            accountRequest.setPasswordHash(passwordEncoder.encode(password));

            //tạo tài khoản
            Account createdAccount =accountService.createAccount(accountRequest);

            student.setAccount(createdAccount);


            //Gửi mail thông tin tài khoản và mật khẩu cho sinh viên
            MailBodyResponse response = MailBodyResponse.builder()
                    .to(student.getEmail())
                    .subject("Thông tin tài khoản ký túc xá")
                    .content("Chào bạn, " + student.getFullName() +
                            "\n\nChúng tôi xin thông báo rằng đơn đăng ký ở ký túc xá của bạn đã được phê duyệt.\n" +
                            "Đây là thông tin đăng nhập của bạn:\n" +
                            "Tên tài khoản: " + username +
                            "Mật khẩu:" + password +
                            "TRÂN TRỌNG")
                    .build();

            forgotPasswordService.sendMail(response);

        } catch (RuntimeException e) {
            System.err.println("Lỗi tạo tài khoản cho sinh viên " + student.getStudentCode() + ": " + e.getMessage());
        }
    }

    public void deleteRegistration(Integer id) {
        Registration registration = getRegistrationById(id);
        registrationRepository.delete(registration);
    }
}
