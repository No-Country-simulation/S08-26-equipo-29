package com.splitflow.backend.repository;

import com.splitflow.backend.model.GroupMember;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface GroupMemberRepository extends JpaRepository<GroupMember, Long> {
    List<GroupMember> findByGroupId(Long groupId);
    java.util.Optional<GroupMember> findByGroupIdAndAliasIgnoreCase(Long groupId, String alias);
    Optional<GroupMember> findByGroupIdAndAliasAndActiveFalse(Long groupId, String alias);
    boolean existsByGroupIdAndAliasIgnoreCase(Long groupId, String alias);
    long countByGroupId(Long groupId);
}
