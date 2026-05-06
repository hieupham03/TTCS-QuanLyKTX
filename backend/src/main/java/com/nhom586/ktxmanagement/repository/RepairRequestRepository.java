package com.nhom586.ktxmanagement.repository;

import com.nhom586.ktxmanagement.entity.RepairRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RepairRequestRepository extends JpaRepository<RepairRequest, Integer> {
    List<RepairRequest> findByStudentStudentCode(String studentCode);
    List<RepairRequest> findByRoomId(Integer roomId);
    List<RepairRequest> findByStatus(RepairRequest.RepairStatus status);

    long countByStatus(RepairRequest.RepairStatus status);
}