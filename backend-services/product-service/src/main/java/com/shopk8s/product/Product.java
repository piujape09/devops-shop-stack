package com.shopk8s.product;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "products")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class Product {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    @Column(length = 1000)
    private String description;
    private double price;
    private String category;
    @Column(length = 500)
    private String imageUrl;
}
