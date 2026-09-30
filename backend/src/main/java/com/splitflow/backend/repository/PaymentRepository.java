package com.splitflow.backend.repository;

import com.splitflow.backend.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByGroupIdAndStatus(Long groupId, String status);
}
