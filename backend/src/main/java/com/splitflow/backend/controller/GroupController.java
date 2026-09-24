package com.splitflow.backend.controller;

import com.splitflow.backend.model.Group;
import com.splitflow.backend.repository.GroupRepository;
import com.splitflow.backend.repository.GroupMemberRepository;
import com.splitflow.backend.model.GroupMember;
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
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.ArrayList;
import java.util.Map;
import java.util.HashMap;

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
    public ResponseEntity<?> joinGroup(@PathVariable Long id, @Valid @RequestBody JoinGroupRequest request) {
        if (request.getAlias().trim().length() > 40) {
            throw new IllegalArgumentException("El nombre no puede superar 40 caracteres");
        }
        if (groupMemberRepository.countByGroupId(id) >= 50) {
            throw new IllegalArgumentException("Este grupo ya alcanzo el limite de 50 participantes");
        }
        
        // Si ya existe un alias pendiente con ese nombre, lo actualiza (proceso de reclamar)
        var pendingAlias = groupMemberRepository.findByGroupIdAndAliasAndActiveFalse(id, request.getAlias().trim());
        if (pendingAlias.isPresent()) {
            GroupMember member = pendingAlias.get();
            member.setDeviceId(request.getDeviceId());
            member.setEmail(request.getEmail());
            member.setActive(true); // Al reclamarlo pasa a activo
            return ResponseEntity.ok(groupMemberRepository.save(member));
        }
        
        if (groupMemberRepository.existsByGroupIdAndAliasIgnoreCase(id, request.getAlias().trim())) {
            throw new IllegalArgumentException("Ya hay alguien con ese nombre en el grupo. Elige otro.");
        }
        
        Group group = groupRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Grupo no encontrado"));
            
        // CORRECCIÓN PARA CP-002: 
        // Si se agrega una persona nueva desde el grupo, se guarda como alias SIN RECLAMAR (active = false)
        // El email pasa a ser completamente opcional.
        boolean isUnclaimedAlias = (request.getEmail() == null || request.getEmail().isBlank());
        
        GroupMember member = new GroupMember(
            request.getAlias().trim(), 
            request.getDeviceId(), 
            !isUnclaimedAlias, // Si viene con email/dispositivo se asume activo, sino entra como alias sin reclamar (false)
            group
        );
        member.setEmail(request.getEmail());
        return ResponseEntity.ok(groupMemberRepository.save(member));
      }

    @DeleteMapping("/{id}/members/{memberId}")
    public ResponseEntity<?> removeMember(@PathVariable Long id, @PathVariable Long memberId) {
        GroupMember member = groupMemberRepository.findById(memberId)
                .orElseThrow(() -> new ResourceNotFoundException("Miembro no encontrado"));
        if (!member.getGroup().getId().equals(id)) {
            throw new ResourceNotFoundException("Miembro no encontrado");
        }
        boolean hasActivity = expenseRepository.findByGroupId(id).stream()
                .anyMatch(expense -> member.getAlias().equalsIgnoreCase(expense.getPaidBy())
                        || expense.getSplits().stream().anyMatch(split -> member.getAlias().equalsIgnoreCase(split.getParticipant())));
        if (hasActivity) {
            throw new IllegalArgumentException("No se puede expulsar a un miembro con gastos o saldos asignados");
        }
        groupMemberRepository.delete(member);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/balances")
    public ResponseEntity<?> getGroupBalances(@PathVariable Long id) {
        // Llamamos al servicio para obtener los saldos procesados
        return ResponseEntity.ok(groupService.calculateBalances(id));
    }

    @GetMapping("/{id}/balances/{userId}/breakdown")
    public ResponseEntity<?> getBalanceBreakdown(@PathVariable Long id, @PathVariable String userId) {
        List<Map<String, Object>> breakdown = new ArrayList<>();
        expenseRepository.findByGroupId(id).forEach(expense -> expenseSplitRepository.findByExpenseId(expense.getId()).stream()
                .filter(split -> userId.equalsIgnoreCase(split.getParticipant()))
                .forEach(split -> {
                    Map<String, Object> item = new HashMap<>();
                    item.put("expenseId", expense.getId());
                    item.put("description", expense.getDescription());
                    item.put("expenseDate", expense.getExpenseDate());
                    item.put("amount", split.getAmount());
                    breakdown.add(item);
                }));
        return ResponseEntity.ok(breakdown);
    }

    @PostMapping("/{id}/payments")
    public ResponseEntity<?> settlePayment(@PathVariable Long id, @Valid @RequestBody SettlePaymentRequest request) {
        if (!groupService.isPendingDebt(id, request.getDebtor(), request.getCreditor(), request.getAmount())) {
            throw new IllegalArgumentException("La deuda indicada no esta pendiente en este grupo");
        }
        Payment payment = new Payment(id, request.getDebtor(), request.getCreditor(), request.getAmount());
        payment.setStatus("SETTLED");
        payment.setGroupId(id);
        return ResponseEntity.ok(paymentRepository.save(payment));
    }
}