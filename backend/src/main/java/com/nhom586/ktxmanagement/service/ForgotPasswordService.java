package com.nhom586.ktxmanagement.service;


import com.nhom586.ktxmanagement.dto.request.ChangePasswordRequest;
import com.nhom586.ktxmanagement.dto.response.MailBodyResponse;
import com.nhom586.ktxmanagement.entity.Account;
import com.nhom586.ktxmanagement.entity.ForgotPassword;
import com.nhom586.ktxmanagement.repository.AccountRepository;
import com.nhom586.ktxmanagement.repository.ForgotPasswordRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.Random;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ForgotPasswordService {

    ForgotPasswordRepository forgotPasswordRepository;

    AccountRepository accountRepository;

    JavaMailSender javaMailSender;

    PasswordEncoder passwordEncoder;

    @NonFinal
    @Value("${spring.mail.username}")
    private String emailName;


    public void verifyMail (String email) {
        Account account = accountRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tồn tại tài khoản với email: " + email));

        Integer otp = generateOtp();

        // Xóa OTP cũ nếu có
        forgotPasswordRepository.deleteByAccount(account);

        // Lưu OTP mới vào DB - commit ngay lập tức (không dùng @Transactional bao ngoài)
        ForgotPassword forgotPassword = ForgotPassword.builder()
                .otp(otp)
                .expirationTime(new Date(Instant.now().plus(5, ChronoUnit.MINUTES).toEpochMilli()))
                .account(account)
                .build();
        forgotPasswordRepository.saveAndFlush(forgotPassword);

        // Gửi mail SAU KHI đã commit vào DB
        MailBodyResponse response = MailBodyResponse.builder()
                .to(email)
                .subject("[PTIT-KTX] Mã xác nhận đặt lại mật khẩu")
                .content(String.format("Mã OTP của bạn là: %s\n\nMã có hiệu lực trong 5 phút. Không chia sẻ mã này với ai.", otp))
                .build();

        try {
            sendMail(response);
        } catch (Exception e) {
            // Mail thất bại nhưng OTP đã được lưu - người dùng có thể thử gửi lại
            throw new RuntimeException("Gửi email thất bại, vui lòng kiểm tra lại email hoặc thử lại sau.");
        }
    }

    public void verifyOtp (String email, Integer otp) {
        Account account = accountRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không  tồn tại tài khoản với email: " + email));

        // Tìm kiếm bản ghi của otp
        System.out.println("Checking OTP for email: " + email + " with value: " + otp);
        ForgotPassword fp = forgotPasswordRepository.findByAccountAndOtp(account, otp)
                .orElseThrow(() -> {
                    System.out.println("OTP Record not found for account: " + account.getUsername() + " and OTP: " + otp);
                    return new RuntimeException("Mã OTP không chính xác.");
                });

        // Kiểm tra thời hạn của Otp
        Date expirationTime = fp.getExpirationTime();
        if(expirationTime.before(Date.from(Instant.now()))) {
            forgotPasswordRepository.deleteById(fp.getId());
            throw new RuntimeException("Mã OTP đã hết hiệu lực");
        }
    }

    public void changePassword(ChangePasswordRequest request, String email) {
        Account account = accountRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không  tồn tại tài khoản với email: " + email));

        if(!request.getPassword().equals(request.getRepeatPassword()))
            throw new RuntimeException("Mật khẩu không khớp. Vui lòng nhập lại!");

        String password = passwordEncoder.encode(request.getPassword());

        account.setPasswordHash(password);

        accountRepository.save(account);
    }

    private Integer generateOtp() {
        Random random  = new Random();

        return random.nextInt(100000, 999999);
    }

    private void sendMail (MailBodyResponse response) {
        SimpleMailMessage simpleMailMessage = new SimpleMailMessage();

        simpleMailMessage.setFrom(emailName);
        simpleMailMessage.setTo(response.getTo());
        simpleMailMessage.setSubject(response.getSubject());
        simpleMailMessage.setText(response.getContent());

        javaMailSender.send(simpleMailMessage);
    }
}
