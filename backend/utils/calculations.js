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
export function estimateWorkoutCalories({ exercises, durationMinutes, weightKg }) {
  const totalSets = exercises.reduce((sum, e) => sum + e.sets.length, 0);
  const avgMet =
    exercises.reduce((sum, e) => sum + (e.exercise?.met || 5), 0) /
    Math.max(exercises.length, 1);

  const duration =
    durationMinutes || Math.round((totalSets * SECONDS_PER_SET) / 60);

  return caloriesFromMET(avgMet, weightKg, duration);
}


