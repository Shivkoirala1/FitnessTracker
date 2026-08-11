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

 


});



export default router;
