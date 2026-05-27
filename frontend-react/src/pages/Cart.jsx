import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";

export default function Cart() {
  const { items, remove, total } = useCart();

  if (items.length === 0) {
    return (
      <div className="card">
        <h2>Your cart is empty</h2>
        <Link to="/products">Browse products</Link>
      </div>
    );
  }

  return (
    <div>
      <h2>Cart</h2>
      <ul className="cart-list">
        {items.map((i) => (
          <li key={i.id}>
            <span>{i.name} × {i.qty}</span>
            <span>${(i.price * i.qty).toFixed(2)}</span>
            <button onClick={() => remove(i.id)}>Remove</button>
          </li>
        ))}
      </ul>
      <h3>Total: ${total.toFixed(2)}</h3>
      <Link to="/checkout" className="btn">Proceed to Checkout</Link>
    </div>
  );
}
