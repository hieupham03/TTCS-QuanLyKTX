package com.nhom586.ktxmanagement.repository;

import com.nhom586.ktxmanagement.entity.ServiceMetric;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ServiceMetricRepository extends JpaRepository<ServiceMetric, Integer> {
    List<ServiceMetric> findByRoomId(Integer roomId);
    Optional<ServiceMetric> findByRoomIdAndBillingMonth(Integer roomId, String billingMonth);
}