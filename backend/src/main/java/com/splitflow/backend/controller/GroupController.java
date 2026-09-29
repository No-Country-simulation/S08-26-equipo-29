package com.splitflow.backend.controller;

import com.splitflow.backend.dto.CreateGroupRequest;
import com.splitflow.backend.dto.JoinGroupRequest;
import com.splitflow.backend.dto.SettlePaymentRequest;
import com.splitflow.backend.exception.ResourceNotFoundException;
import com.splitflow.backend.model.Group;
import com.splitflow.backend.model.GroupMember;
import com.splitflow.backend.model.Payment;
import com.splitflow.backend.repository.ExpenseRepository;
import com.splitflow.backend.repository.ExpenseSplitRepository;
import com.splitflow.backend.repository.GroupMemberRepository;
import com.splitflow.backend.repository.GroupRepository;
import com.splitflow.backend.repository.PaymentRepository;
import com.splitflow.backend.service.GroupService;
import jakarta.validation.Valid;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping({"/api/groups"})
public class GroupController {
   @Autowired
   private GroupRepository groupRepository;
   @Autowired
   private GroupService groupService;
   @Autowired
   private GroupMemberRepository groupMemberRepository;
   @Autowired
   private PaymentRepository paymentRepository;
   @Autowired
   private ExpenseRepository expenseRepository;
   @Autowired
   private ExpenseSplitRepository expenseSplitRepository;

   public GroupController() {
   }

   @GetMapping
   public List<Group> getAllGroups() {
      return this.groupRepository.findAll();
   }

   @PostMapping
   public Group createGroup(@RequestBody @Valid CreateGroupRequest request) {
      Group group = new Group(request.getName().trim(), request.getCurrency(), (String)null);
      group.setAliases(request.getAliases());
      group.setOwnerId(request.getOwnerId());
      if (group.getInviteCode() == null || group.getInviteCode().isEmpty()) {
         String randomCode = UUID.randomUUID().toString().substring(0, 6).toUpperCase();
         group.setInviteCode(randomCode);
      }

      Group savedGroup = (Group)this.groupRepository.save(group);

      // FIX: antes se guardaba new GroupMember(group.getOwnerId(), group.getOwnerId(), true, savedGroup),
      // es decir, se usaba el ownerId (un UUID de DISPOSITIVO que manda el frontend,
      // crypto.randomUUID()) como ALIAS del creador del grupo. Por eso el dueño del
      // grupo terminaba mostrando literalmente su UUID como nombre en Saldos/Gastos.
      // El ownerId debe usarse SOLO como deviceId (para identificar "quien sos vos"),
      // nunca como el nombre visible. Usamos "Tú" como alias, que es el mismo
      // placeholder que ya manda el frontend en `aliases` para el creador.
      if (group.getOwnerId() != null && !group.getOwnerId().isBlank()) {
         this.groupMemberRepository.save(new GroupMember("Tú", group.getOwnerId(), true, savedGroup));
      }

      if (group.getAliases() != null) {
         group.getAliases().stream()
            .map(String::trim)
            .filter((alias) -> !alias.isEmpty())
            // FIX: sin este filtro, el "Tú" que ya manda el frontend en `aliases`
            // volvía a crear un SEGUNDO miembro duplicado para el mismo dueño
            // (alias="Tú", deviceId=null, active=false, sin reclamar).
            .filter((alias) -> !"Tú".equalsIgnoreCase(alias))
            .distinct()
            .forEach((alias) -> this.groupMemberRepository.save(new GroupMember(alias, (String)null, false, savedGroup)));
      }

      return savedGroup;
   }

   @GetMapping({"/invite/{inviteCode}"})
   public Group getGroupByInviteCode(@PathVariable String inviteCode) {
      return (Group)this.groupRepository.findByInviteCode(inviteCode).orElseThrow(() -> new ResourceNotFoundException("Grupo no encontrado con el código: " + inviteCode));
   }

   @GetMapping({"/{id}/members"})
   public List<GroupMember> getMembers(@PathVariable Long id) {
      return this.groupMemberRepository.findByGroupId(id);
   }

   @PostMapping({"/{id}/members"})
   public ResponseEntity<?> joinGroup(@PathVariable Long id, @RequestBody @Valid JoinGroupRequest request) {
      if (request.getAlias().trim().length() > 40) {
         throw new IllegalArgumentException("El nombre no puede superar 40 caracteres");
      } else if (this.groupMemberRepository.countByGroupId(id) >= 50L) {
         throw new IllegalArgumentException("Este grupo ya alcanzo el limite de 50 participantes");
      } else {
         Optional<GroupMember> pendingAlias = this.groupMemberRepository.findByGroupIdAndAliasAndActiveFalse(id, request.getAlias().trim());
         if (pendingAlias.isPresent()) {
            GroupMember member = (GroupMember)pendingAlias.get();
            member.setDeviceId(request.getDeviceId());
            member.setEmail(request.getEmail());
            member.setActive(true);
            return ResponseEntity.ok((GroupMember)this.groupMemberRepository.save(member));
         } else if (this.groupMemberRepository.existsByGroupIdAndAliasIgnoreCase(id, request.getAlias().trim())) {
            throw new IllegalArgumentException("Ya hay alguien con ese nombre en el grupo. Elige otro.");
         } else {
            Group group = (Group)this.groupRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Grupo no encontrado"));
            boolean isUnclaimedAlias = request.getEmail() == null || request.getEmail().isBlank();
            GroupMember member = new GroupMember(request.getAlias().trim(), request.getDeviceId(), !isUnclaimedAlias, group);
            member.setEmail(request.getEmail());
            return ResponseEntity.ok((GroupMember)this.groupMemberRepository.save(member));
         }
      }
   }

   @DeleteMapping({"/{id}/members/{memberId}"})
   public ResponseEntity<?> removeMember(@PathVariable Long id, @PathVariable Long memberId) {
      GroupMember member = (GroupMember)this.groupMemberRepository.findById(memberId).orElseThrow(() -> new ResourceNotFoundException("Miembro no encontrado"));
      if (!member.getGroup().getId().equals(id)) {
         throw new ResourceNotFoundException("Miembro no encontrado");
      } else {
         boolean hasActivity = this.expenseRepository.findByGroupId(id).stream().anyMatch((expense) -> member.getAlias().equalsIgnoreCase(expense.getPaidBy()) || expense.getSplits().stream().anyMatch((split) -> member.getAlias().equalsIgnoreCase(split.getParticipant())));
         if (hasActivity) {
            throw new IllegalArgumentException("No se puede expulsar a un miembro con gastos o saldos asignados");
         } else {
            this.groupMemberRepository.delete(member);
            return ResponseEntity.noContent().build();
         }
      }
   }

   @GetMapping({"/{id}/balances"})
   public ResponseEntity<?> getGroupBalances(@PathVariable Long id) {
      return ResponseEntity.ok(this.groupService.calculateBalances(id));
   }

   @GetMapping({"/{id}/balances/{userId}/breakdown"})
   public ResponseEntity<?> getBalanceBreakdown(@PathVariable Long id, @PathVariable String userId) {
      List<Map<String, Object>> breakdown = new ArrayList();
      this.expenseRepository.findByGroupId(id).forEach((expense) -> this.expenseSplitRepository.findByExpenseId(expense.getId()).stream().filter((split) -> userId.equalsIgnoreCase(split.getParticipant())).forEach((split) -> {
            Map<String, Object> item = new HashMap();
            item.put("expenseId", expense.getId());
            item.put("description", expense.getDescription());
            item.put("expenseDate", expense.getExpenseDate());
            item.put("amount", split.getAmount());
            breakdown.add(item);
         }));
      return ResponseEntity.ok(breakdown);
   }

   @PostMapping({"/{id}/payments"})
   public ResponseEntity<?> settlePayment(@PathVariable Long id, @RequestBody @Valid SettlePaymentRequest request) {
      if (!this.groupService.isPendingDebt(id, request.getDebtor(), request.getCreditor(), request.getAmount())) {
         throw new IllegalArgumentException("La deuda indicada no esta pendiente en este grupo");
      } else {
         Payment payment = new Payment(id, request.getDebtor(), request.getCreditor(), request.getAmount());
         payment.setStatus("SETTLED");
         payment.setGroupId(id);
         return ResponseEntity.ok((Payment)this.paymentRepository.save(payment));
      }
   }
}