package com.splitflow.backend.dto;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public class CreateExpenseRequest {
    private String description;
    private Double amount;
    private String paidBy;
    private LocalDate expenseDate;
    private List<String> participants;
    private String splitMethod;
    private Map<String, Double> allocations;

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }
    public String getPaidBy() { return paidBy; }
    public void setPaidBy(String paidBy) { this.paidBy = paidBy; }
    public LocalDate getExpenseDate() { return expenseDate; }
    public void setExpenseDate(LocalDate expenseDate) { this.expenseDate = expenseDate; }
    public List<String> getParticipants() { return participants; }
    public void setParticipants(List<String> participants) { this.participants = participants; }
    public String getSplitMethod() { return splitMethod; }
    public void setSplitMethod(String splitMethod) { this.splitMethod = splitMethod; }
    public Map<String, Double> getAllocations() { return allocations; }
    public void setAllocations(Map<String, Double> allocations) { this.allocations = allocations; }
}
