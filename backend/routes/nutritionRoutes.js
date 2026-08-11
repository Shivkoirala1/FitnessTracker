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

    

});





  





