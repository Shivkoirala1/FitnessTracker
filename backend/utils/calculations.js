// Estimated time per set (work + rest) when duration isn't logged directly.
const SECONDS_PER_SET = 45 + 60; // ~45s work, ~60s rest

// MET values for cardio, by type and rough pace.
const CARDIO_MET = {
  walk: 3.5, // brisk walk
  run: 9.8, // ~6 mph
  cycle: 7.5, // moderate
};

/**
 * calories = MET x weight(kg) x duration(hours)
 */
export function caloriesFromMET(met, weightKg, durationMinutes) {
  if (!weightKg || !durationMinutes) return 0;
  return Math.round(met * weightKg * (durationMinutes / 60));
}

/**
 * Estimates total calories burned in a resistance workout session.
 * exercises: [{ exercise: { met }, sets: [{reps, weight}] }]
 * Uses logged durationMinutes if provided, otherwise estimates from set count.
 */

