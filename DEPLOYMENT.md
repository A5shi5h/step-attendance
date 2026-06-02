# Workshop Attendance System — Deployment Guide

## Project Structure

```
workshop-attendance/
├── backend/
│   ├── db/
│   │   ├── index.js       # DB connection + setup
│   │   └── schema.sql     # PostgreSQL schema
│   ├── middleware/
│   │   └── auth.js        # JWT middleware
│   ├── routes/
│   │   ├── auth.js
│   │   ├── teachers.js
│   │   ├── sessions.js
│   │   └── attendance.js
│   ├── server.js
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── AttendancePage.jsx   (/attendance)
│   │   │   ├── AdminLogin.jsx       (/admin/login)
│   │   │   └── AdminDashboard.jsx   (/admin)
│   │   ├── utils/api.js
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
└── package.json
```

---

## 1. Prerequisites

- Node.js ≥ 18
- PostgreSQL ≥ 14
- npm ≥ 9

---

## 2. Database Setup

```bash
# Create the database
psql -U postgres
CREATE DATABASE workshop_attendance;
\q
```

---

## 3. Backend Setup

```bash
cd backend
cp .env.example .env
# Edit .env with your database credentials and secrets
nano .env

npm install
node db/setup.js      # OR: npm run setup-db (runs schema + seeds admin)
```

**Required `.env` values:**
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=workshop_attendance
DB_USER=postgres
DB_PASSWORD=your_password

JWT_SECRET=change_this_to_a_long_random_string
JWT_EXPIRES_IN=8h

ADMIN_USERNAME=admin
ADMIN_PASSWORD=YourSecurePassword123
```

---

## 4. Frontend Setup

```bash
cd frontend
npm install

# For development (proxies /api to backend)
npm run dev

# For production build
npm run build
# Output: frontend/dist/
```

**`frontend/.env` (optional, for separate deployment):**
```
VITE_API_URL=https://yourdomain.com/api
```

---

## 5. Running Locally (Development)

Open two terminals:

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev        # nodemon, auto-restarts on changes
# Runs on: http://localhost:5000
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev        # Vite dev server with HMR
# Runs on: http://localhost:5173
```

Visit:
- Teacher attendance: http://localhost:5173/attendance
- Admin panel:        http://localhost:5173/admin

---

## 6. Production Deployment (Single Server)

```bash
# 1. Build frontend
cd frontend && npm run build

# 2. Start backend (serves frontend from dist/)
cd backend
NODE_ENV=production npm start
# Runs on: http://your-server:5000
```

The Express server will serve the React app as static files in production.

---

## 7. Nginx Configuration (Recommended)

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Redirect HTTP → HTTPS
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name yourdomain.com;

    ssl_certificate     /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

---

## 8. PM2 (Process Manager for Production)

```bash
npm install -g pm2

cd backend
pm2 start server.js --name workshop-attendance
pm2 save
pm2 startup       # auto-start on server reboot
```

---

## 9. QR Code for Teachers

Once deployed, generate a QR code pointing to:
```
https://yourdomain.com/attendance
```

Use any QR code generator (qr-code-generator.com, etc.)

---

## 10. Excel Import Format

The Excel file for teacher import must have these columns in this order:
| Column A     | Column B  | Column C     | Column D    |
|--------------|-----------|--------------|-------------|
| Roll Number  | Full Name | Phone Number | School Name |
| T001         | John Doe  | 9876543210   | ABC School  |

Row 1 is treated as a header and skipped automatically.

---

## 11. Default Admin Credentials

Set in your `.env` before first run:
```
ADMIN_USERNAME=admin
ADMIN_PASSWORD=Admin@Workshop2026
```

Change these before deploying to production!

---

## 12. API Endpoints Reference

### Auth
- `POST /api/auth/login` — Login
- `GET  /api/auth/verify` — Verify JWT

### Teachers (admin only except /roll/:roll)
- `GET  /api/teachers` — List all
- `GET  /api/teachers/roll/:roll` — Get by roll (public)
- `POST /api/teachers` — Add one
- `PUT  /api/teachers/:id` — Edit
- `DELETE /api/teachers/:id` — Delete
- `POST /api/teachers/upload` — Excel import

### Sessions (admin only except /active)
- `GET  /api/sessions` — List all
- `GET  /api/sessions/active` — Active session (public)
- `PUT  /api/sessions/:id/activate` — Activate
- `PUT  /api/sessions/:id/close` — Close
- `PUT  /api/sessions/:id/topic` — Update topic

### Attendance
- `POST /api/attendance` — Mark attendance (public)
- `GET  /api/attendance` — List all (admin)
- `PUT  /api/attendance/:id/status` — Change status (admin)
- `GET  /api/attendance/analytics` — Dashboard stats (admin)
- `GET  /api/attendance/eligibility` — Certificate report (admin)
- `GET  /api/attendance/export` — Excel export (admin)
- `GET  /api/attendance/export/eligibility` — Eligibility export (admin)
