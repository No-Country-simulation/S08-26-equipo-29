package com.splitflow.backend.service;

import com.splitflow.backend.dto.CreateExpenseRequest;
import com.splitflow.backend.model.Expense;
import com.splitflow.backend.model.ExpenseSplit;
import com.splitflow.backend.model.Group;
import com.splitflow.backend.model.GroupMember;
import com.splitflow.backend.model.SplitMethod;
import com.splitflow.backend.exception.ResourceNotFoundException;
import com.splitflow.backend.repository.ExpenseRepository;
import com.splitflow.backend.repository.GroupMemberRepository;
import com.splitflow.backend.repository.GroupRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Clock;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class ExpenseService {
    private static final BigDecimal CENT = new BigDecimal("0.01");
    private static final BigDecimal TOLERANCE = CENT;
    // La fecha de un gasto puede ser "hoy" en cualquier zona horaria; la más adelantada es UTC+14
    private static final ZoneOffset MOST_ADVANCED_ZONE = ZoneOffset.ofHours(14);

    private final ExpenseRepository expenseRepository;
    private final GroupRepository groupRepository;
    private final GroupMemberRepository memberRepository;
    private final Clock clock;

    public ExpenseService(ExpenseRepository expenseRepository,
                          GroupRepository groupRepository,
                          GroupMemberRepository memberRepository,
                          Clock clock) {
        this.expenseRepository = expenseRepository;
        this.groupRepository = groupRepository;
        this.memberRepository = memberRepository;
        this.clock = clock;
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
            .orElseThrow(() -> new ResourceNotFoundException("Grupo no encontrado"));

        SplitMethod method = parseMethod(request.getSplitMethod());
        
        // CORRECCIÓN: Se traen TODOS los miembros del grupo (activos y sin reclamar/alias)
        Map<String, GroupMember> groupMembers = memberRepository.findByGroupId(groupId).stream()
                .collect(Collectors.toMap(member -> normalize(member.getAlias()), Function.identity(), (first, ignored) -> first));
        
        List<String> participants = normalizeParticipants(request.getParticipants());
        validateParticipants(participants, groupMembers);
        
        String payer = normalize(request.getPaidBy());
        if (!groupMembers.containsKey(payer)) {
            throw new IllegalArgumentException("El pagador debe ser un miembro del grupo");
        }

        Map<String, BigDecimal> splitAmounts = calculateSplits(request, method, participants);
        // El monto del gasto se guarda en centavos, igual que sus repartos, para que el pagador y los deudores cuadren
        Expense expense = new Expense(request.getDescription().trim(), money(request.getAmount()).doubleValue(), payer, group);
        expense.setExpenseDate(request.getExpenseDate() == null ? LocalDate.now(clock) : request.getExpenseDate());

        List<ExpenseSplit> splits = new ArrayList<>();
        for (String participant : participants) {
            ExpenseSplit split = new ExpenseSplit(participant, splitAmounts.get(participant).doubleValue(), expense);
            split.setMember(groupMembers.get(participant));
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
        if (request.getAmount() == null || money(request.getAmount()).signum() <= 0) {
            throw new IllegalArgumentException("El monto debe ser mayor a $0");
        }
        if (request.getExpenseDate() != null && request.getExpenseDate().isAfter(LocalDate.now(clock.withZone(MOST_ADVANCED_ZONE)))) {
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

    private void validateParticipants(List<String> participants, Map<String, GroupMember> groupMembers) {
        if (!groupMembers.keySet().containsAll(participants)) {
            throw new IllegalArgumentException("Todos los participantes deben pertenecer al grupo");
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
            // Los nombres se normalizan igual que los participantes; dos claves que coinciden al recortar son ambiguas
            Map<String, Double> requestedAllocations = new HashMap<>();
            for (Map.Entry<String, Double> entry : request.getAllocations().entrySet()) {
                String participant = normalize(entry.getKey());
                if (requestedAllocations.containsKey(participant)) {
                    throw new IllegalArgumentException("Debes informar exactamente un monto por participante");
                }
                requestedAllocations.put(participant, entry.getValue());
            }
            if (!requestedAllocations.keySet().equals(new HashSet<>(participants))) {
                throw new IllegalArgumentException("Debes informar exactamente un monto por participante");
            }
            Map<String, BigDecimal> allocations = new HashMap<>();
            for (String participant : participants) {
                Double value = requestedAllocations.get(participant);
                if (value == null || value < 0) {
                    throw new IllegalArgumentException("Cada monto debe ser cero o positivo");
                }
                allocations.put(participant, money(value));
            }
            BigDecimal assigned = allocations.values().stream().reduce(BigDecimal.ZERO, BigDecimal::add);
            BigDecimal difference = total.subtract(assigned);
            if (difference.abs().compareTo(TOLERANCE) > 0) {
                throw new IllegalArgumentException("La suma de los montos debe coincidir con el total");
            }
            // La diferencia tolerada (un centavo) se absorbe en el primer participante con monto, como en la división
            // equitativa, para que los repartos sumen exactamente el total del gasto
            if (difference.signum() != 0) {
                String receiver = participants.stream()
                        .filter(participant -> allocations.get(participant).signum() > 0)
                        .findFirst().orElse(participants.get(0));
                allocations.merge(receiver, difference, BigDecimal::add);
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