from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

from accounts.views import LoginView, LogoutView

def api_root(request):
    return JsonResponse({
        'message': 'LibraryOS Backend API is running ✅',
        'frontend': 'http://localhost:3005',
        'admin_panel': 'http://127.0.0.1:8000/admin/',
        'api': 'http://127.0.0.1:8000/api/',
    })

urlpatterns = [
    path('', api_root),
    path('admin/', admin.site.urls),
    path('api/', include('library.urls')),
    path('api/auth/login/', LoginView.as_view(), name='login'),
    path('api/auth/logout/', LogoutView.as_view(), name='logout'),
    path('api/auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
