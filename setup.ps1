Write-Host "Setting up LibraryOS (MERN Stack)..." -ForegroundColor Cyan

$rootDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# Backend
Write-Host "Installing backend dependencies..." -ForegroundColor Green
Set-Location $rootDir\backend
npm install

# Frontend
Write-Host "Installing frontend dependencies..." -ForegroundColor Green
Set-Location $rootDir\frontend
npm install

If (!(Test-Path ".env")) {
    Write-Host "Creating frontend .env..." -ForegroundColor Yellow
    Set-Content -Path ".env" -Value "VITE_API_BASE_URL=http://127.0.0.1:8000"
}

Write-Host "Setup complete!" -ForegroundColor Cyan
