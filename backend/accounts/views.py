from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.core.cache import cache
from django.utils.timezone import now
from datetime import timedelta
from django.contrib.auth.hashers import check_password, make_password
from django.conf import settings
from django.db import OperationalError, ProgrammingError
from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import LoginSerializer
from .models import CustomUser, AuditLog

class LoginView(APIView):
    permission_classes = []
    authentication_classes = []

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({"success": False, "message": "Validation error", "code": "VALIDATION_FAILED", "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        email = serializer.validated_data['email']
        password = serializer.validated_data['password']
        role_requested = serializer.validated_data.get('role')

        print(f"[DEBUG] Login attempt for email: {email}, role_requested: {role_requested}")

        ip = self.get_client_ip(request)
        cache_key = f"login_attempts_{ip}_{email}"
        attempts = cache.get(cache_key, 0)

        if attempts >= 5:
            user = CustomUser.objects.filter(email=email).first()
            if user:
                user.locked_until = now() + timedelta(minutes=15)
                user.save()
                AuditLog.objects.create(user=user, email_attempted=email, role_attempted=role_requested, ip_address=ip, user_agent=request.META.get('HTTP_USER_AGENT', ''), event_type='account_locked')
            return Response({"success": False, "message": "Too many attempts. Try again later.", "code": "TOO_MANY_ATTEMPTS"}, status=status.HTTP_429_TOO_MANY_REQUESTS)

        # Auto-provision the default admin if missing
        try:
            if email == 'vishnureddycom4@gmail.com' and password == '7095410421':
                if not CustomUser.objects.filter(email=email).exists():
                    print(f"[DEBUG] Auto-provisioning default admin: {email}")
                    CustomUser.objects.create_superuser(email=email, password=password)
                else:
                    # Sync password if it changed or user exists but needs verification
                    admin_user = CustomUser.objects.get(email=email)
                    if not check_password(password, admin_user.password) or admin_user.role != 'admin':
                        print(f"[DEBUG] Syncing default admin credentials/role for: {email}")
                        admin_user.set_password(password)
                        admin_user.role = 'admin'
                        admin_user.status = 'active'
                        admin_user.is_staff = True
                        admin_user.is_superuser = True
                        admin_user.save()

            # Role-agnostic user lookup
            user = CustomUser.objects.filter(email=email).first()
        except (OperationalError, ProgrammingError) as e:
            if "no such table" in str(e).lower():
                return Response({
                    "success": False, 
                    "message": "Database not initialized. Please run: .\\migrate.ps1 in your terminal.",
                    "code": "DB_NOT_READY"
                }, status=status.HTTP_503_SERVICE_UNAVAILABLE)
            raise e

        if not user:
            print(f"[DEBUG] User not found: {email}")
            check_password('dummy', make_password('dummy'))
            return Response({"success": False, "message": "Invalid credentials.", "code": "INVALID_CREDENTIALS"}, status=status.HTTP_401_UNAUTHORIZED)

        # If role is requested, it MUST match the user's actual role
        if role_requested and user.role != role_requested:
            print(f"[DEBUG] Role mismatch for {email}. Requested: {role_requested}, Actual: {user.role}")
            return Response({"success": False, "message": "Invalid role for this account.", "code": "ROLE_MISMATCH"}, status=status.HTTP_403_FORBIDDEN)

        if user.locked_until and user.locked_until > now():
            print(f"[DEBUG] Account locked until {user.locked_until}")
            return Response({"success": False, "message": "Too many attempts. Try again later.", "code": "ACCOUNT_LOCKED"}, status=status.HTTP_429_TOO_MANY_REQUESTS)

        if not check_password(password, user.password):
            print(f"[DEBUG] Password mismatch for {email}")
            user.failed_attempts += 1
            user.save()
            cache.set(cache_key, attempts + 1, timeout=900)
            AuditLog.objects.create(user=user, email_attempted=email, role_attempted=user.role, ip_address=ip, user_agent=request.META.get('HTTP_USER_AGENT', ''), event_type='login_failure')
            return Response({"success": False, "message": "Invalid credentials.", "code": "INVALID_CREDENTIALS"}, status=status.HTTP_401_UNAUTHORIZED)

        if user.status == 'suspended':
            return Response({"success": False, "message": "Account suspended.", "code": "ACCOUNT_SUSPENDED"}, status=status.HTTP_403_FORBIDDEN)
        if user.status == 'pending':
            return Response({"success": False, "message": "Account pending approval.", "code": "ACCOUNT_PENDING"}, status=status.HTTP_403_FORBIDDEN)

        user.failed_attempts = 0
        user.locked_until = None
        user.last_login = now()
        user.save()
        cache.delete(cache_key)

        AuditLog.objects.create(user=user, email_attempted=email, role_attempted=user.role, ip_address=ip, user_agent=request.META.get('HTTP_USER_AGENT', ''), event_type='login_success')

        refresh = RefreshToken.for_user(user)
        refresh['role'] = user.role
        access = str(refresh.access_token)

        response = Response({
            "success": True,
            "access": access,
            "user": { "id": user.id, "email": user.email, "role": user.role }
        }, status=status.HTTP_200_OK)

        response.set_cookie(
            'refresh', str(refresh),
            httponly=True,
            secure=not settings.DEBUG,
            samesite='Strict'
        )
        return response

    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip

class LogoutView(APIView):
    permission_classes = []
    authentication_classes = []

    def post(self, request):
        refresh_token = request.COOKIES.get('refresh')
        if refresh_token:
            try:
                token = RefreshToken(refresh_token)
                token.blacklist()
            except Exception:
                pass
        
        user = getattr(request, 'user', None)
        if user and user.is_authenticated:
            AuditLog.objects.create(
                user=user, 
                email_attempted=user.email, 
                role_attempted=getattr(user, 'role', ''), 
                ip_address=request.META.get('REMOTE_ADDR'), 
                user_agent=request.META.get('HTTP_USER_AGENT', ''), 
                event_type='logout'
            )

        response = Response({"success": True, "message": "Successfully logged out."}, status=status.HTTP_200_OK)
        response.delete_cookie('refresh')
        return response
