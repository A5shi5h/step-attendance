# Workshop Attendance System

A full-stack attendance system for workshop programs with:

- teacher attendance marking
- admin login and dashboard
- workshop session management
- Excel-based teacher import and attendance export
- certificate eligibility reporting

## Stack

- Backend: Node.js, Express, PostgreSQL
- Frontend: React, Vite, Tailwind CSS

## Project Structure

```text
workshop-attendance/
|-- backend/
|-- frontend/
|-- DEPLOYMENT.md
```

## Prerequisites

- Node.js 18+
- npm 9+
- PostgreSQL 14+

## Environment Setup

Copy `backend/.env.example` to `backend/.env` and set:

```env
PORT=5000
HOST=0.0.0.0
NODE_ENV=production

DB_HOST=localhost
DB_PORT=5432
DB_NAME=workshop_attendance
DB_USER=postgres
DB_PASSWORD=your_db_password_here

JWT_SECRET=your_very_long_random_secret_key_here_change_this
JWT_EXPIRES_IN=8h

ADMIN_USERNAME=admin
ADMIN_PASSWORD=Admin@Workshop2026
```

`HOST=0.0.0.0` lets the backend accept connections from other devices on the same network.

## Install

From the repo root:

```bash
npm run install:all
```

## Database Setup

Create the database, then run:

```bash
npm run setup-db
```

## Local Development

Run the backend:

```bash
npm run dev:backend
```

Run the frontend in a second terminal:

```bash
npm run dev:frontend
```

Default local URLs:

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000`
- Admin: `http://localhost:5173/admin`
- Attendance page: `http://localhost:5173/attendance`

The Vite dev server now runs with `--host`, so the frontend is reachable from other devices on your LAN.

## Production

Build the frontend:

```bash
npm run build
```

Start the backend:

```bash
npm start
```

In production, the Express server serves files from `frontend/dist`.

## Current Session Behavior

- A `Pending` session can be activated.
- A `Closed` session can now be reactivated from the admin dashboard.
- Activating a session closes any other currently active session first.
- Re-activating an already active session returns the existing session without error.

## Main API Areas

- `/api/auth`
- `/api/teachers`
- `/api/sessions`
- `/api/attendance`

## Additional Deployment Notes

See `DEPLOYMENT.md` for the longer deployment guide, Nginx example, PM2 notes, and Excel import format.
