# Tunegie Development Startup Script

Write-Host "🎵 Starting Tunegie Development Environment..." -ForegroundColor Green

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install Node.js first." -ForegroundColor Red
    exit 1
}

# Navigate to frontend directory
Write-Host "📁 Navigating to frontend directory..." -ForegroundColor Yellow
Set-Location "$PSScriptRoot\frontend"

# Install dependencies if node_modules doesn't exist
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing frontend dependencies..." -ForegroundColor Yellow
    & "C:\Program Files\nodejs\npm.cmd" install --no-workspaces
}

# Start the React development server
Write-Host "🚀 Starting React development server..." -ForegroundColor Green
Write-Host "The app will open at http://localhost:3000 (or another port if 3000 is busy)" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop the development server" -ForegroundColor Cyan

& "C:\Program Files\nodejs\npm.cmd" start