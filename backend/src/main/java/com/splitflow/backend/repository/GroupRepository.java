package com.splitflow.backend.repository;

import com.splitflow.backend.model.Group;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.splitflow.backend.model.Expense;

import java.util.Optional;

@Repository
public interface GroupRepository extends JpaRepository<Group, Long> {
    Optional<Group> findByInviteCode(String inviteCode);
}