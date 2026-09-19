package com.splitflow.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public class SettlePaymentRequest {
    @NotBlank(message = "El deudor es obligatorio")
    private String debtor;

    @NotBlank(message = "El acreedor es obligatorio")
    private String creditor;

    @NotNull(message = "El monto es obligatorio")
    @Positive(message = "El monto debe ser mayor a $0")
    private Double amount;

    public String getDebtor() { return debtor; }
    public void setDebtor(String debtor) { this.debtor = debtor; }
    public String getCreditor() { return creditor; }
    public void setCreditor(String creditor) { this.creditor = creditor; }
    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }
}