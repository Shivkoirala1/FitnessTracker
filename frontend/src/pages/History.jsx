import { useEffect, useState } from "react";
import client from "../api/client.js";

function formatDate(dateStr) {
  // Parse as local date (not UTC midnight) so the weekday doesn't shift a day off.
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    weekday: "short", month: "short", day: "numeric",
  });
}

export default function History() {
  const [days, setDays] = useState(null);
  const [error, setError] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [detail, setDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    client
      .get("/history?days=14")
      .then((res) => setDays(res.data.days))
      .catch((err) => setError(err.response?.data?.message || "Could not load history"));
  }, []);

  async function toggleDay(date) {
    if (selectedDate === date) {
      setSelectedDate(null);
      setDetail(null);
      return;
    }
    setSelectedDate(date);
    setDetail(null);
    setLoadingDetail(true);
    try {
      const res = await client.get(`/history/${date}`);
      setDetail(res.data);
    } catch {
      setDetail(null);
    } finally {
      setLoadingDetail(false);
    }
  }

  

function DayDetail({ detail }) {
  return (
    <div className="flex flex-col gap-4 text-sm">
      <Section title="Nutrition" empty={detail.foodEntries.length === 0} emptyText="No food logged.">
        {detail.foodEntries.map((f) => (
          <p key={f._id} className="text-xs text-muted">
            {f.foodName} ({f.amountGrams}g) — {f.calories} kcal · {f.protein}g protein · {f.mealType}
          </p>
        ))}
      </Section>

      <Section title="Workouts" empty={detail.workouts.length === 0} emptyText="No workouts logged.">
        {detail.workouts.map((w) => (
          <div key={w._id} className="mb-2">
            <p className="text-xs capitalize">
              {w.dayType.replace("_", " ")} — ~{w.caloriesBurned} kcal
              {w.durationMinutes ? ` · ${w.durationMinutes} min` : ""}
            </p>
            {w.exercises.map((ex, i) => (
              <p key={i} className="text-xs text-muted ml-2">
                {ex.exercise?.name || "Deleted exercise"}: {ex.sets.map((s) => `${s.reps}×${s.weight}kg`).join(", ")}
              </p>
            ))}
          </div>
        ))}
      </Section>

      <Section title="Cardio" empty={detail.cardioSessions.length === 0} emptyText="No cardio logged.">
        {detail.cardioSessions.map((c) => (
          <p key={c._id} className="text-xs text-muted capitalize">
            {c.type} — {c.distanceKm}km · {c.durationMinutes}min
            {c.steps ? ` · ${c.steps} steps` : ""} · {c.caloriesBurned} kcal
          </p>
        ))}
      </Section>
    </div>
  );
}

function Section({ title, empty, emptyText, children }) {
  return (
    <div>
      <p className="text-signal text-[11px] font-mono uppercase tracking-wide mb-1">{title}</p>
      {empty ? <p className="text-muted text-xs">{emptyText}</p> : children}
    </div>
  );
}
