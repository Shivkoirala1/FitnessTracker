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

export default function Workout() {
  const { showToast } = useToast();
}

const [dayType, setDayType] = useState("chest");

const [exercises, setExercises] = useState([]);

const [entries, setEntries] = useState([]);

const [durationMinutes, setDurationMinutes] =
  useState("");

const [journey, setJourney] = useState(null);

const [sessions, setSessions] = useState([]);

const [error, setError] = useState("");

const [loading, setLoading] = useState(false);

const [justLoggedId, setJustLoggedId] =
  useState(null);

const [expandedSessionId, setExpandedSessionId] =
  useState(null);

  const [showCustomForm, setShowCustomForm] =
  useState(false);

const [customName, setCustomName] = useState("");

const [customMet, setCustomMet] = useState("");

const [customError, setCustomError] =
  useState("");


  const [overEntryIndex, setOverEntryIndex] =
  useState(null);

const [overSet, setOverSet] = useState(null);

const [dropzoneActive, setDropzoneActive] =
  useState(false);

function loadExercises() {
  return client
    .get(
      `/workouts/exercises?muscleGroup=${dayType}`
    )
    .then((res) => setExercises(res.data));
}

useEffect(() => {
  loadExercises();

  client
    .get(`/workouts/journey/${dayType}`)
    .then((res) => setJourney(res.data));
}, [dayType]);

useEffect(() => {
  client
    .get("/workouts")
    .then((res) => setSessions(res.data));
}, []);