@echo off
echo 🎵 Starting Tunegie Development Environment...
echo.

:: Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js not found. Please install Node.js first.
    pause
    exit /b 1
)

echo ✅ Node.js is available
echo 📁 Navigating to frontend directory...
cd /d "%~dp0frontend"

:: Check if node_modules exists
if not exist "node_modules" (
    echo 📦 Installing frontend dependencies...
    npm.cmd install --no-workspaces
)

echo 🚀 Starting React development server...
echo The app will open at http://localhost:3000 (or another port if 3000 is busy)
echo Press Ctrl+C to stop the development server
echo.

npm.cmd start