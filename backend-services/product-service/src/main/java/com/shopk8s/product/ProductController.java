package com.shopk8s.product;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductRepository repo;

    @GetMapping
    public List<Product> list(@RequestParam(value = "category", required = false) String category) {
        if (category != null && !category.isBlank()) {
            return repo.findByCategoryIgnoreCase(category);
        }
        return repo.findAll();
    }

    @GetMapping("/categories")
    public List<String> categories() {
        return repo.findDistinctCategories();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> get(@PathVariable Long id) {
        return repo.findById(id).map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Product> create(@Valid @RequestBody ProductRequest req,
                                          @RequestHeader(value = "X-User-Role", required = false) String role) {
        if (role != null && !"admin".equalsIgnoreCase(role)) return ResponseEntity.status(403).build();
        Product saved = repo.save(Product.builder()
                .name(req.name())
                .description(req.description())
                .price(req.price())
                .category(req.category())
                .imageUrl(req.imageUrl())
                .build());
        return ResponseEntity.created(URI.create("/products/" + saved.getId())).body(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id,
                                       @RequestHeader(value = "X-User-Role", required = false) String role) {
        if (role != null && !"admin".equalsIgnoreCase(role)) return ResponseEntity.status(403).build();
        if (!repo.existsById(id)) return ResponseEntity.notFound().build();
        repo.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    public record ProductRequest(
            @NotBlank String name,
            String description,
            @PositiveOrZero double price,
            String category,
            String imageUrl) {}
}
