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

export async function lookupFoodPer100g(foodName) {
  const key = foodName.trim().toLowerCase();
  if (cache.has(key)) return cache.get(key);

  const apiKey = process.env.USDA_API_KEY || "DEMO_KEY";
  const url = `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${apiKey}&query=${encodeURIComponent(
    foodName
  )}&pageSize=1&dataType=Foundation,SR%20Legacy`;

  const response = await fetch(url);
  if (!response.ok) {
    if (response.status === 429) {
      throw new Error("Nutrition lookup rate limit reached. Get a free personal API key at https://fdc.nal.usda.gov/api-key-signup and set USDA_API_KEY.");
    }
    throw new Error(`Nutrition lookup failed (status ${response.status})`);
  }

  


