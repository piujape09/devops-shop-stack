const API_BASE = import.meta.env.VITE_API_BASE || "/api";

async function request(path, options = {}) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    ...options,
  });
  if (!res.ok) {
    const msg = await res.text();
    throw new Error(msg || `Request failed: ${res.status}`);
  }
  return res.status === 204 ? null : res.json();
}

function qs(params) {
  const entries = Object.entries(params || {}).filter(([, v]) => v != null && v !== "");
  if (!entries.length) return "";
  return "?" + new URLSearchParams(entries).toString();
}

export const api = {
  login:           (data)        => request("/auth/login", { method: "POST", body: JSON.stringify(data) }),
  register:        (data)        => request("/auth/register", { method: "POST", body: JSON.stringify(data) }),

  listProducts:    (params = {}) => request(`/products${qs(params)}`),
  listCategories:  ()            => request("/products/categories"),
  createProduct:   (data)        => request("/products", { method: "POST", body: JSON.stringify(data) }),
  deleteProduct:   (id)          => request(`/products/${id}`, { method: "DELETE" }),

  checkout:        (data)        => request("/orders", { method: "POST", body: JSON.stringify(data) }),
};
