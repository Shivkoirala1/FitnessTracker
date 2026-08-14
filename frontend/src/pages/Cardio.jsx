import { useEffect, useState } from "react";
import client from "../api/client.js";
import { useToast } from "../context/ToastContext.jsx";

const inputClass = "bg-panel border border-line rounded px-3 py-2 focus:outline-none focus:border-signal";

const QUICK_PRESETS = [
  { label: "20 min walk", type: "walk", durationMinutes: 20 },
  { label: "30 min walk", type: "walk", durationMinutes: 30 },
  { label: "45 min walk", type: "walk", durationMinutes: 45 },
  { label: "20 min run", type: "run", durationMinutes: 20 },
  { label: "30 min cycle", type: "cycle", durationMinutes: 30 },
];

export default function Cardio() {
  const { showToast } = useToast();
  const [form, setForm] = useState({ type: "walk", distanceKm: "", durationMinutes: "", steps: "" });
  const [sessions, setSessions] = useState([]);
  const [weekSummary, setWeekSummary] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadAll() {
    const res = await client.get("/cardio");
    setSessions(res.data);
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const summaryRes = await client.get(`/cardio/summary?from=${weekAgo}`);
    setWeekSummary(summaryRes.data.totals);
  }

  useEffect(() => { loadAll(); }, []);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function submitPayload(payload) {
    setError("");
    setLoading(true);
    try {
      const res = await client.post("/cardio", payload);
      setSessions((prev) => [res.data, ...prev]);
      setWeekSummary((prev) =>
        prev && {
          distanceKm: prev.distanceKm + (res.data.distanceKm || 0),
          durationMinutes: prev.durationMinutes + (res.data.durationMinutes || 0),
          steps: prev.steps + (res.data.steps || 0),
          caloriesBurned: prev.caloriesBurned + (res.data.caloriesBurned || 0),
        }
      );
      showToast(`${res.data.type[0].toUpperCase()}${res.data.type.slice(1)} logged — ${res.data.caloriesBurned} kcal`);
      setForm({ type: "walk", distanceKm: "", durationMinutes: "", steps: "" });
    } catch (err) {
      setError(err.response?.data?.message || "Could not log this session");
      showToast("Could not log this session", "error");
    } finally {
      setLoading(false);
    }
  }

  function handleQuickLog(preset) {
    submitPayload({ type: preset.type, durationMinutes: preset.durationMinutes, distanceKm: 0 });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    await submitPayload({
      ...form,
      distanceKm: Number(form.distanceKm) || 0,
      durationMinutes: Number(form.durationMinutes),
      steps: Number(form.steps) || undefined,
    });
  }

  return (
    <div>
      <h1 className="font-display text-2xl sm:text-3xl font-bold uppercase tracking-wide mb-6">Cardio &amp; Walks</h1>

      {weekSummary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mb-2">
          <Stat label="Distance (km)" value={weekSummary.distanceKm.toFixed(1)} />
          <Stat label="Minutes" value={weekSummary.durationMinutes} />
          <Stat label="Steps" value={weekSummary.steps} />
          <Stat label="Calories burned" value={weekSummary.caloriesBurned} />
        </div>
      )}
      <p className="text-muted text-xs mb-6">Totals for the last 7 days</p>

      <p className="text-xs text-muted mb-2">Quick log:</p>
      <div className="flex gap-2 flex-wrap mb-6">
        {QUICK_PRESETS.map((p) => (
          <button
            key={p.label}
            type="button"
            disabled={loading}
            onClick={() => handleQuickLog(p)}
            className="text-xs bg-panel border border-line rounded-full px-3 py-1.5 hover:border-signal disabled:opacity-50"
          >
            {p.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="bg-panel border border-line rounded-xl p-4 mb-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <p className="sm:col-span-2 text-xs text-muted -mb-1">Or log something custom:</p>
        <select value={form.type} onChange={(e) => update("type", e.target.value)} className={inputClass}>
          <option value="walk">Walk</option>
          <option value="run">Run</option>
          <option value="cycle">Cycle</option>
        </select>
        <input type="number" placeholder="Duration (minutes)" value={form.durationMinutes} onChange={(e) => update("durationMinutes", e.target.value)} className={inputClass} min="1" required />
        <input type="number" placeholder="Distance (km)" value={form.distanceKm} onChange={(e) => update("distanceKm", e.target.value)} className={inputClass} min="0" step="0.1" />
        <input type="number" placeholder="Steps" value={form.steps} onChange={(e) => update("steps", e.target.value)} className={inputClass} min="0" />
        {error && <p className="text-alert text-sm sm:col-span-2">{error}</p>}
        <button type="submit" disabled={loading} className="sm:col-span-2 bg-signal text-ink font-medium rounded px-4 py-2 mt-1 disabled:opacity-50">
          {loading ? "Logging..." : "Log session"}
        </button>
      </form>

      <h2 className="font-display text-lg sm:text-xl font-bold uppercase tracking-wide mb-3">History</h2>
      <div className="flex flex-col gap-2">
        {sessions.map((s) => (
          <div key={s._id} className="bg-panel border border-line rounded-lg px-4 py-3 flex justify-between">
            <div>
              <p className="text-sm font-medium capitalize">{s.type} — {new Date(s.date).toLocaleDateString()}</p>
              <p className="text-xs text-muted">{s.distanceKm} km · {s.durationMinutes} min{s.steps ? ` · ${s.steps} steps` : ""}</p>
            </div>
            <p className="text-sm font-mono text-signal shrink-0 ml-3">{s.caloriesBurned} kcal</p>
          </div>
        ))}
        {sessions.length === 0 && <p className="text-muted text-sm">No cardio logged yet.</p>}
      </div>
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
