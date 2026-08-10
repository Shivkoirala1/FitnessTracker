import mongoose from "mongoose";

const cardioSessionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: Date, default: Date.now },
    type: { type: String, enum: ["walk", "run", "cycle"], default: "walk" },
    distanceKm: { type: Number, default: 0 },
    durationMinutes: { type: Number, required: true },
    steps: { type: Number },
    caloriesBurned: { type: Number, default: 0 }, // computed on save
  },
  { timestamps: true }
);

cardioSessionSchema.index({ user: 1, date: 1 });

export default mongoose.model("CardioSession", cardioSessionSchema);
