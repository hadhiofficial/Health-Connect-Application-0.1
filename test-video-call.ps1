#!/usr/bin/env pwsh
# HealthConnect - Video Call Feature Test Suite
# Tests WebRTC video calling implementation

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "   🎥 Video Call Test Suite" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$testsPassed = 0
$testsFailed = 0

# Test 1: Check Signaling Server Files
Write-Host "Test 1: Checking Signaling Server Files..." -ForegroundColor Yellow
$signalingFiles = @(
    "signaling-server\package.json",
    "signaling-server\server.js"
)

$filesOk = $true
foreach ($file in $signalingFiles) {
    if (Test-Path $file) {
        Write-Host "✅ $file exists" -ForegroundColor Green
    } else {
        Write-Host "❌ $file is missing!" -ForegroundColor Red
        $filesOk = $false
    }
}

if ($filesOk) {
    $testsPassed++
} else {
    $testsFailed++
}

# Test 2: Check Frontend Files
Write-Host "`nTest 2: Checking Frontend Files..." -ForegroundColor Yellow
$frontendFiles = @(
    "client\src\pages\VideoCall.jsx",
    "client\src\pages\VideoCall.css",
    "client\src\services\webrtc.service.js"
)

$filesOk = $true
foreach ($file in $frontendFiles) {
    if (Test-Path $file) {
        Write-Host "✅ $file exists" -ForegroundColor Green
    } else {
        Write-Host "❌ $file is missing!" -ForegroundColor Red
        $filesOk = $false
    }
}

if ($filesOk) {
    $testsPassed++
} else {
    $testsFailed++
}

# Test 3: Check Backend Files
Write-Host "`nTest 3: Checking Backend Files..." -ForegroundColor Yellow
$backendFile = "server\src\main\java\com\healthconnect\controller\VideoCallController.java"
if (Test-Path $backendFile) {
    Write-Host "✅ $backendFile exists" -ForegroundColor Green
    $testsPassed++
} else {
    Write-Host "❌ $backendFile is missing!" -ForegroundColor Red
    $testsFailed++
}

# Test 4: Check if socket.io-client is in package.json
Write-Host "`nTest 4: Checking Dependencies..." -ForegroundColor Yellow
if (Test-Path "client\package.json") {
    $packageJson = Get-Content "client\package.json" -Raw | ConvertFrom-Json
    if ($packageJson.dependencies.'socket.io-client') {
        Write-Host "✅ socket.io-client dependency found" -ForegroundColor Green
        $testsPassed++
    } else {
        Write-Host "❌ socket.io-client dependency missing!" -ForegroundColor Red
        Write-Host "   Run: cd client; npm install socket.io-client" -ForegroundColor Yellow
        $testsFailed++
    }
} else {
    Write-Host "❌ client/package.json not found!" -ForegroundColor Red
    $testsFailed++
}

# Test 5: Check Signaling Server
Write-Host "`nTest 5: Testing Signaling Server..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:4000/health" -TimeoutSec 5 -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Signaling server is running on port 4000" -ForegroundColor Green
        $result = $response.Content | ConvertFrom-Json
        Write-Host "   Status: $($result.status)" -ForegroundColor Gray
        Write-Host "   Active Rooms: $($result.activeRooms)" -ForegroundColor Gray
        Write-Host "   Active Users: $($result.activeUsers)" -ForegroundColor Gray
        $testsPassed++
    }
} catch {
    Write-Host "❌ Signaling server is NOT running!" -ForegroundColor Red
    Write-Host "   Start with: cd signaling-server; npm install; npm start" -ForegroundColor Yellow
    $testsFailed++
}

# Test 6: Check Spring Boot Backend
Write-Host "`nTest 6: Testing Spring Boot Backend..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080/api/video-calls/health" -TimeoutSec 5 -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Spring Boot backend is running" -ForegroundColor Green
        $result = $response.Content | ConvertFrom-Json
        Write-Host "   Status: $($result.status)" -ForegroundColor Gray
        Write-Host "   Service: $($result.service)" -ForegroundColor Gray
        $testsPassed++
    }
} catch {
    Write-Host "❌ Spring Boot backend is NOT running!" -ForegroundColor Red
    Write-Host "   Start with: cd server; mvn spring-boot:run" -ForegroundColor Yellow
    $testsFailed++
}

# Test 7: Check React Frontend
Write-Host "`nTest 7: Testing React Frontend..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 5 -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ React frontend is running on port 3000" -ForegroundColor Green
        $testsPassed++
    }
} catch {
    Write-Host "⚠️  React frontend is NOT running" -ForegroundColor Yellow
    Write-Host "   Start with: cd client; npm start" -ForegroundColor Yellow
}

# Test 8: Test Room Creation API
Write-Host "`nTest 8: Testing Room Creation API..." -ForegroundColor Yellow
try {
    $testData = @{
        doctorId = "test-doctor-123"
        patientId = "test-patient-456"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/video-calls/generate-room" `
        -Method Post `
        -Body $testData `
        -ContentType "application/json" `
        -TimeoutSec 10

    if ($response.success -eq $true) {
        Write-Host "✅ Room creation API works!" -ForegroundColor Green
        Write-Host "   Room ID: $($response.roomId)" -ForegroundColor Gray
        Write-Host "   Signaling Server: $($response.signalingServer)" -ForegroundColor Gray
        $testsPassed++
    } else {
        Write-Host "❌ Room creation API returned error" -ForegroundColor Red
        $testsFailed++
    }
} catch {
    Write-Host "❌ Room creation API test failed!" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    $testsFailed++
}

# Test 9: Test Instant Call API
Write-Host "`nTest 9: Testing Instant Call API..." -ForegroundColor Yellow
try {
    $callData = @{
        initiatorId = "doc123"
        initiatorType = "doctor"
        initiatorName = "Dr. Test"
        recipientId = "pat456"
        recipientName = "Patient Test"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/video-calls/start-instant-call" `
        -Method Post `
        -Body $callData `
        -ContentType "application/json" `
        -TimeoutSec 10

    if ($response.success -eq $true) {
        Write-Host "✅ Instant call API works!" -ForegroundColor Green
        Write-Host "   Room ID: $($response.roomId)" -ForegroundColor Gray
        Write-Host "   Call Type: $($response.callType)" -ForegroundColor Gray
        $testsPassed++
    } else {
        Write-Host "❌ Instant call API returned error" -ForegroundColor Red
        $testsFailed++
    }
} catch {
    Write-Host "❌ Instant call API test failed!" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    $testsFailed++
}

# Summary
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "   📊 Test Summary" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$totalTests = $testsPassed + $testsFailed
$passRate = if ($totalTests -gt 0) { [math]::Round(($testsPassed / $totalTests) * 100, 2) } else { 0 }

Write-Host "Total Tests: $totalTests" -ForegroundColor White
Write-Host "Passed: $testsPassed" -ForegroundColor Green
Write-Host "Failed: $testsFailed" -ForegroundColor Red
Write-Host "Success Rate: $passRate%`n" -ForegroundColor Cyan

if ($testsFailed -eq 0) {
    Write-Host "🎉 All tests passed! Video call feature is ready!" -ForegroundColor Green
    Write-Host "`n📋 Manual Testing Steps:" -ForegroundColor Cyan
    Write-Host "   1. Open TWO browser windows" -ForegroundColor White
    Write-Host "   2. Window 1: Navigate to http://localhost:3000/video-call" -ForegroundColor White
    Write-Host "   3. Grant camera/microphone permissions" -ForegroundColor White
    Write-Host "   4. Copy the Room ID displayed" -ForegroundColor White
    Write-Host "   5. Window 2: Navigate to the same URL" -ForegroundColor White
    Write-Host "   6. Grant permissions" -ForegroundColor White
    Write-Host "   7. Both users should connect automatically!" -ForegroundColor White
    Write-Host "   8. Test camera on/off button" -ForegroundColor White
    Write-Host "   9. Test microphone on/off button" -ForegroundColor White
    Write-Host "   10. Test end call button`n" -ForegroundColor White
} else {
    Write-Host "⚠️  Some tests failed. Please fix the issues above.`n" -ForegroundColor Yellow
}

Write-Host "========================================`n" -ForegroundColor Cyan

# Start Guide
Write-Host "🚀 Quick Start Commands:" -ForegroundColor Cyan
Write-Host "   Signaling Server: cd signaling-server; npm install; npm start" -ForegroundColor White
Write-Host "   Spring Boot:      cd server; mvn spring-boot:run" -ForegroundColor White
Write-Host "   React Frontend:   cd client; npm install; npm start`n" -ForegroundColor White

Write-Host "📚 Documentation:" -ForegroundColor Cyan
Write-Host "   See VIDEO_CALL_DOCUMENTATION.md for complete guide`n" -ForegroundColor White

Write-Host "📞 Test URLs:" -ForegroundColor Cyan
Write-Host "   Signaling Server: http://localhost:4000/health" -ForegroundColor White
Write-Host "   Backend Health:   http://localhost:8080/api/video-calls/health" -ForegroundColor White
Write-Host "   Video Call Page:  http://localhost:3000/video-call`n" -ForegroundColor White

# Pause at end
Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
