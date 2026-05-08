from rest_framework.permissions import IsAuthenticated

class IsAdmin(IsAuthenticated):
    def has_permission(self, request, view):
        is_auth = super().has_permission(request, view)
        return bool(is_auth and getattr(request.user, 'role', None) == 'admin')

class IsLibrarian(IsAuthenticated):
    def has_permission(self, request, view):
        is_auth = super().has_permission(request, view)
        return bool(is_auth and getattr(request.user, 'role', None) in ['admin', 'librarian', 'faculty'])

class IsStudent(IsAuthenticated):
    def has_permission(self, request, view):
        is_auth = super().has_permission(request, view)
        return bool(is_auth and getattr(request.user, 'role', None) in ['admin', 'librarian', 'faculty', 'student'])
