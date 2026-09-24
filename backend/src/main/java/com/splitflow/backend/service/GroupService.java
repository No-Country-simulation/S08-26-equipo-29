package com.splitflow.backend.service;

import com.splitflow.backend.model.Expense;
import com.splitflow.backend.model.Group;
import com.splitflow.backend.repository.GroupRepository;
import com.splitflow.backend.repository.ExpenseSplitRepository;
import com.splitflow.backend.repository.GroupMemberRepository;
import com.splitflow.backend.repository.PaymentRepository;
import com.splitflow.backend.model.Payment;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.ArrayList;
import java.util.List;
import java.util.Comparator;
import java.util.stream.Collectors;

@Service
public class GroupService {

    @Autowired
    private GroupRepository groupRepository;

    @Autowired
    private ExpenseSplitRepository expenseSplitRepository;

    @Autowired
    private GroupMemberRepository groupMemberRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    public Map<String, Object> calculateBalances(Long groupId) {
        Group group = groupRepository.findById(groupId).orElse(null);
        Map<String, Double> balances = new HashMap<>();
        if (group == null) {
            return Map.of("balances", balances, "debts", List.of(), "hadDebts", false, "hasExpenses", false);
        }
        groupMemberRepository.findByGroupId(groupId).forEach(member -> balances.put(member.getAlias(), 0.0));
        if (group.getExpenses() != null) {
            for (Expense expense : group.getExpenses()) {
                if (expense == null) continue;
                String payer = expense.getPaidBy();
                if (payer != null && !payer.isBlank()) {
                    balances.put(payer, balances.getOrDefault(payer, 0.0) + expense.getAmount());
                }
                expenseSplitRepository.findByExpenseId(expense.getId()).forEach(split ->
                        balances.put(split.getParticipant(), balances.getOrDefault(split.getParticipant(), 0.0) - split.getAmount()));
            }
        }
        
        List<Map<String, Object>> debts = new ArrayList<>();
        List<Map.Entry<String, Double>> creditors = balances.entrySet().stream().filter(entry -> entry.getValue() > 0.005)
                .sorted(Map.Entry.comparingByValue(Comparator.reverseOrder())).collect(Collectors.toCollection(ArrayList::new));
        List<Map.Entry<String, Double>> debtors = balances.entrySet().stream().filter(entry -> entry.getValue() < -0.005)
                .sorted(Map.Entry.comparingByValue()).collect(Collectors.toCollection(ArrayList::new));
        
        int creditorIndex = 0;
        int debtorIndex = 0;
        while (creditorIndex < creditors.size() && debtorIndex < debtors.size()) {
            Map.Entry<String, Double> creditor = creditors.get(creditorIndex);
            Map.Entry<String, Double> debtor = debtors.get(debtorIndex);
            double amount = Math.min(creditor.getValue(), -debtor.getValue());
            
            debts.add(new HashMap<>(Map.of(
                "debtor", debtor.getKey(), 
                "creditor", creditor.getKey(), 
                "amount", Math.round(amount * 100) / 100.0, 
                "status", "PENDING"
            )));
            
            creditor.setValue(creditor.getValue() - amount);
            debtor.setValue(debtor.getValue() + amount);
            if (creditor.getValue() <= 0.005) creditorIndex++;
            if (debtor.getValue() >= -0.005) debtorIndex++;
        }

        // Procesar pagos SETTLED (soporta pagos parciales o totales de forma flexible)
        List<Payment> settledPayments = paymentRepository.findByGroupIdAndStatus(groupId, "SETTLED");
        for (Payment payment : settledPayments) {
            String pDebtor = payment.getDebtor();
            String pCreditor = payment.getCreditor();
            double paidAmount = payment.getAmount();

            for (Map<String, Object> debt : debts) {
                if (pDebtor.equals(debt.get("debtor")) && pCreditor.equals(debt.get("creditor"))) {
                    double currentDebtAmount = ((Number) debt.get("amount")).doubleValue();
                    double newAmount = currentDebtAmount - paidAmount;
                    if (newAmount <= 0.005) {
                        debt.put("amount", 0.0);
                    } else {
                        debt.put("amount", Math.round(newAmount * 100) / 100.0);
                    }
                }
            }
        }

        // Remover deudas que ya quedaron en 0 (completamente saldadas)
        debts.removeIf(debt -> ((Number) debt.get("amount")).doubleValue() <= 0.005);

        boolean hadDebts = !debts.isEmpty();
        return Map.of("balances", balances, "debts", debts, "hadDebts", hadDebts, "hasExpenses", group.getExpenses() != null && !group.getExpenses().isEmpty());
    }

    public boolean isPendingDebt(Long groupId, String debtor, String creditor, Double amount) {
        Map<String, Object> summary = calculateBalances(groupId);
        Object rawDebts = summary.get("debts");
        if (!(rawDebts instanceof List<?> debts)) return false;
        return debts.stream().anyMatch(rawDebt -> {
            if (!(rawDebt instanceof Map<?, ?> debt)) return false;
            return debtor.equals(debt.get("debtor"))
                    && creditor.equals(debt.get("creditor"))
                    && amount != null
                    && Math.abs(amount - ((Number) debt.get("amount")).doubleValue()) <= 0.01;
        });
    }
}