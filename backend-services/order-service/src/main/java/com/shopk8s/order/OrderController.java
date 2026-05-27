package com.shopk8s.order;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.time.Instant;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderRepository repo;
    private final ProductClient products;

    @PostMapping
    @Transactional
    public ResponseEntity<?> create(@RequestHeader(value = "X-User-Id", required = false) Long userId,
                                    @Valid @RequestBody OrderRequest req) {
        if (userId == null) return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));

        Order order = Order.builder()
                .userId(userId)
                .address(req.address())
                .status("PENDING")
                .createdAt(Instant.now())
                .build();

        double total = 0.0;
        for (LineItem li : req.items()) {
            double price = products.fetchPrice(li.id());
            total += price * li.qty();
            order.getItems().add(OrderItem.builder()
                    .order(order)
                    .productId(li.id())
                    .qty(li.qty())
                    .priceAtPurchase(price)
                    .build());
        }
        order.setTotalPrice(Math.round(total * 100.0) / 100.0);

        Order saved = repo.save(order);
        return ResponseEntity.created(URI.create("/orders/" + saved.getId())).body(saved);
    }

    @GetMapping
    public List<Order> mine(@RequestHeader(value = "X-User-Id", required = false) Long userId) {
        if (userId == null) return List.of();
        return repo.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Order> get(@PathVariable Long id,
                                     @RequestHeader(value = "X-User-Id", required = false) Long userId) {
        return repo.findById(id)
                .filter(o -> userId != null && o.getUserId().equals(userId))
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    public record LineItem(@NotNull Long id, @Positive int qty) {}

    public record OrderRequest(
            @NotEmpty String address,
            @NotEmpty List<@Valid LineItem> items) {}
}
