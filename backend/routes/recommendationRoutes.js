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

  }




