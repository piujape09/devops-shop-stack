import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { items } = useCart();

  return (
    <nav className="navbar">
      <Link to="/" className="brand">ShopK8s</Link>
      <div className="links">
        <NavLink to="/products">Products</NavLink>
        <NavLink to="/cart">Cart ({items.length})</NavLink>
        {user?.role === "admin" && <NavLink to="/admin">Admin</NavLink>}
        {user ? (
          <>
            <span className="user">Hi, {user.name}</span>
            <button onClick={logout}>Logout</button>
          </>
        ) : (
          <>
            <NavLink to="/login">Login</NavLink>
            <NavLink to="/register">Register</NavLink>
          </>
        )}
      </div>
    </nav>
  );
}
