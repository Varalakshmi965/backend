# HealthyHabits Tracker – Backend

Node/Express API for HealthyHabits Tracker. It manages users, habits, logs, analytics, moods, and CSV export using Supabase as the database.

## Tech Stack

- **Node.js + Express**
- **Supabase (Postgres) via `@supabase/supabase-js`**
- **JWT** authentication
- **bcryptjs** for password hashing
- **CORS + morgan**

## Folder Structure

```text
backend/
  config/
    supabase.js
  controllers/
    authController.js
    habitController.js
    analyticsController.js
    moodController.js
  models/
    userModel.js
    habitModel.js
    analyticsModel.js
    moodModel.js
  routes/
    authRoutes.js
    habitRoutes.js
    analyticsRoutes.js
    moodRoutes.js
  middleware/
    authMiddleware.js
  server.js
  package.json
  .env.example
```

## Environment

Create a `.env` file in `backend/`:

```bash
PORT=5000
SUPABASE_URL=https://goodlvycuqhnvxoyromz.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
JWT_SECRET=your_jwt_secret_here
FRONTEND_URL=http://localhost:5173
```

**Important:** Get your Supabase keys from [Supabase Dashboard](https://supabase.com/dashboard) → your project → Settings → API. Use the `anon` `public` key. On Render, configure the same variables as environment variables (do **not** expose `JWT_SECRET`).

**Before running:** You must create the database tables. Run the SQL in `supabase-schema.sql` in the Supabase SQL Editor (Dashboard → SQL Editor → New query).

## Database Schema (Supabase)

In Supabase, create the following tables (simplified schema):

```sql
-- users
create table users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text unique not null,
  password_hash text not null,
  created_at timestamptz default now()
);

-- habits
create table habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  name text not null,
  category text not null,
  goal_type text not null, -- 'daily' or 'weekly'
  goal_value numeric not null,
  unit text not null,
  created_at timestamptz default now()
);

-- habit_logs
create table habit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  habit_id uuid references habits(id) on delete cascade,
  date date not null,
  value numeric,
  completed boolean default false,
  created_at timestamptz default now()
);

-- moods
create table moods (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  date date not null,
  mood integer not null, -- 1-5
  note text,
  created_at timestamptz default now()
);
```

For simplicity, you can start with **RLS disabled** on these tables. In production, prefer using a **service role key** instead of the anon key and add proper RLS policies.

## API Overview

Base URL: `/api`

- **Auth**
  - `POST /api/auth/register` – Register user (name, email, password)
  - `POST /api/auth/login` – Login, returns `{ user, token }`
- **Habits** (JWT required)
  - `GET /api` – List habits for logged-in user
  - `POST /api` – Create habit
  - `DELETE /api/:id` – Delete habit
  - `POST /api/logs` – Log habit completion `{ habitId, date, value, completed }`
- **Dashboard & Analytics** (JWT required)
  - `GET /api/dashboard/summary` – Daily & weekly summary + wellness score + reminders
  - `GET /api/analytics` – Habit analytics dashboard data
  - `GET /api/export/csv` – Export logs as CSV
- **Moods** (JWT required)
  - `GET /api/moods` – List recent mood entries
  - `POST /api/moods` – Log mood `{ mood, note }`

## Run Locally

```bash
cd backend
npm install
npm run dev
```

The API will run on `http://localhost:5000`.

## Deployment (Render)

1. Push this backend folder to a **separate GitHub repo**.
2. Create a new **Web Service** on Render.
3. Build command: `npm install`
4. Start command: `npm start`
5. Set environment variables from `.env.example`.
6. After deployment, use the Render URL (e.g. `https://your-api.onrender.com/api`) in the frontend `VITE_API_URL`.

