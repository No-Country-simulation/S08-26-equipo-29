package com.splitflow.backend.dto;

public class JoinGroupRequest {
    private String alias;
    private String deviceId;
    private String email;

    public String getAlias() { return alias; }
    public void setAlias(String alias) { this.alias = alias; }
    public String getDeviceId() { return deviceId; }
    public void setDeviceId(String deviceId) { this.deviceId = deviceId; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
}
