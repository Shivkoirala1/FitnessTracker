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

// Add a custom exercise not in the built-in library (e.g. a machine or movement
// specific to the user's gym). Only visible to the user who created it.
router.post("/exercises", async (req, res) => {
  try {
    const { name, muscleGroup, met } = req.body;
    if (!name || !muscleGroup) {
      return res.status(400).json({ message: "name and muscleGroup are required" });
    }
    const exercise = await Exercise.create({
      name: name.trim(),
      muscleGroup,
      met: Number(met) || 5,
      createdBy: req.userId,
    });
    res.status(201).json(exercise);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "You already have an exercise with that name." });
    }
    res.status(500).json({ message: err.message });
  }
});

// Log a workout session, e.g.:
// { dayType: "chest", durationMinutes: 55, exercises: [{ exercise: "<id>", sets: [{reps:10, weight:60}, ...] }] }
router.post("/", async (req, res) => {
  try {
    const { dayType, exercises, durationMinutes, notes, date } = req.body;
    if (!dayType || !exercises?.length) {
      return res.status(400).json({ message: "dayType and at least one exercise are required" });
    }

    const user = await User.findById(req.userId);
    const populatedExercises = await Promise.all(
      exercises.map(async (e) => ({
        exercise: e.exercise,
        sets: e.sets,
        met: (await Exercise.findById(e.exercise))?.met || 5,
      }))
    );

    const caloriesBurned = estimateWorkoutCalories({
      exercises: populatedExercises.map((e) => ({ exercise: { met: e.met }, sets: e.sets })),
      durationMinutes,
      weightKg: user.weight,
    });

    const session = await WorkoutSession.create({
      user: req.userId,
      dayType,
      exercises: exercises.map((e) => ({ exercise: e.exercise, sets: e.sets })),
      durationMinutes,
      caloriesBurned,
      notes,
      date,
    });

    const populated = await session.populate("exercises.exercise");
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});





export default router;
