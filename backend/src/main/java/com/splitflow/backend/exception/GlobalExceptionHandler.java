package com.splitflow.backend.exception;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.ErrorResponse;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

@RestControllerAdvice
public class GlobalExceptionHandler {
    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(MethodArgumentNotValidException exception) {
        String message = exception.getBindingResult().getFieldErrors().stream()
                .map(error -> error.getField() + ": " + error.getDefaultMessage())
                .collect(Collectors.joining("; "));
        return errorResponse(HttpStatus.BAD_REQUEST, message);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<Map<String, Object>> handleUnreadableMessage(HttpMessageNotReadableException exception) {
        return errorResponse(HttpStatus.BAD_REQUEST, "El cuerpo de la solicitud no tiene un formato válido");
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleNotFound(ResourceNotFoundException exception) {
        return errorResponse(HttpStatus.NOT_FOUND, exception.getMessage());
    }

    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<Map<String, Object>> handleMissingResource(NoResourceFoundException exception) {
        return errorResponse(HttpStatus.NOT_FOUND, "Recurso no encontrado");
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalArgument(IllegalArgumentException exception) {
        log.info("Solicitud rechazada: {}", exception.getMessage());
        log.debug("Detalle de la solicitud rechazada", exception);
        return errorResponse(HttpStatus.BAD_REQUEST, exception.getMessage());
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<Map<String, Object>> handleTypeMismatch(MethodArgumentTypeMismatchException exception) {
        return errorResponse(HttpStatus.BAD_REQUEST, "El parámetro '" + exception.getName() + "' no tiene un formato válido");
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, Object>> handleDataIntegrity(DataIntegrityViolationException exception) {
        log.warn("La operación viola una restricción de la base de datos", exception);
        return errorResponse(HttpStatus.CONFLICT, "La operación entra en conflicto con datos existentes. Intenta de nuevo.");
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleUnexpected(Exception exception) {
        // Los errores de cliente que Spring MVC ya resolvió (405, 415, parámetros faltantes...) conservan su status
        if (exception instanceof ErrorResponse clientError && clientError.getStatusCode().is4xxClientError()) {
            HttpStatus status = HttpStatus.valueOf(clientError.getStatusCode().value());
            return errorResponse(status, clientErrorMessage(status), clientError.getHeaders());
        }
        log.error("Error inesperado al procesar la solicitud", exception);
        return errorResponse(HttpStatus.INTERNAL_SERVER_ERROR, "Ocurrió un error interno en el servidor");
    }

    private String clientErrorMessage(HttpStatus status) {
        return switch (status) {
            case METHOD_NOT_ALLOWED -> "Método no permitido";
            case UNSUPPORTED_MEDIA_TYPE -> "Tipo de contenido no soportado";
            case NOT_ACCEPTABLE -> "Formato de respuesta no disponible";
            default -> "La solicitud no es válida";
        };
    }

    private ResponseEntity<Map<String, Object>> errorResponse(HttpStatus status, String message) {
        return errorResponse(status, message, HttpHeaders.EMPTY);
    }

    private ResponseEntity<Map<String, Object>> errorResponse(HttpStatus status, String message, HttpHeaders headers) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", Instant.now());
        body.put("status", status.value());
        body.put("error", status.getReasonPhrase());
        body.put("message", message == null || message.isBlank() ? status.getReasonPhrase() : message);
        return ResponseEntity.status(status).headers(headers).body(body);
    }
}