package com.nhom586.ktxmanagement.dto.response;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ApiResponse<T> {
    int code;
    String message;
    T result;
}
