# Tunegie

A music guessing game. Listen to a clip, guess the song. Compete on leaderboards, unlock achievements, build daily streaks.

**Stack:** React (Vercel) · PHP 8.2 (Railway) · MySQL

---

## Project Structure

```
Tunegie/
├── frontend/               # React app (deployed to Vercel)
│   └── src/
│       ├── components/     # Game, Leaderboard, Profile, Auth, etc.
│       ├── contexts/       # AuthContext, GameContext, ThemeContext
│       ├── pages/          # Route-level pages
│       └── services/       # iTunes API client
├── backend/
│   └── php/                # PHP API (deployed to Railway)
│       ├── api/            # Endpoints: auth, game, user, admin
│       ├── config/         # config.php — DB, JWT, helpers
│       ├── middleware/      # cors.php
│       └── utils/          # AchievementSystem.php
├── database/
│   ├── schemas/            # SQL table definitions
│   ├── migrations/         # One-off migration scripts
│   └── seeds/              # Demo data seed
└── deploy/                 # Railway / nixpacks config
```

---

## Local Development

### Prerequisites

- **Node.js** v16+
- **PHP 8.2+** with extensions: `pdo`, `pdo_mysql`, `mysqli`, `curl`
- **MySQL 8+** (Laragon, XAMPP, or standalone)

### 1. Database

```sql
-- In MySQL client or phpMyAdmin:
source database/schemas/setup_database.sql
source database/schemas/achievements_streaks_schema.sql

-- Optional: load demo data so leaderboards aren't empty
source database/seeds/demo_data.sql
```

### 2. Backend (PHP)

```bash
cd backend/php
```

Copy and edit the env file:

```bash
cp ../node/.env.example .env   # or create manually
```

Set these values in `backend/php/config/config.php` (or via env vars):

| Variable         | Description                        |
|------------------|------------------------------------|
| `MYSQLHOST`      | Database host (default: localhost) |
| `MYSQLDATABASE`  | Database name (default: tunegie_db)|
| `MYSQLUSER`      | Database user (default: root)      |
| `MYSQLPASSWORD`  | Database password                  |
| `MYSQLPORT`      | Database port (default: 3306)      |
| `JWT_SECRET`     | Secret key for JWT signing         |

Start the PHP built-in server:

```bash
php -S localhost:8000 -t . router.php
```

API is now available at `http://localhost:8000`.

### 3. Frontend (React)

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```env
REACT_APP_API_BASE=http://localhost:8000
```

```bash
npm start
```

App runs at `http://localhost:3000`.

---

## Deployment

### Frontend → Vercel

1. Connect your GitHub repo to Vercel
2. Set **Root Directory** to `frontend`
3. Add environment variable:
   - `REACT_APP_API_BASE` = `https://your-railway-app.up.railway.app`
4. Deploy — Vercel runs `npm run build` automatically

The `frontend/public/vercel.json` SPA rewrite rule handles client-side routing.

### Backend → Railway

1. Create a new Railway project and add a **MySQL** service
2. Add a second service pointed at this repo, set **Root Directory** to `backend`
3. Railway auto-detects `nixpacks.toml` and uses:
   ```
   php -S 0.0.0.0:$PORT -t php php/router.php
   ```
4. Set these environment variables in Railway:

| Variable         | Value                                      |
|------------------|--------------------------------------------|
| `MYSQLHOST`      | From Railway MySQL service (auto-linked)   |
| `MYSQLDATABASE`  | From Railway MySQL service                 |
| `MYSQLUSER`      | From Railway MySQL service                 |
| `MYSQLPASSWORD`  | From Railway MySQL service                 |
| `MYSQLPORT`      | From Railway MySQL service                 |
| `JWT_SECRET`     | A long random string                       |
| `SEED_SECRET`    | A secret for the demo data seeder (optional)|

5. After first deploy, run the database schemas via the Railway MySQL shell or a migration tool.

### Seeding Demo Data on Railway

Once deployed, seed the leaderboard with demo users by hitting:

```
GET https://your-app.up.railway.app/api/admin/seed_demo.php?secret=YOUR_SEED_SECRET
```

This creates 8 demo users with realistic game history, leaderboard entries, streaks, and achievements. Safe to run multiple times — uses `INSERT IGNORE`.

Demo user credentials (for testing login):
- **Username:** any of `MelodyKing`, `BeatDropper`, `RhythmRider`, etc.
- **Password:** `Demo1234!`

---

## API Endpoints

### Auth
| Method | Path                          | Auth | Description          |
|--------|-------------------------------|------|----------------------|
| POST   | `/api/auth/register.php`      | —    | Register             |
| POST   | `/api/auth/login.php`         | —    | Login, returns JWT   |
| POST   | `/api/auth/forgot-password.php` | —  | Request password reset |
| POST   | `/api/auth/reset-password.php`  | —  | Reset password       |

### Game
| Method | Path                          | Auth | Description          |
|--------|-------------------------------|------|----------------------|
| POST   | `/api/game/save_score.php`    | ✅   | Save completed game  |
| GET    | `/api/game/leaderboard.php`   | —    | Leaderboard data     |
| GET    | `/api/game/streaks.php`       | ✅   | User streak info     |

### User
| Method | Path                              | Auth | Description           |
|--------|-----------------------------------|------|-----------------------|
| GET    | `/api/user/my-profile.php`        | ✅   | Own profile           |
| GET/PUT| `/api/user/profile.php`           | ✅   | Profile + update      |
| GET    | `/api/user/user_stats.php`        | ✅   | Personal stats        |
| GET    | `/api/user/achievements.php`      | ✅   | Own achievements      |
| POST   | `/api/user/upload_profile_picture.php` | ✅ | Upload avatar      |
| GET    | `/api/user/search-users.php`      | —    | Search users          |
| GET    | `/api/user/user-profile.php`      | —    | Public user profile   |

### Admin
| Method | Path                              | Auth   | Description           |
|--------|-----------------------------------|--------|-----------------------|
| GET    | `/api/admin/dashboard.php`        | Admin  | Dashboard stats       |
| GET    | `/api/admin/seed_demo.php?secret=` | Secret | Seed demo data       |

---

## Achievement System

Achievements are stored in the `achievements` table and checked automatically after every game via `AchievementSystem.php`.

| Category     | Achievement         | Condition                        |
|--------------|---------------------|----------------------------------|
| Gameplay     | First Steps         | Play 1 game                      |
| Gameplay     | Game Veteran        | Play 10 games                    |
| Gameplay     | Game Master         | Play 50 games                    |
| Gameplay     | Game Legend         | Play 100 games                   |
| Scoring      | High Roller         | Score 500 pts in one game        |
| Scoring      | Perfectionist       | Score 1000 pts in one game       |
| Scoring      | Sharp Shooter       | 80% accuracy in one game         |
| Scoring      | Sniper Elite        | 90% accuracy in one game         |
| Scoring      | Perfect Game        | 100% accuracy in one game        |
| Progression  | Score Climber       | 1000 total points                |
| Progression  | Score Crusher       | 5000 total points                |
| Streak       | Streak Starter      | 3-day play streak                |
| Streak       | Dedicated Player    | 7-day play streak                |
| Streak       | Streak Warrior      | 14-day play streak               |
| Streak       | Unstoppable         | 30-day play streak               |
| Consistency  | Consistent Performer| 50 rounds played                 |
| Consistency  | Round Master        | 200 rounds played                |
| Consistency  | Endurance Champion  | 500 rounds played                |

---

## Game Modes

| Mode       | Description                                      |
|------------|--------------------------------------------------|
| `random`   | Random mix of tracks from iTunes top charts      |
| `artist`   | Tracks from a specific artist                    |
| `genre`    | Tracks from a specific genre                     |

---

## Troubleshooting

**502 Bad Gateway on Railway**
- Check Railway deploy logs — usually a missing PHP extension or startup crash
- Verify `nixpacks.toml` includes `php82Extensions.curl`
- The healthcheck hits `/api/health.php` — make sure it returns 200

**CORS errors**
- Every PHP endpoint includes `cors.php` at the top — if you see CORS errors, the server is likely returning a 5xx before headers are sent
- Check Railway logs for PHP fatal errors

**JWT / login not working**
- Ensure `JWT_SECRET` env var is set on Railway
- The `Authorization: Bearer <token>` header must reach PHP — `config.php` checks `$_SERVER['HTTP_AUTHORIZATION']`, `apache_request_headers()`, and `getallheaders()` as fallbacks

**Profile pictures not showing**
- Images are served via `/serve_image.php?file=filename.jpg`
- Uploads go to `backend/php/api/uploads/profile_pictures/`
- Railway's filesystem is ephemeral — uploaded images won't survive redeploys (use object storage for production)

**Database connection failed**
- On Railway, use the auto-linked MySQL env vars (`MYSQLHOST`, `MYSQLDATABASE`, etc.)
- Locally, edit the fallback values in `backend/php/config/config.php`
