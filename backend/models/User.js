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

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

// Mifflin-St Jeor equation
userSchema.methods.calculateBMR = function () {
  if (!this.age || !this.height || !this.weight) return null;
  const base = 10 * this.weight + 6.25 * this.height - 5 * this.age;
  return this.sex === "female" ? base - 161 : base + 5;
};

userSchema.methods.calculateTDEE = function () {
  const bmr = this.calculateBMR();
  if (bmr === null) return null;
  return bmr * (ACTIVITY_MULTIPLIERS[this.activityLevel] || 1.55);
};

userSchema.methods.calculateTargetCalories = function () {
  const tdee = this.calculateTDEE();
  if (tdee === null) return null;
  return Math.round(tdee + (GOAL_ADJUSTMENT[this.goal] || 0));
};

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

export default mongoose.model("User", userSchema);
