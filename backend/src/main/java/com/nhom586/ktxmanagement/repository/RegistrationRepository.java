package com.nhom586.ktxmanagement.repository;

import com.nhom586.ktxmanagement.entity.Registration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RegistrationRepository extends JpaRepository<Registration, Integer> {
    List<Registration> findByStudentStudentCode(String studentCode);

    boolean existsByPeriodIdAndStudentStudentCode(Integer periodId, String studentCode);

    long countByStatus(Registration.RegistrationStatus status);

    @Modifying
    @Query(value = "DELETE FROM registrations WHERE student_code IN (SELECT student_code FROM students WHERE account_id IS NULL)", nativeQuery = true)
    void deleteRegistrationsOfStudentsWithoutAccount();
}