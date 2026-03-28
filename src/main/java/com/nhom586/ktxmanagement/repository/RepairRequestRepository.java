package com.nhom586.ktxmanagement.repository;

import com.nhom586.ktxmanagement.entity.RepairRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RepairRequestRepository extends JpaRepository<RepairRequest, Integer> {
}