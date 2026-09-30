package com.splitflow.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
public class Payment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false)
    private Long groupId;
    @Column(nullable = false)
    private String debtor;
    @Column(nullable = false)
    private String creditor;
    @Column(nullable = false)
    private Double amount;
    @Column(nullable = false)
    private String status = "SETTLED";
    @Column(nullable = false)
    private LocalDateTime settledAt = LocalDateTime.now();

    public Payment() {}
    public Payment(Long groupId, String debtor, String creditor, Double amount) {
        this.groupId = groupId;
        this.debtor = debtor;
        this.creditor = creditor;
        this.amount = amount;
    }
    public Long getId() { return id; }
    public Long getGroupId() { return groupId; }
    public void setGroupId(Long groupId) { this.groupId = groupId; }
    public String getDebtor() { return debtor; }
    public void setDebtor(String debtor) { this.debtor = debtor; }
    public String getCreditor() { return creditor; }
    public void setCreditor(String creditor) { this.creditor = creditor; }
    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDateTime getSettledAt() { return settledAt; }
}
