package com.splitflow.backend.dto;

import java.util.List;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class CreateGroupRequest {
    @NotBlank(message = "El nombre del grupo es obligatorio")
    @Size(max = 80, message = "El nombre del grupo no puede superar 80 caracteres")
    private String name;

    @NotBlank(message = "La moneda es obligatoria")
    @Pattern(regexp = "COP|USD|ARS|CLP", message = "La moneda debe ser COP, USD, ARS o CLP")
    private String currency;

    @Size(max = 50, message = "No puedes agregar más de 50 participantes")
    private List<@NotBlank(message = "Los participantes no pueden estar vacíos") String> aliases;

    @Size(max = 100, message = "El propietario no puede superar 100 caracteres")
    private String ownerId;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }
    public List<String> getAliases() { return aliases; }
    public void setAliases(List<String> aliases) { this.aliases = aliases; }
    public String getOwnerId() { return ownerId; }
    public void setOwnerId(String ownerId) { this.ownerId = ownerId; }
}