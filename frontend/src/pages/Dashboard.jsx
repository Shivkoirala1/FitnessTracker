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





