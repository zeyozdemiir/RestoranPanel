Write-Host "HandsOff local kontrol basliyor..." -ForegroundColor Cyan

Write-Host "`n1) Backend kontrol:" -ForegroundColor Cyan

try {
  $health = Invoke-RestMethod -Uri "http://localhost:4000/api/health" -TimeoutSec 5
  Write-Host "Backend calisiyor." -ForegroundColor Green
  $health | ConvertTo-Json -Depth 5
} catch {
  Write-Host "Backend calismiyor veya cevap vermiyor." -ForegroundColor Red
  Write-Host $_.Exception.Message
}

Write-Host "`n2) API config:" -ForegroundColor Cyan
Get-Content .\src\apiConfig.js

Write-Host "`n3) Frontend adresi:" -ForegroundColor Cyan
Write-Host "http://localhost:5173"

Write-Host "`n4) Kontrol edilecek ekranlar:" -ForegroundColor Cyan
Write-Host "- Login"
Write-Host "- Sol menu"
Write-Host "- Kullanici Rolleri"
Write-Host "- Gunluk Kontrol Listesi"
Write-Host "- Aksiyon Takip"
Write-Host "- Yonetim Ozeti"
