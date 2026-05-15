Write-Host "Setting up Flask backend..." -ForegroundColor Cyan

# Ensure we are in the correct directory
$rootDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $rootDir\backend

Write-Host "Currently in: $(Get-Location)" -ForegroundColor Yellow

# Attempt to activate virtual environment
$venvActivate = "..\.venv\Scripts\Activate.ps1"
if (Test-Path $venvActivate) {
    Write-Host "Activating virtual environment..." -ForegroundColor Green
    & $venvActivate
} else {
    Write-Host "Warning: Virtual environment not found at $venvActivate" -ForegroundColor Red
}

Write-Host "Installing correct backend requirements..." -ForegroundColor Green
python -m pip install -r requirements.txt

Write-Host "Initializing Flask database..." -ForegroundColor Green
python -m flask db init

Write-Host "Creating migrations..." -ForegroundColor Green
python -m flask db migrate -m "Initial Flask migration"

Write-Host "Applying migrations..." -ForegroundColor Green
python -m flask db upgrade

Write-Host "Setup complete! You can now start your server with: cd backend; python -m flask run --port=8000" -ForegroundColor Cyan
