#!/usr/bin/env pwsh
# HealthConnect - Video Call Quick Start Script
# Automatically starts all required servers for video calling

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "   🎥 HealthConnect Video Call Setup" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Check if we're in the correct directory
if (-not (Test-Path "client") -or -not (Test-Path "server")) {
    Write-Host "❌ Error: Please run this script from the HealthConnect root directory" -ForegroundColor Red
    exit 1
}

Write-Host "📦 Installing Dependencies...`n" -ForegroundColor Yellow

# Install Signaling Server dependencies
Write-Host "1️⃣  Installing Signaling Server dependencies..." -ForegroundColor Cyan
if (Test-Path "signaling-server\package.json") {
    cd signaling-server
    if (-not (Test-Path "node_modules")) {
        npm install
        if ($LASTEXITCODE -eq 0) {
            Write-Host "   ✅ Signaling server dependencies installed`n" -ForegroundColor Green
        } else {
            Write-Host "   ❌ Failed to install signaling server dependencies`n" -ForegroundColor Red
        }
    } else {
        Write-Host "   ✅ Signaling server dependencies already installed`n" -ForegroundColor Green
    }
    cd ..
} else {
    Write-Host "   ⚠️  Signaling server directory not found`n" -ForegroundColor Yellow
}

# Install Client dependencies
Write-Host "2️⃣  Checking Client dependencies..." -ForegroundColor Cyan
cd client
if (-not (Test-Path "node_modules\socket.io-client")) {
    Write-Host "   Installing socket.io-client..." -ForegroundColor Yellow
    npm install socket.io-client
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Client dependencies installed`n" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Failed to install client dependencies`n" -ForegroundColor Red
    }
} else {
    Write-Host "   ✅ Client dependencies already installed`n" -ForegroundColor Green
}
cd ..

Write-Host "========================================`n" -ForegroundColor Cyan
Write-Host "🚀 Starting Servers...`n" -ForegroundColor Yellow
Write-Host "   This will open 3 terminal windows:" -ForegroundColor White
Write-Host "   1. Signaling Server (Port 4000)" -ForegroundColor White
Write-Host "   2. Spring Boot Backend (Port 8080)" -ForegroundColor White
Write-Host "   3. React Frontend (Port 3000)`n" -ForegroundColor White

Start-Sleep -Seconds 2

# Start Signaling Server
Write-Host "1️⃣  Starting Signaling Server..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\signaling-server'; npm start" -WindowStyle Normal
Write-Host "   ✅ Signaling server starting on http://localhost:4000`n" -ForegroundColor Green
Start-Sleep -Seconds 3

# Start Spring Boot Backend
Write-Host "2️⃣  Starting Spring Boot Backend..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\server'; mvn spring-boot:run" -WindowStyle Normal
Write-Host "   ✅ Backend starting on http://localhost:8080`n" -ForegroundColor Green
Start-Sleep -Seconds 3

# Start React Frontend
Write-Host "3️⃣  Starting React Frontend..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\client'; npm start" -WindowStyle Normal
Write-Host "   ✅ Frontend starting on http://localhost:3000`n" -ForegroundColor Green

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   ✨ Setup Complete!" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "⏳ Please wait 30-60 seconds for all servers to fully start...`n" -ForegroundColor Yellow

Write-Host "📋 Testing the Video Call Feature:`n" -ForegroundColor Cyan
Write-Host "   Method 1: Two Browser Windows" -ForegroundColor White
Write-Host "   ─────────────────────────────" -ForegroundColor White
Write-Host "   1. Open Browser Window 1: http://localhost:3000/video-call" -ForegroundColor White
Write-Host "   2. Grant camera/microphone permissions" -ForegroundColor White
Write-Host "   3. Copy the Room ID displayed" -ForegroundColor White
Write-Host "   4. Open Browser Window 2 (incognito): Same URL" -ForegroundColor White
Write-Host "   5. Grant permissions" -ForegroundColor White
Write-Host "   6. Both users should auto-connect!`n" -ForegroundColor White

Write-Host "   Method 2: Integration Test" -ForegroundColor White
Write-Host "   ─────────────────────────────" -ForegroundColor White
Write-Host "   Run: .\test-video-call.ps1`n" -ForegroundColor White

Write-Host "📚 Documentation:" -ForegroundColor Cyan
Write-Host "   Complete Guide: VIDEO_CALL_DOCUMENTATION.md`n" -ForegroundColor White

Write-Host "🔧 Useful Commands:" -ForegroundColor Cyan
Write-Host "   Check Signaling Server: curl http://localhost:4000/health" -ForegroundColor White
Write-Host "   Check Backend:          curl http://localhost:8080/api/video-calls/health" -ForegroundColor White
Write-Host "   Check Frontend:         curl http://localhost:3000`n" -ForegroundColor White

Write-Host "⚠️  To stop servers: Close the 3 terminal windows that opened`n" -ForegroundColor Yellow

Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "Press any key to exit this window..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
