import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import AuthLayout from "../components/AuthLayout.jsx";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "", email: "", password: "",
    age: "", height: "", weight: "", sex: "male", activityLevel: "moderate", goal: "maintain",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register({
        ...form,
        age: Number(form.age) || undefined,
        height: Number(form.height) || undefined,
        weight: Number(form.weight) || undefined,
      });
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }
  const inputClass = "bg-panel border border-line rounded px-4 py-2.5 focus:outline-none focus:border-signal w-full";

  return (
    <AuthLayout maxWidthClass="max-w-md">
      <div className="flex items-center gap-2 mb-8 md:hidden">
        <span className="w-2.5 h-2.5 rounded-full bg-signal" aria-hidden="true" />
        <span className="font-display font-bold text-xl tracking-wide uppercase">
          Richard<span className="text-signal">Gym</span>
        </span>
      </div>

      <h1 className="font-display text-3xl font-bold uppercase tracking-wide mb-1">Create account</h1>
      <p className="text-muted text-sm mb-6">Start the log. First entry's free.</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input placeholder="Name" value={form.name} onChange={(e) => update("name", e.target.value)} className={inputClass} required />
        <input type="email" placeholder="Email" value={form.email} onChange={(e) => update("email", e.target.value)} className={inputClass} required />
        <input type="password" placeholder="Password (min. 6 characters)" value={form.password} onChange={(e) => update("password", e.target.value)} className={inputClass} minLength={6} required />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input type="number" placeholder="Age" value={form.age} onChange={(e) => update("age", e.target.value)} className={inputClass} min="1" max="120" />
          <input type="number" placeholder="Height (cm)" value={form.height} onChange={(e) => update("height", e.target.value)} className={inputClass} min="50" max="250" />
          <input type="number" placeholder="Weight (kg)" value={form.weight} onChange={(e) => update("weight", e.target.value)} className={inputClass} min="20" max="400" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <select value={form.sex} onChange={(e) => update("sex", e.target.value)} className={inputClass}>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
          <select value={form.activityLevel} onChange={(e) => update("activityLevel", e.target.value)} className={inputClass}>
            <option value="sedentary">Sedentary</option>
            <option value="light">Light</option>
            <option value="moderate">Moderate</option>
            <option value="active">Active</option>
            <option value="very_active">Very active</option>
          </select>
          <select value={form.goal} onChange={(e) => update("goal", e.target.value)} className={inputClass}>
            <option value="bulk">Bulk</option>
            <option value="cut">Cut</option>
            <option value="maintain">Maintain</option>
          </select>
        </div>

        {error && <p className="text-alert text-sm">{error}</p>}
        <button type="submit" disabled={loading} className="bg-signal text-ink font-medium rounded px-4 py-2.5 mt-2 disabled:opacity-50">
          {loading ? "Creating account..." : "Create account"}
        </button>
      </form>
      <p className="text-muted text-sm mt-4">
        Already have an account? <Link to="/login" className="text-signal">Log in</Link>
      </p>
    </AuthLayout>
  );
}
