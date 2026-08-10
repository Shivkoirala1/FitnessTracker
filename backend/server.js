import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import nutritionRoutes from "./routes/nutritionRoutes.js";
import workoutRoutes from "./routes/workoutRoutes.js";
import cardioRoutes from "./routes/cardioRoutes.js";
import recommendationRoutes from "./routes/recommendationRoutes.js";
import historyRoutes from "./routes/historyRoutes.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api/nutrition", nutritionRoutes);
app.use("/api/workouts", workoutRoutes);
app.use("/api/cardio", cardioRoutes);
app.use("/api/recommendations", recommendationRoutes);
app.use("/api/history", historyRoutes);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
