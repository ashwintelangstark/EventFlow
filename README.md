# EventFlow — IDEA → AI → IMPACT
### Full-Stack Event Management Web Application

EventFlow is built with **React + Vite** on the frontend, **Node.js + Express** on the backend, and is pre-architected for **Supabase** as the database.

---

## 🚀 Live Testing & Quick Demo Switcher

The application features a floating **"Quick Demo" One-Click Switcher** docked at the bottom of the screen, allowing you to test every view without typing passwords:

* ⚡ **Admin View:** Logs in as **Ashwin Telang** (`admin@eventflow.com` / `admin123`) $\rightarrow$ Opens the full **Admin Operations Portal** (`adminindex.html`).
* ⚡ **Staff View:** Logs in as **Priya Sharma** (`priya@eventflow.com` / `staff123`) $\rightarrow$ Opens the **Staff / Non-Admin Portal** (`nonadminindex.html`).
* ⚡ **Attendee View:** Logs in as **Rohan Patil** (`rohan@eventflow.com` / `student123`) $\rightarrow$ Opens the **Participant Portal**.
* 🚪 **Sign Out:** Returns to the split-screen Cyberpunk / Glassmorphic Login & Sign-Up page.

---

## 🛠️ Tech Stack & Architecture

* **Frontend (`/client`):** React 18, Vite, Vanilla CSS with Glassmorphism, CSS Custom Properties, Lucide Icons.
* **Backend (`/server`):** Node.js, Express, CORS, Dotenv, `@supabase/supabase-js`.
* **Database:** Supabase ready with automated fallback to an in-memory mock store today.
* **Database Migration File:** [`supabase_schema.sql`](file:///Users/ashwintelangstark/Desktop/dot.files/DataDice%20Projects/EventFlow/WebApp/supabase_schema.sql) (Hand this file to your teammate tomorrow).

---

## 📋 Running Locally

### Start Both Frontend & Backend Concurrently
From the root workspace directory:
```bash
npm run dev
```
* **Client:** [http://localhost:5173/](http://localhost:5173/)
* **Server:** [http://localhost:5001/](http://localhost:5001/)
* **API Health Check:** [http://localhost:5001/api/health](http://localhost:5001/api/health)

### Running Separately
```bash
# Start backend only
npm run server

# Start frontend only
npm run client
```

---

## 🔌 Connecting Supabase Tomorrow

When your teammate finishes setting up Supabase tomorrow:

1. Hand them [`supabase_schema.sql`](file:///Users/ashwintelangstark/Desktop/dot.files/DataDice%20Projects/EventFlow/WebApp/supabase_schema.sql) to run in the **Supabase SQL Editor**. It creates:
   * `profiles` (with Role-Based Access Control)
   * `registrations` (with check-in status and timestamps)
   * `announcements` (with category tags and draft/published flags)
   * Row-Level Security (RLS) policies.
2. In [`server/.env`](file:///Users/ashwintelangstark/Desktop/dot.files/DataDice%20Projects/EventFlow/WebApp/server/.env), fill in the credentials:
   ```env
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```
3. Restart the server (`npm run server`). The backend will automatically detect the credentials and switch from Mock Store to Supabase without any changes to your React frontend!
