import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },

    // Profile used for BMR / TDEE / target calculations
    age: { type: Number },
    height: { type: Number }, // cm
    weight: { type: Number }, // kg (most recent)
    sex: { type: String, enum: ["male", "female"], default: "male" },
    activityLevel: {
      type: String,
      enum: ["sedentary", "light", "moderate", "active", "very_active"],
      default: "moderate",
    },
    goal: {
      type: String,
      enum: ["bulk", "cut", "maintain"],
      default: "maintain",
    },
  },
  { timestamps: true }
);

const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

const GOAL_ADJUSTMENT = {
  bulk: 400,
  cut: -400,
  maintain: 0,
};

