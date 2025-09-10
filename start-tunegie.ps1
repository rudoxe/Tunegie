# Add Laragon Node.js to PATH and start Tunegie
Write-Host "🚀 Starting Tunegie..." -ForegroundColor Green
Write-Host "Adding Node.js to PATH..." -ForegroundColor Yellow

$env:PATH += ";C:\laragon\bin\nodejs\node-v18"

Write-Host "✅ Node.js added to PATH" -ForegroundColor Green
Write-Host "Starting both PHP API and React app..." -ForegroundColor Cyan
Write-Host ""

npm start
