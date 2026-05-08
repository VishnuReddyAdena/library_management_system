import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'lms_core.settings')
django.setup()

from accounts.models import CustomUser

users = [
    {
        'email': 'admin@library.edu',
        'password': 'password123',
        'role': 'admin',
        'status': 'active'
    },
    {
        'email': 'librarian@library.edu',
        'password': 'password123',
        'role': 'librarian',
        'status': 'active'
    },
    {
        'email': 'faculty@library.edu',
        'password': 'password123',
        'role': 'faculty',
        'status': 'active'
    }
]

for user_data in users:
    user, created = CustomUser.objects.get_or_create(email=user_data['email'])
    user.set_password(user_data['password'])
    user.role = user_data['role']
    user.status = user_data['status']
    user.is_active = True
    if user_data['role'] == 'admin':
        user.is_staff = True
        user.is_superuser = True
    user.save()
    
    if created:
        print(f"Created {user_data['role']} user: {user_data['email']}")
    else:
        print(f"Updated {user_data['role']} user: {user_data['email']}")
