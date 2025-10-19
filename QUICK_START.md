# Tunegie - Quick Start Guide

## One-Click Setup

**Prerequisites:** Laragon + Node.js installed

1. **Run the automated setup:**
   ```cmd
   setup_project.bat
   ```

2. **That's it!** Your apps will open automatically:
   - Frontend: http://localhost:3000
   - Backend: http://localhost:8000
   - Admin: http://localhost:3001/admin

## What the Script Does

1. **Starts Laragon services** (Apache + MySQL)
2. **Creates database** `tunegie_db`
3. **Runs all SQL scripts** in correct order:
   - Main database structure
   - Achievement & streak system (19 achievements)
   - Bug fixes and improvements
4. **Installs dependencies** (React + Next.js)
5. **Launches all applications**

## Admin Panel

- URL: http://localhost:3001/admin
- Username: `admin`
- Password: `password`

## Current Achievement System

You have **11/19 achievements unlocked** with **810 points**!

**Your Recent Achievements:**
- Perfect Game (100% accuracy) - 150 pts
- Sniper Elite (90% accuracy) - 75 pts  
- Perfectionist (1000+ single game score) - 200 pts
- Score Crusher (5000+ total points) - 150 pts
- And 7 more achievements!

**Streaks:**
- Current play streak: 1 day
- Keep playing daily to unlock streak achievements!

## Project Structure

```
Tunegie/
├── setup_project.bat      # Automated setup (run this!)
├── README.md              # Full documentation
├── SETUP_GUIDE.md         # Manual setup guide
├── frontend/              # React app
├── backend/php/           # PHP API
├── app/                   # Next.js admin panel
└── database/             # SQL schemas
```

## Troubleshooting

**Script fails?** 
- Right-click → "Run as administrator"
- Check Laragon is installed
- Ensure Node.js is installed

**Need help?** Check `SETUP_GUIDE.md` for detailed manual setup.

---

**Ready to play? Visit http://localhost:3000 and start gaming!**