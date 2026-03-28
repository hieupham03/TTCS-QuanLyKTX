package com.nhom586.ktxmanagement.repository;

import com.nhom586.ktxmanagement.entity.ServicePrice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ServicePriceRepository extends JpaRepository<ServicePrice, Integer> {
}