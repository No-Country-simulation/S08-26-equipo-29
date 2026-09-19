package com.splitflow.backend.dto;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public class CreateExpenseRequest {
    @NotBlank(message = "La descripción es obligatoria")
    @Size(max = 80, message = "La descripción no puede superar 80 caracteres")
    private String description;

    @NotNull(message = "El monto es obligatorio")
    @Positive(message = "El monto debe ser mayor a $0")
    private Double amount;

    @NotBlank(message = "El pagador es obligatorio")
    private String paidBy;

    @PastOrPresent(message = "La fecha no puede ser futura")
    private LocalDate expenseDate;

    @NotEmpty(message = "Debes seleccionar al menos un participante")
    @Size(max = 50, message = "No puedes seleccionar más de 50 participantes")
    private List<String> participants;

    @Pattern(regexp = "EQUAL|BY_AMOUNT", flags = Pattern.Flag.CASE_INSENSITIVE,
            message = "El método de división debe ser EQUAL o BY_AMOUNT")
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
