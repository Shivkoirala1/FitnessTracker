import express from "express";
import FoodEntry from "../models/FoodEntry.js";
import WorkoutSession from "../models/WorkoutSession.js";
import CardioSession from "../models/CardioSession.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();
router.use(requireAuth);

function dateKey(d) {
  return new Date(d).toISOString().slice(0, 10);
}

// GET /api/history?days=14 — one summary row per day, newest first.
// Every day in the range is included even if nothing was logged (zeros),
// so the frontend can render a consistent 14-day list.
router.get("/", async (req, res) => {
  const days = Math.min(Math.max(Number(req.query.days) || 14, 1), 60);

  const since = new Date();
  since.setHours(0, 0, 0, 0);
  since.setDate(since.getDate() - (days - 1));

  const [foodEntries, workouts, cardioSessions] = await Promise.all([
    FoodEntry.find({ user: req.userId, date: { $gte: since } }),
    WorkoutSession.find({ user: req.userId, date: { $gte: since } }),
    CardioSession.find({ user: req.userId, date: { $gte: since } }),
  ]);

  const byDate = {};
  for (let i = 0; i < days; i++) {
    const d = new Date(since);
    d.setDate(d.getDate() + i);
    const key = dateKey(d);
    byDate[key] = {
      date: key,
      caloriesEaten: 0,
      proteinEaten: 0,
      workoutSessions: 0,
      workoutCaloriesBurned: 0,
      cardioSessions: 0,
      cardioCaloriesBurned: 0,
      cardioDistanceKm: 0,
    };
  }

  for (const e of foodEntries) {
    const row = byDate[dateKey(e.date)];
    if (!row) continue;
    row.caloriesEaten += e.calories;
    row.proteinEaten += e.protein;
  }
  for (const w of workouts) {
    const row = byDate[dateKey(w.date)];
    if (!row) continue;
    row.workoutSessions += 1;
    row.workoutCaloriesBurned += w.caloriesBurned || 0;
  }
  for (const c of cardioSessions) {
    const row = byDate[dateKey(c.date)];
    if (!row) continue;
    row.cardioSessions += 1;
    row.cardioCaloriesBurned += c.caloriesBurned || 0;
    row.cardioDistanceKm += c.distanceKm || 0;
  }

  const result = Object.values(byDate).sort((a, b) => b.date.localeCompare(a.date));
  res.json({ days: result });
});



export default router;
