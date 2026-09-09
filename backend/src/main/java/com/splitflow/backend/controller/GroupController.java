package com.splitflow.backend.controller;

import com.splitflow.backend.model.Group;
import com.splitflow.backend.repository.GroupRepository;
import com.splitflow.backend.repository.GroupMemberRepository;
import com.splitflow.backend.model.GroupMember;
import com.splitflow.backend.model.Payment;
import com.splitflow.backend.dto.JoinGroupRequest;
import com.splitflow.backend.repository.PaymentRepository;
import com.splitflow.backend.repository.ExpenseRepository;
import com.splitflow.backend.repository.ExpenseSplitRepository;
import com.splitflow.backend.service.GroupService;
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
@CrossOrigin(origins = "http://localhost:5173")
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
    public Group createGroup(@RequestBody Group group) {
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
                .orElseThrow(() -> new RuntimeException("Grupo no encontrado con el código: " + inviteCode));
    }

    @GetMapping("/{id}/members")
    public List<GroupMember> getMembers(@PathVariable Long id) {
        return groupMemberRepository.findByGroupId(id);
    }

    @PostMapping("/{id}/members")
    public ResponseEntity<?> joinGroup(@PathVariable Long id, @RequestBody JoinGroupRequest request) {
        if (request.getAlias() == null || request.getAlias().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Debes ingresar un nombre para unirte");
        }
        if (request.getAlias().trim().length() > 40) {
            return ResponseEntity.badRequest().body("El nombre no puede superar 40 caracteres");
        }
        if (groupMemberRepository.countByGroupId(id) >= 50) {
            return ResponseEntity.badRequest().body("Este grupo ya alcanzo el limite de 50 participantes");
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
            return ResponseEntity.badRequest().body("Ya hay alguien con ese nombre en el grupo. Elige otro.");
        }
        Group group = groupRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Grupo no encontrado"));
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
    public ResponseEntity<?> settlePayment(@PathVariable Long id, @RequestBody Payment payment) {
        if (payment.getDebtor() == null || payment.getCreditor() == null || payment.getAmount() == null || payment.getAmount() <= 0) {
            return ResponseEntity.badRequest().body("La deuda a saldar no es valida");
        }
        if (!groupService.isPendingDebt(id, payment.getDebtor(), payment.getCreditor(), payment.getAmount())) {
            return ResponseEntity.badRequest().body("La deuda indicada no esta pendiente en este grupo");
        }
        payment.setStatus("SETTLED");
        payment.setGroupId(id);
        return ResponseEntity.ok(paymentRepository.save(payment));
    }
}