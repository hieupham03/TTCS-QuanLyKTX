package com.nhom586.ktxmanagement.controller;


import com.nhom586.ktxmanagement.dto.request.AccountUpdateRequest;
import com.nhom586.ktxmanagement.entity.Account;
import com.nhom586.ktxmanagement.service.AccountService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/accounts")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AccountController {
    AccountService accountService;


    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    List<Account> getAccounts () {
        return accountService.getAccounts();
    }


    // admin có thể truy cập
    // hoặc người dùng có thể xem của chính mình
    @PreAuthorize("hasRole('ADMIN') or returnObject.username == authentication.name")
    @GetMapping("/{id}")
    Account getAccountById (@Valid @PathVariable("id") Integer id){
        return accountService.getAccountById(id);
    }

    @PreAuthorize("hasRole('ADMIN') or returnObject.username == authentication.name")
    @GetMapping("/{username}")
    Account getAccountByUsername(@Valid @PathVariable("username") String username) {
        return accountService.getAccountByUsername(username);
    }


    // Chỉ sinh viên mới có thể cập nhật thông tin tài khoản của mình
    @PreAuthorize("#username == principal.claims['username'] and hasRole('STUDENT')")
    @PutMapping("/{username}")
    Account updateAccount(@Valid @PathVariable("username") String username, @RequestBody AccountUpdateRequest request) {
        return accountService.updateAccount(request, username);
    }

}
