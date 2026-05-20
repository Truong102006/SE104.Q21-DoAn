package com.se104.goldstore.exception;

import com.se104.goldstore.dto.response.ApiError;
import com.se104.goldstore.dto.response.ApiResponse;
import jakarta.validation.ConstraintViolationException;
import java.util.ArrayList;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger LOGGER = LoggerFactory.getLogger(GlobalExceptionHandler.class);
    private static final String GENERIC_INTERNAL_ERROR_MESSAGE =
        "\u0110\u00e3 c\u00f3 l\u1ed7i h\u1ec7 th\u1ed1ng. Vui l\u00f2ng th\u1eed l\u1ea1i sau.";

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Object>> handleValidation(MethodArgumentNotValidException ex) {
        List<ApiError> errors = new ArrayList<>();
        for (FieldError fieldError : ex.getBindingResult().getFieldErrors()) {
            errors.add(new ApiError(fieldError.getField(), fieldError.getDefaultMessage()));
        }
        return ResponseEntity.badRequest().body(ApiResponse.failure("Validation error", errors));
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ApiResponse<Object>> handleConstraintViolation(ConstraintViolationException ex) {
        List<ApiError> errors = ex.getConstraintViolations().stream()
            .map(v -> new ApiError(v.getPropertyPath().toString(), v.getMessage()))
            .toList();

        return ResponseEntity.badRequest().body(ApiResponse.failure("Validation error", errors));
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse<Object>> handleNotFound(ResourceNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(ApiResponse.failure(ex.getMessage(), List.of(new ApiError("resource", ex.getMessage()))));
    }

    @ExceptionHandler({BusinessException.class, IllegalArgumentException.class})
    public ResponseEntity<ApiResponse<Object>> handleBusiness(RuntimeException ex) {
        return ResponseEntity.badRequest()
            .body(ApiResponse.failure(ex.getMessage(), List.of(new ApiError("business", ex.getMessage()))));
    }

    @ExceptionHandler({UnauthorizedException.class, AuthenticationException.class})
    public ResponseEntity<ApiResponse<Object>> handleUnauthorized(RuntimeException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
            .body(ApiResponse.failure(ex.getMessage(), List.of(new ApiError("auth", ex.getMessage()))));
    }

    @ExceptionHandler({ForbiddenException.class, AccessDeniedException.class})
    public ResponseEntity<ApiResponse<Object>> handleForbidden(RuntimeException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
            .body(ApiResponse.failure(ex.getMessage(), List.of(new ApiError("forbidden", ex.getMessage()))));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Object>> handleInternal(Exception ex) {
        LOGGER.error("Unhandled internal server error", ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(
                ApiResponse.failure(
                    GENERIC_INTERNAL_ERROR_MESSAGE,
                    List.of(new ApiError("internal", GENERIC_INTERNAL_ERROR_MESSAGE))
                )
            );
    }
}
