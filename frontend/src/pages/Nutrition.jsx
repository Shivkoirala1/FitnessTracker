import { useState } from "react";
import client from "../api/client.js";
import { useToast } from "../context/ToastContext.jsx";
import { useEffect, useState } from "react";

const today = () => new Date().toISOString().slice(0, 10);

const inputClass =
  "bg-panel border border-line rounded px-3 py-2 focus:outline-none focus:border-signal";

const PRESET_GRAMS = [50, 100, 150, 200, 300];

export default function Nutrition() {
  return (
    <div>
      <h1>Nutrition</h1>
    </div>
  );
}

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
  const from = new Date(
    Date.now() - 7 * 24 * 60 * 60 * 1000
  ).toISOString();

  const res = await client.get("/nutrition", {
    params: { from },
  });

  const seen = new Map();

  for (const e of res.data) {
    if (!seen.has(e.foodName)) {
      seen.set(e.foodName, e.amountGrams);
    }
  }

  setRecentFoods([...seen.entries()].slice(0, 6));
}

useEffect(() => {
  loadSummary();
  loadRecentFoods();
}, []);

async function handlePreview(
  name = foodName,
  amount = amountGrams
) {
  if (!name || !amount) return;

  setError("");
  setLoading(true);

  try {
    const res = await client.get(
      "/nutrition/lookup",
      {
        params: {
          foodName: name,
          amountGrams: amount,
        },
      }
    );

    setPreview(res.data);
  } catch (err) {
    setPreview(null);

    setError(
      err.response?.data?.message ||
        "Lookup failed"
    );
  } finally {
    setLoading(false);
  }
}