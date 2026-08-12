# RichardGym Tracker (MERN)

A members' workout tracker built for **Richard's Fitness & Gym, Biratnagar** — tracks
nutrition, workouts, and cardio/walks, with a rule-based recommendation engine. Also
includes public **About Us** (`/about`) and **Contact Us** (`/contact`) pages with the
gym's details and the developer's social links.

## Structure

```
gym-tracker/
  backend/    Express + MongoDB (Mongoose) API
  frontend/   React (Vite) + Tailwind CSS
```

## What's included

- **Auth**: register/login with JWT, profile fields (age, height, weight, sex, activity level, goal)
- **Nutrition**: log food intake, daily summary vs a calculated calorie target (Mifflin-St Jeor + activity multiplier + goal adjustment)
- **Workout**: exercise library seeded by muscle group, log sets/reps/weight per session, auto-estimated calories burned (MET-based), "journey" check (days since a muscle group was last trained)
- **Cardio**: log walk/run/cycle sessions with distance/duration/steps, auto-estimated calories burned, weekly totals
- **Recommendations**: `/api/recommendations` combines all of the above into plain-language suggestions (under/over calorie target, low protein, untrained muscle groups, low weekly cardio)

## Setup

### 1. Backend

```bash
cd backend
cp .env.example .env     # edit MONGO_URI / JWT_SECRET as needed
npm install
npm run seed              # populates the exercise library
npm run dev                # starts on http://localhost:5000
```

Requires a running MongoDB instance (local `mongod`, or a free MongoDB Atlas cluster —
just paste its connection string into `MONGO_URI`).

### 2. Frontend

```bash
cd frontend
npm install
npm run dev                # starts on http://localhost:5173
```

The Vite dev server proxies `/api` to `http://localhost:5000`, so no CORS config is needed
in development.

## What's deliberately left out (next steps)

- **Nutrition API integration**: food calories/macros are entered manually right now.
  Wire in USDA FoodData Central or Nutritionix in `nutritionRoutes.js` to auto-fill them
  from a food name search.
- **Charts**: the dashboard shows raw numbers; add a charting library (recharts, Chart.js)
  for calorie/weight/volume trends over time.
- **Weight history**: `User.weight` is a single current value — consider a separate
  `WeightLog` collection if you want a trend line.
- **Password reset, email verification.**
- **Tests.**

## Environment variables (backend/.env)

| Variable | Description |
|---|---|
| `PORT` | API port (default 5000) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret for signing auth tokens — use a long random string |
| `NUTRITIONIX_APP_ID` / `NUTRITIONIX_APP_KEY` | Optional, for future nutrition API lookup |
