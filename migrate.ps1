Write-Host "Running migrations..."
cd backend
. .\venv\Scripts\Activate.ps1

Write-Host "Making migrations for accounts..."
python manage.py makemigrations accounts
Write-Host "Making migrations for library..."
python manage.py makemigrations library
Write-Host "Migrating..."
python manage.py migrate

Write-Host "Creating superuser if it doesn't exist..."
python -c "import os, django; os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'lms_core.settings'); django.setup(); from accounts.models import CustomUser; email='vishnureddycom4@gmail.com'; CustomUser.objects.create_superuser(email, '7095410421') if not CustomUser.objects.filter(email=email).exists() else print('Superuser exists.')"

cd ..
Write-Host "Migrations complete!"
