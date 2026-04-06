package com.nhom586.ktxmanagement.repository;

import com.nhom586.ktxmanagement.entity.Registration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RegistrationRepository extends JpaRepository<Registration, Integer> {
    List<Registration> findByStudentStudentCode(String studentCode);

    boolean existsByPeriodIdAndStudentStudentCode(Integer periodId, String studentCode);
}