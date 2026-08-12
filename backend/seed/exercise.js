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

  
 

  

  
  
];



run();
