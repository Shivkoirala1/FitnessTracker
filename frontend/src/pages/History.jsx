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

  return (
    <div>
      <h1 className="font-display text-2xl sm:text-3xl font-bold uppercase tracking-wide mb-2">History</h1>
      <p className="text-muted text-sm mb-6">Last 14 days. Tap a day to see everything you logged.</p>

      {error && <p className="text-alert text-sm">{error}</p>}
      {!days && !error && <p className="text-muted text-sm">Loading...</p>}

      <div className="flex flex-col gap-2">
        {days?.map((d) => {
          const isEmpty = !d.caloriesEaten && !d.workoutSessions && !d.cardioSessions;
          const totalBurned = Math.round(d.workoutCaloriesBurned + d.cardioCaloriesBurned);
          const isOpen = selectedDate === d.date;

          return (
            <div key={d.date}>
              <button
                onClick={() => toggleDay(d.date)}
                className={`w-full text-left bg-panel border rounded-lg px-4 py-3 flex justify-between items-center transition-colors ${
                  isOpen ? "border-signal" : "border-line hover:border-muted"
                }`}
              >
                <div>
                  <p className="text-sm font-medium">{formatDate(d.date)}</p>
                  {isEmpty ? (
                    <p className="text-xs text-muted">Nothing logged</p>
                  ) : (
                    <p className="text-xs text-muted">
                      {Math.round(d.caloriesEaten)} kcal eaten
                      {d.workoutSessions > 0 && ` · ${d.workoutSessions} workout${d.workoutSessions > 1 ? "s" : ""}`}
                      {d.cardioSessions > 0 && ` · ${d.cardioSessions} cardio session${d.cardioSessions > 1 ? "s" : ""}`}
                    </p>
                  )}
                </div>
                {totalBurned > 0 && <span className="text-signal text-xs font-mono shrink-0 ml-3">{totalBurned} KCAL</span>}
              </button>

              {isOpen && (
                <div className="bg-ink border border-line border-t-0 rounded-b-lg px-4 py-4">
                  {loadingDetail && <p className="text-xs text-muted">Loading...</p>}
                  {detail && <DayDetail detail={detail} />}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
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
