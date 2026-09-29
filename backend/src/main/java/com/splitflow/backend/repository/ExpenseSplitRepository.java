package com.splitflow.backend.repository;

import com.splitflow.backend.model.ExpenseSplit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ExpenseSplitRepository extends JpaRepository<ExpenseSplit, Long> {
    @Query("select s from ExpenseSplit s join fetch s.expense e where e.group.id = :groupId order by e.id, s.id")
    List<ExpenseSplit> findByGroupIdWithExpense(@Param("groupId") Long groupId);

    boolean existsByExpenseGroupIdAndParticipantIgnoreCase(Long groupId, String participant);
}
