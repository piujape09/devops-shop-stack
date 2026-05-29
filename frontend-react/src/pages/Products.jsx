import { useEffect, useMemo, useState } from "react";
import { api } from "../api.js";
import { useCart } from "../context/CartContext.jsx";

const ALL = "All";

export default function Products() {
  const [products, setProducts]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");
  const [selectedCat, setSelectedCat] = useState(ALL);
  const [query, setQuery]           = useState("");
  const { add } = useCart();

  useEffect(() => {
    setLoading(true);
    api.listProducts()
      .then(setProducts)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  // Build category buckets with counts.
  const categories = useMemo(() => {
    const counts = new Map();
    for (const p of products) {
      const k = p.category || "Other";
      counts.set(k, (counts.get(k) || 0) + 1);
    }
    return [
      { name: ALL, count: products.length },
      ...Array.from(counts.entries())
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([name, count]) => ({ name, count })),
    ];
  }, [products]);

  const visible = useMemo(() => {
    return products.filter((p) => {
      const matchesCat = selectedCat === ALL || (p.category || "Other") === selectedCat;
      const q = query.trim().toLowerCase();
      const matchesQ  = !q ||
        p.name.toLowerCase().includes(q) ||
        (p.description || "").toLowerCase().includes(q);
      return matchesCat && matchesQ;
    });
  }, [products, selectedCat, query]);

  if (error) return <p className="error">{error}</p>;

  return (
    <>
      <section className="hero">
        <h1>Discover curated essentials</h1>
        <p>Apparel, electronics, stationery and more — handpicked for everyday life.</p>
      </section>

      <div className="catalog">
        <aside className="cat-sidebar">
          <h3>Categories</h3>
          <ul className="cat-list">
            {categories.map((c) => (
              <li key={c.name}>
                <button
                  className={selectedCat === c.name ? "selected" : ""}
                  onClick={() => setSelectedCat(c.name)}
                >
                  <span>{c.name}</span>
                  <span className="count">{c.count}</span>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <section>
          <div className="toolbar">
            <div className="search-box">
              <input
                type="search"
                placeholder="Search products..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <span className="result-count">
              {loading ? "Loading..." : `${visible.length} item${visible.length === 1 ? "" : "s"}`}
            </span>
          </div>

          {loading ? (
            <div className="product-grid">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="skeleton skeleton-card" />
              ))}
            </div>
          ) : visible.length === 0 ? (
            <div className="empty">
              <div className="icon">🛍️</div>
              <p>No products match your filters.</p>
            </div>
          ) : (
            <div className="product-grid">
              {visible.map((p) => (
                <article key={p.id} className="product-card">
                  <div
                    className="product-thumb"
                    style={p.imageUrl ? { backgroundImage: `url(${p.imageUrl})` } : {}}
                  >
                    {!p.imageUrl && <div className="product-thumb-placeholder">📦</div>}
                    {p.category && <span className="tag">{p.category}</span>}
                  </div>
                  <div className="product-body">
                    <h3>{p.name}</h3>
                    <p className="desc">{p.description}</p>
                    <span className="price">${p.price.toFixed(2)}</span>
                  </div>
                  <button className="add-btn" onClick={() => add(p)}>
                    Add to cart
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
