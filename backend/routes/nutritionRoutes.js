import express from "express";
import FoodEntry from "../models/FoodEntry.js";
import User from "../models/User.js";
import { requireAuth } from "../middleware/auth.js";
import { lookupFoodPer100g, scaleNutrition } from "../utils/nutritionLookup.js";









  





