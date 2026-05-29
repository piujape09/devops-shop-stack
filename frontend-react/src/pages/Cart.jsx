import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";

export default function Cart() {
  const { items, remove, total } = useCart();

  if (items.length === 0) {
    return (
      <div className="empty">
        <div className="icon">🛒</div>
        <h2>Your cart is empty</h2>
        <p className="muted">Add some products and they'll show up here.</p>
        <Link to="/products" className="btn">Browse products</Link>
      </div>
    );
  }

  return (
    <>
      <h2>Your cart</h2>
      <div className="cart-grid">
        <ul className="cart-list">
          {items.map((i) => (
            <li key={i.id}>
              <div
                className="thumb"
                style={i.imageUrl ? { backgroundImage: `url(${i.imageUrl})` } : {}}
              />
              <div>
                <div className="name">{i.name}</div>
                <div className="qty">Qty: {i.qty}</div>
              </div>
              <div className="price">${(i.price * i.qty).toFixed(2)}</div>
              <button className="btn-ghost" onClick={() => remove(i.id)}>Remove</button>
            </li>
          ))}
        </ul>

        <aside className="summary">
          <h3>Order summary</h3>
          <div className="summary-row"><span>Items</span><span>{items.length}</span></div>
          <div className="summary-row"><span>Subtotal</span><span>${total.toFixed(2)}</span></div>
          <div className="summary-row"><span>Shipping</span><span>Free</span></div>
          <div className="summary-row total"><span>Total</span><span>${total.toFixed(2)}</span></div>
          <Link to="/checkout" className="btn btn-block" style={{ marginTop: 12 }}>
            Proceed to Checkout
          </Link>
        </aside>
      </div>
    </>
  );
}
