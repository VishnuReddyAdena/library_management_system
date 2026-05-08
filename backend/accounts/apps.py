from django.apps import AppConfig

class AccountsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'accounts'

    def ready(self):
        import os

        if os.environ.get('RENDER'):
            from django.contrib.auth import get_user_model
            from django.db.utils import OperationalError, ProgrammingError

            try:
                User = get_user_model()

                if not User.objects.filter(email='admin@gmail.com').exists():
                    User.objects.create_superuser(
                        email='admin@gmail.com',
                        password='admin123'
                    )
            except (OperationalError, ProgrammingError):
                # Tables might not exist yet during initial build/migrations
                pass