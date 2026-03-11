# stop-dev.ps1 - ONE COMMAND TO STOP EVERYTHING
Write-Host "╔════════════════════════════════════════════╗" -ForegroundColor Red
Write-Host "║   Stopping Health Monitoring Environment   ║" -ForegroundColor Red
Write-Host "╚════════════════════════════════════════════╝" -ForegroundColor Red

# Step 1: Stop Docker services
Write-Host "`n1. 🐳 Stopping Docker services..." -ForegroundColor Yellow
cd E:\smartplus_v1
docker compose down
Write-Host "   ✅ Docker services stopped" -ForegroundColor Green

# Step 2: Stop Node.js processes (Metro bundler)
Write-Host "`n2. 📱 Stopping React Native Metro..." -ForegroundColor Yellow
$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    $nodeProcesses | Stop-Process -Force
    Write-Host "   ✅ Node.js processes stopped" -ForegroundColor Green
} else {
    Write-Host "   ⚠️ No Node.js processes found" -ForegroundColor Yellow
}

# Step 3: Clear ADB reverse
Write-Host "`n3. 📱 Clearing ADB reverse..." -ForegroundColor Yellow
adb reverse --remove-all
Write-Host "   ✅ ADB reverse cleared" -ForegroundColor Green

Write-Host "`n╔════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║   ✅ ALL SERVICES STOPPED!                 ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════╝" -ForegroundColor Green