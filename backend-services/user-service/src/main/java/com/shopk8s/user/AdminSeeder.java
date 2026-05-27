package com.shopk8s.user;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Profile("!test")
public class AdminSeeder implements CommandLineRunner {
    private final UserRepository repo;
    private final PasswordEncoder encoder;

    @Override public void run(String... args) {
        if (repo.existsByEmail("admin@shopk8s.local")) return;
        repo.save(User.builder()
                .name("Admin")
                .email("admin@shopk8s.local")
                .passwordHash(encoder.encode("admin123"))
                .role("admin")
                .build());
    }
}
