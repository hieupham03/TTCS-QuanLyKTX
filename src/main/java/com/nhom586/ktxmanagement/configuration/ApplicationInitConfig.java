package com.nhom586.ktxmanagement.configuration;

import com.nhom586.ktxmanagement.entity.Account;
import com.nhom586.ktxmanagement.entity.Role;
import com.nhom586.ktxmanagement.repository.AccountRepository;
import com.nhom586.ktxmanagement.repository.RoleRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ApplicationInitConfig {
    PasswordEncoder passwordEncoder;
    RoleRepository roleRepository;


    // tạo tài khoản admin mỗi khi chạy ứng dụng
    @Bean
    ApplicationRunner applicationRunner(AccountRepository accountRepository) {
        return args -> {
            if(!accountRepository.existsByUsername("admin")) {

                Role role = roleRepository.findById(1).
                        orElseThrow();

                Account account = Account.builder()
                        .username("admin")
                        .passwordHash(passwordEncoder.encode("admin@123"))
                        .role(role)
                        .email("admin1@gmail.com")
                        .isActive(true)
                        .build();

                accountRepository.save(account);
            }
        };
    }
}
