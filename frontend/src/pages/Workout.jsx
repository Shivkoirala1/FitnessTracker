import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import client from "../api/client.js";
import { useToast } from "../context/ToastContext.jsx";

const DAY_TYPES = ["chest", "triceps", "back", "biceps", "shoulder", "leg", "abs"];
const inputClass = "bg-panel border border-line rounded px-3 py-2 focus:outline-none focus:border-signal";

function reorder(list, fromIndex, toIndex) {
  const copy = [...list];
  const [item] = copy.splice(fromIndex, 1);
  copy.splice(toIndex, 0, item);
  return copy;
}

function Stepper({ value, onChange, step = 1, min = 0 }) {
  const num = Number(value) || 0;
  return (
    <div className="flex items-center bg-ink border border-line rounded overflow-hidden">
      <button
        type="button"
        onClick={() => onChange(String(Math.max(min, num - step)))}
        className="px-2 py-2 text-muted hover:text-bone hover:bg-panel"
      >
        −
      </button>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-14 bg-transparent text-center focus:outline-none py-2"
        min={min}
      />
      <button
        type="button"
        onClick={() => onChange(String(num + step))}
        className="px-2 py-2 text-muted hover:text-bone hover:bg-panel"
      >
        +
      </button>
    </div>
  );
}

export default function Workout() {
  const { showToast } = useToast();
  const [dayType, setDayType] = useState("chest");
  const [exercises, setExercises] = useState([]);
  const [entries, setEntries] = useState([]); // { exerciseId, sets: [{reps, weight}] }
  const [durationMinutes, setDurationMinutes] = useState("");
  const [journey, setJourney] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [justLoggedId, setJustLoggedId] = useState(null); // drives the highlight flash
  const [expandedSessionId, setExpandedSessionId] = useState(null);

  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customMet, setCustomMet] = useState("");
  const [customError, setCustomError] = useState("");

  const [overEntryIndex, setOverEntryIndex] = useState(null);
  const [overSet, setOverSet] = useState(null);
  const [dropzoneActive, setDropzoneActive] = useState(false);

  function loadExercises() {
    return client
      .get(`/workouts/exercises?muscleGroup=${dayType}`)
      .then((res) => setExercises(res.data));
  }

  useEffect(() => {
    loadExercises();
    client.get(`/workouts/journey/${dayType}`).then((res) => setJourney(res.data));
    setEntries([]);
    setShowCustomForm(false);
    setCustomName("");
    setCustomMet("");
    setCustomError("");
  }, [dayType]);

  useEffect(() => {
    client.get("/workouts").then((res) => setSessions(res.data));
  }, []);

  function addExerciseEntry(exerciseId) {
    setEntries((prev) => {
      if (prev.find((e) => e.exerciseId === exerciseId)) return prev;
      return [...prev, { exerciseId, sets: [{ reps: "10", weight: "20" }] }];
    });
  }

  function removeExerciseEntry(exerciseId) {
    setEntries((prev) => prev.filter((e) => e.exerciseId !== exerciseId));
  }

  function updateSet(exerciseId, idx, field, value) {
    setEntries((prev) =>
      prev.map((e) =>
        e.exerciseId !== exerciseId
          ? e
          : { ...e, sets: e.sets.map((s, i) => (i === idx ? { ...s, [field]: value } : s)) }
      )
    );
  }

  // Copies the last set's reps/weight into a brand new set — the common case
  // (same weight, same reps) needs zero typing.
  function duplicateLastSet(exerciseId) {
    setEntries((prev) =>
      prev.map((e) => {
        if (e.exerciseId !== exerciseId) return e;
        const last = e.sets[e.sets.length - 1] || { reps: "10", weight: "20" };
        return { ...e, sets: [...e.sets, { ...last }] };
      })
    );
  }

  function removeSet(exerciseId, idx) {
    setEntries((prev) =>
      prev.map((e) => (e.exerciseId !== exerciseId ? e : { ...e, sets: e.sets.filter((_, i) => i !== idx) }))
    );
  }

  async function handleAddCustomExercise(e) {
    e.preventDefault();
    setCustomError("");
    try {
      const res = await client.post("/workouts/exercises", {
        name: customName,
        muscleGroup: dayType,
        met: customMet || undefined,
      });
      setCustomName("");
      setCustomMet("");
      setShowCustomForm(false);
      await loadExercises();
      addExerciseEntry(res.data._id);
      showToast(`Added "${res.data.name}" to your exercises`);
    } catch (err) {
      setCustomError(err.response?.data?.message || "Could not add that exercise");
    }
  }

  function handleLibraryDragStart(e, exerciseId) {
    e.dataTransfer.effectAllowed = "copy";
    e.dataTransfer.setData("application/json", JSON.stringify({ type: "library", exerciseId }));
  }
  function handleDropzoneDragOver(e) {
    e.preventDefault();
    setDropzoneActive(true);
  }
  function handleDropzoneDrop(e) {
    e.preventDefault();
    setDropzoneActive(false);
    try {
      const data = JSON.parse(e.dataTransfer.getData("application/json"));
      if (data.type === "library") addExerciseEntry(data.exerciseId);
    } catch { /* ignore */ }
  }
  function handleEntryDragStart(e, index) {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("application/json", JSON.stringify({ type: "entry", index }));
  }
  function handleEntryDragOver(e, index) {
    e.preventDefault();
    setOverEntryIndex(index);
  }
  function handleEntryDrop(e, targetIndex) {
    e.preventDefault();
    e.stopPropagation();
    setOverEntryIndex(null);
    try {
      const data = JSON.parse(e.dataTransfer.getData("application/json"));
      if (data.type === "entry" && data.index !== targetIndex) {
        setEntries((prev) => reorder(prev, data.index, targetIndex));
      } else if (data.type === "library") {
        addExerciseEntry(data.exerciseId);
      }
    } catch { /* ignore */ }
  }
  function handleSetDragStart(e, entryIndex, setIndex) {
    e.stopPropagation();
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("application/json", JSON.stringify({ type: "set", entryIndex, setIndex }));
  }
  function handleSetDragOver(e, entryIndex, setIndex) {
    e.preventDefault();
    e.stopPropagation();
    setOverSet({ entryIndex, setIndex });
  }
  function handleSetDrop(e, entryIndex, targetSetIndex) {
    e.preventDefault();
    e.stopPropagation();
    setOverSet(null);
    try {
      const data = JSON.parse(e.dataTransfer.getData("application/json"));
      if (data.type === "set" && data.entryIndex === entryIndex && data.setIndex !== targetSetIndex) {
        setEntries((prev) =>
          prev.map((entry, i) =>
            i !== entryIndex ? entry : { ...entry, sets: reorder(entry.sets, data.setIndex, targetSetIndex) }
          )
        );
      }
    } catch { /* ignore */ }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!entries.length) return;
    setError("");
    setLoading(true);
    try {
      const res = await client.post("/workouts", {
        dayType,
        durationMinutes: Number(durationMinutes) || undefined,
        exercises: entries.map((e) => ({
          exercise: e.exerciseId,
          sets: e.sets.map((s) => ({ reps: Number(s.reps), weight: Number(s.weight) })),
        })),
      });

      // Show it immediately — don't make the user wonder if it saved.
      setSessions((prev) => [res.data, ...prev]);
      setJustLoggedId(res.data._id);
      setTimeout(() => setJustLoggedId(null), 1600);
      showToast(`Workout logged — ~${res.data.caloriesBurned} kcal burned`);

      setEntries([]);
      setDurationMinutes("");
      const j = await client.get(`/workouts/journey/${dayType}`);
      setJourney(j.data);
    } catch (err) {
      setError(err.response?.data?.message || "Could not log this workout");
      showToast("Could not log this workout", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl sm:text-3xl font-bold uppercase tracking-wide mb-6">Workout</h1>

      <div className="flex gap-2 mb-4 flex-wrap">
        {DAY_TYPES.map((d) => (
          <button
            key={d}
            onClick={() => setDayType(d)}
            className={`px-3 py-1.5 rounded-full text-sm capitalize transition-colors ${
              dayType === d ? "bg-signal text-ink" : "bg-panel border border-line text-muted hover:text-bone"
            }`}
          >
            {d}
          </button>
        ))}
      </div>

      {journey && (
        <p className="text-sm text-muted mb-6">
          {journey.daysSince != null ? `Last trained ${journey.daysSince} day(s) ago.` : journey.message}
        </p>
      )}

      <div className="bg-panel border border-line rounded-xl p-4 mb-4">
        <p className="text-sm text-muted mb-2">Drag an exercise into the builder below, or tap it to add.</p>
        <div className="flex gap-2 flex-wrap">
          {exercises.map((ex) => (
            <button
              key={ex._id}
              draggable
              onDragStart={(e) => handleLibraryDragStart(e, ex._id)}
              onClick={() => addExerciseEntry(ex._id)}
              className="text-xs bg-ink border border-line rounded-full px-3 py-1 hover:border-signal cursor-grab active:cursor-grabbing transition-colors"
            >
              + {ex.name}
            </button>
          ))}
          {exercises.length === 0 && <p className="text-xs text-muted">No exercises found — run the seed script.</p>}
        </div>

        {!showCustomForm ? (
          <button type="button" onClick={() => setShowCustomForm(true)} className="text-xs text-signal mt-3">
            + Add an exercise that's not in this list
          </button>
        ) : (
          <form onSubmit={handleAddCustomExercise} className="flex gap-2 mt-3 items-start flex-wrap">
            <input placeholder="Exercise name" value={customName} onChange={(e) => setCustomName(e.target.value)} className={inputClass} required />
            <input
              type="number" placeholder="Intensity (optional)" value={customMet}
              onChange={(e) => setCustomMet(e.target.value)} className={`${inputClass} w-40`}
              min="1" max="15" step="0.5"
              title="MET value — roughly how hard the movement is. Leave blank for a reasonable default."
            />
            <button type="submit" className="bg-signal text-ink text-sm font-medium rounded px-3 py-2">
              Add to {dayType}
            </button>
            <button type="button" onClick={() => setShowCustomForm(false)} className="text-muted text-sm px-2 py-2">
              Cancel
            </button>
            {customError && <p className="text-alert text-xs w-full">{customError}</p>}
          </form>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div
          onDragOver={handleDropzoneDragOver}
          onDragLeave={() => setDropzoneActive(false)}
          onDrop={handleDropzoneDrop}
          className={`flex flex-col gap-3 rounded-xl border-2 border-dashed p-3 transition-colors ${
            dropzoneActive ? "border-signal bg-panel/60" : "border-line"
          }`}
        >
          {entries.length === 0 && (
            <p className="text-xs text-muted text-center py-6">Drop exercises here to build today's session.</p>
          )}

          {entries.map((entry, entryIndex) => {
            const ex = exercises.find((x) => x._id === entry.exerciseId);
            return (
              <div
                key={entry.exerciseId}
                draggable
                onDragStart={(e) => handleEntryDragStart(e, entryIndex)}
                onDragOver={(e) => handleEntryDragOver(e, entryIndex)}
                onDragLeave={() => setOverEntryIndex(null)}
                onDrop={(e) => handleEntryDrop(e, entryIndex)}
                className={`bg-panel border rounded-xl p-4 cursor-grab active:cursor-grabbing transition-colors ${
                  overEntryIndex === entryIndex ? "border-signal" : "border-line"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <p className="font-medium">
                    <span className="text-muted mr-2">⠿</span>
                    {ex?.name}
                  </p>
                  <button type="button" onClick={() => removeExerciseEntry(entry.exerciseId)} className="text-alert text-xs">
                    Remove
                  </button>
                </div>

                {entry.sets.map((s, setIndex) => (
                  <div
                    key={setIndex}
                    draggable
                    onDragStart={(e) => handleSetDragStart(e, entryIndex, setIndex)}
                    onDragOver={(e) => handleSetDragOver(e, entryIndex, setIndex)}
                    onDragLeave={() => setOverSet(null)}
                    onDrop={(e) => handleSetDrop(e, entryIndex, setIndex)}
                    className={`flex items-center flex-wrap gap-1.5 sm:gap-2 mb-2 cursor-grab active:cursor-grabbing rounded ${
                      overSet?.entryIndex === entryIndex && overSet?.setIndex === setIndex ? "ring-1 ring-signal" : ""
                    }`}
                  >
                    <span className="text-muted text-xs w-4">⠿</span>
                    <span className="text-muted text-xs w-4">{setIndex + 1}</span>
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-[10px] text-muted">reps</span>
                      <Stepper value={s.reps} onChange={(v) => updateSet(entry.exerciseId, setIndex, "reps", v)} min={1} />
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-[10px] text-muted">kg</span>
                      <Stepper value={s.weight} onChange={(v) => updateSet(entry.exerciseId, setIndex, "weight", v)} step={2.5} min={0} />
                    </div>
                    {entry.sets.length > 1 && (
                      <button type="button" onClick={() => removeSet(entry.exerciseId, setIndex)} className="text-alert text-xs px-1 self-start mt-4">
                        ×
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={() => duplicateLastSet(entry.exerciseId)} className="text-signal text-xs">
                  + Same again
                </button>
              </div>
            );
          })}
        </div>

        {entries.length > 0 && (
          <>
            <input
              type="number" placeholder="Session duration (minutes, optional)"
              value={durationMinutes} onChange={(e) => setDurationMinutes(e.target.value)}
              className={inputClass} min="1"
            />
            {error && <p className="text-alert text-sm">{error}</p>}
            <button type="submit" disabled={loading} className="bg-signal text-ink font-medium rounded px-4 py-2 disabled:opacity-50">
              {loading ? "Logging..." : "Log workout session"}
            </button>
          </>
        )}
      </form>

      <div className="flex flex-wrap items-center justify-between gap-2 mt-8 mb-3">
        <h2 className="font-display text-lg sm:text-xl font-bold uppercase tracking-wide">Recent sessions</h2>
        <Link to="/history" className="text-signal text-xs">View full history →</Link>
      </div>
      <div className="flex flex-col gap-2">
        {sessions.slice(0, 5).map((s) => {
          const isOpen = expandedSessionId === s._id;
          return (
            <div
              key={s._id}
              className={`bg-panel border rounded-lg overflow-hidden transition-colors ${
                s._id === justLoggedId ? "animate-flash-highlight border-signal" : isOpen ? "border-signal" : "border-line"
              }`}
            >
              <button
                type="button"
                onClick={() => setExpandedSessionId(isOpen ? null : s._id)}
                className="w-full text-left px-4 py-3 flex items-center justify-between gap-3"
                aria-expanded={isOpen}
              >
                <div>
                  <p className="text-sm font-medium capitalize">
                    {s._id === justLoggedId && <span className="text-signal mr-1">✓</span>}
                    {s.dayType} — {new Date(s.date).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-muted font-mono">{s.exercises.length} EXERCISES · ~{s.caloriesBurned} KCAL</p>
                </div>
                <span className={`text-muted text-xs shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}>▾</span>
              </button>

              {isOpen && (
                <div className="border-t border-dashed border-line px-4 py-3 bg-ink/40">
                  {s.durationMinutes && (
                    <p className="text-xs text-muted font-mono mb-2">DURATION: {s.durationMinutes} MIN</p>
                  )}
                  <div className="flex flex-col gap-3">
                    {s.exercises.map((ex, i) => (
                      <div key={i}>
                        <p className="text-sm font-medium mb-1">{ex.exercise?.name || "Deleted exercise"}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {ex.sets.map((set, si) => (
                            <span
                              key={si}
                              className="text-xs font-mono bg-panel border border-line rounded px-2 py-1"
                            >
                              {set.reps}×{set.weight}kg
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {sessions.length === 0 && <p className="text-muted text-sm">No workouts logged yet — build one above.</p>}
      </div>
    </div>
  );
}
