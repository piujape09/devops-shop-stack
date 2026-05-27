package com.shopk8s.product;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
@Profile("!test")
public class ProductSeeder implements CommandLineRunner {
    private final ProductRepository repo;

    @Override public void run(String... args) {
        if (repo.count() > 0) return;
        repo.saveAll(List.of(
            Product.builder().name("T-Shirt").description("100% cotton").price(19.99).build(),
            Product.builder().name("Coffee Mug").description("Ceramic, 350ml").price(9.50).build(),
            Product.builder().name("Notebook").description("A5, dotted").price(7.25).build()
        ));
    }
}
