package com.splitflow.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
@Table(name = "group_members", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"group_id", "alias"})
})
public class GroupMember {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 40)
    private String alias;

    @Column(length = 64)
    private String deviceId;

    @Column(length = 160)
    private String email;

    @Column(nullable = false)
    private boolean active;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id", nullable = false)
    @JsonIgnore
    private Group group;

    public GroupMember() {}

    public GroupMember(String alias, String deviceId, boolean active, Group group) {
        this.alias = alias;
        this.deviceId = deviceId;
        this.active = active;
        this.group = group;
    }

    public Long getId() { return id; }
    public String getAlias() { return alias; }
    public void setAlias(String alias) { this.alias = alias; }
    public String getDeviceId() { return deviceId; }
    public void setDeviceId(String deviceId) { this.deviceId = deviceId; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
    public Group getGroup() { return group; }
    public void setGroup(Group group) { this.group = group; }
}
