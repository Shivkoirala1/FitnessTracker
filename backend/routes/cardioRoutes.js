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

