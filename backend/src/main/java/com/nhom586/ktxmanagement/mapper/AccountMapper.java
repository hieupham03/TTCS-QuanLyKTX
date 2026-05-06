package com.nhom586.ktxmanagement.mapper;


import com.nhom586.ktxmanagement.dto.request.AccountCreationRequest;
import com.nhom586.ktxmanagement.dto.request.AccountUpdateRequest;
import com.nhom586.ktxmanagement.entity.Account;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface AccountMapper {
    Account toAccount(AccountCreationRequest request);
    void updateAccount (@MappingTarget  Account account,AccountUpdateRequest request);
}
