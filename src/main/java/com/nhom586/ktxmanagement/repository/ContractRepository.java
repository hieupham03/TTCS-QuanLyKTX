package com.nhom586.ktxmanagement.repository;

import com.nhom586.ktxmanagement.entity.Contract;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ContractRepository extends JpaRepository<Contract, Integer> {

    List<Contract> findByStudentStudentCode(String studentCode);

    List<Contract> findByRoomId(Integer roomId);

    List<Contract> findByPeriodId(Integer periodId);

    List<Contract> findByStatus(Contract.ContractStatus status);

    Optional<Contract> findByStudentStudentCodeAndPeriodIdAndStatusNot(
            String studentCode, Integer periodId, Contract.ContractStatus status);

    boolean existsByStudentStudentCodeAndPeriodIdAndStatusNot(
            String studentCode, Integer periodId, Contract.ContractStatus status);
}