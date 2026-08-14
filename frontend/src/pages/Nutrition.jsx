import { useState } from "react";
import client from "../api/client.js";
import { useToast } from "../context/ToastContext.jsx";
import { useEffect, useState } from "react";
import {
  useEffect,
  useMemo,
  useState,
} from "react";

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
    const res = await client.post(
      "/nutrition",
      {
        foodName,
        amountGrams: Number(amountGrams),
        mealType,
      }
    );

    setSummary((prev) => ({
      ...prev,

      entries: [res.data, ...prev.entries],

      totals: {
        calories:
          prev.totals.calories +
          res.data.calories,

        protein:
          prev.totals.protein +
          res.data.protein,

        carbs:
          prev.totals.carbs +
          res.data.carbs,

        fat:
          prev.totals.fat +
          res.data.fat,
      },
    }));

    showToast(
      `Logged ${res.data.foodName}`
    );

    setFoodName("");
    setAmountGrams("");
    setPreview(null);

    loadRecentFoods();
  } finally {
    setLoading(false);
  }
}

async function handleDelete(id) {
  setSummary((prev) => {
    const entry = prev.entries.find(
      (e) => e._id === id
    );

    if (!entry) return prev;

    return {
      ...prev,

      entries: prev.entries.filter(
        (e) => e._id !== id
      ),

      totals: {
        calories:
          prev.totals.calories -
          entry.calories,

        protein:
          prev.totals.protein -
          entry.protein,

        carbs:
          prev.totals.carbs -
          entry.carbs,

        fat:
          prev.totals.fat -
          entry.fat,
      },
    };
  });

  await client.delete(`/nutrition/${id}`);
}

const remaining = useMemo(() => {
  if (!summary?.targetCalories) {
    return null;
  }

  return Math.round(
    summary.targetCalories -
      summary.totals.calories
  );
}, [summary]);

function Stat({ label, value }) {
  return (
    <div className="bg-panel border border-line rounded-xl px-4 py-4">
      <p>{label}</p>

      <p>{value}</p>
    </div>
  );
}