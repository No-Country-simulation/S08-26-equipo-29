package com.splitflow.backend.controller;

import com.splitflow.backend.model.Expense;
import com.splitflow.backend.dto.CreateExpenseRequest;
import com.splitflow.backend.service.ExpenseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:5173")
public class ExpenseController {

    private final ExpenseService expenseService;

    @Autowired
    public ExpenseController(ExpenseService expenseService) {
        this.expenseService = expenseService;
    }

    @GetMapping("/expenses")
    public List<Expense> getAllExpenses() {
        return expenseService.findAll();
    }

    @GetMapping("/groups/{groupId}/expenses")
    public List<Expense> getGroupExpenses(@PathVariable Long groupId) {
        return expenseService.findByGroupId(groupId);
    }

    @PostMapping("/groups/{groupId}/expenses")
    public ResponseEntity<?> createExpense(@PathVariable Long groupId, @RequestBody CreateExpenseRequest request) {
        try {
            return ResponseEntity.ok(expenseService.create(groupId, request));
        } catch (IllegalArgumentException exception) {
            return ResponseEntity.badRequest().body(exception.getMessage());
        }
    }
}