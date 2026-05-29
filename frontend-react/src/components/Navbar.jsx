import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { items } = useCart();
  const cartCount = items.reduce((n, i) => n + (i.qty || 1), 0);
  const initial = user?.name ? user.name.charAt(0).toUpperCase() : "?";

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="brand">
          <span className="brand-logo">S</span>
          ShopK8s
        </Link>

        <div className="nav-links">
          <NavLink to="/products" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>
            Shop
          </NavLink>
          <NavLink to="/cart" className={({ isActive }) => "nav-link cart-link" + (isActive ? " active" : "")}>
            Cart
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </NavLink>
          {user?.role === "admin" && (
            <NavLink to="/admin" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>
              Admin
            </NavLink>
          )}
        </div>

        <div className="nav-cta">
          {user ? (
            <>
              <span className="user-chip">
                <span className="avatar">{initial}</span>
                {user.name}
              </span>
              <button className="btn-ghost" onClick={logout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-ghost">Login</Link>
              <Link to="/register" className="btn">Sign up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
