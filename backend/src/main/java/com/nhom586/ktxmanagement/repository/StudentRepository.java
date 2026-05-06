package com.nhom586.ktxmanagement.repository;

import com.nhom586.ktxmanagement.entity.Account;
import com.nhom586.ktxmanagement.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, String> {

    Boolean  existsByEmail(String email);
    Boolean  existsByCccd(String cccd);

    @Modifying
    @Query(value = "DELETE FROM students WHERE account_id IS NULL", nativeQuery = true)
    void deleteStudentsWithoutAccount();
}