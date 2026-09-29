package com.splitflow.backend.service;

import com.splitflow.backend.model.Expense;
import com.splitflow.backend.exception.ResourceNotFoundException;
import com.splitflow.backend.model.ExpenseSplit;
import com.splitflow.backend.repository.ExpenseRepository;
import com.splitflow.backend.repository.GroupRepository;
import com.splitflow.backend.repository.ExpenseSplitRepository;
import com.splitflow.backend.repository.GroupMemberRepository;
import com.splitflow.backend.repository.PaymentRepository;
import com.splitflow.backend.model.Payment;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.AbstractMap;
import java.util.HashMap;
import java.util.Map;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Comparator;
import java.util.stream.Collectors;

@Service
public class GroupService {

    @Autowired
    private GroupRepository groupRepository;

    @Autowired
    private ExpenseRepository expenseRepository;

    @Autowired
    private ExpenseSplitRepository expenseSplitRepository;

    @Autowired
    private GroupMemberRepository groupMemberRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Transactional(readOnly = true)
    public Map<String, Object> calculateBalances(Long groupId) {
        Map<String, Double> balances = new HashMap<>();
        if (!groupRepository.existsById(groupId)) {
            return Map.of("balances", balances, "debts", List.of(), "hadDebts", false, "hasExpenses", false);
        }
        
        // 1. Crear un diccionario para traducir UUIDs, IDs o alias al alias oficial del miembro
        Map<String, String> memberAliasMap = new HashMap<>();
        groupMemberRepository.findByGroupId(groupId).forEach(member -> {
            String alias = member.getAlias() != null ? member.getAlias().trim() : "";
            if (!alias.isEmpty()) {
                memberAliasMap.put(alias, alias);
                if (member.getId() != null) {
                    memberAliasMap.put(member.getId().toString(), alias);
                }
            }
        });

        // Inicializar los balances con los alias limpios
        memberAliasMap.values().forEach(alias -> balances.put(alias, 0.0));

        // Gastos y repartos del grupo se leen con una consulta cada uno, no una por gasto
        List<Expense> expenses = expenseRepository.findByGroupId(groupId);
        for (Expense expense : expenses) {
            // Resolver el pagador al alias oficial
            String payer = resolveAlias(memberAliasMap, expense.getPaidBy());
            if (!payer.isBlank()) {
                balances.put(payer, balances.getOrDefault(payer, 0.0) + expense.getAmount());
            }
        }
        for (ExpenseSplit split : expenseSplitRepository.findByGroupIdWithExpense(groupId)) {
            // Resolver cada participante al alias oficial
            String participant = resolveAlias(memberAliasMap, split.getParticipant());
            if (!participant.isBlank()) {
                balances.put(participant, balances.getOrDefault(participant, 0.0) - split.getAmount());
            }
        }

        // Las deudas se simplifican solo con los gastos y cada pago SETTLED que coincide con una deuda mostrada la descuenta,
        // sin tocar las demás. Un pago que ya no coincide con ninguna (gastos posteriores cambiaron el sentido o los pares)
        // se aplica a los saldos y las deudas se recalculan, así el pago nunca se pierde.
        List<Payment> settledPayments = new ArrayList<>(paymentRepository.findByGroupIdAndStatus(groupId, "SETTLED"));
        settledPayments.sort(Comparator.comparing(Payment::getId));
        List<Map<String, Object>> debts = simplify(balances);
        for (Payment payment : settledPayments) {
            String paymentDebtor = resolveAlias(memberAliasMap, payment.getDebtor());
            String paymentCreditor = resolveAlias(memberAliasMap, payment.getCreditor());
            balances.merge(paymentDebtor, payment.getAmount(), Double::sum);
            balances.merge(paymentCreditor, -payment.getAmount(), Double::sum);
            Map<String, Object> settledDebt = debts.stream()
                    .filter(debt -> isSameDebt(debt, paymentDebtor, paymentCreditor, payment.getAmount()))
                    .findFirst().orElse(null);
            if (settledDebt == null) {
                debts = simplify(balances);
                continue;
            }
            double remaining = ((Number) settledDebt.get("amount")).doubleValue() - payment.getAmount();
            if (remaining <= 0.005) {
                debts.remove(settledDebt);
            } else {
                settledDebt.put("amount", Math.round(remaining * 100) / 100.0);
            }
        }

        // Los saldos se devuelven en centavos, sin el ruido de la aritmética de punto flotante
        balances.replaceAll((member, balance) -> Math.round(balance * 100) / 100.0);

        // Hubo deudas si queda alguna pendiente o si alguna ya se saldó
        boolean hadDebts = !debts.isEmpty() || !settledPayments.isEmpty();
        return Map.of("balances", balances, "debts", debts, "hadDebts", hadDebts, "hasExpenses", !expenses.isEmpty());
    }

    // Empareja acreedores y deudores de mayor a menor saldo; no modifica los saldos recibidos
    private static List<Map<String, Object>> simplify(Map<String, Double> balances) {
        List<Map<String, Object>> debts = new ArrayList<>();
        List<Map.Entry<String, Double>> creditors = balances.entrySet().stream().filter(entry -> entry.getValue() > 0.005)
                .sorted(Map.Entry.comparingByValue(Comparator.reverseOrder())).map(GroupService::copyOf)
                .collect(Collectors.toCollection(ArrayList::new));
        List<Map.Entry<String, Double>> debtors = balances.entrySet().stream().filter(entry -> entry.getValue() < -0.005)
                .sorted(Map.Entry.comparingByValue()).map(GroupService::copyOf)
                .collect(Collectors.toCollection(ArrayList::new));

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
        return debts;
    }

    // Una deuda coincide con un pago cuando es el mismo par y el monto difiere a lo sumo un centavo
    private static boolean isSameDebt(Map<?, ?> debt, String debtor, String creditor, double amount) {
        return debtor.equals(debt.get("debtor"))
                && creditor.equals(debt.get("creditor"))
                && Math.abs(amount - ((Number) debt.get("amount")).doubleValue()) <= 0.01;
    }

    // Las entradas de un HashMap escriben sobre el mapa en setValue: el netting necesita copias independientes.
    private static Map.Entry<String, Double> copyOf(Map.Entry<String, Double> entry) {
        return new AbstractMap.SimpleEntry<>(entry);
    }

    private static String resolveAlias(Map<String, String> memberAliasMap, String rawName) {
        String name = rawName != null ? rawName.trim() : "";
        return memberAliasMap.getOrDefault(name, name);
    }

    @Transactional
    public Payment settleDebt(Long groupId, String debtor, String creditor, Double amount) {
        // Bloquea el grupo hasta el commit: dos pagos simultáneos de la misma deuda no pueden registrarse ambos
        groupRepository.findByIdForUpdate(groupId)
                .orElseThrow(() -> new ResourceNotFoundException("Grupo no encontrado"));
        // Se registra el monto pendiente que calcula el servidor: uno recibido con un centavo de diferencia dejaría un saldo fantasma
        double pendingAmount = pendingDebtAmount(groupId, debtor, creditor, amount)
                .orElseThrow(() -> new IllegalArgumentException("La deuda indicada no esta pendiente en este grupo"));
        Payment payment = new Payment(groupId, debtor, creditor, pendingAmount);
        payment.setStatus("SETTLED");
        return paymentRepository.save(payment);
    }

    // Monto pendiente de la deuda que coincide con el par y el monto indicados (con un centavo de tolerancia), si existe
    public Optional<Double> pendingDebtAmount(Long groupId, String debtor, String creditor, Double amount) {
        Object rawDebts = calculateBalances(groupId).get("debts");
        if (!(rawDebts instanceof List<?> debts) || amount == null) return Optional.empty();
        return debts.stream()
                .filter(rawDebt -> rawDebt instanceof Map<?, ?> debt && isSameDebt(debt, debtor, creditor, amount))
                .map(rawDebt -> ((Number) ((Map<?, ?>) rawDebt).get("amount")).doubleValue())
                .findFirst();
    }
}
