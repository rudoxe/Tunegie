# Tunegie - Music Guessing Game

A full-stack music guessing game built with React frontend, PHP backend, and Next.js admin panel.

## Quick Start

### Automated Setup (Recommended)

1. **Run the setup script:**
   ```cmd
   setup_project.bat
   ```
   
   This will automatically:
   - Start Laragon services
   - Set up the database with all tables
   - Install all dependencies 
   - Launch the applications

2. **Access your applications:**
   - **Frontend**: http://localhost:3000
   - **Backend API**: http://localhost:8000
   - **Admin Panel**: http://localhost:3001/admin

### Prerequisites

- **Laragon** (with Apache, MySQL, PHP 8.1+)
- **Node.js** (v16+ recommended)

## Features

- User Authentication - Register, login, password reset
- Music Guessing Game - Multiple game modes and difficulties
- Achievement System - 19 achievements to unlock
- Daily Streaks - Track consecutive play days
- Leaderboards - Compete with other players
- Profile Management - Track progress and statistics
- Admin Panel - Content management system

## Database

The setup script creates and populates:
- **Users & Authentication** tables
- **Game sessions & rounds** tracking
- **Leaderboards & statistics**
- **Achievement system** (19 pre-loaded achievements)
- **Daily streak tracking**

## Manual Setup

If you prefer manual setup or encounter issues, see **SETUP_GUIDE.md** for detailed step-by-step instructions.

## How to Play

1. Register an account at http://localhost:3000
2. Choose a game mode
3. Listen to music clips and guess the song/artist
4. Earn points and unlock achievements
5. Build daily streaks by playing consistently
6. Compete on leaderboards

## Achievement System

**Gameplay Achievements:**
- First Steps (1 game) - 10 pts
- Game Veteran (10 games) - 25 pts  
- Game Master (50 games) - 100 pts
- Game Legend (100 games) - 250 pts

**Scoring Achievements:**
- Score Settler (1 point) - 5 pts
- Score Climber (1000 total points) - 50 pts
- High Roller (500 points single game) - 75 pts
- Perfect Game (100% accuracy) - 150 pts

**Streak Achievements:**
- Streak Starter (3 days) - 20 pts
- Dedicated Player (7 days) - 50 pts
- Streak Warrior (14 days) - 100 pts
- Unstoppable (30 days) - 300 pts

## Admin Panel

Access the admin panel at http://localhost:3001/admin

**Default Login:**
- Username: `admin`
- Password: `password`

**Features:**
- Content management
- User statistics
- Game analytics
- System configuration

## Project Structure

```
Tunegie/
├── app/                    # Next.js admin panel
├── backend/php/           # PHP API backend
├── frontend/              # React frontend
├── database/              # SQL schemas and migrations
├── data/                  # Admin panel data storage
├── setup_project.bat      # Automated setup script
├── SETUP_GUIDE.md         # Detailed setup guide
└── README.md              # This file
```

## Troubleshooting

### Common Issues:

1. **Script fails to run**: Right-click `setup_project.bat` → "Run as administrator"

2. **Database connection error**: 
   - Ensure Laragon MySQL is running
   - Check database credentials in `backend/php/config/config.php`

3. **Frontend won't start**:
   - Ensure Node.js is installed
   - Try deleting `node_modules` and running script again

4. **Achievement system not working**:
   - Verify all SQL scripts ran successfully
   - Check timezone settings in backend config

### Getting Help:

1. Check the **SETUP_GUIDE.md** for detailed instructions
2. Verify all prerequisites are installed
3. Check Laragon logs for errors
4. Ensure all ports (3000, 3001, 8000) are available

## Production Deployment

For production deployment:

1. Set up proper database credentials
2. Configure environment variables
3. Build production assets: `npm run build`
4. Set up proper authentication
5. Configure HTTPS and security headers

---

**Enjoy playing Tunegie!**

Built with React, PHP, MySQL, and Next.js
