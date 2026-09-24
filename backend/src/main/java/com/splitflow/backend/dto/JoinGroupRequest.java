package com.splitflow.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class JoinGroupRequest {
    @NotBlank(message = "Debes ingresar un nombre para unirte")
    @Size(max = 40, message = "El nombre no puede superar 40 caracteres")
    private String alias;

    @Size(max = 100, message = "El dispositivo no puede superar 100 caracteres")
    private String deviceId;

    @Email(message = "El email no tiene un formato válido")
    @Size(max = 254, message = "El email no puede superar 254 caracteres")
    private String email;

    public String getAlias() { return alias; }
    public void setAlias(String alias) { this.alias = alias; }
    public String getDeviceId() { return deviceId; }
    public void setDeviceId(String deviceId) { this.deviceId = deviceId; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
}
