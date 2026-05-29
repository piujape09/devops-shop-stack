import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { api } from "../api.js";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const { user, token } = await api.login(form);
      login(user, token);
      navigate("/products");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card card-narrow">
      <h2>Welcome back</h2>
      <p className="muted">Sign in to continue shopping.</p>
      <form onSubmit={submit}>
        <div>
          <label>Email</label>
          <input
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
        </div>
        <div>
          <label>Password</label>
          <input
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
        </div>
        <button type="submit" disabled={submitting} className="btn-block">
          {submitting ? "Signing in..." : "Sign in"}
        </button>
      </form>
      {error && <p className="error">{error}</p>}
      <p className="muted" style={{ marginTop: 16, textAlign: "center" }}>
        Don't have an account? <Link to="/register">Create one</Link>
      </p>
    </div>
  );
}
