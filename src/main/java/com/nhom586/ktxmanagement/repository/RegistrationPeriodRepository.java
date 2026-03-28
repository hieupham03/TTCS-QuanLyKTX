package com.nhom586.ktxmanagement.repository;

import com.nhom586.ktxmanagement.entity.RegistrationPeriod;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RegistrationPeriodRepository extends JpaRepository<RegistrationPeriod, Integer> {
}