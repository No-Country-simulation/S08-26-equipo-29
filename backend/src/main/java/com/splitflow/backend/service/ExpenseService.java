package com.splitflow.backend.service;

import com.splitflow.backend.dto.CreateExpenseRequest;
import com.splitflow.backend.model.Expense;
import com.splitflow.backend.model.ExpenseSplit;
import com.splitflow.backend.model.Group;
import com.splitflow.backend.model.GroupMember;
import com.splitflow.backend.model.SplitMethod;
import com.splitflow.backend.repository.ExpenseRepository;
import com.splitflow.backend.repository.GroupMemberRepository;
import com.splitflow.backend.repository.GroupRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class ExpenseService {
    private static final BigDecimal CENT = new BigDecimal("0.01");
    private static final BigDecimal TOLERANCE = CENT;

    private final ExpenseRepository expenseRepository;
    private final GroupRepository groupRepository;
    private final GroupMemberRepository memberRepository;

    public ExpenseService(ExpenseRepository expenseRepository,
                          GroupRepository groupRepository,
                          GroupMemberRepository memberRepository) {
        this.expenseRepository = expenseRepository;
        this.groupRepository = groupRepository;
        this.memberRepository = memberRepository;
    }

    public List<Expense> findAll() {
        return expenseRepository.findAll();
    }

    public List<Expense> findByGroupId(Long groupId) {
        return expenseRepository.findByGroupId(groupId);
    }

    @Transactional
    public Expense create(Long groupId, CreateExpenseRequest request) {
        validateBasicFields(request);
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new IllegalArgumentException("Grupo no encontrado"));

        SplitMethod method = parseMethod(request.getSplitMethod());
        Map<String, GroupMember> activeMembers = memberRepository.findByGroupId(groupId).stream()
                .filter(GroupMember::isActive)
                .collect(Collectors.toMap(member -> normalize(member.getAlias()), Function.identity(), (first, ignored) -> first));
        List<String> participants = normalizeParticipants(request.getParticipants());
        validateParticipants(participants, activeMembers);
        String payer = normalize(request.getPaidBy());
        if (!activeMembers.containsKey(payer)) {
            throw new IllegalArgumentException("El pagador debe ser un miembro activo del grupo");
        }

        Map<String, BigDecimal> splitAmounts = calculateSplits(request, method, participants);
        Expense expense = new Expense(request.getDescription().trim(), request.getAmount(), payer, group);
        expense.setExpenseDate(request.getExpenseDate() == null ? LocalDate.now() : request.getExpenseDate());

        List<ExpenseSplit> splits = new ArrayList<>();
        for (String participant : participants) {
            ExpenseSplit split = new ExpenseSplit(participant, splitAmounts.get(participant).doubleValue(), expense);
            split.setMember(activeMembers.get(participant));
            splits.add(split);
        }
        expense.setSplits(splits);
        return expenseRepository.save(expense);
    }

    private void validateBasicFields(CreateExpenseRequest request) {
        if (request == null) throw new IllegalArgumentException("La peticion es obligatoria");
        if (request.getDescription() == null || request.getDescription().trim().isEmpty()) {
            throw new IllegalArgumentException("La descripcion es obligatoria");
        }
        if (request.getDescription().trim().length() > 80) {
            throw new IllegalArgumentException("La descripcion no puede superar 80 caracteres");
        }
        if (request.getAmount() == null || request.getAmount() <= 0) {
            throw new IllegalArgumentException("El monto debe ser mayor a $0");
        }
        if (request.getExpenseDate() != null && request.getExpenseDate().isAfter(LocalDate.now())) {
            throw new IllegalArgumentException("La fecha no puede ser futura");
        }
    }

    private SplitMethod parseMethod(String value) {
        if (value == null || value.isBlank()) return SplitMethod.EQUAL;
        try {
            return SplitMethod.valueOf(value.trim().toUpperCase());
        } catch (IllegalArgumentException exception) {
            throw new IllegalArgumentException("El metodo de division debe ser EQUAL o BY_AMOUNT");
        }
    }

    private List<String> normalizeParticipants(List<String> rawParticipants) {
        if (rawParticipants == null || rawParticipants.isEmpty()) {
            throw new IllegalArgumentException("Debes seleccionar al menos un participante");
        }
        List<String> participants = rawParticipants.stream().map(this::normalize).toList();
        if (participants.stream().anyMatch(String::isEmpty) || participants.size() != new HashSet<>(participants).size()) {
            throw new IllegalArgumentException("Los participantes deben ser unicos y no vacios");
        }
        return participants;
    }

    private void validateParticipants(List<String> participants, Map<String, GroupMember> activeMembers) {
        if (!activeMembers.keySet().containsAll(participants)) {
            throw new IllegalArgumentException("Todos los participantes deben ser miembros activos del grupo");
        }
    }

    private Map<String, BigDecimal> calculateSplits(CreateExpenseRequest request,
                                                      SplitMethod method,
                                                      List<String> participants) {
        BigDecimal total = money(request.getAmount());
        if (method == SplitMethod.BY_AMOUNT) {
            if (request.getAllocations() == null) {
                throw new IllegalArgumentException("Debes informar un monto para cada participante");
            }
            Set<String> allocationKeys = request.getAllocations().keySet().stream()
                    .map(this::normalize).collect(Collectors.toSet());
            if (!allocationKeys.equals(new HashSet<>(participants))) {
                throw new IllegalArgumentException("Debes informar exactamente un monto por participante");
            }
            Map<String, BigDecimal> allocations = new HashMap<>();
            for (String participant : participants) {
                Double value = request.getAllocations().get(participant);
                if (value == null || value < 0) {
                    throw new IllegalArgumentException("Cada monto debe ser cero o positivo");
                }
                allocations.put(participant, money(value));
            }
            BigDecimal assigned = allocations.values().stream().reduce(BigDecimal.ZERO, BigDecimal::add);
            if (assigned.subtract(total).abs().compareTo(TOLERANCE) > 0) {
                throw new IllegalArgumentException("La suma de los montos debe coincidir con el total");
            }
            return allocations;
        }

        BigDecimal[] division = total.movePointRight(2).divideAndRemainder(BigDecimal.valueOf(participants.size()));
        BigDecimal base = division[0].movePointLeft(2).setScale(2, RoundingMode.UNNECESSARY);
        BigDecimal remainder = division[1].movePointLeft(2).setScale(2, RoundingMode.UNNECESSARY);
        Map<String, BigDecimal> result = new HashMap<>();
        for (int index = 0; index < participants.size(); index++) {
            result.put(participants.get(index), index == 0 ? base.add(remainder) : base);
        }
        return result;
    }

    private BigDecimal money(Double value) {
        return BigDecimal.valueOf(value).setScale(2, RoundingMode.HALF_UP);
    }

    private String normalize(String value) {
        return value == null ? "" : value.trim();
    }
}
