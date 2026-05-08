Write-Host "Setting up LibraryOS..."

# Create backend venv
Write-Host "Creating Python virtual environment..."
cd backend
python -m venv venv

# Keep inline execution using dot sourcing
. .\venv\Scripts\Activate.ps1

Write-Host "Installing backend dependencies..."
pip install -r requirements.txt
cd ..

# Frontend
Write-Host "Installing frontend dependencies..."
cd frontend
npm install

If (!(Test-Path ".env")) {
    Write-Host "Creating frontend .env from placeholder..."
    Set-Content -Path ".env" -Value "VITE_API_BASE_URL=http://127.0.0.1:8000"
}
cd ..

Write-Host "Setup complete!"
