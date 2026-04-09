package com.nhom586.ktxmanagement.controller;


import com.nhom586.ktxmanagement.dto.request.AuthenticationRequest;
import com.nhom586.ktxmanagement.dto.request.IntrospectRequest;
import com.nhom586.ktxmanagement.dto.request.LogoutRequest;
import com.nhom586.ktxmanagement.dto.response.AuthenticationResponse;
import com.nhom586.ktxmanagement.dto.response.IntrospectResponse;
import com.nhom586.ktxmanagement.service.AuthenticationService;
import com.nimbusds.jose.JOSEException;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.text.ParseException;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AuthenticationController {
    AuthenticationService authenticationService;

    @PostMapping("/login")
    public AuthenticationResponse authenticationResponse (@RequestBody @Valid AuthenticationRequest request) throws JOSEException {
        var result = authenticationService.authenticate(request);

        return AuthenticationResponse.builder()
                .token(result.getToken())
                .isAuthenticated(result.isAuthenticated())
                .build();

    }

    @PostMapping("/introspect")
    public IntrospectResponse introspectResponse (@RequestBody IntrospectRequest request) throws ParseException, JOSEException {
        var result = authenticationService.introspectResponse(request);

        return IntrospectResponse.builder()
                .isValid(result.isValid())
                .build();
    }

    @PostMapping("/logout")
    public String logout (@RequestBody LogoutRequest request) throws ParseException, JOSEException {
        authenticationService.logout(request);

        return "logout thành công";
    }

}
