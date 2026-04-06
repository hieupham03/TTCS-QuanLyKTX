package com.nhom586.ktxmanagement.service;


import com.nhom586.ktxmanagement.dto.request.AccountCreationRequest;
import com.nhom586.ktxmanagement.dto.request.AccountUpdateRequest;
import com.nhom586.ktxmanagement.entity.Account;
import com.nhom586.ktxmanagement.entity.Role;
import com.nhom586.ktxmanagement.mapper.AccountMapper;
import com.nhom586.ktxmanagement.repository.AccountRepository;
import com.nhom586.ktxmanagement.repository.RoleRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AccountService {
    AccountRepository accountRepository;
    AccountMapper accountMapper;
    RoleRepository roleRepository;
    PasswordEncoder passwordEncoder;

    public Account createAccount(AccountCreationRequest request){
        if(accountRepository.existsByUsername(request.getUsername()))
            throw new RuntimeException("username đã tồn tại");

        Account account = accountMapper.toAccount(request);

        Role studentRole = roleRepository.findById(2)
                .orElseThrow(() -> new RuntimeException("role không tồn tại"));

        account.setRole(studentRole);

        // mã hoá mật khẩu
        account.setPasswordHash(passwordEncoder.encode(request.getPasswordHash()));

        return accountRepository.save(account);
    }

    private Account getAccount (String username) {
        return accountRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Tên tài khoản không tồn tại"));
    }

    public Account updateAccount(AccountUpdateRequest request, String username) {
        Account account = getAccount(username);

        accountMapper.updateAccount(request, username);

        return accountRepository.save(account);

    }
}
