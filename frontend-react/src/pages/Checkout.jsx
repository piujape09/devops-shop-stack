import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { api } from "../api.js";

export default function Checkout() {
  const { items, total, clear } = useCart();
  const [address, setAddress] = useState("");
  const [status, setStatus] = useState("");
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setStatus("Placing order...");
    try {
      await api.checkout({
        address,
        items: items.map(({ id, qty }) => ({ id, qty })),
      });
      clear();
      setStatus("Order placed!");
      setTimeout(() => navigate("/products"), 1200);
    } catch (err) {
      setStatus(`Error: ${err.message}`);
    }
  };

  return (
    <div className="card">
      <h2>Checkout</h2>
      <p>Total: ${total.toFixed(2)}</p>
      <form onSubmit={submit}>
        <textarea
          placeholder="Shipping address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          required
        />
        <button type="submit" disabled={items.length === 0}>
          Place Order
        </button>
      </form>
      {status && <p>{status}</p>}
    </div>
  );
}
