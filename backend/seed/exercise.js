import dotenv from "dotenv";
import { connectDB } from "../config/db.js";
import Exercise from "../models/Exercise.js";
import mongoose from "mongoose";

dotenv.config();

// Built-in exercise library, scoped to the 7 muscle groups this app tracks
// for now: chest, triceps, back, biceps, shoulder, leg, abs.
const exercises = [
  // Chest
  { name: "Barbell Bench Press", muscleGroup: "chest", met: 6 },
  { name: "Incline Dumbbell Press", muscleGroup: "chest", met: 5.5 },
  { name: "Decline Bench Press", muscleGroup: "chest", met: 5.5 },
  { name: "Cable Fly", muscleGroup: "chest", met: 4 },
  { name: "Push-Up", muscleGroup: "chest", met: 4 },
  { name: "Chest Dip", muscleGroup: "chest", met: 5 },
  { name: "Dumbbell Pullover", muscleGroup: "chest", met: 4.5 },

  
 

  // Biceps
  { name: "Barbell Curl", muscleGroup: "biceps", met: 4 },
  { name: "Dumbbell Curl", muscleGroup: "biceps", met: 4 },
  { name: "Hammer Curl", muscleGroup: "biceps", met: 4 },
  { name: "Preacher Curl", muscleGroup: "biceps", met: 4 },
  { name: "Concentration Curl", muscleGroup: "biceps", met: 3.5 },
  { name: "Cable Curl", muscleGroup: "biceps", met: 4 },

  // Shoulder
  { name: "Overhead Press", muscleGroup: "shoulder", met: 5 },
  { name: "Arnold Press", muscleGroup: "shoulder", met: 5 },
  { name: "Lateral Raise", muscleGroup: "shoulder", met: 3.5 },
  { name: "Front Raise", muscleGroup: "shoulder", met: 3.5 },
  { name: "Rear Delt Fly", muscleGroup: "shoulder", met: 3.5 },
  { name: "Upright Row", muscleGroup: "shoulder", met: 4.5 },
  { name: "Barbell Shrug", muscleGroup: "shoulder", met: 4 },

  // Leg
  { name: "Barbell Squat", muscleGroup: "leg", met: 6 },
  { name: "Leg Press", muscleGroup: "leg", met: 5 },
  { name: "Romanian Deadlift", muscleGroup: "leg", met: 6 },
  { name: "Leg Curl", muscleGroup: "leg", met: 4.5 },
  { name: "Leg Extension", muscleGroup: "leg", met: 4 },
  { name: "Walking Lunge", muscleGroup: "leg", met: 5 },
  { name: "Bulgarian Split Squat", muscleGroup: "leg", met: 5.5 },
  { name: "Calf Raise", muscleGroup: "leg", met: 4 },

  // Abs
  { name: "Plank", muscleGroup: "abs", met: 3.5 },
  { name: "Hanging Leg Raise", muscleGroup: "abs", met: 4 },
  { name: "Cable Crunch", muscleGroup: "abs", met: 4 },
  { name: "Russian Twist", muscleGroup: "abs", met: 4 },
  { name: "Ab Wheel Rollout", muscleGroup: "abs", met: 4.5 },
  { name: "Sit-Up", muscleGroup: "abs", met: 3.8 },
  { name: "Mountain Climber", muscleGroup: "abs", met: 6 },
];

async function run() {
  await connectDB();
  for (const ex of exercises) {
    await Exercise.updateOne({ name: ex.name, createdBy: null }, ex, { upsert: true });
  }
  console.log(`Seeded ${exercises.length} exercises across 7 muscle groups.`);
  await mongoose.disconnect();
}

run();
