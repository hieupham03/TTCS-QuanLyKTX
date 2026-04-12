package com.nhom586.ktxmanagement.configuration;


import lombok.experimental.NonFinal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final String[] PUBLIC_ENDPOINTS = {
            "/api/auth/login", "/api/registrations", "/api/auth/logout", "/api/forgotPassword/**"
                                                };
    @Value("${jwt.secret}")
    String signerKey;

    @Autowired
    private CustomJwtDecoder customJwtDecoder;


    // Bảo mật hệ thống
    // Bảo mật hệ thống
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity httpSecurity) throws Exception {
        // Nở khoá tất cả
        httpSecurity.authorizeHttpRequests(request ->
                request.requestMatchers(HttpMethod.POST, PUBLIC_ENDPOINTS).permitAll()
                        .requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()

                        // Các API mở cho Sinh Viên và Admin cùng truy cập (Xem hóa đơn, tạo đơn, xem lịch sử sửa chữa/đăng ký)
                        .requestMatchers(HttpMethod.GET, "/api/invoices/**", "/api/repair-requests/**", "/api/registrations/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/repair-requests/**").authenticated()

                        // Các thao tác còn lại (PUT Update Status, Delete, ...) bắt buộc là ADMIN
                        .requestMatchers("/api/invoices/**", "/api/repair-requests/**", "/api/registrations/**").hasRole("ADMIN")

                        // Toàn bộ các luồng Quản trị khác (Phòng, Sinh viên, Hợp đồng, Dịch vụ, Tài khoản) -> ADMIN
                        .requestMatchers("/api/rooms/**", "/api/students/**", "/api/contracts/**", "/api/buildings/**", 
                                "/api/service-metrics/**", "/api/service-prices/**", "/api/accounts/**", "/api/dashboard/**").hasRole("ADMIN")

                        .anyRequest().authenticated()
        );

        httpSecurity.csrf(AbstractHttpConfigurer::disable);

        // Cần token để mở khoá
        httpSecurity.oauth2ResourceServer(oauth2 ->
                oauth2.jwt(jwtConfigurer ->
                        jwtConfigurer.decoder(customJwtDecoder)
                                .jwtAuthenticationConverter(jwtAuthenticationConverter())
                )
        );

        return httpSecurity.build();
    }


//    @Bean
//    public JwtDecoder jwtDecoder() {
//        SecretKeySpec secretKeySpec = new SecretKeySpec(signerKey.getBytes(), "HS512");
//
//        return NimbusJwtDecoder
//                .withSecretKey(secretKeySpec)
//                .macAlgorithm(MacAlgorithm.HS512)
//                .build();
//    }


    // Đổi SCOPE_ thành ROLE_
    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtGrantedAuthoritiesConverter jwtGrantedAuthoritiesConverter = new JwtGrantedAuthoritiesConverter();
        jwtGrantedAuthoritiesConverter.setAuthorityPrefix("ROLE_");

        JwtAuthenticationConverter jwtAuthenticationConverter = new JwtAuthenticationConverter();
        jwtAuthenticationConverter.setJwtGrantedAuthoritiesConverter(jwtGrantedAuthoritiesConverter);

        return jwtAuthenticationConverter;
    }

    // Mã hoá mật khẩu
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(10);
    }

}
