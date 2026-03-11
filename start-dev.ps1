# start-dev.ps1 - ONE COMMAND TO START EVERYTHING IN DOCKER
Write-Host "╔════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   Starting Health Monitoring in DOCKER    ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════╝" -ForegroundColor Cyan

# Step 1: Start ALL Docker services (database + backend)
Write-Host "`n1. 🐳 Starting all Docker services..." -ForegroundColor Yellow
cd E:\smartplus_v1
docker compose up -d

# Step 2: Wait for services to be healthy
Write-Host "`n2. ⏳ Waiting for services to be ready..." -ForegroundColor Yellow
Write-Host "   This may take 15-20 seconds..." -ForegroundColor Gray

$maxRetries = 30
$retryCount = 0
$backendReady = $false

while ($retryCount -lt $maxRetries -and -not $backendReady) {
    $retryCount++
    Write-Host "." -NoNewline
    
    # Check if backend is responding
    try {
        $response = curl -UseBasicParsing -TimeoutSec 1 "http://localhost:4100/health" 2>$null
        if ($response -and $response.StatusCode -eq 200) {
            $backendReady = $true
            Write-Host "`n   ✅ Backend is ready!" -ForegroundColor Green
        }
    } catch {
        # Not ready yet
    }
    
    if (-not $backendReady) {
        Start-Sleep -Seconds 1
    }
}

if (-not $backendReady) {
    Write-Host "`n   ⚠️ Backend not responding yet, but continuing..." -ForegroundColor Yellow
}

# Step 3: Check container status
Write-Host "`n3. 📊 Container Status:" -ForegroundColor Yellow
docker compose ps

# Step 4: Show database info
Write-Host "`n4. 🗄️  Database Info:" -ForegroundColor Yellow
try {
    $users = docker exec health_postgres psql -U healthuser -d healthdb -t -c "SELECT COUNT(*) FROM users;" 2>$null
    if ($users) {
        Write-Host "   ✅ PostgreSQL running with $($users.Trim()) users" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️ PostgreSQL running but no users found" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ❌ Cannot connect to PostgreSQL" -ForegroundColor Red
}

# Step 5: Setup adb reverse for physical device
Write-Host "`n5. 📱 Setting up ADB reverse for physical device..." -ForegroundColor Yellow
adb kill-server 2>$null
adb start-server 2>$null
adb reverse --remove-all
$reverse4100 = adb reverse tcp:4100 tcp:4100
$reverse8081 = adb reverse tcp:8081 tcp:8081

if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ ADB reverse configured (ports 4100, 8081)" -ForegroundColor Green
} else {
    Write-Host "   ⚠️ ADB reverse failed - is your device connected?" -ForegroundColor Yellow
    Write-Host "   Connect device via USB and enable USB debugging" -ForegroundColor Gray
}

# Step 6: Start React Native Metro bundler
Write-Host "`n6. 📱 Starting React Native Metro bundler..." -ForegroundColor Yellow
$metroProcess = Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like "*metro*" }
if ($metroProcess) {
    Write-Host "   ⚠️ Metro already running. Skipping..." -ForegroundColor Yellow
} else {
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd E:\smartplus_v1\mobile; Write-Host '📱 Metro Bundler' -ForegroundColor Green; npx react-native start"
    Write-Host "   ✅ Metro started in new window" -ForegroundColor Green
}

# Step 7: Show access URLs
Write-Host "`n╔════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║   ✅ ALL SERVICES STARTED!                ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "📊 PostgreSQL:" -ForegroundColor Cyan
Write-Host "   Host: localhost:5432" -ForegroundColor White
Write-Host "   Database: healthdb" -ForegroundColor White
Write-Host "   Username: healthuser" -ForegroundColor White
Write-Host "   Password: healthpass123" -ForegroundColor White
Write-Host ""
Write-Host "🗄️  pgAdmin:" -ForegroundColor Cyan
Write-Host "   URL: http://localhost:5050" -ForegroundColor White
Write-Host "   Email: admin@health.com" -ForegroundColor White
Write-Host "   Password: admin123" -ForegroundColor White
Write-Host ""
Write-Host "🚀 Backend API:" -ForegroundColor Cyan
Write-Host "   URL: http://localhost:4100" -ForegroundColor White
Write-Host "   Health Check: http://localhost:4100/health" -ForegroundColor White
Write-Host "   Users API: http://localhost:4100/api/users" -ForegroundColor White
Write-Host ""
Write-Host "📱 React Native Commands:" -ForegroundColor Cyan
Write-Host "   Run on Android: cd mobile; npx react-native run-android" -ForegroundColor White
Write-Host "   For physical device: adb reverse tcp:4100 tcp:4100 (already done)" -ForegroundColor White
Write-Host ""
Write-Host "🛑 To stop everything: .\stop-dev.ps1" -ForegroundColor Yellow
Write-Host ""
Write-Host "📝 Test Users (all password: password123):" -ForegroundColor Magenta
Write-Host "   - john_doe (patient)" -ForegroundColor White
Write-Host "   - jane_smith (patient)" -ForegroundColor White
Write-Host "   - dr_silva (doctor)" -ForegroundColor White