Write-Host "Starting Node.js/Express MERN server..." -ForegroundColor Cyan

# Ensure we are in the correct directory
$rootDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $rootDir\backend

Write-Host "Server running at http://localhost:8000" -ForegroundColor Green
npm run start
