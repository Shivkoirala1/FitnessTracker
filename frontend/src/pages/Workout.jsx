import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import client from "../api/client.js";
import { useToast } from "../context/ToastContext.jsx";

const DAY_TYPES = [
  "chest",
  "triceps",
  "back",
  "biceps",
  "shoulder",
  "leg",
  "abs",
];

const inputClass =
  "bg-panel border border-line rounded px-3 py-2 focus:outline-none focus:border-signal";

function reorder(list, fromIndex, toIndex) {
  const copy = [...list];

  const [item] = copy.splice(fromIndex, 1);

  copy.splice(toIndex, 0, item);

  return copy;
}

function Stepper({ value, onChange, step = 1, min = 0 }) {
  const num = Number(value) || 0;

  return (
    <div>
      <button>-</button>

      <input type="number" />

      <button>+</button>
    </div>
  );
}