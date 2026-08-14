import { useEffect, useMemo, useState } from "react";
import client from "../api/client.js";
import { useToast } from "../context/ToastContext.jsx";

const today = () => new Date().toISOString().slice(0, 10);
const inputClass = "bg-panel border border-line rounded px-3 py-2 focus:outline-none focus:border-signal";
const PRESET_GRAMS = [50, 100, 150, 200, 300];

export default function Nutrition() {
  const { showToast } = useToast();
  const [summary, setSummary] = useState(null);
  const [foodName, setFoodName] = useState("");
  const [amountGrams, setAmountGrams] = useState("");
  const [mealType, setMealType] = useState("snack");
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [recentFoods, setRecentFoods] = useState([]);

  async function loadSummary() {
    const res = await client.get(`/nutrition/summary/${today()}`);
    setSummary(res.data);
  }

  async function loadRecentFoods() {
    // Pulls unique food names from the last week's entries for one-tap re-logging.
    const from = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const res = await client.get("/nutrition", { params: { from } });
    const seen = new Map();
    for (const e of res.data) {
      if (!seen.has(e.foodName)) seen.set(e.foodName, e.amountGrams);
    }
    setRecentFoods([...seen.entries()].slice(0, 6));
  }

  useEffect(() => { loadSummary(); loadRecentFoods(); }, []);

  async function handlePreview(name = foodName, amount = amountGrams) {
    if (!name || !amount) return;
    setError("");
    setLoading(true);
    try {
      const res = await client.get("/nutrition/lookup", { params: { foodName: name, amountGrams: amount } });
      setPreview(res.data);
    } catch (err) {
      setPreview(null);
      setError(err.response?.data?.message || "Lookup failed");
    } finally {
      setLoading(false);
    }
  }

  function applyQuickFood(name, amount) {
    setFoodName(name);
    setAmountGrams(String(amount));
    handlePreview(name, amount);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await client.post("/nutrition", { foodName, amountGrams: Number(amountGrams), mealType });
      // Update instantly instead of waiting on a full refetch.
      setSummary((prev) => ({
        ...prev,
        entries: [res.data, ...prev.entries],
        totals: {
          calories: prev.totals.calories + res.data.calories,
          protein: prev.totals.protein + res.data.protein,
          carbs: prev.totals.carbs + res.data.carbs,
          fat: prev.totals.fat + res.data.fat,
        },
      }));
      showToast(`Logged ${res.data.foodName} — ${res.data.calories} kcal`);
      setFoodName("");
      setAmountGrams("");
      setPreview(null);
      loadRecentFoods();
    } catch (err) {
      setError(err.response?.data?.message || "Could not log this food");
      showToast("Could not log this food", "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    setSummary((prev) => {
      const entry = prev.entries.find((e) => e._id === id);
      if (!entry) return prev;
      return {
        ...prev,
        entries: prev.entries.filter((e) => e._id !== id),
        totals: {
          calories: prev.totals.calories - entry.calories,
          protein: prev.totals.protein - entry.protein,
          carbs: prev.totals.carbs - entry.carbs,
          fat: prev.totals.fat - entry.fat,
        },
      };
    });
    await client.delete(`/nutrition/${id}`);
  }

  const remaining = useMemo(() => {
    if (!summary?.targetCalories) return null;
    return Math.round(summary.targetCalories - summary.totals.calories);
  }, [summary]);

  return (
    <div>
      <h1 className="font-display text-2xl sm:text-3xl font-bold uppercase tracking-wide mb-6">Nutrition</h1>

      {summary && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mb-3">
            <Stat label="Calories" value={Math.round(summary.totals.calories)} />
            <Stat label="Protein (g)" value={Math.round(summary.totals.protein)} />
            <Stat label="Carbs (g)" value={Math.round(summary.totals.carbs)} />
            <Stat label="Fat (g)" value={Math.round(summary.totals.fat)} />
          </div>
          {summary.targetCalories && (
            <ProgressBar current={summary.totals.calories} target={summary.targetCalories} remaining={remaining} />
          )}
        </>
      )}

      {recentFoods.length > 0 && (
        <div className="mt-6 mb-3">
          <p className="text-xs text-muted mb-2">Quick re-log:</p>
          <div className="flex gap-2 flex-wrap">
            {recentFoods.map(([name, amount]) => (
              <button
                key={name}
                type="button"
                onClick={() => applyQuickFood(name, amount)}
                className="text-xs bg-panel border border-line rounded-full px-3 py-1 hover:border-signal"
              >
                {name} ({amount}g)
              </button>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-panel border border-line rounded-xl p-4 mt-4 mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          <input
            placeholder="Food name (e.g. chicken breast)"
            value={foodName}
            onChange={(e) => setFoodName(e.target.value)}
            onBlur={() => handlePreview()}
            className={`${inputClass} sm:col-span-2`}
            required
          />
          <div className="sm:col-span-2 flex gap-2 flex-wrap -mt-1 mb-1">
            {PRESET_GRAMS.map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => { setAmountGrams(String(g)); handlePreview(foodName, g); }}
                className={`text-xs rounded-full px-2.5 py-1 border transition-colors ${
                  amountGrams === String(g) ? "bg-signal text-ink border-signal" : "bg-ink border-line text-muted hover:text-bone"
                }`}
              >
                {g}g
              </button>
            ))}
          </div>
          <input
            type="number"
            placeholder="Amount (grams)"
            value={amountGrams}
            onChange={(e) => setAmountGrams(e.target.value)}
            onBlur={() => handlePreview()}
            className={inputClass}
            min="1"
            required
          />
          <select value={mealType} onChange={(e) => setMealType(e.target.value)} className={inputClass}>
            <option value="breakfast">Breakfast</option>
            <option value="lunch">Lunch</option>
            <option value="dinner">Dinner</option>
            <option value="snack">Snack</option>
          </select>
        </div>

        {loading && <p className="text-xs text-muted mb-2">Looking up nutrition data...</p>}
        {error && <p className="text-alert text-sm mb-2">{error}</p>}

        {preview && (
          <div className="bg-ink border border-line rounded-lg px-4 py-3 mb-3 text-sm">
            <p className="text-muted text-xs mb-1">Matched: {preview.matchedName}</p>
            <p>
              <span className="text-signal font-medium">{preview.calories} kcal</span>
              {"  ·  "}
              {preview.protein}g protein · {preview.carbs}g carbs · {preview.fat}g fat
            </p>
          </div>
        )}

        <button type="submit" disabled={loading} className="bg-signal text-ink font-medium rounded px-4 py-2 disabled:opacity-50">
          Log food
        </button>
      </form>

      <h2 className="font-display text-lg sm:text-xl font-bold uppercase tracking-wide mb-3">Today's entries</h2>
      <div className="flex flex-col gap-2">
        {summary?.entries.map((e) => (
          <div key={e._id} className="bg-panel border border-line rounded-lg px-4 py-3 flex justify-between items-center">
            <div>
              <p className="text-sm font-medium">{e.foodName} <span className="text-muted">({e.amountGrams}g)</span></p>
              <p className="text-xs text-muted">{e.calories} kcal · {e.protein}g protein · {e.mealType}</p>
            </div>
            <button onClick={() => handleDelete(e._id)} className="text-alert text-xs">Delete</button>
          </div>
        ))}
        {summary?.entries.length === 0 && <p className="text-muted text-sm">No entries logged today yet.</p>}
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

function ProgressBar({ current, target, remaining }) {
  const pct = Math.min(100, Math.round((current / target) * 100));
  const over = current > target;
  return (
    <div className="mb-2">
      <div className="flex justify-between text-xs text-muted mb-1 font-mono">
        <span>{Math.round(current)} / {target} KCAL</span>
        <span className={over ? "text-alert" : "text-signal"}>
          {over ? `${Math.abs(remaining)} OVER` : `${remaining} LEFT`}
        </span>
      </div>
      <div className="h-2 bg-panel border border-line rounded-full overflow-hidden">
        <div
          className={`h-full transition-all ${over ? "bg-alert" : "bg-signal"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
