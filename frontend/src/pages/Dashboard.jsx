import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import client from "../api/client.js";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    client
      .get("/recommendations")
      .then((res) => setData(res.data))
      .catch((err) => setError(err.response?.data?.message || "Failed to load"));

    client.get("/history?days=14").then((res) => {
      let count = 0;
      for (const day of res.data.days) {
        const active = day.caloriesEaten > 0 || day.workoutSessions > 0 || day.cardioSessions > 0;
        if (!active) break;
        count += 1;
      }
      setStreak(count);
    });
  }, []);

  const pct = data?.target ? Math.min(100, Math.round((data.caloriesEaten / data.target) * 100)) : 0;
  const over = data?.target && data.caloriesEaten > data.target;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="font-display text-2xl sm:text-3xl font-bold uppercase tracking-wide">Today's overview</h1>
        {streak > 0 && (
          <span className="text-xs font-mono bg-panel border border-dashed border-line rounded px-3 py-1.5 shrink-0">
            {streak} DAY{streak > 1 ? "S" : ""} STREAK
          </span>
        )}
      </div>

      {error && <p className="text-alert">{error}</p>}

      {data && (
        <>
          {data.target > 0 && (
            <div className="mb-6">
              <div className="flex justify-between text-xs text-muted mb-1 font-mono">
                <span>{Math.round(data.caloriesEaten)} / {data.target} KCAL</span>
                <span className={over ? "text-alert" : "text-signal"}>
                  {over ? "OVER TARGET" : `${Math.round(data.target - data.caloriesEaten)} LEFT`}
                </span>
              </div>
              <div className="h-2 bg-panel border border-line rounded-full overflow-hidden">
                <div className={`h-full transition-all ${over ? "bg-alert" : "bg-signal"}`} style={{ width: `${pct}%` }} />
              </div>
            </div>
          )}

          <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-8">
            <Stat label="Target" value={data.target ?? "—"} />
            <Stat label="Eaten" value={Math.round(data.caloriesEaten ?? 0)} />
            <Stat label="Protein" value={`${Math.round(data.proteinEaten ?? 0)}/${data.proteinTarget ?? "—"}`} />
          </div>

          <h2 className="font-display text-lg sm:text-xl font-bold uppercase tracking-wide mb-3">Recommendations</h2>
          <div className="flex flex-col gap-3 mb-8">
            {data.recommendations.map((r, i) => (
              <div key={i} className="bg-panel border border-line rounded-xl px-4 py-3">
                <span className="text-[11px] font-mono uppercase tracking-wide text-signal">{r.type}</span>
                <p className="text-sm mt-1">{r.message}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
            <QuickLink to="/nutrition" label="Log food" />
            <QuickLink to="/workout" label="Log workout" />
            <QuickLink to="/cardio" label="Log cardio" />
          </div>
        </>
      )}
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="bg-panel border border-line rounded-xl px-2.5 sm:px-4 py-3 sm:py-4">
      <p className="text-muted text-[11px] sm:text-xs uppercase tracking-wide">{label}</p>
      <p className="font-mono text-lg sm:text-xl font-medium mt-1 truncate">{value}</p>
    </div>
  );
}

