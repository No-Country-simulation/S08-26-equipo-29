package com.splitflow.backend.repository;

import com.splitflow.backend.model.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, Long> {
	java.util.List<Expense> findByGroupId(Long groupId);
}