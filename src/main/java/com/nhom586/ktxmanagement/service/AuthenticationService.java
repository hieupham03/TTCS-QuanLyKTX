package com.nhom586.ktxmanagement.service;


import com.nhom586.ktxmanagement.dto.request.AuthenticationRequest;
import com.nhom586.ktxmanagement.dto.request.IntrospectRequest;
import com.nhom586.ktxmanagement.dto.response.AuthenticationResponse;
import com.nhom586.ktxmanagement.dto.response.IntrospectResponse;
import com.nhom586.ktxmanagement.entity.Account;
import com.nhom586.ktxmanagement.repository.AccountRepository;
import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.text.ParseException;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AuthenticationService {
    private final AccountRepository accountRepository;

    @Value("${jwt.secret}")
    private String signerKey;

    public AuthenticationService(AccountRepository accountRepository) {
        this.accountRepository = accountRepository;
    }

    public AuthenticationResponse authenticate (AuthenticationRequest request) throws JOSEException {
        Account account = accountRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("Tên tài khoản không tồn tại"));

        PasswordEncoder passwordEncoder = new BCryptPasswordEncoder(10);

        boolean authenticated = passwordEncoder.matches(request.getPasswordHash(), account.getPasswordHash());

        if(!authenticated)
            throw  new RuntimeException("Không thể xác thực");

        var token = generateToken(account);

        return AuthenticationResponse.builder()
                .token(token)
                .isAuthenticated(true)
                .build();
    }

    public String generateToken(Account account) throws JOSEException {
        JWSHeader jwsHeader = new JWSHeader(JWSAlgorithm.HS512);

        JWTClaimsSet jwtClaimsSet = new JWTClaimsSet.Builder()
                .subject(account.getUsername())
                .issuer("KTX.PTIT")
                .issueTime(new Date())
                .expirationTime(new Date(Instant.now().plus(30, ChronoUnit.MINUTES).toEpochMilli()))
                .claim("scope", account.getRole().getRoleName())
                .build();

        Payload payload = new Payload(jwtClaimsSet.toJSONObject());

        JWSObject jwsObject = new JWSObject(jwsHeader, payload);

        jwsObject.sign(new MACSigner(signerKey.getBytes()));
        return jwsObject.serialize();
    }

    public IntrospectResponse introspectResponse (IntrospectRequest request) throws JOSEException, ParseException {
        var token = request.getToken();

        JWSVerifier jwsVerifier = new MACVerifier(signerKey.getBytes());

        SignedJWT signedJWT = SignedJWT.parse(token);

        Date expiry = signedJWT.getJWTClaimsSet().getExpirationTime();

        var verified = signedJWT.verify(jwsVerifier);

        return IntrospectResponse.builder()
                .isValid(expiry.after(new Date()) && verified)
                .build();
    }
}
