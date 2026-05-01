package com.nhom586.ktxmanagement.exception;


import com.nhom586.ktxmanagement.dto.response.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.List;

@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(value = RuntimeException.class)
    public ResponseEntity<ApiResponse<Void>> handlingRuntimeException (RuntimeException exception) {
        ApiResponse<Void> apiResponse = ApiResponse.<Void>builder()
                .code(400)
                .message(exception.getMessage())
                .build();
        return ResponseEntity.badRequest().body(apiResponse);
    }

    @ExceptionHandler(value = MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Void>> handlingMethodArgumentNotValidException (MethodArgumentNotValidException exception) {
        StringBuilder message = new StringBuilder();
        List<FieldError> errors = exception.getFieldErrors();

        for(FieldError e :errors){
            message.append(e.getDefaultMessage()).append("; ");
        }

        ApiResponse<Void> apiResponse = ApiResponse.<Void>builder()
                .code(400)
                .message(message.toString())
                .build();
        return ResponseEntity.badRequest().body(apiResponse);
    }
}
