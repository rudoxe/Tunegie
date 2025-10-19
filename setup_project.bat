@echo off
setlocal enabledelayedexpansion

REM ==================================================
REM  Tunegie Project Automated Setup Script
REM ==================================================

echo.
echo ====================================
echo   TUNEGIE PROJECT SETUP SCRIPT
echo ====================================
echo.

REM Set project paths
set "PROJECT_DIR=%~dp0"
set "LARAGON_DIR=C:\laragon"
set "MYSQL_BIN=%LARAGON_DIR%\bin\mysql\mysql-8.0.30-winx64\bin"
set "PHP_BIN=%LARAGON_DIR%\bin\php\php-8.1.10-Win32-vs16-x64"

echo Project Directory: %PROJECT_DIR%
echo Laragon Directory: %LARAGON_DIR%
echo.

REM Check if Laragon is installed
if not exist "%LARAGON_DIR%" (
    echo ERROR: Laragon not found at %LARAGON_DIR%
    echo Please install Laragon first from https://laragon.org/
    pause
    exit /b 1
)

echo Laragon installation found
echo.

REM ==================================================
REM  Step 1: Start Laragon Services
REM ==================================================

echo STEP 1: Starting Laragon Services...
echo.

REM Check if Laragon services are running
tasklist /fi "imagename eq httpd.exe" 2>nul | find /i "httpd.exe" >nul
if %errorlevel% neq 0 (
    echo Starting Apache...
    start "" "%LARAGON_DIR%\laragon.exe" start apache
    timeout /t 3 /nobreak >nul
) else (
    echo Apache already running
)

tasklist /fi "imagename eq mysqld.exe" 2>nul | find /i "mysqld.exe" >nul
if %errorlevel% neq 0 (
    echo Starting MySQL...
    start "" "%LARAGON_DIR%\laragon.exe" start mysql
    timeout /t 5 /nobreak >nul
) else (
    echo MySQL already running
)

echo.
echo Waiting for services to fully start...
timeout /t 8 /nobreak >nul

REM ==================================================
REM  Step 2: Database Setup
REM ==================================================

echo STEP 2: Setting up Database...
echo.

REM Test MySQL connection
echo Testing MySQL connection...
"%MYSQL_BIN%\mysql.exe" -u root -e "SELECT 'Connection successful' as status;" 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Cannot connect to MySQL
    echo Please ensure MySQL is running in Laragon
    pause
    exit /b 1
)

echo MySQL connection successful

REM Create database
echo Creating database 'tunegie_db'...
"%MYSQL_BIN%\mysql.exe" -u root -e "CREATE DATABASE IF NOT EXISTS tunegie_db;" 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Failed to create database
    pause
    exit /b 1
)

echo Database 'tunegie_db' created/verified

REM Run SQL scripts in order
echo Running database setup scripts...

echo   1/3 - Main database structure...
"%MYSQL_BIN%\mysql.exe" -u root tunegie_db < "%PROJECT_DIR%database\schemas\setup_database.sql" 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Failed to run setup_database.sql
    pause
    exit /b 1
)
echo   Main database structure created

echo   2/3 - Achievement and streak system...
"%MYSQL_BIN%\mysql.exe" -u root tunegie_db < "%PROJECT_DIR%database\schemas\achievements_streaks_schema.sql" 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Failed to run achievements_streaks_schema.sql
    pause
    exit /b 1
)
echo   Achievement system tables created

echo   3/3 - Applying fixes and updates...
"%MYSQL_BIN%\mysql.exe" -u root tunegie_db < "%PROJECT_DIR%database\migrations\fix_achievements_streaks.sql" 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Failed to run fix_achievements_streaks.sql
    pause
    exit /b 1
)
echo   Database fixes applied

echo Database setup complete!
echo.

REM ==================================================
REM  Step 3: Backend Configuration Check
REM ==================================================

echo STEP 3: Backend Configuration...
echo.

REM Check PHP
echo Checking PHP installation...
"%PHP_BIN%\php.exe" --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: PHP not found or not working
    echo Please ensure PHP is properly installed in Laragon
    pause
    exit /b 1
)

echo PHP installation verified

REM Test database connection from PHP
echo Testing PHP database connection...
cd /d "%PROJECT_DIR%backend\php"
"%PHP_BIN%\php.exe" -r "require 'config/config.php'; try { $pdo = getDbConnection(); echo 'PHP database connection successful!'; } catch (Exception $e) { echo 'Connection failed: ' . $e->getMessage(); exit(1); }" 2>nul
if %errorlevel% neq 0 (
    echo ERROR: PHP cannot connect to database
    echo Please check your backend configuration
    pause
    exit /b 1
)

echo Backend database connection working
echo.

REM ==================================================
REM  Step 4: Frontend Dependencies
REM ==================================================

echo STEP 4: Installing Frontend Dependencies...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js not found
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js found

REM Install frontend dependencies
echo Installing React frontend dependencies...
cd /d "%PROJECT_DIR%frontend"
if not exist "node_modules" (
    call npm install
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install frontend dependencies
        pause
        exit /b 1
    )
    echo Frontend dependencies installed
) else (
    echo Frontend dependencies already installed
)

REM Install main project dependencies (Next.js admin panel)
echo Installing Next.js admin panel dependencies...
cd /d "%PROJECT_DIR%"
if not exist "node_modules" (
    call npm install
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install admin panel dependencies
        pause
        exit /b 1
    )
    echo Admin panel dependencies installed
) else (
    echo Admin panel dependencies already installed
)

echo.

REM ==================================================
REM  Step 5: Create Data Directory
REM ==================================================

echo STEP 5: Setting up data directory...
echo.

if not exist "%PROJECT_DIR%data" (
    mkdir "%PROJECT_DIR%data" 2>nul
    echo Data directory created
) else (
    echo Data directory already exists
)

echo.

REM ==================================================
REM  Step 6: Launch Applications
REM ==================================================

echo STEP 6: Launching Applications...
echo.

echo Starting backend server (Laragon Apache)...
echo Backend available at: http://localhost:8000

echo Starting frontend development server...
cd /d "%PROJECT_DIR%frontend"
start "Tunegie Frontend" cmd /k "npm start"

echo Waiting for frontend to initialize...
timeout /t 5 /nobreak >nul

echo Starting admin panel...
cd /d "%PROJECT_DIR%"
start "Tunegie Admin" cmd /k "npm run dev"

echo.

REM ==================================================
REM  Setup Complete
REM ==================================================

echo ====================================
echo    SETUP COMPLETED SUCCESSFULLY!
echo ====================================
echo.
echo Your Tunegie project is now running:
echo.
echo   Frontend:    http://localhost:3000
echo   Backend:     http://localhost:8000  
echo   Admin Panel: http://localhost:3001/admin
echo.
echo Admin Panel Login:
echo   Username: admin
echo   Password: password
echo.
echo Database: tunegie_db (accessible via HeidiSQL/phpMyAdmin)
echo.
echo Features Available:
echo   - User registration and authentication
echo   - Music guessing game mechanics  
echo   - Achievement system (19 achievements)
echo   - Daily streak tracking
echo   - Leaderboards and statistics
echo   - Admin content management
echo   - Profile management
echo.
echo For detailed documentation, see: SETUP_GUIDE.md
echo.
echo Happy gaming with Tunegie!
echo.

REM Keep the window open
pause

REM ==================================================
REM  Error Handler
REM ==================================================

:error
echo.
echo Setup encountered an error!
echo Please check the error messages above and:
echo 1. Ensure Laragon is properly installed
echo 2. Ensure Node.js is installed
echo 3. Check that all required services are running
echo 4. Refer to SETUP_GUIDE.md for manual setup
echo.
pause
exit /b 1