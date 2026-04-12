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
                .orElseThrow(() -> new RuntimeException("Không  tồn tại tài khoản với email: " + email));

        Integer otp = generateOtp();

        forgotPasswordRepository.deleteByAccount(account);

        ForgotPassword forgotPassword = ForgotPassword.builder()
                .otp(otp)
                .expirationTime(new Date(Instant.now().plus(1, ChronoUnit.MINUTES).toEpochMilli()))
                .account(account)
                .build();

        forgotPasswordRepository.save(forgotPassword);

        MailBodyResponse response = MailBodyResponse.builder()
                .to(email)
                .subject("Reset Password")
                .content(String.format("Đây là mã OTP cho yêu cầu quên  mật khẩu: %s.\n\nMã OTP có hiệu lực 5 phút.", otp))
                .build();

        sendMail(response);
    }

    public void verifyOtp (String email, Integer otp) {
        Account account = accountRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không  tồn tại tài khoản với email: " + email));

        // Tìm kiếm bản ghi của  otp
        ForgotPassword fp = forgotPasswordRepository.findByAccountAndOtp(account, otp)
                .orElseThrow(() -> new RuntimeException("bản ghi không tồn tại"));

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

    public void sendMail (MailBodyResponse response) {
        SimpleMailMessage simpleMailMessage = new SimpleMailMessage();

        simpleMailMessage.setFrom(emailName);
        simpleMailMessage.setTo(response.getTo());
        simpleMailMessage.setSubject(response.getSubject());
        simpleMailMessage.setText(response.getContent());

        javaMailSender.send(simpleMailMessage);
    }
}
