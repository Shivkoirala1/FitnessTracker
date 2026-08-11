import express from "express";
import FoodEntry from "../models/FoodEntry.js";
import User from "../models/User.js";
import { requireAuth } from "../middleware/auth.js";
import { lookupFoodPer100g, scaleNutrition } from "../utils/nutritionLookup.js";

const router = express.Router();
router.use(requireAuth);

// Log a food intake entry — user only sends foodName + amountGrams (+ optional mealType/date).
// Calories/protein/carbs/fat are looked up automatically from USDA FoodData Central
// and scaled to the amount eaten.
router.post("/", async (req, res) => {
  try {
    const { foodName, amountGrams, mealType, date } = req.body;
    if (!foodName || !amountGrams) {
      return res.status(400).json({ message: "foodName and amountGrams are required" });
    }

    const { fdcId, matchedName, per100g } = await lookupFoodPer100g(foodName);
    const nutrition = scaleNutrition(per100g, Number(amountGrams));

    const entry = await FoodEntry.create({
      user: req.userId,
      foodName,
      matchedName,
      amountGrams: Number(amountGrams),
      fdcId,
      mealType,
      date,
      ...nutrition,
    });

    res.status(201).json(entry);
  } catch (err) {
    // Lookup failures (food not found, rate limit) are the user's problem to fix by
    // rephrasing the food name — surface as 422 rather than a generic 500.
    res.status(422).json({ message: err.message });
  }
});

// Preview nutrition for a food + amount without saving it (used by the frontend
// to show the user what will be logged before they confirm).
router.get("/lookup", async (req, res) => {
  try {
    const { foodName, amountGrams } = req.query;
    if (!foodName || !amountGrams) {
      return res.status(400).json({ message: "foodName and amountGrams query params are required" });
    }
    const { matchedName, per100g } = await lookupFoodPer100g(foodName);
    const nutrition = scaleNutrition(per100g, Number(amountGrams));
    res.json({ matchedName, ...nutrition });
  } catch (err) {
    res.status(422).json({ message: err.message });
  }
});

router.get("/", async (req, res) => {
  const { from, to } = req.query;
  const filter = { user: req.userId };
  if (from || to) {
    filter.date = {};
    if (from) filter.date.$gte = new Date(from);
    if (to) filter.date.$lte = new Date(to);
  }
  const entries = await FoodEntry.find(filter).sort({ date: -1 });
  res.json(entries);
});

router.delete("/:id", async (req, res) => {
  await FoodEntry.deleteOne({ _id: req.params.id, user: req.userId });
  res.json({ message: "Deleted" });
});

// Daily summary: total intake vs the user's calculated target.
router.get("/summary/:date", async (req, res) => {
  const dayStart = new Date(req.params.date);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(dayStart);
  dayEnd.setHours(23, 59, 59, 999);

  const entries = await FoodEntry.find({
    user: req.userId,
    date: { $gte: dayStart, $lte: dayEnd },
  });

  const totals = entries.reduce(
    (acc, e) => {
      acc.calories += e.calories;
      acc.protein += e.protein;
      acc.carbs += e.carbs;
      acc.fat += e.fat;
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const user = await User.findById(req.userId);
  const target = user.calculateTargetCalories();

  
});

