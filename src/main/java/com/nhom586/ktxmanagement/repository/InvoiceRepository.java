package com.nhom586.ktxmanagement.repository;

import com.nhom586.ktxmanagement.entity.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Integer> {
    List<Invoice> findByRoomId(Integer roomId);
    List<Invoice> findByStatus(Invoice.InvoiceStatus status);
    List<Invoice> findByBillingMonth(String billingMonth);
    Optional<Invoice> findByRoomIdAndBillingMonth(Integer roomId, String billingMonth);
    boolean existsByRoomIdAndBillingMonth(Integer roomId, String billingMonth);
}