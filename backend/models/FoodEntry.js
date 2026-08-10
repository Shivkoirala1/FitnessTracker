import mongoose from "mongoose";

const foodEntrySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: Date, default: Date.now },

    foodName: { type: String, required: true }, // what the user typed
    matchedName: { type: String }, // the USDA database match, for transparency
    amountGrams: { type: Number, required: true },

    // Auto-calculated from amountGrams x per-100g nutrition (see utils/nutritionLookup.js)
    calories: { type: Number, required: true },
    protein: { type: Number, default: 0 }, // grams
    carbs: { type: Number, default: 0 }, // grams
    fat: { type: Number, default: 0 }, // grams

    fdcId: { type: Number }, // USDA FoodData Central id, for re-lookup/debugging
    mealType: {
      type: String,
      enum: ["breakfast", "lunch", "dinner", "snack"],
      default: "snack",
    },
  },
  { timestamps: true }
);

foodEntrySchema.index({ user: 1, date: 1 });

export default mongoose.model("FoodEntry", foodEntrySchema);
