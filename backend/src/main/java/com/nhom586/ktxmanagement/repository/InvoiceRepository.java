package com.nhom586.ktxmanagement.repository;

import com.nhom586.ktxmanagement.entity.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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

    long countByStatus(Invoice.InvoiceStatus status);
    long countByStatusAndBillingMonth(Invoice.InvoiceStatus status, String billingMonth);

    @Query("SELECT COALESCE(SUM(i.totalAmount), 0) FROM Invoice i WHERE i.status = :status")
    Integer sumTotalAmountByStatus(@Param("status") Invoice.InvoiceStatus status);

    @Query("SELECT COALESCE(SUM(i.totalAmount), 0) FROM Invoice i WHERE i.status = :status AND i.billingMonth = :billingMonth")
    Integer sumTotalAmountByStatusAndBillingMonth(@Param("status") Invoice.InvoiceStatus status, @Param("billingMonth") String billingMonth);

}