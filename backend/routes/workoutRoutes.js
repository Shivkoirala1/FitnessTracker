import express from "express";
import WorkoutSession from "../models/WorkoutSession.js";
import Exercise from "../models/Exercise.js";
import User from "../models/User.js";
import { requireAuth } from "../middleware/auth.js";
import { estimateWorkoutCalories } from "../utils/calculations.js";

const router = express.Router();
router.use(requireAuth);

// Exercise library — e.g. GET /api/workouts/exercises?muscleGroup=chest
// Returns built-in (global) exercises plus any custom exercises this user has added.
router.get("/exercises", async (req, res) => {
  const filter = { $or: [{ createdBy: null }, { createdBy: req.userId }] };
  if (req.query.muscleGroup) filter.muscleGroup = req.query.muscleGroup;
  const exercises = await Exercise.find(filter).sort({ name: 1 });
  res.json(exercises);
});






export default router;