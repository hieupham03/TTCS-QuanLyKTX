package com.nhom586.ktxmanagement.exception;


import org.springframework.http.ResponseEntity;
import org.springframework.validation.Errors;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.util.Collections;
import java.util.List;

@ControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(value = RuntimeException.class)
    ResponseEntity<String> handlingRuntimeException (RuntimeException exception) {

        return  ResponseEntity.badRequest().body(exception.getMessage());
    }

    @ExceptionHandler(value = MethodArgumentNotValidException.class)
    ResponseEntity<String> handlingMethodArgumentNotValidException (MethodArgumentNotValidException exception) {
        StringBuilder message = new StringBuilder();
        List<FieldError> errors = exception.getFieldErrors();

        for(FieldError e :errors){
            message.append(e.getDefaultMessage() + "\n");
        }

        return  ResponseEntity.badRequest().body(message.toString());
    }
}
