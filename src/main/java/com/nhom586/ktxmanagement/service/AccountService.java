package com.nhom586.ktxmanagement.service;


import com.nhom586.ktxmanagement.dto.request.AccountCreationRequest;
import com.nhom586.ktxmanagement.dto.request.AccountUpdateRequest;
import com.nhom586.ktxmanagement.entity.Account;
import com.nhom586.ktxmanagement.entity.Role;
import com.nhom586.ktxmanagement.mapper.AccountMapper;
import com.nhom586.ktxmanagement.repository.*;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

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

        if(accountRepository.existsByEmail(request.getEmail()))
            throw  new RuntimeException("Email đã tồn tại");


        Account account = accountMapper.toAccount(request);

        Role studentRole = roleRepository.findById(2)
                .orElseThrow(() -> new RuntimeException("role không tồn tại"));

        account.setRole(studentRole);
        account.setIsActive(true);


        // mã hoá mật khẩu
        account.setPasswordHash(passwordEncoder.encode(request.getPasswordHash()));

        return accountRepository.save(account);
    }

    public Account getAccountByUsername (String username) {
        return accountRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Tài khoản không tồn tại với username: " + username));
    }

    public List<Account> getAccounts() {
        return accountRepository.findAll();
    }

    public Account getAccountById(Integer id) {
        return accountRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tài khoản không tồn tại với id: " + id));
    }

    public Account updateAccount(AccountUpdateRequest request, String username) {
        Account account = getAccountByUsername(username);

        accountMapper.updateAccount(account, request);

        return accountRepository.save(account);

    }
}