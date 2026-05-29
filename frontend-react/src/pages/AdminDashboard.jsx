import { useEffect, useState } from "react";
import { api } from "../api.js";

const EMPTY = { name: "", description: "", price: "", category: "", imageUrl: "" };

export default function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const refresh = async () => {
    try {
      const [items, cats] = await Promise.all([api.listProducts(), api.listCategories()]);
      setProducts(items);
      setCategories(cats);
    } catch (e) { setError(e.message); }
  };

  useEffect(() => { refresh(); }, []);

  const create = async (e) => {
    e.preventDefault();
    setError(""); setBusy(true);
    try {
      await api.createProduct({ ...form, price: parseFloat(form.price) });
      setForm(EMPTY);
      refresh();
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  };

  const remove = async (id) => {
    if (!confirm("Delete this product?")) return;
    await api.deleteProduct(id);
    refresh();
  };

  return (
    <>
      <h2>Admin dashboard</h2>
      <p className="muted">Manage the product catalog.</p>

      <div className="admin-grid">
        <div className="card">
          <h3>Add product</h3>
          <form onSubmit={create}>
            <div>
              <label>Name</label>
              <input
                placeholder="Wireless mouse"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label>Description</label>
              <textarea
                placeholder="Short description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div className="form-row">
              <div>
                <label>Price (USD)</label>
                <input
                  type="number" step="0.01" min="0"
                  placeholder="0.00"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  required
                />
              </div>
              <div>
                <label>Category</label>
                <input
                  list="cat-options"
                  placeholder="Apparel"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                />
                <datalist id="cat-options">
                  {categories.map((c) => <option key={c} value={c} />)}
                </datalist>
              </div>
            </div>
            <div>
              <label>Image URL</label>
              <input
                type="url"
                placeholder="https://..."
                value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              />
            </div>
            <button type="submit" disabled={busy}>
              {busy ? "Adding..." : "Add product"}
            </button>
          </form>
          {error && <p className="error">{error}</p>}
        </div>

        <div>
          <h3>Existing products ({products.length})</h3>
          {products.length === 0 ? (
            <div className="empty"><p>No products yet.</p></div>
          ) : (
            <ul className="admin-list">
              {products.map((p) => (
                <li key={p.id}>
                  <div
                    className="thumb"
                    style={p.imageUrl ? { backgroundImage: `url(${p.imageUrl})` } : {}}
                  />
                  <div className="meta">
                    <div className="name">{p.name}</div>
                    <div className="sub">
                      {p.category || "—"} · ${p.price.toFixed(2)}
                    </div>
                  </div>
                  <button className="btn-danger" onClick={() => remove(p.id)}>Delete</button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
