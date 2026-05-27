package com.shopk8s.order;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.util.Map;

/**
 * Thin client for product-service. Used during checkout to look up
 * the current price for each line item.
 */
@Component
@Slf4j
public class ProductClient {

    private final RestClient client;

    public ProductClient(RestClient.Builder builder,
                         @Value("${services.product.base-url}") String baseUrl) {
        this.client = builder.baseUrl(baseUrl).build();
    }

    public double fetchPrice(Long productId) {
        try {
            Map<?, ?> body = client.get()
                    .uri("/products/{id}", productId)
                    .retrieve()
                    .body(Map.class);
            if (body == null || body.get("price") == null) {
                throw new IllegalStateException("Product %d missing price".formatted(productId));
            }
            return ((Number) body.get("price")).doubleValue();
        } catch (RestClientException e) {
            log.error("product-service lookup failed for id={}", productId, e);
            throw new IllegalStateException("Product " + productId + " not available", e);
        }
    }
}
