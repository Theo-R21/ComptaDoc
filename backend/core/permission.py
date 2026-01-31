from rest_framework.permissions import BasePermission

class HasRole(BasePermission):
    allowed_roles = []

    def has_permission(self, request, view):
        user = request.user

        if not user or not user.is_authenticated:
            return False

        if user.is_superuser:
            return True

        return user.role in self.allowed_roles

class IsComptable(HasRole):
    allowed_roles = ["comptable"]

class IsUser(HasRole):
    allowed_roles = ["user"]
