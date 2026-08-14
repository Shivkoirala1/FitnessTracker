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

 

function Stat({ label, value }) {
  return (
    <div className="bg-panel border border-line rounded-xl px-2.5 sm:px-4 py-3 sm:py-4">
      <p className="text-muted text-[11px] sm:text-xs uppercase tracking-wide">{label}</p>
      <p className="font-mono text-lg sm:text-xl font-medium mt-1">{value}</p>
    </div>
  );
}
