package com.splitflow.backend.controller;

import com.splitflow.backend.dto.CreateGroupRequest;
import com.splitflow.backend.dto.JoinGroupRequest;
import com.splitflow.backend.dto.SettlePaymentRequest;
import com.splitflow.backend.exception.ResourceNotFoundException;
import com.splitflow.backend.model.Expense;
import com.splitflow.backend.model.Group;
import com.splitflow.backend.model.GroupMember;
import com.splitflow.backend.repository.ExpenseRepository;
import com.splitflow.backend.repository.ExpenseSplitRepository;
import com.splitflow.backend.repository.GroupMemberRepository;
import com.splitflow.backend.repository.GroupRepository;
import com.splitflow.backend.service.GroupService;

import jakarta.validation.Valid;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/groups")
public class GroupController {

    @Autowired
    private GroupRepository groupRepository;

    @Autowired
    private GroupService groupService;

    @Autowired
    private GroupMemberRepository groupMemberRepository;

    @Autowired
    private ExpenseRepository expenseRepository;

    @Autowired
    private ExpenseSplitRepository expenseSplitRepository;

    @GetMapping
    public List<Group> getGroups(@RequestParam(required = false) String deviceId) {
        if (deviceId == null || deviceId.isBlank()) {
            return List.of();
        }

        return groupRepository.findDistinctByMembersDeviceIdOrderByIdAsc(deviceId);
    }

    @PostMapping
    @Transactional
    public Group createGroup(@Valid @RequestBody CreateGroupRequest request) {
        Group group = new Group(
                request.getName().trim(),
                request.getCurrency(),
                null
        );

        group.setAliases(request.getAliases());
        group.setOwnerId(request.getOwnerId());

        if (group.getInviteCode() == null || group.getInviteCode().isEmpty()) {
            String randomCode = UUID.randomUUID()
                    .toString()
                    .substring(0, 6)
                    .toUpperCase();

            group.setInviteCode(randomCode);
        }

        Group savedGroup = groupRepository.save(group);

        if (group.getOwnerId() != null && !group.getOwnerId().isBlank()) {
            groupMemberRepository.save(
                    new GroupMember(
                            "Yo",
                            group.getOwnerId(),
                            true,
                            savedGroup
                    )
            );
        }

        if (group.getAliases() != null) {
            group.getAliases().stream()
                    .map(String::trim)
                    .filter(alias -> !alias.isEmpty())
                    .distinct()
                    .filter(alias -> !"Yo".equalsIgnoreCase(alias))
                    .filter(alias -> !"Tú".equalsIgnoreCase(alias))
                    .forEach(alias ->
                            groupMemberRepository.save(
                                    new GroupMember(
                                            alias,
                                            null,
                                            false,
                                            savedGroup
                                    )
                            )
                    );
        }

        return savedGroup;
    }

    @GetMapping("/invite/{inviteCode}")
    public Group getGroupByInviteCode(@PathVariable String inviteCode) {
        return groupRepository.findByInviteCode(inviteCode)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Grupo no encontrado con el código: " + inviteCode
                        )
                );
    }

    @GetMapping("/{id}/members")
    public List<GroupMember> getMembers(@PathVariable Long id) {
        return groupMemberRepository.findByGroupId(id);
    }

    @PostMapping("/{id}/members")
    @Transactional
    public ResponseEntity<?> joinGroup(
            @PathVariable Long id,
            @Valid @RequestBody JoinGroupRequest request) {

        String alias = request.getAlias().trim();

        if (alias.length() > 40) {
            throw new IllegalArgumentException(
                    "El nombre no puede superar 40 caracteres"
            );
        }

        Group group = groupRepository.findByIdForUpdate(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Grupo no encontrado")
                );

        String deviceId = request.getDeviceId() == null
                || request.getDeviceId().isBlank()
                ? null
                : request.getDeviceId().trim();

        String email = request.getEmail() == null
                || request.getEmail().isBlank()
                ? null
                : request.getEmail().trim();

        if (deviceId != null) {
            var pendingAliases =
                    groupMemberRepository
                            .findByGroupIdAndAliasIgnoreCaseAndActiveFalseOrderByIdAsc(
                                    id,
                                    alias
                            );

            var pendingAlias = pendingAliases.stream()
                    .filter(pending -> pending.getAlias().equals(alias))
                    .findFirst()
                    .or(() -> pendingAliases.stream().findFirst());

            if (pendingAlias.isPresent()) {
                GroupMember member = pendingAlias.get();

                member.setDeviceId(deviceId);

                if (email != null) {
                    member.setEmail(email);
                }

                member.setActive(true);

                return ResponseEntity.ok(
                        groupMemberRepository.save(member)
                );
            }
        }

        if (groupMemberRepository.countByGroupId(id) >= 50) {
            throw new IllegalArgumentException(
                    "Este grupo ya alcanzo el limite de 50 participantes"
            );
        }

        if (groupMemberRepository.existsByGroupIdAndAliasIgnoreCase(id, alias)) {
            throw new IllegalArgumentException(
                    "Ya hay alguien con ese nombre en el grupo. Elige otro."
            );
        }

        GroupMember member = new GroupMember(
                alias,
                deviceId,
                deviceId != null,
                group
        );

        member.setEmail(email);

        return ResponseEntity.ok(
                groupMemberRepository.save(member)
        );
    }

    @DeleteMapping("/{id}/members/{memberId}")
    public ResponseEntity<?> removeMember(
            @PathVariable Long id,
            @PathVariable Long memberId) {

        GroupMember member = groupMemberRepository.findById(memberId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Miembro no encontrado")
                );

        if (!member.getGroup().getId().equals(id)) {
            throw new ResourceNotFoundException("Miembro no encontrado");
        }

        boolean hasActivity =
                expenseRepository.existsByGroupIdAndPaidByIgnoreCase(
                        id,
                        member.getAlias()
                )
                || expenseSplitRepository
                        .existsByExpenseGroupIdAndParticipantIgnoreCase(
                                id,
                                member.getAlias()
                        );

        if (hasActivity) {
            throw new IllegalArgumentException(
                    "No se puede expulsar a un miembro con gastos o saldos asignados"
            );
        }

        groupMemberRepository.delete(member);

        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/balances")
    public ResponseEntity<?> getGroupBalances(@PathVariable Long id) {
        return ResponseEntity.ok(groupService.calculateBalances(id));
    }

    @GetMapping("/{id}/balances/{userId}/breakdown")
    public ResponseEntity<?> getBalanceBreakdown(
            @PathVariable Long id,
            @PathVariable String userId) {

        List<Map<String, Object>> breakdown = new ArrayList<>();

        expenseSplitRepository.findByGroupIdWithExpense(id)
                .stream()
                .filter(split ->
                        userId.equalsIgnoreCase(split.getParticipant())
                )
                .forEach(split -> {
                    Expense expense = split.getExpense();

                    if (expense != null) {
                        Map<String, Object> item = new HashMap<>();

                        item.put("expenseId", expense.getId());
                        item.put("description", expense.getDescription());
                        item.put("expenseDate", expense.getExpenseDate());
                        item.put("amount", split.getAmount());

                        breakdown.add(item);
                    }
                });

        return ResponseEntity.ok(breakdown);
    }

    @PostMapping("/{id}/payments")
    public ResponseEntity<?> settlePayment(
            @PathVariable Long id,
            @Valid @RequestBody SettlePaymentRequest request) {

        return ResponseEntity.ok(
                groupService.settleDebt(
                        id,
                        request.getDebtor(),
                        request.getCreditor(),
                        request.getAmount()
                )
        );
    }
}