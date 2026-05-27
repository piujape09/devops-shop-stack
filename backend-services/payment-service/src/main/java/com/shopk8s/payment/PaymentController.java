package com.shopk8s.payment;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/payments")
public class PaymentController {

    private static final double MAX_AMOUNT = 10_000.0;

    @PostMapping
    public ResponseEntity<?> charge(@Valid @RequestBody PaymentRequest req,
                                    @RequestHeader(value = "X-User-Id", required = false) Long userId) {
        if (userId == null) return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));

        boolean approved = req.amount() <= MAX_AMOUNT;
        return ResponseEntity.ok(Map.of(
                "paymentId", UUID.randomUUID().toString(),
                "orderId",   req.orderId(),
                "amount",    req.amount(),
                "method",    req.method() == null ? "MOCK" : req.method(),
                "status",    approved ? "APPROVED" : "DECLINED",
                "reason",    approved ? "ok" : "amount exceeds limit",
                "timestamp", Instant.now().toString()
        ));
    }

    public record PaymentRequest(
            @NotNull Long orderId,
            @Positive double amount,
            String method) {}
}
