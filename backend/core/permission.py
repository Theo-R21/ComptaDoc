from rest_framework.permissions import BasePermission


class HasRole(BasePermission):
    allowed_roles = set()

    def has_permission(self, request, view):
        user = request.user

        if not user or not user.is_authenticated:
            return False

        if user.is_superuser:
            return True

        user_roles = set(user.roles.values_list("name", flat=True))
        return bool(user_roles & self.allowed_roles)


class IsComptable(HasRole):
    allowed_roles = {"comptable"}


class IsClient(HasRole):
    allowed_roles = {"client"}


class IsComptableOrClient(HasRole):
    allowed_roles = {"comptable", "client"}