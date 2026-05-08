from django.apps import AppConfig

class AccountsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'accounts'

    def ready(self):
        # We handle default admin creation in LoginView or manual migrate script
        # to avoid database access during app registry initialization.
        pass
