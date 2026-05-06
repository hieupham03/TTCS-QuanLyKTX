package com.nhom586.ktxmanagement.service;


import com.nhom586.ktxmanagement.dto.request.AuthenticationRequest;
import com.nhom586.ktxmanagement.dto.request.IntrospectRequest;
import com.nhom586.ktxmanagement.dto.request.LogoutRequest;
import com.nhom586.ktxmanagement.dto.response.AuthenticationResponse;
import com.nhom586.ktxmanagement.dto.response.IntrospectResponse;
import com.nhom586.ktxmanagement.entity.Account;
import com.nhom586.ktxmanagement.entity.InvalidatedToken;
import com.nhom586.ktxmanagement.repository.AccountRepository;
import com.nhom586.ktxmanagement.repository.InvalidateTokenRepository;
import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.text.ParseException;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AuthenticationService {

    AccountRepository accountRepository;
    InvalidateTokenRepository invalidateTokenRepository;
    PasswordEncoder passwordEncoder;


    @NonFinal
    @Value("${jwt.secret}")
    String signerKey;


    public AuthenticationResponse authenticate (AuthenticationRequest request) throws JOSEException {
        Account account = accountRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("Tên tài khoản không tồn tại"));

        if(!account.getIsActive()) {
            throw new RuntimeException("Tài khoản đã bị vô hiệu hoá");
        }


        boolean authenticated = passwordEncoder.matches(request.getPasswordHash(), account.getPasswordHash());

        if(!authenticated)
            throw  new RuntimeException("Không thể xác thực");

        var token = generateToken(account);

        return AuthenticationResponse.builder()
                .token(token)
                .isAuthenticated(true)
                .build();
    }

    public void logout (LogoutRequest request) throws ParseException, JOSEException {

        try {
            var signToken = verifyToken(request.getToken());
            System.out.println(request.getToken());

            // Lấy thông tin id và thời hạn token
            String jti = signToken.getJWTClaimsSet().getJWTID();
            Date expiryTime = signToken.getJWTClaimsSet().getExpirationTime();

            //Thêm vào bảng InvalidatedToken
            InvalidatedToken invalidatedToken = InvalidatedToken.builder()
                    .id(jti)
                    .expiryTime(expiryTime)
                    .build();

            invalidateTokenRepository.save(invalidatedToken);
        }
        catch (RuntimeException e) {
            log.info("Token đã hết hạn");
        }
    }



    public IntrospectResponse introspectResponse (IntrospectRequest request) throws JOSEException, ParseException {
        var token = request.getToken();

        boolean isValid = true;

        try {
            verifyToken(request.getToken());
        } catch (RuntimeException e) {
            isValid = false;
        }

        return IntrospectResponse.builder()
                .isValid(isValid)
                .build();
    }

    private String generateToken(Account account) throws JOSEException {
        JWSHeader jwsHeader = new JWSHeader(JWSAlgorithm.HS512);

        JWTClaimsSet jwtClaimsSet = new JWTClaimsSet.Builder()
                .subject(account.getUsername())
                .issuer("KTX.PTIT")
                // thời gian tạo token
                .issueTime(new Date())
                // thời gian hết hạn của Token
                .expirationTime(new Date(Instant.now().plus(12, ChronoUnit.HOURS).toEpochMilli()))
                // Tạo id ngẫu nhiên cho token
                .jwtID(UUID.randomUUID().toString())
                .claim("scope", account.getRole().getRoleName())
                .build();

        Payload payload = new Payload(jwtClaimsSet.toJSONObject());

        JWSObject jwsObject = new JWSObject(jwsHeader, payload);

        jwsObject.sign(new MACSigner(signerKey.getBytes()));
        return jwsObject.serialize();
    }

    // Xác thực token
    private SignedJWT verifyToken (String token) throws JOSEException, ParseException {

        JWSVerifier jwsVerifier = new MACVerifier(signerKey.getBytes());

        // giải mã chuỗi
        SignedJWT signedJWT = SignedJWT.parse(token);

        // Lấy thời hạn token và kiểm tra chữ ký
        Date expiry = signedJWT.getJWTClaimsSet().getExpirationTime();
        var verified = signedJWT.verify(jwsVerifier);

        if(!(verified && expiry.after(new Date())))
            throw new RuntimeException("Không thể xác thực!!!");

        if(invalidateTokenRepository.existsById(signedJWT.getJWTClaimsSet().getJWTID()))
            throw new RuntimeException("Token đã hết hạn");

        return signedJWT;
    }
}
