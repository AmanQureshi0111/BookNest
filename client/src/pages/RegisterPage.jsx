import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../services/api";

const RegisterPage = () => {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const register = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const { data } = await api.post("/auth/register", form);
      login(data);
      setMsg("Registration successful.");
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed.");
    }
  };

  return (
    <div className="mx-auto mt-12 max-w-md card space-y-4">
      <h1 className="text-2xl font-bold">Register</h1>
      <form onSubmit={register} className="space-y-3">
        <input
          className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
          placeholder="Username"
          value={form.username}
          onChange={(e) => setForm((v) => ({ ...v, username: e.target.value }))}
          required
        />
        <input
          className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
          placeholder="Email"
          type="email"
          value={form.email}
          onChange={(e) => setForm((v) => ({ ...v, email: e.target.value }))}
          required
        />
        <input
          className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
          placeholder="Password"
          type="password"
          value={form.password}
          onChange={(e) => setForm((v) => ({ ...v, password: e.target.value }))}
          required
        />
        <button className="w-full rounded-lg bg-indigo-600 py-2 hover:bg-indigo-500">Create account</button>
      </form>
      {msg && <p className="text-sm text-emerald-300">{msg}</p>}
      {error && <p className="text-sm text-rose-300">{error}</p>}
      <p className="text-sm">
        Already have an account?{" "}
        <Link to="/login" className="text-indigo-300">
          Login
        </Link>
      </p>
    </div>
  );
};

export default RegisterPage;
