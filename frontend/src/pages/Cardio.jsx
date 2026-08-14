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

