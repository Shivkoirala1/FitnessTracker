import express from "express";
import User from "../models/User.js";
import FoodEntry from "../models/FoodEntry.js";
import WorkoutSession from "../models/WorkoutSession.js";
import CardioSession from "../models/CardioSession.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();
router.use(requireAuth);

// GET /api/recommendations — today's nutrition + training guidance
router.get("/", async (req, res) => {
  const user = await User.findById(req.userId);
  const target = user.calculateTargetCalories();
  const recommendations = [];

  if (!user.age || !user.height || !user.weight) {
    recommendations.push({
      type: "profile",
      message: "Complete your profile (age, height, weight) to unlock personalized targets.",
    });
    return res.json({ recommendations });
  }

  // --- Nutrition check (today) ---
  const dayStart = new Date();
  dayStart.setHours(0, 0, 0, 0);
  const todaysFood = await FoodEntry.find({ user: req.userId, date: { $gte: dayStart } });
  const caloriesEaten = todaysFood.reduce((sum, e) => sum + e.calories, 0);
  const proteinEaten = todaysFood.reduce((sum, e) => sum + e.protein, 0);
  const proteinTarget = Math.round(user.weight * 1.8); // ~1.8g/kg for active lifters


  }




