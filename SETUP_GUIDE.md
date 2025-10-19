# Tunegie Project Setup Guide

Complete guide to set up and run the Tunegie music guessing game project.

## Prerequisites

Before starting, ensure you have:

- **Laragon** (with Apache, MySQL, PHP 8.1+)
- **Node.js** (v16+ recommended)
- **Git** (optional, for version control)
- **Windows 10/11**

## Quick Setup (Automated)

### Option 1: Use the Automated Setup Script
1. Open Command Prompt or PowerShell as Administrator
2. Navigate to the project directory:
   ```cmd
   cd C:\laragon\www\Tunegie
   ```
3. Run the setup script:
   ```cmd
   setup_project.bat
   ```

This will automatically:
- Start Laragon services
- Set up the database
- Install dependencies
- Configure the project
- Launch the application

---

## Manual Setup (Step-by-Step)

### Step 1: Start Laragon Services
1. Open Laragon
2. Click **"Start All"** to start Apache and MySQL
3. Verify services are running (green icons)

### Step 2: Database Setup

#### A. Create Database
1. Open **HeidiSQL** or **phpMyAdmin** from Laragon
2. Create a new database named `tunegie_db`

#### B. Run Database Scripts (In Order)
Execute these SQL files in **exactly this order**:

```sql
-- 1. Main database structure
SOURCE C:/laragon/www/Tunegie/database/schemas/setup_database.sql;

-- 2. Achievement and streak system
SOURCE C:/laragon/www/Tunegie/database/schemas/achievements_streaks_schema.sql;

-- 3. Apply fixes and updates
SOURCE C:/laragon/www/Tunegie/database/migrations/fix_achievements_streaks.sql;
```

**Alternative: Command Line Method**
```cmd
cd C:\laragon\bin\mysql\mysql-8.0.30-winx64\bin
mysql.exe -u root -p < C:\laragon\www\Tunegie\database\schemas\setup_database.sql
mysql.exe -u root -p < C:\laragon\www\Tunegie\database\schemas\achievements_streaks_schema.sql
mysql.exe -u root -p < C:\laragon\www\Tunegie\database\migrations\fix_achievements_streaks.sql
```

### Step 3: Backend Setup (PHP)

#### A. Verify PHP Configuration
1. Check PHP version: `php --version` (should be 8.1+)
2. Ensure these extensions are enabled in `php.ini`:
   - `extension=pdo_mysql`
   - `extension=mysqli`
   - `extension=openssl`

#### B. Configure Backend
1. Navigate to backend directory:
   ```cmd
   cd C:\laragon\www\Tunegie\backend\php
   ```

2. Verify `config/config.php` contains:
   ```php
   // Set timezone for consistent date/time handling
   date_default_timezone_set('Europe/Berlin'); // Adjust to your timezone

   // Database configuration
   define('DB_HOST', 'localhost');
   define('DB_NAME', 'tunegie_db');
   define('DB_USER', 'root');
   define('DB_PASS', '');
   define('DB_PORT', '3306');
   ```

3. Test database connection:
   ```cmd
   php -r "
   require 'config/config.php';
   try {
       $pdo = getDbConnection();
       echo 'Database connection successful!';
   } catch (Exception $e) {
       echo 'Connection failed: ' . $e->getMessage();
   }
   "
   ```

### Step 4: Frontend Setup (React)

#### A. Install Dependencies
1. Navigate to frontend directory:
   ```cmd
   cd C:\laragon\www\Tunegie\frontend
   ```

2. Install Node.js dependencies:
   ```cmd
   npm install
   ```

#### B. Configure Frontend
1. Verify `src/contexts/AuthContext.js` has correct API_BASE:
   ```javascript
   const API_BASE = 'http://localhost:8000';
   ```

2. Check all hardcoded URLs in:
   - `src/pages/ResetPassword.js`
   - `src/components/Layout.js`
   - `src/pages/UserProfile.js`

   They should use `API_BASE` variable instead of hardcoded `http://localhost:8000`

### Step 5: Admin Panel Setup (Next.js)

#### A. Install Dependencies
1. Navigate to admin directory:
   ```cmd
   cd C:\laragon\www\Tunegie
   ```

2. Install Next.js dependencies:
   ```cmd
   npm install
   ```

#### B. Verify Admin Configuration
1. Check `app/api/content/route.js` exists
2. Check `app/api/stats/route.js` exists
3. Verify `data/` directory exists for content storage

### Step 6: Launch Application

#### A. Start Backend Server
1. In Laragon, ensure Apache is running
2. Backend should be accessible at: `http://localhost:8000`

#### B. Start Frontend Development Server
```cmd
cd C:\laragon\www\Tunegie\frontend
npm start
```
Frontend will be available at: `http://localhost:3000`

#### C. Start Admin Panel
```cmd
cd C:\laragon\www\Tunegie
npm run dev
```
Admin panel will be available at: `http://localhost:3001`

---

## Testing the Setup

### 1. Test Database Connection
```cmd
cd C:\laragon\www\Tunegie\backend\php
php -r "
require 'config/config.php';
$pdo = getDbConnection();
echo 'Database: ' . DB_NAME . ' connected successfully!';
"
```

### 2. Test API Endpoints
Open browser and test:
- `http://localhost:8000/backend/php/api/user/test.php` - Should return JSON
- Backend health check

### 3. Test Frontend
- Visit `http://localhost:3000`
- Should see Tunegie homepage
- Try registration/login functionality

### 4. Test Admin Panel
- Visit `http://localhost:3001/admin`
- Login with: `admin` / `password`
- Test content editing and saving

### 5. Verify Achievement System
After playing games, check:
- Profile page shows achievements
- Streaks are tracking correctly
- Database has achievement records

---

## Project Structure

```
Tunegie/
├── app/                     # Next.js admin panel
│   ├── admin/
│   │   └── simple-cms/
│   └── api/
├── backend/
│   ├── node/               # Node.js backend (if used)
│   └── php/                # PHP API backend
│       ├── api/            # API endpoints
│       ├── config/         # Configuration
│       └── utils/          # Utility classes
├── database/
│   ├── migrations/         # Database updates
│   └── schemas/           # Database structure
├── frontend/              # React frontend
│   ├── public/
│   └── src/
├── data/                  # Admin panel data storage
└── setup_project.bat     # Automated setup script
```

---

## Configuration Files

### Key Files to Configure:
1. `backend/php/config/config.php` - Database and API settings
2. `frontend/src/contexts/AuthContext.js` - API endpoints
3. `package.json` - Dependencies and scripts
4. Database connection settings

---

## Troubleshooting

### Common Issues:

#### 1. Database Connection Failed
- **Check**: Laragon MySQL is running
- **Check**: Database `tunegie_db` exists
- **Check**: PHP PDO MySQL extension is enabled

#### 2. Frontend Can't Connect to Backend
- **Check**: Backend is accessible at `http://localhost:8000`
- **Check**: CORS settings in `config/config.php`
- **Check**: API_BASE variable in frontend

#### 3. Admin Panel Not Saving
- **Check**: `data/` directory has write permissions
- **Check**: API routes exist in `app/api/`

#### 4. Achievements Not Working
- **Check**: Database has achievement tables
- **Check**: Migration scripts have been run
- **Check**: Timezone settings in config

#### 5. Streaks Not Updating
- **Check**: Timezone configuration
- **Check**: Daily streak records exist in database
- **Check**: Game saving triggers streak updates

---

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Verify all prerequisites are installed
3. Ensure all SQL scripts have been executed in order
4. Check browser console for JavaScript errors
5. Check PHP error logs in Laragon

---

## Next Steps

After successful setup:
1. **Configure your timezone** in `backend/php/config/config.php`
2. **Add your music tracks** to the game
3. **Customize the admin panel** content
4. **Deploy to production** when ready
5. **Set up proper authentication** for production use

---

**Your Tunegie project should now be fully functional!**

Features working:
- User registration and authentication
- Music guessing game mechanics
- Achievement system (19 achievements available)
- Daily streak tracking
- Leaderboards and statistics
- Admin content management panel
- Profile management and progress tracking
