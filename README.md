# 🌱 Mobile E-Learning Platform for Small-Scale Farmers

**Author:** Gikara James Ng'ang'a | Reg No. 668886  
**Unit:** APT3065VA — Final Class Project | USIU-Africa  
**GitHub:** https://github.com/jngikara/mobile-elearning-farmers

---

## Project Overview

A full-stack mobile e-learning platform delivering structured agricultural training to small-scale farmers in Kenya. The platform supports **offline content access**, **role-based access control** (Farmer, Extension Officer, Administrator), and a normalized MySQL database (3NF).

---

## Tech Stack

| Layer            | Technology                        |
|------------------|-----------------------------------|
| Mobile Frontend  | React Native (Android)            |
| Admin Dashboard  | HTML / CSS / Vanilla JS           |
| Backend API      | Node.js + Express.js (REST)       |
| Primary Database | MySQL 8.0                         |
| Offline Cache    | SQLite (react-native-sqlite-storage) |
| Media Hosting    | Cloudinary CDN                    |
| Authentication   | JWT + bcrypt                      |

---

## Project Structure

```
farmer-elearning/
├── backend/                    # Node.js REST API
│   ├── src/
│   │   ├── controllers/        # Business logic per resource
│   │   ├── routes/             # Express route definitions
│   │   ├── middleware/         # JWT auth middleware
│   │   └── db/                 # MySQL pool + seed script
│   ├── .env.example
│   └── package.json
│
├── mobile-app/                 # React Native Android app
│   ├── App.js                  # Root component
│   ├── src/
│   │   ├── navigation/         # React Navigation config
│   │   ├── screens/            # Farmer + Admin screens
│   │   └── utils/              # API client + SQLite offline storage
│   └── package.json
│
├── admin-dashboard/
│   └── index.html              # Single-file admin web dashboard
│
└── database/
    └── schema.sql              # MySQL DDL (3NF) + seed data
```

---

## Database Schema (3NF)

```
users        ← central identity table (farmer / officer / admin)
categories   ← agricultural topic categories (normalised lookup)
modules      ← learning content metadata (FK → categories, users)
progress     ← per-user completion records (FK → users, modules)
downloads    ← offline download records (FK → users, modules)
feedback     ← ratings + comments (FK → users, modules)
```

All foreign keys use `ON DELETE CASCADE` to maintain referential integrity.

---

## API Endpoints

| Method | Endpoint                        | Auth         | Description                     |
|--------|---------------------------------|--------------|---------------------------------|
| POST   | /api/auth/register              | None         | Register new user               |
| POST   | /api/auth/login                 | None         | Login → returns JWT             |
| GET    | /api/auth/me                    | JWT          | Get own profile                 |
| GET    | /api/modules                    | JWT          | List published modules          |
| POST   | /api/modules                    | Officer/Admin| Create module                   |
| PUT    | /api/modules/:id                | Officer/Admin| Update module                   |
| DELETE | /api/modules/:id                | Admin        | Delete module                   |
| GET    | /api/categories                 | JWT          | List categories                 |
| GET    | /api/progress                   | JWT          | Get progress records            |
| POST   | /api/progress                   | JWT          | Mark module complete            |
| GET    | /api/downloads                  | JWT          | Get downloaded modules          |
| POST   | /api/downloads                  | JWT          | Record a download               |
| DELETE | /api/downloads/:module_id       | JWT          | Remove offline download         |
| POST   | /api/feedback                   | JWT          | Submit rating + comment         |
| GET    | /api/feedback/:module_id        | Officer/Admin| View module feedback            |
| GET    | /api/users                      | Admin        | List all users                  |
| PUT    | /api/users/:id                  | Admin        | Update user (role, active, etc.)|
| DELETE | /api/users/:id                  | Admin        | Delete user                     |
| GET    | /api/reports/summary            | Admin        | Dashboard statistics            |
| GET    | /api/reports/completion         | Officer/Admin| Module completion stats         |
| GET    | /api/reports/category-engagement| Officer/Admin| Completions by category         |

---

## Setup Instructions

### Prerequisites

- Node.js ≥ 18
- MySQL 8.0
- Android Studio (for the mobile app emulator)
- Java 17 (for React Native Android builds)

---

### 1. Database Setup

```bash
# Log into MySQL
mysql -u root -p

# Run the schema
SOURCE /path/to/farmer-elearning/database/schema.sql;
```

---

### 2. Backend API

```bash
cd backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env — set DB_PASS, JWT_SECRET, and Cloudinary keys

# Seed the database with demo data
npm run seed

# Start development server
npm run dev
# → API running at http://localhost:5000
```

**Default seeded accounts:**

| Role    | Email                      | Password       |
|---------|----------------------------|----------------|
| Admin   | admin@farmerlearn.ke       | Admin@1234     |
| Officer | officer@farmerlearn.ke     | Officer@1234   |
| Farmer  | farmer@farmerlearn.ke      | Farmer@1234    |

---

### 3. Admin Dashboard

Open `admin-dashboard/index.html` directly in a browser.  
Sign in with the Admin or Officer credentials above.

> The dashboard connects to `http://localhost:5000/api` by default.  
> To deploy, update the `API` constant at the top of the `<script>` block.

---

### 4. Mobile App (React Native)

```bash
cd mobile-app

# Install JS dependencies
npm install

# Install iOS pods (macOS only)
cd ios && pod install && cd ..

# Start Metro bundler
npm start

# In a second terminal — run on Android emulator
npm run android
```

> **Android emulator note:** The app uses `http://10.0.2.2:5000/api` in development,
> which maps to the host machine's `localhost`. Ensure the backend is running first.

---

## User Roles & Permissions

| Feature                        | Farmer | Officer | Admin |
|--------------------------------|--------|---------|-------|
| Browse & view modules          | ✓      | ✓       | ✓     |
| Download modules (offline)     | ✓      | ✓       | ✓     |
| Track learning progress        | ✓      | ✓       | ✓     |
| Submit feedback / ratings      | ✓      |         |       |
| Upload / edit modules          |        | ✓       | ✓     |
| View engagement statistics     |        | ✓       | ✓     |
| Manage users (CRUD)            |        |         | ✓     |
| Delete modules                 |        |         | ✓     |
| Generate reports               |        |         | ✓     |

---

## Offline Feature

The offline system works in two layers:

1. **Backend records** — `POST /api/downloads` logs which modules a user has saved.  
2. **Device cache** — `react-native-sqlite-storage` stores module metadata locally in `farmerlearn.db`.

When a farmer taps **"Save for offline"** on a module, both layers are updated. The **Library** tab shows all locally cached modules and works without any internet connection.

---

## Production Deployment (Recommended)

| Component       | Service                              |
|-----------------|--------------------------------------|
| Backend API     | Railway / Render / AWS EC2 + PM2     |
| MySQL Database  | PlanetScale / AWS RDS / Google Cloud SQL |
| Media assets    | Cloudinary CDN (already integrated)  |
| Admin Dashboard | Vercel / Netlify (static HTML)       |
| Android APK     | `./gradlew assembleRelease` → Google Play |

---

## Usability Testing Results

| Task                         | Completion | Avg Rating |
|------------------------------|-----------|------------|
| Register a new account       | 5/5 (100%)| 4.8 / 5    |
| Find and open a module       | 5/5 (100%)| 4.6 / 5    |
| Watch / read module content  | 5/5 (100%)| 4.7 / 5    |
| Download for offline         | 4/5 (80%) | 4.2 / 5    |
| Track learning progress      | 5/5 (100%)| 4.5 / 5    |
| **Overall**                  | **96%**   | **4.56 / 5** |

---

## Future Enhancements

- NLP-powered query engine for free-text farmer questions
- iOS support (extend existing React Native codebase)
- Swahili + regional language UI
- Push notifications for new module alerts
- Peer discussion / community forum
- AI-driven personalised module recommendations

---

## License

Academic project — USIU-Africa, Summer 2026.  
All rights reserved by Gikara James Ng'ang'a.
