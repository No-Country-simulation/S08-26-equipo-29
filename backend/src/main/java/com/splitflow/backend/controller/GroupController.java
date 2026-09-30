package com.splitflow.backend.controller;

import com.splitflow.backend.model.Expense;
import com.splitflow.backend.model.Group;
import com.splitflow.backend.repository.GroupRepository;
import com.splitflow.backend.repository.GroupMemberRepository;
import com.splitflow.backend.model.GroupMember;
import com.splitflow.backend.dto.JoinGroupRequest;
import com.splitflow.backend.dto.CreateGroupRequest;
import com.splitflow.backend.dto.SettlePaymentRequest;
import com.splitflow.backend.model.Payment;
import com.splitflow.backend.dto.JoinGroupRequest;
import com.splitflow.backend.dto.CreateGroupRequest;
import com.splitflow.backend.dto.SettlePaymentRequest;
import com.splitflow.backend.repository.PaymentRepository;
import com.splitflow.backend.repository.ExpenseRepository;
import com.splitflow.backend.repository.ExpenseSplitRepository;
import com.splitflow.backend.service.GroupService;
import com.splitflow.backend.exception.ResourceNotFoundException;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.ArrayList;
import java.util.Map;
import java.util.HashMap;
import java.util.Set;
import java.util.TreeSet;

@RestController
@RequestMapping("/api/groups")
public class GroupController {

    @Autowired
    private GroupRepository groupRepository;

    @Autowired
    private GroupService groupService; // Inyectamos el servicio creado

    @Autowired
    private GroupMemberRepository groupMemberRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private ExpenseRepository expenseRepository;

    @Autowired
    private ExpenseSplitRepository expenseSplitRepository;

    // Cada dispositivo solo ve los grupos en los que participa; sin dispositivo no hay grupos que listar
    @GetMapping
    public List<Group> getGroups(@RequestParam(required = false) String deviceId) {
        if (deviceId == null || deviceId.isBlank()) return List.of();
        return groupRepository.findDistinctByMembersDeviceIdOrderByIdAsc(deviceId);
    }

    @PostMapping
    @Transactional
    @GetMapping
    public List<Group> getAllGroups() {
        return groupRepository.findAll();
    }

    @PostMapping
    public Group createGroup(@Valid @RequestBody CreateGroupRequest request) {
        Group group = new Group(request.getName().trim(), request.getCurrency(), null);
        group.setAliases(request.getAliases());
        group.setOwnerId(request.getOwnerId());
        if (group.getInviteCode() == null || group.getInviteCode().isEmpty()) {
            String randomCode = UUID.randomUUID().toString().substring(0, 6).toUpperCase();
            group.setInviteCode(randomCode);
        }
        Group savedGroup = groupRepository.save(group);
        // El nombre de cada miembro es único sin distinguir mayúsculas: el dueño y los alias repetidos se registran una sola vez
        Set<String> registeredNames = new TreeSet<>(String.CASE_INSENSITIVE_ORDER);
        if (group.getOwnerId() != null && !group.getOwnerId().isBlank()) {
            registeredNames.add(group.getOwnerId().trim());
            groupMemberRepository.save(new GroupMember(group.getOwnerId(), group.getOwnerId(), true, savedGroup));
        }
        if (group.getAliases() != null) {
            group.getAliases().stream().map(String::trim).filter(alias -> !alias.isEmpty()).filter(registeredNames::add)
        if (group.getOwnerId() != null && !group.getOwnerId().isBlank()) {
            groupMemberRepository.save(new GroupMember(group.getOwnerId(), group.getOwnerId(), true, savedGroup));
        }
        if (group.getAliases() != null) {
            group.getAliases().stream().map(String::trim).filter(alias -> !alias.isEmpty()).distinct()
                    .forEach(alias -> groupMemberRepository.save(new GroupMember(alias, null, false, savedGroup)));
        }
        return savedGroup;
    }

    @GetMapping("/invite/{inviteCode}")
    public Group getGroupByInviteCode(@PathVariable String inviteCode) {
        return groupRepository.findByInviteCode(inviteCode)
            .orElseThrow(() -> new ResourceNotFoundException("Grupo no encontrado con el código: " + inviteCode));
    }

    @GetMapping("/{id}/members")
    public List<GroupMember> getMembers(@PathVariable Long id) {
        return groupMemberRepository.findByGroupId(id);
    }

    @PostMapping("/{id}/members")
    @Transactional
    public ResponseEntity<?> joinGroup(@PathVariable Long id, @Valid @RequestBody JoinGroupRequest request) {
        String alias = request.getAlias().trim();
        if (alias.length() > 40) {
            throw new IllegalArgumentException("El nombre no puede superar 40 caracteres");
        }
        // Bloquea el grupo hasta el commit: dos personas que reclaman el mismo alias, o que llegan al cupo final a la vez, se atienden una por una
        Group group = groupRepository.findByIdForUpdate(id)
            .orElseThrow(() -> new ResourceNotFoundException("Grupo no encontrado"));
        // Quien se une desde un dispositivo queda activo; sin dispositivo solo se registra un alias por reclamar
        String deviceId = request.getDeviceId() == null || request.getDeviceId().isBlank() ? null : request.getDeviceId().trim();
        String email = request.getEmail() == null || request.getEmail().isBlank() ? null : request.getEmail().trim();
        
        // Si ya existe un alias pendiente con ese nombre, lo actualiza (proceso de reclamar)
        if (deviceId != null) {
            var pendingAliases = groupMemberRepository.findByGroupIdAndAliasIgnoreCaseAndActiveFalseOrderByIdAsc(id, alias);
            // Si hay nombres que solo difieren en mayúsculas (datos anteriores) se prefiere el que coincide exactamente
            var pendingAlias = pendingAliases.stream().filter(pending -> pending.getAlias().equals(alias)).findFirst()
                    .or(() -> pendingAliases.stream().findFirst());
            if (pendingAlias.isPresent()) {
                GroupMember member = pendingAlias.get();
                member.setDeviceId(deviceId);
                if (email != null) member.setEmail(email); // No pisa el email de contacto ya registrado
                member.setActive(true); // Al reclamarlo pasa a activo
                return ResponseEntity.ok(groupMemberRepository.save(member));
            }
        }

        // Reclamar un alias no suma miembros, así que el límite solo aplica a personas nuevas
        if (groupMemberRepository.countByGroupId(id) >= 50) {
            throw new IllegalArgumentException("Este grupo ya alcanzo el limite de 50 participantes");
        }
        
        if (groupMemberRepository.existsByGroupIdAndAliasIgnoreCase(id, alias)) {
            throw new IllegalArgumentException("Ya hay alguien con ese nombre en el grupo. Elige otro.");
        }
        
        // Modo B (nombre propio desde el enlace): entra con su dispositivo y queda activo.
        // Persona registrada desde el grupo: sin dispositivo, queda como alias SIN RECLAMAR (active = false) y el email es opcional.
        GroupMember member = new GroupMember(alias, deviceId, deviceId != null, group);
        member.setEmail(email);
        return ResponseEntity.ok(groupMemberRepository.save(member));
    }

    @DeleteMapping("/{id}/members/{memberId}")
    public ResponseEntity<?> removeMember(@PathVariable Long id, @PathVariable Long memberId) {
        GroupMember member = groupMemberRepository.findById(memberId)
                .orElseThrow(() -> new ResourceNotFoundException("Miembro no encontrado"));
        if (!member.getGroup().getId().equals(id)) {
            throw new ResourceNotFoundException("Miembro no encontrado");
        }
        boolean hasActivity = expenseRepository.existsByGroupIdAndPaidByIgnoreCase(id, member.getAlias())
                || expenseSplitRepository.existsByExpenseGroupIdAndParticipantIgnoreCase(id, member.getAlias());
        if (hasActivity) {
            throw new IllegalArgumentException("No se puede expulsar a un miembro con gastos o saldos asignados");
        }
        groupMemberRepository.delete(member);
        return ResponseEntity.noContent().build();
    }

    public ResponseEntity<?> joinGroup(@PathVariable Long id, @Valid @RequestBody JoinGroupRequest request) {
        if (request.getAlias().trim().length() > 40) {
            throw new IllegalArgumentException("El nombre no puede superar 40 caracteres");
        }
        if (groupMemberRepository.countByGroupId(id) >= 50) {
            throw new IllegalArgumentException("Este grupo ya alcanzo el limite de 50 participantes");
        }
        var pendingAlias = groupMemberRepository.findByGroupIdAndAliasAndActiveFalse(id, request.getAlias().trim());
        if (pendingAlias.isPresent()) {
            GroupMember member = pendingAlias.get();
            member.setDeviceId(request.getDeviceId());
            member.setEmail(request.getEmail());
            member.setActive(true);
            return ResponseEntity.ok(groupMemberRepository.save(member));
        }
        if (groupMemberRepository.existsByGroupIdAndAliasIgnoreCase(id, request.getAlias().trim())) {
            throw new IllegalArgumentException("Ya hay alguien con ese nombre en el grupo. Elige otro.");
        }
        Group group = groupRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Grupo no encontrado"));
        GroupMember member = new GroupMember(request.getAlias().trim(), request.getDeviceId(), true, group);
        member.setEmail(request.getEmail());
        return ResponseEntity.ok(groupMemberRepository.save(member));
    }

    @GetMapping("/{id}/balances")
    public ResponseEntity<?> getGroupBalances(@PathVariable Long id) {
        // Llamamos al servicio para obtener los saldos procesados
        return ResponseEntity.ok(groupService.calculateBalances(id));
    }

    @GetMapping("/{id}/balances/{userId}/breakdown")
    public ResponseEntity<?> getBalanceBreakdown(@PathVariable Long id, @PathVariable String userId) {
        List<Map<String, Object>> breakdown = new ArrayList<>();
        expenseSplitRepository.findByGroupIdWithExpense(id).stream()
                .filter(split -> userId.equalsIgnoreCase(split.getParticipant()))
                .forEach(split -> {
                    Expense expense = split.getExpense();
        expenseRepository.findByGroupId(id).forEach(expense -> expenseSplitRepository.findByExpenseId(expense.getId()).stream()
                .filter(split -> userId.equalsIgnoreCase(split.getParticipant()))
                .forEach(split -> {
                    Map<String, Object> item = new HashMap<>();
                    item.put("expenseId", expense.getId());
                    item.put("description", expense.getDescription());
                    item.put("expenseDate", expense.getExpenseDate());
                    item.put("amount", split.getAmount());
                    breakdown.add(item);
                });
                }));
        return ResponseEntity.ok(breakdown);
    }

    @PostMapping("/{id}/payments")
    public ResponseEntity<?> settlePayment(@PathVariable Long id, @Valid @RequestBody SettlePaymentRequest request) {
        return ResponseEntity.ok(groupService.settleDebt(id, request.getDebtor(), request.getCreditor(), request.getAmount()));
        if (!groupService.isPendingDebt(id, request.getDebtor(), request.getCreditor(), request.getAmount())) {
            throw new IllegalArgumentException("La deuda indicada no esta pendiente en este grupo");
        }
        Payment payment = new Payment(id, request.getDebtor(), request.getCreditor(), request.getAmount());
        payment.setStatus("SETTLED");
        payment.setGroupId(id);
        return ResponseEntity.ok(paymentRepository.save(payment));
    }
}