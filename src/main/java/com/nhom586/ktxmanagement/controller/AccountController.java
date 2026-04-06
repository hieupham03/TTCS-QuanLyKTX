package com.nhom586.ktxmanagement.controller;


import com.nhom586.ktxmanagement.dto.request.AccountCreationRequest;
import com.nhom586.ktxmanagement.dto.request.AccountUpdateRequest;
import com.nhom586.ktxmanagement.entity.Account;
import com.nhom586.ktxmanagement.service.AccountService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/accounts")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AccountController {
    AccountService accountService;

    @PostMapping
    Account creatAccount(@RequestBody @Valid AccountCreationRequest request){
        return accountService.createAccount(request);
    }

    @PutMapping
    Account updateAccount(@RequestBody @Valid AccountUpdateRequest request, String username) {
        return accountService.updateAccount(request, username);

    }
}
