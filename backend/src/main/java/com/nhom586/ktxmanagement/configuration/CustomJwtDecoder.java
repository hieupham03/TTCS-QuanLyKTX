package com.nhom586.ktxmanagement.configuration;

import com.nhom586.ktxmanagement.dto.request.IntrospectRequest;
import com.nhom586.ktxmanagement.service.AuthenticationService;
import com.nimbusds.jose.JOSEException;
import lombok.experimental.NonFinal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.stereotype.Component;

import javax.crypto.spec.SecretKeySpec;
import java.text.ParseException;
import java.util.Objects;

// giải mã và xác thực token
@Component
public class CustomJwtDecoder implements JwtDecoder {
    @Value("${jwt.secret}")
    String signerKey;

    private final AuthenticationService  authenticationService;

    private NimbusJwtDecoder nimbusJwtDecoder = null;

    public CustomJwtDecoder(@Lazy AuthenticationService authenticationService) {
        this.authenticationService = authenticationService;
    }

    @Override
    public Jwt decode(String token) {

        try{
            var response = authenticationService.introspectResponse
                    (IntrospectRequest.builder().token(token).build());

            if(!response.isValid())
                throw  new JwtException("Token không hợp lệ");
        } catch (ParseException | JOSEException e) {
            throw new RuntimeException(e);
        }

        if(Objects.isNull(nimbusJwtDecoder)) {
            SecretKeySpec secretKeySpec =  new SecretKeySpec(signerKey.getBytes(), "HS512");
            nimbusJwtDecoder = NimbusJwtDecoder
                    .withSecretKey(secretKeySpec)
                    .macAlgorithm(MacAlgorithm.HS512)
                    .build();
        }

        return nimbusJwtDecoder.decode(token);
    }

}
