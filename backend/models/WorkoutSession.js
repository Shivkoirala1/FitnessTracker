import mongoose from "mongoose";

const setSchema = new mongoose.Schema(
  {
    reps: { type: Number, required: true },
    weight: { type: Number, required: true }, // kg
  },
  { _id: false }
);

const exerciseLogSchema = new mongoose.Schema(
  {
    exercise: { type: mongoose.Schema.Types.ObjectId, ref: "Exercise", required: true },
    sets: [setSchema],
  },
  { _id: false }
);

const workoutSessionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: Date, default: Date.now },
    dayType: {
      type: String,
      enum: ["chest", "triceps", "back", "biceps", "shoulder", "leg", "abs"],
      required: true,
    },
    exercises: [exerciseLogSchema],
    durationMinutes: { type: Number, default: 60 },
    caloriesBurned: { type: Number, default: 0 }, // computed on save
    notes: { type: String },
  },
  { timestamps: true }
);

workoutSessionSchema.index({ user: 1, date: 1 });

export default mongoose.model("WorkoutSession", workoutSessionSchema);
