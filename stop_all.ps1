# Stop all services
Write-Host "Stopping services..." -ForegroundColor Yellow

# 1. Stop PowerShell Jobs
$jobs = Get-Job -Name "admin", "backend", "customer" -ErrorAction SilentlyContinue
if ($jobs) {
    $jobs | Stop-Job
    $jobs | Remove-Job
    Write-Host "Stopped and removed PowerShell jobs." -ForegroundColor Green
} else {
    Write-Host "No active PowerShell jobs found for services." -ForegroundColor Gray
}

# 2. Kill processes on specific ports (to be sure)
$ports = @(5173, 5174, 5000)
foreach ($port in $ports) {
    $process = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
    if ($process) {
        Write-Host "Killing process on port $port (PID: $process)..." -ForegroundColor Cyan
        Stop-Process -Id $process -Force -ErrorAction SilentlyContinue
    }
}

Write-Host "All services stopped." -ForegroundColor Green
