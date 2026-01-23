$root = Get-Location

Write-Host "Starting services in background..." -ForegroundColor Cyan

Start-Job -Name "admin" -ScriptBlock { cd "$using:root\admin"; npm run dev }
Start-Job -Name "backend" -ScriptBlock { cd "$using:root\backend"; npm run dev }
Start-Job -Name "customer" -ScriptBlock { cd "$using:root\customer"; npm run dev }

Write-Host "`nAll services started in background." -ForegroundColor Green
Write-Host "----------------------------------"
Write-Host "Expected Ports:"
Write-Host "  Admin:    http://localhost:5174"
Write-Host "  Backend:  http://localhost:5000"
Write-Host "  Customer: http://localhost:5173"
Write-Host "----------------------------------"
Write-Host "Commands to manage services:"
Write-Host "1. Check status:   Get-Job"
Write-Host "2. View logs:      Receive-Job -Name backend -Keep"
Write-Host "3. Stop a service: Stop-Job -Name backend"
Write-Host "4. Stop all:       Get-Job | Stop-Job"
Write-Host "----------------------------------"

