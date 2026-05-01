import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../services/api";

const LoginPage = () => {
  const [form, setForm] = useState({ identity: "", password: "" });
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const { data } = await api.post("/auth/login", form);
      login(data);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed.");
    }
  };

  return (
    <div className="mx-auto mt-16 max-w-md card space-y-4">
      <h1 className="text-2xl font-bold">Login</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <input
          className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
          placeholder="Email or username"
          value={form.identity}
          onChange={(e) => setForm((v) => ({ ...v, identity: e.target.value }))}
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
        <button className="w-full rounded-lg bg-indigo-600 py-2 hover:bg-indigo-500">Login</button>
      </form>
      {error && <p className="text-sm text-rose-300">{error}</p>}
      <p className="text-sm">
        New user?{" "}
        <Link to="/register" className="text-indigo-300">
          Register
        </Link>
      </p>
    </div>
  );
};

export default LoginPage;
