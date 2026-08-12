// Looks up nutrition data from the USDA FoodData Central API.
// Free API — sign up for a personal key at https://fdc.nal.usda.gov/api-key-signup
// (the shared DEMO_KEY works out of the box but is rate-limited to ~30 requests/hour).
//
// Returns nutrition PER 100g — callers scale this to the amount the user actually ate.

const cache = new Map(); // foodName (lowercased) -> result, avoids repeat API calls

const NUTRIENT_MAP = {
  "energy": "calories", // kcal
  "protein": "protein",
  "carbohydrate, by difference": "carbs",
  "total lipid (fat)": "fat",
};

