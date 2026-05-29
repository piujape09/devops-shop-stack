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
        // Reseed when the catalog is empty OR predates the category column.
        boolean catalogHasCategories = !repo.findDistinctCategories().isEmpty();
        if (catalogHasCategories) return;
        repo.deleteAll();

        repo.saveAll(List.of(
            // --- Apparel ----------------------------------------------------
            p("Classic Cotton T-Shirt",  "Soft 100% combed cotton, regular fit, pre-shrunk.",  19.99, "Apparel",
              "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600"),
            p("Zip-Up Hoodie",           "Brushed-fleece interior, ribbed cuffs, kangaroo pocket.", 49.00, "Apparel",
              "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600"),
            p("Slim Jeans",              "Stretch denim, 5-pocket, mid-rise. Indigo wash.",  59.50, "Apparel",
              "https://images.unsplash.com/photo-1542272604-787c3835535d?w=600"),

            // --- Drinkware --------------------------------------------------
            p("Ceramic Coffee Mug",      "350 ml matte-glaze ceramic, microwave-safe.",        9.50, "Drinkware",
              "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=600"),
            p("Insulated Travel Bottle", "Double-walled stainless steel, 24 h cold / 12 h hot.", 24.00, "Drinkware",
              "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600"),

            // --- Stationery -------------------------------------------------
            p("Dotted Notebook A5",      "160 pages, 90 gsm, lay-flat binding.",                7.25, "Stationery",
              "https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=600"),
            p("Gel Pen Set (12 colors)", "0.5 mm fine tip, quick-dry ink.",                    11.00, "Stationery",
              "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=600"),

            // --- Electronics ------------------------------------------------
            p("Wireless Earbuds Pro",    "Bluetooth 5.3, active noise cancelling, 30 h case.", 89.99, "Electronics",
              "https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=600"),
            p("Mechanical Keyboard",     "75% layout, hot-swappable switches, RGB.",          129.00, "Electronics",
              "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600"),
            p("USB-C Hub 7-in-1",        "HDMI 4K, 100 W PD, SD/microSD, 3x USB-A.",           39.00, "Electronics",
              "https://images.unsplash.com/photo-1625842268584-8f3296236761?w=600"),

            // --- Accessories ------------------------------------------------
            p("Leather Cardholder",      "Full-grain leather, 4 slots + center pocket.",       29.00, "Accessories",
              "https://images.unsplash.com/photo-1620625515032-6ed0c1790c75?w=600"),
            p("Canvas Tote Bag",         "Heavyweight 16 oz canvas, reinforced straps.",       18.00, "Accessories",
              "https://images.unsplash.com/photo-1591348278863-a8fb3887e2aa?w=600"),
            p("Aluminum Watch",          "316L stainless case, sapphire crystal, 5 ATM.",     149.00, "Accessories",
              "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=600")
        ));
    }

    private static Product p(String name, String desc, double price, String category, String img) {
        return Product.builder()
                .name(name).description(desc).price(price)
                .category(category).imageUrl(img)
                .build();
    }
}
