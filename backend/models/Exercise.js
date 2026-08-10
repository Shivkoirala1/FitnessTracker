import mongoose from "mongoose";

const exerciseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  muscleGroup: {
    type: String,
    enum: ["chest", "triceps", "back", "biceps", "shoulder", "leg", "abs"],
    required: true,
  },
  // MET (Metabolic Equivalent of Task) — used to estimate calories burned.
  // Resistance training generally falls 3.5-6 depending on intensity/rest.
  met: { type: Number, required: true, default: 5 },

  // null = built-in/global exercise (from the seed script), visible to everyone.
  // Set to a user id for exercises that user added themselves — only they see it.
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
});

// A user can't create two exercises with the same name, but different users
// (or the global library) can reuse names freely.
exerciseSchema.index({ name: 1, createdBy: 1 }, { unique: true });

export default mongoose.model("Exercise", exerciseSchema);
