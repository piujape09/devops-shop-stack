import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { api } from "../api.js";

export default function Checkout() {
  const { items, total, clear } = useCart();
  const [address, setAddress] = useState("");
  const [status, setStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setStatus("Placing order...");
    try {
      await api.checkout({
        address,
        items: items.map(({ id, qty }) => ({ id, qty })),
      });
      clear();
      setStatus("✓ Order placed successfully");
      setTimeout(() => navigate("/products"), 1400);
    } catch (err) {
      setStatus(`Error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="cart-grid">
      <div className="card">
        <h2>Shipping details</h2>
        <form onSubmit={submit}>
          <div>
            <label>Delivery address</label>
            <textarea
              placeholder="Street, city, postal code, country"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </div>
          <button type="submit" disabled={submitting || items.length === 0} className="btn-block">
            {submitting ? "Placing..." : `Place order — $${total.toFixed(2)}`}
          </button>
        </form>
        {status && <p style={{ marginTop: 12 }}>{status}</p>}
      </div>

      <aside className="summary">
        <h3>Order summary</h3>
        {items.map((i) => (
          <div className="summary-row" key={i.id}>
            <span>{i.name} × {i.qty}</span>
            <span>${(i.price * i.qty).toFixed(2)}</span>
          </div>
        ))}
        <div className="summary-row total">
          <span>Total</span><span>${total.toFixed(2)}</span>
        </div>
      </aside>
    </div>
  );
}
