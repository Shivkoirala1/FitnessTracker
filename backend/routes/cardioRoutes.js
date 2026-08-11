import express from "express";
import CardioSession from "../models/CardioSession.js";
import User from "../models/User.js";
import { requireAuth } from "../middleware/auth.js";
import { estimateCardioCalories } from "../utils/calculations.js";

const router = express.Router();
router.use(requireAuth);

// Log a walk/run/cycle session
router.post("/", async (req, res) => {
  try {
    const { type, distanceKm, durationMinutes, steps, date } = req.body;
    if (!durationMinutes) {
      return res.status(400).json({ message: "durationMinutes is required" });
    }
    const user = await User.findById(req.userId);
    const caloriesBurned = estimateCardioCalories({
      type: type || "walk",
      durationMinutes,
      weightKg: user.weight,
    });

    const session = await CardioSession.create({
      user: req.userId, type, distanceKm, durationMinutes, steps, caloriesBurned, date,
    });
    res.status(201).json(session);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/", async (req, res) => {
  const sessions = await CardioSession.find({ user: req.userId }).sort({ date: -1 });
  res.json(sessions);
});

// Totals over a date range, e.g. weekly walk summary
router.get("/summary", async (req, res) => {
  const { from, to } = req.query;
  const filter = { user: req.userId };
  if (from || to) {
    filter.date = {};
    if (from) filter.date.$gte = new Date(from);
    if (to) filter.date.$lte = new Date(to);
  }
  const sessions = await CardioSession.find(filter);
  const totals = sessions.reduce(
    (acc, s) => {
      acc.distanceKm += s.distanceKm || 0;
      acc.durationMinutes += s.durationMinutes || 0;
      acc.steps += s.steps || 0;
      acc.caloriesBurned += s.caloriesBurned || 0;
      return acc;
    },
    { distanceKm: 0, durationMinutes: 0, steps: 0, caloriesBurned: 0 }
  );
  res.json({ totals, sessionCount: sessions.length });
});

router.delete("/:id", async (req, res) => {
  await CardioSession.deleteOne({ _id: req.params.id, user: req.userId });
  res.json({ message: "Deleted" });
});

export default router;
