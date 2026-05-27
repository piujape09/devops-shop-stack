package com.shopk8s.user;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository repo;

    // Gateway injects X-User-Id after validating JWT.
    @GetMapping("/me")
    public ResponseEntity<?> me(@RequestHeader(value = "X-User-Id", required = false) Long userId) {
        if (userId == null) return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        return repo.findById(userId)
                .<ResponseEntity<?>>map(u -> ResponseEntity.ok(Map.of(
                        "id", u.getId(), "name", u.getName(), "email", u.getEmail(), "role", u.getRole())))
                .orElse(ResponseEntity.notFound().build());
    }
}
