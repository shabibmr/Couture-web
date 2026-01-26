# Restart with Clean Logs
$root = Get-Location

Write-Host "----------------------------------" -ForegroundColor Cyan
Write-Host "Restarting with Clean Logs" -ForegroundColor Cyan
Write-Host "----------------------------------" -ForegroundColor Cyan

# 1. Stop existing services
Write-Host "`n[1/3] Stopping services..." -ForegroundColor Yellow
if (Test-Path "$root\stop_all.ps1") {
    & "$root\stop_all.ps1"
} else {
    Write-Host "stop_all.ps1 not found. Skipping stop step." -ForegroundColor Red
}

# 2. Clear logs
Write-Host "`n[2/3] Clearing log files..." -ForegroundColor Yellow
$logFiles = @("admin.log", "backend.log", "customer.log")
foreach ($log in $logFiles) {
    if (Test-Path "$root\$log") {
        Clear-Content "$root\$log" -ErrorAction SilentlyContinue
    } else {
        New-Item -Path "$root\$log" -ItemType File -Force | Out-Null
    }
}
Write-Host "Logs cleared: admin.log, backend.log, customer.log" -ForegroundColor Green

# 3. Start services
Write-Host "`n[3/3] Starting services..." -ForegroundColor Yellow
if (Test-Path "$root\start_all.ps1") {
    & "$root\start_all.ps1"
} else {
    Write-Host "start_all.ps1 not found. Please start services manually." -ForegroundColor Red
}

Write-Host "`nRestart complete." -ForegroundColor Green
