package com.nhom586.ktxmanagement.controller;


import com.nhom586.ktxmanagement.dto.request.ChangePasswordRequest;
import com.nhom586.ktxmanagement.service.ForgotPasswordService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/forgotPassword")
public class ForgotPasswordController {

    @Autowired
    private ForgotPasswordService  forgotPasswordService;

    @PostMapping("/verifyMail/{email}")
    public String verifyMail (@Valid @PathVariable("email") String email) {
        forgotPasswordService.verifyMail(email);

        return "Gửi mail thành công";
    }

    @PostMapping("/verifyOtp/{email}/{otp}")
    public String verifyOtp(@Valid @PathVariable("email") String email, @PathVariable("otp") Integer otp){
        forgotPasswordService.verifyOtp(email, otp);

        return "Xác thực OTP thành công";
    }

    @PostMapping("changePassword/{email}")
        public String changePassword(@Valid @RequestBody ChangePasswordRequest request, @PathVariable("email") String email) {
            forgotPasswordService.changePassword(request, email);

            return "Thay đổi mật khẩu thành công";
        }
}
