package com.shopk8s.gateway;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;

/**
 * GatewayFilter that validates an Authorization: Bearer <jwt> header and forwards
 * X-User-Id / X-User-Role / X-User-Email to downstream services.
 *
 * Apply per-route in application.yml via:
 *   filters:
 *     - name: JwtAuth
 */
@Component
@Slf4j
public class JwtAuthGatewayFilterFactory extends AbstractGatewayFilterFactory<JwtAuthGatewayFilterFactory.Config> {

    private final SecretKey key;
    private final String issuer;

    public JwtAuthGatewayFilterFactory(
            @Value("${security.jwt.secret}") String secret,
            @Value("${security.jwt.issuer:shopk8s}") String issuer) {
        super(Config.class);
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.issuer = issuer;
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            ServerHttpRequest req = exchange.getRequest();
            String auth = req.getHeaders().getFirst("Authorization");
            if (auth == null || !auth.startsWith("Bearer ")) {
                return unauthorized(exchange, "missing bearer token");
            }
            String token = auth.substring(7);
            try {
                Claims claims = Jwts.parser()
                        .verifyWith(key)
                        .requireIssuer(issuer)
                        .build()
                        .parseSignedClaims(token)
                        .getPayload();

                ServerHttpRequest mutated = req.mutate()
                        .header("X-User-Id",    claims.getSubject())
                        .header("X-User-Role",  String.valueOf(claims.get("role", String.class)))
                        .header("X-User-Email", String.valueOf(claims.get("email", String.class)))
                        .build();
                return chain.filter(exchange.mutate().request(mutated).build());
            } catch (JwtException e) {
                log.debug("JWT rejected: {}", e.getMessage());
                return unauthorized(exchange, "invalid token");
            }
        };
    }

    private Mono<Void> unauthorized(org.springframework.web.server.ServerWebExchange exchange, String reason) {
        exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
        exchange.getResponse().getHeaders().add("WWW-Authenticate", "Bearer error=\"" + reason + "\"");
        return exchange.getResponse().setComplete();
    }

    public static class Config { /* no options yet */ }
}
