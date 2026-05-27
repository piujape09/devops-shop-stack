import { useEffect, useState } from "react";
import { api } from "../api.js";

export default function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ name: "", description: "", price: "" });
  const [error, setError] = useState("");

  const refresh = () => api.listProducts().then(setProducts).catch((e) => setError(e.message));

  useEffect(() => {
    refresh();
  }, []);

  const create = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.createProduct({ ...form, price: parseFloat(form.price) });
      setForm({ name: "", description: "", price: "" });
      refresh();
    } catch (err) {
      setError(err.message);
    }
  };

  const remove = async (id) => {
    await api.deleteProduct(id);
    refresh();
  };

  return (
    <div>
      <h2>Admin Dashboard</h2>
      <div className="card">
        <h3>Add Product</h3>
        <form onSubmit={create}>
          <input
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <input
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <input
            type="number"
            step="0.01"
            placeholder="Price"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            required
          />
          <button type="submit">Create</button>
        </form>
        {error && <p className="error">{error}</p>}
      </div>

      <h3>Existing Products</h3>
      <ul className="admin-list">
        {products.map((p) => (
          <li key={p.id}>
            <span>{p.name} — ${p.price.toFixed(2)}</span>
            <button onClick={() => remove(p.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
