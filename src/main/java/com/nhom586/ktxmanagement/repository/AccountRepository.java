package com.nhom586.ktxmanagement.repository;

import com.nhom586.ktxmanagement.entity.Account;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AccountRepository extends JpaRepository<Account, Integer> {
    //kiểm tra username có tồn tại không
    boolean existsByUsername(String username);

    Optional<Account> findByUsername(String username);
}