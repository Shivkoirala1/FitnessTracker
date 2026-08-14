import { useEffect, useState } from "react";
import client from "../api/client.js";
import { useToast } from "../context/ToastContext.jsx";

const inputClass = "bg-panel border border-line rounded px-3 py-2 focus:outline-none focus:border-signal";

export default function Profile() {
  const { showToast } = useToast();
  const [form, setForm] = useState(null);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  async function load() {
    const res = await client.get("/auth/me");
    setForm(res.data.user);
    setStats({ bmr: res.data.bmr, tdee: res.data.tdee, targetCalories: res.data.targetCalories });
  }

  useEffect(() => { load(); }, []);

  function update(field, value) {
    setSaved(false);
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSaved(false);
    setLoading(true);
    try {
      const res = await client.put("/auth/me", {
        ...form,
        age: Number(form.age) || undefined,
        height: Number(form.height) || undefined,
        weight: Number(form.weight) || undefined,
      });
      setForm(res.data.user);
      setStats({ bmr: res.data.bmr, tdee: res.data.tdee, targetCalories: res.data.targetCalories });
      setSaved(true);
      showToast("Profile saved");
    } catch (err) {
      setError(err.response?.data?.message || "Could not save changes");
    } finally {
      setLoading(false);
    }
  }

  if (!form) return <p className="text-muted">Loading...</p>;

  return (
    <div>
      <h1 className="font-display text-2xl sm:text-3xl font-bold uppercase tracking-wide mb-6">Profile</h1>

      {stats && (
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-8">
          <Stat label="BMR" value={stats.bmr ? Math.round(stats.bmr) : "—"} />
          <Stat label="TDEE" value={stats.tdee ? Math.round(stats.tdee) : "—"} />
          <Stat label="Target calories" value={stats.targetCalories ?? "—"} />
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-md">
        <input placeholder="Name" value={form.name} onChange={(e) => update("name", e.target.value)} className={inputClass} required />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input type="number" placeholder="Age" value={form.age || ""} onChange={(e) => update("age", e.target.value)} className={inputClass} min="1" max="120" />
          <input type="number" placeholder="Height (cm)" value={form.height || ""} onChange={(e) => update("height", e.target.value)} className={inputClass} min="50" max="250" />
          <input type="number" placeholder="Weight (kg)" value={form.weight || ""} onChange={(e) => update("weight", e.target.value)} className={inputClass} min="20" max="400" />
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
        {saved && <p className="text-signal text-sm">Saved.</p>}
        <button type="submit" disabled={loading} className="bg-signal text-ink font-medium rounded px-4 py-2 mt-1 self-start disabled:opacity-50">
          {loading ? "Saving..." : "Save changes"}
        </button>
      </form>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="bg-panel border border-line rounded-xl px-2.5 sm:px-4 py-3 sm:py-4">
      <p className="text-muted text-[11px] sm:text-xs uppercase tracking-wide">{label}</p>
      <p className="font-mono text-lg sm:text-xl font-medium mt-1">{value}</p>
    </div>
  );
}
