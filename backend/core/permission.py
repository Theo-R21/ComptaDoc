from rest_framework.permissions import BasePermission


class HasRole(BasePermission):
    allowed_roles = set()   # plus performant que list

    def has_permission(self, request, view):
        user = request.user

        if not user or not user.is_authenticated:
            return False

        if user.is_superuser:
            return True

        return getattr(user, "role", None) in self.allowed_roles


class IsComptable(HasRole):
    allowed_roles = {"comptable"}


class IsClient(HasRole):
    allowed_roles = {"client"}


class IsComptableOrClient(HasRole):
    allowed_roles = {"comptable", "client"}
