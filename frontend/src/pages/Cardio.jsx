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
