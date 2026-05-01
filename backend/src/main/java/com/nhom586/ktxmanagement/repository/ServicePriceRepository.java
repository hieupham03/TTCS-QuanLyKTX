package com.nhom586.ktxmanagement.repository;

import com.nhom586.ktxmanagement.entity.ServicePrice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ServicePriceRepository extends JpaRepository<ServicePrice, Integer> {
    Optional<ServicePrice> findByType(String type);
}