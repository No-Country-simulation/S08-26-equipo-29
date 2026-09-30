package com.splitflow.backend.repository;

import com.splitflow.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    // Spring Data JPA ya nos provee métodos como save(), findAll(), findById(), etc.
}