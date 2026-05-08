import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'lms_core.settings')
django.setup()

from accounts.models import CustomUser

email = 'vishnureddycom4@gmail.com'
password = '7095410421'

user, created = CustomUser.objects.get_or_create(email=email)
user.set_password(password)
user.role = 'admin'
user.status = 'active'
user.is_staff = True
user.is_superuser = True
user.save()

if created:
    print(f"Created admin user: {email}")
else:
    print(f"Updated admin user: {email}")
