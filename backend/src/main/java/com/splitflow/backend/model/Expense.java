package com.splitflow.backend.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Entity
@Table(name = "expenses")
public class Expense {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String description;
    private Double amount;
    private String paidBy; // <-- Falta declarar este atributo

    private LocalDate expenseDate;

    @Transient
    private List<String> participants;

    @Transient
    private String splitMethod;

    @Transient
    private Map<String, Double> allocations;

    @OneToMany(mappedBy = "expense", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ExpenseSplit> splits;

    @ManyToOne
    @JoinColumn(name = "group_id")
    private Group group;

    public Expense() {}

    public Expense(String description, Double amount, String paidBy, Group group) {
        this.description = description;
        this.amount = amount;
        this.paidBy = paidBy;
        this.group = group;
    }

    // Getters y Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

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
    public List<ExpenseSplit> getSplits() { return splits; }
    public void setSplits(List<ExpenseSplit> splits) { this.splits = splits; }

    public Group getGroup() { return group; }
    public void setGroup(Group group) { this.group = group; }
}