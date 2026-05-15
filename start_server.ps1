Write-Host "Starting Flask server..." -ForegroundColor Cyan

# Ensure we are in the correct directory
$rootDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $rootDir\backend

# Attempt to activate virtual environment
$venvActivate = "..\.venv\Scripts\Activate.ps1"
if (Test-Path $venvActivate) {
    & $venvActivate
}

Write-Host "Server running at http://localhost:8000" -ForegroundColor Green
python -m flask run --port=8000
