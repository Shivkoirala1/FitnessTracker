import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import AuthLayout from "../components/AuthLayout.jsx";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <div className="flex items-center gap-2 mb-8 md:hidden">
        <span className="w-2.5 h-2.5 rounded-full bg-signal" aria-hidden="true" />
        <span className="font-display font-bold text-xl tracking-wide uppercase">
          Richard<span className="text-signal">Gym</span>
        </span>
      </div>

      <h1 className="font-display text-3xl font-bold uppercase tracking-wide mb-1">Log in</h1>
      <p className="text-muted text-sm mb-6">Pick up your training log where you left it.</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="email" placeholder="Email" value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="bg-panel border border-line rounded px-4 py-2.5 focus:outline-none focus:border-signal"
          required
        />
        <input
          type="password" placeholder="Password" value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="bg-panel border border-line rounded px-4 py-2.5 focus:outline-none focus:border-signal"
          required
        />
        {error && <p className="text-alert text-sm">{error}</p>}
        <button type="submit" disabled={loading} className="bg-signal text-ink font-medium rounded px-4 py-2.5 mt-2 disabled:opacity-50">
          {loading ? "Logging in..." : "Log in"}
        </button>
      </form>
      <p className="text-muted text-sm mt-4">
        No account? <Link to="/register" className="text-signal">Register</Link>
      </p>
    </AuthLayout>
  );
}
