# restart-dev.ps1 - Quick restart
Write-Host "🔄 Restarting development environment..." -ForegroundColor Cyan
.\stop-dev.ps1
Start-Sleep -Seconds 3
.\start-dev.ps1