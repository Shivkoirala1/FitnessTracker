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

  if (target) {
    const remaining = target - caloriesEaten;
    if (remaining > 300) {
      recommendations.push({
        type: "nutrition",
        message: `You've eaten ${Math.round(caloriesEaten)} kcal today, about ${Math.round(remaining)} kcal under your ${user.goal} target of ${target}. Consider a nutrient-dense meal or snack.`,
      });
    } else if (remaining < -300) {
      recommendations.push({
        type: "nutrition",
        message: `You're about ${Math.round(-remaining)} kcal over your ${target} kcal target today.`,
      });
    }
  }
  if (proteinEaten < proteinTarget * 0.7) {
    recommendations.push({
      type: "nutrition",
      message: `Protein so far today is ${Math.round(proteinEaten)}g, below your ~${proteinTarget}g target. Add a protein-rich food.`,
    });
  }

  // --- Training balance check (last 7 days) ---
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const recentWorkouts = await WorkoutSession.find({ user: req.userId, date: { $gte: weekAgo } });
  const trainedGroups = new Set(recentWorkouts.map((w) => w.dayType));
  const allGroups = ["chest", "triceps", "back", "biceps", "shoulder", "leg", "abs"];
  const untrainedGroups = allGroups.filter((g) => !trainedGroups.has(g));

  if (untrainedGroups.length) {
    recommendations.push({
      type: "workout",
      message: `You haven't trained ${untrainedGroups.join(", ")} in the last 7 days. Consider adding it to your split.`,
    });
  }
  if (recentWorkouts.length === 0) {
    recommendations.push({
      type: "workout",
      message: "No workouts logged in the last 7 days — time to get back in the gym.",
    });
  }

  // --- Cardio/steps check (last 7 days) ---
  const recentCardio = await CardioSession.find({ user: req.userId, date: { $gte: weekAgo } });
  const totalSteps = recentCardio.reduce((sum, c) => sum + (c.steps || 0), 0);
  if (recentCardio.length < 3) {
    recommendations.push({
      type: "cardio",
      message: "Fewer than 3 cardio/walk sessions logged this week. Aim for at least 3 for cardiovascular health.",
    });
  } else if (totalSteps && totalSteps / recentCardio.length < 5000) {
    recommendations.push({
      type: "cardio",
      message: "Your average daily steps are on the low side — try to work toward 8,000-10,000/day.",
    });
  }

  if (recommendations.length === 0) {
    recommendations.push({ type: "general", message: "You're on track across nutrition, training, and cardio. Keep it up!" });
  }

  res.json({ target, caloriesEaten, proteinEaten, proteinTarget, recommendations });
});


