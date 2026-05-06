package com.nhom586.ktxmanagement.repository;

import com.nhom586.ktxmanagement.entity.Account;
import com.nhom586.ktxmanagement.entity.ForgotPassword;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;


import java.util.Optional;

@Repository
public interface ForgotPasswordRepository extends JpaRepository<ForgotPassword, String> {

    @Transactional
    @Modifying
    @Query("DELETE FROM ForgotPassword fp WHERE fp.account= :account")
    void deleteByAccount(Account account);

    @Query("SELECT fp FROM ForgotPassword fp WHERE fp.account= :account and fp.otp= :otp")
    Optional<ForgotPassword>  findByAccountAndOtp (Account account, Integer otp);
}
