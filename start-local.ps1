Write-Host "HandsOff local sistem baslatiliyor..." -ForegroundColor Cyan

taskkill /F /IM node.exe 2>$null

Start-Sleep -Seconds 2

Write-Host "Backend aciliyor..." -ForegroundColor Cyan

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\Users\Lenovo\Desktop\RestoranPanel\backend'; & 'C:\Program Files\nodejs\npm.cmd' run dev"

Write-Host "Backend hazir mi kontrol ediliyor..." -ForegroundColor Cyan

$backendReady = $false

for ($i = 1; $i -le 20; $i++) {
  try {
    Invoke-RestMethod -Uri "http://localhost:4000/api/health" -TimeoutSec 2 | Out-Null
    $backendReady = $true
    break
  } catch {
    Start-Sleep -Seconds 1
  }
}

if ($backendReady) {
  Write-Host "Backend hazir: http://localhost:4000" -ForegroundColor Green
} else {
  Write-Host "Backend hazir olmadi. Backend terminalindeki kirmizi hataya bak." -ForegroundColor Red
}

Write-Host "Frontend aciliyor..." -ForegroundColor Cyan

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\Users\Lenovo\Desktop\RestoranPanel'; `$env:VITE_API_BASE_URL='http://localhost:4000'; & 'C:\Program Files\nodejs\npm.cmd' run dev -- --host 0.0.0.0 --port 5173 --strictPort --force"

Write-Host "Frontend hazir mi kontrol ediliyor..." -ForegroundColor Cyan

$frontendReady = $false

for ($i = 1; $i -le 30; $i++) {
  try {
    Invoke-WebRequest -Uri "http://localhost:5173" -TimeoutSec 2 | Out-Null
    $frontendReady = $true
    break
  } catch {
    Start-Sleep -Seconds 1
  }
}

if ($frontendReady) {
  Write-Host "Frontend hazir: http://localhost:5173" -ForegroundColor Green
  Start-Process "http://localhost:5173"
} else {
  Write-Host "Frontend hazir olmadi. Frontend terminalindeki kirmizi hataya bak." -ForegroundColor Red
}

Write-Host ""
Write-Host "Backend terminali ve frontend terminali acik kalmali." -ForegroundColor Yellow
Write-Host "Uygulama adresi: http://localhost:5173" -ForegroundColor Green
