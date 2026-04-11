package com.nhom586.ktxmanagement.dto.response;


import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
public class MailBodyResponse {
    String to;

    String subject;

    String content;
}
