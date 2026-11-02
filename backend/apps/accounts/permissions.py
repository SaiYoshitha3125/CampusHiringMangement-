from rest_framework import permissions


class IsStudent(permissions.BasePermission):
    """Allows access only to authenticated users with STUDENT role."""
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.role == 'STUDENT'
        )


class IsRecruiter(permissions.BasePermission):
    """Allows access only to authenticated users with RECRUITER role."""
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.role == 'RECRUITER'
        )


class IsPlacementAdmin(permissions.BasePermission):
    """Allows access only to placement administrators."""
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            (request.user.role == 'ADMIN' or request.user.is_staff or request.user.is_superuser)
        )


class IsRecruiterOrAdmin(permissions.BasePermission):
    """Allows access to recruiters or placement admins."""
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            (request.user.role in ['RECRUITER', 'ADMIN'] or request.user.is_staff)
        )


class IsOwnerOrAdmin(permissions.BasePermission):
    """Object-level permission to only allow owners of an object or admins to edit/view it."""
    def has_object_permission(self, request, view, obj):
        if request.user.role == 'ADMIN' or request.user.is_superuser:
            return True

        # Check common ownership fields
        if hasattr(obj, 'user'):
            return obj.user == request.user
        if hasattr(obj, 'student'):
            return hasattr(obj.student, 'user') and obj.student.user == request.user
        if hasattr(obj, 'recruiter'):
            return obj.recruiter == request.user

        return False
