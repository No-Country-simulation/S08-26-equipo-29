package com.splitflow.backend.service;

import com.splitflow.backend.model.Expense;
import com.splitflow.backend.model.Group;
import com.splitflow.backend.model.Payment;
import com.splitflow.backend.repository.ExpenseSplitRepository;
import com.splitflow.backend.repository.GroupMemberRepository;
import com.splitflow.backend.repository.GroupRepository;
import com.splitflow.backend.repository.PaymentRepository;
import java.io.Serializable;
import java.util.AbstractMap;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

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

   public GroupService() {
   }

   public Map<String, Object> calculateBalances(Long groupId) {
      Group group = this.groupRepository.findById(groupId).orElse(null);
      Map<String, Double> balances = new HashMap();
      if (group == null) {
         return Map.of("balances", balances, "debts", List.of(), "hadDebts", false, "hasExpenses", false);
      } else {
         Map<String, String> memberAliasMap = new HashMap();
         this.groupMemberRepository.findByGroupId(groupId).forEach((member) -> {
            String alias = member.getAlias() != null ? member.getAlias().trim() : "";
            if (!alias.isEmpty()) {
               memberAliasMap.put(alias, alias);
               if (member.getId() != null) {
                  memberAliasMap.put(member.getId().toString(), alias);
               }
            }

         });
         memberAliasMap.values().forEach((alias) -> balances.put(alias, (double)0.0F));
         if (group.getExpenses() != null) {
            for(Expense expense : group.getExpenses()) {
               if (expense != null) {
                  String rawPayer = expense.getPaidBy() != null ? expense.getPaidBy().trim() : "";
                  String payer = (String)memberAliasMap.getOrDefault(rawPayer, rawPayer);
                  if (!payer.isBlank()) {
                     balances.put(payer, (Double)balances.getOrDefault(payer, (double)0.0F) + expense.getAmount());
                  }

                  this.expenseSplitRepository.findByExpenseId(expense.getId()).forEach((split) -> {
                     String rawParticipant = split.getParticipant() != null ? split.getParticipant().trim() : "";
                     String participant = (String)memberAliasMap.getOrDefault(rawParticipant, rawParticipant);
                     if (!participant.isBlank()) {
                        balances.put(participant, (Double)balances.getOrDefault(participant, (double)0.0F) - split.getAmount());
                     }

                  });
               }
            }
         }

         List<Map<String, Object>> debts = new ArrayList();

         // FIX: antes se armaban estas listas directamente sobre balances.entrySet(),
         // y las Map.Entry que entrega entrySet() en un HashMap estan "conectadas" al
         // mapa original: llamar entry.setValue(...) mas abajo (en el algoritmo de
         // simplificacion de deudas) terminaba escribiendo directamente sobre
         // `balances`, vaciandolo a 0 como efecto secundario. Ahora se copian los
         // valores a entries independientes (AbstractMap.SimpleEntry) para que el
         // algoritmo pueda mutarlas libremente sin tocar el mapa que se devuelve.
         List<Map.Entry<String, Double>> creditors = (List)balances.entrySet().stream()
            .filter((entry) -> (Double)entry.getValue() > 0.005)
            .map((entry) -> (Map.Entry<String, Double>) new AbstractMap.SimpleEntry<>(entry.getKey(), entry.getValue()))
            .sorted(Entry.comparingByValue(Comparator.reverseOrder()))
            .collect(Collectors.toCollection(ArrayList::new));
         List<Map.Entry<String, Double>> debtors = (List)balances.entrySet().stream()
            .filter((entry) -> (Double)entry.getValue() < -0.005)
            .map((entry) -> (Map.Entry<String, Double>) new AbstractMap.SimpleEntry<>(entry.getKey(), entry.getValue()))
            .sorted(Entry.comparingByValue())
            .collect(Collectors.toCollection(ArrayList::new));

         int creditorIndex = 0;
         int debtorIndex = 0;

         while(creditorIndex < creditors.size() && debtorIndex < debtors.size()) {
            Map.Entry<String, Double> creditor = (Map.Entry)creditors.get(creditorIndex);
            Map.Entry<String, Double> debtor = (Map.Entry)debtors.get(debtorIndex);
            double amount = Math.min((Double)creditor.getValue(), -(Double)debtor.getValue());
            debts.add(new HashMap(Map.of("debtor", (Serializable)debtor.getKey(), "creditor", (Serializable)creditor.getKey(), "amount", (double)Math.round(amount * (double)100.0F) / (double)100.0F, "status", "PENDING")));
            creditor.setValue((Double)creditor.getValue() - amount);
            debtor.setValue((Double)debtor.getValue() + amount);
            if ((Double)creditor.getValue() <= 0.005) {
               ++creditorIndex;
            }

            if ((Double)debtor.getValue() >= -0.005) {
               ++debtorIndex;
            }
         }

         for(Payment payment : this.paymentRepository.findByGroupIdAndStatus(groupId, "SETTLED")) {
            String rawPDebtor = payment.getDebtor() != null ? payment.getDebtor().trim() : "";
            String rawPCreditor = payment.getCreditor() != null ? payment.getCreditor().trim() : "";
            String pDebtor = (String)memberAliasMap.getOrDefault(rawPDebtor, rawPDebtor);
            String pCreditor = (String)memberAliasMap.getOrDefault(rawPCreditor, rawPCreditor);
            double paidAmount = payment.getAmount();

            for(Map<String, Object> debt : debts) {
               if (pDebtor.equals(debt.get("debtor")) && pCreditor.equals(debt.get("creditor"))) {
                  double currentDebtAmount = ((Number)debt.get("amount")).doubleValue();
                  double newAmount = currentDebtAmount - paidAmount;
                  if (newAmount <= 0.005) {
                     debt.put("amount", (double)0.0F);
                  } else {
                     debt.put("amount", (double)Math.round(newAmount * (double)100.0F) / (double)100.0F);
                  }
               }
            }
         }

         debts.removeIf((debtx) -> ((Number)debtx.get("amount")).doubleValue() <= 0.005);
         boolean hadDebts = !debts.isEmpty();
         return Map.of("balances", balances, "debts", debts, "hadDebts", hadDebts, "hasExpenses", group.getExpenses() != null && !group.getExpenses().isEmpty());
      }
   }

   public boolean isPendingDebt(Long groupId, String debtor, String creditor, Double amount) {
      Map<String, Object> summary = this.calculateBalances(groupId);
      Object rawDebts = summary.get("debts");
      if (rawDebts instanceof List<?> debts) {
         return debts.stream().anyMatch((rawDebt) -> {
            if (!(rawDebt instanceof Map<?, ?> debt)) {
               return false;
            } else {
               return debtor.equals(debt.get("debtor")) && creditor.equals(debt.get("creditor")) && amount != null && Math.abs(amount - ((Number)debt.get("amount")).doubleValue()) <= 0.01;
            }
         });
      } else {
         return false;
      }
   }
}