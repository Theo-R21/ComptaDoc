from rest_framework import serializers
from user.models import User, Role
from user.serializers.role import RoleSerializer
from .validators import (
    validate_not_blank,
    validate_email_format,
    validate_unique_email,
    validate_phone,
)


class BaseUserSerializer(serializers.ModelSerializer):
    roles = RoleSerializer(many=True, read_only=True)
    roles_ids = serializers.ListField(
        child=serializers.UUIDField(),
        write_only=True,
        required=False,
    )

    class Meta:
        model = User
        fields = [
            "first_name",
            "last_name",
            "email",
            "phone",
            "roles",
            "roles_ids",
        ]

    def validate_first_name(self, value):
        return validate_not_blank(value, "Le prénom")

    def validate_last_name(self, value):
        return validate_not_blank(value, "Le nom")

    def validate_email(self, value):
        value = validate_not_blank(value, "L'email")
        value = validate_email_format(value)
        return validate_unique_email(value, self.instance)

    def validate_phone(self, value):
        return validate_phone(value)

    def _set_roles(self, user, roles_ids):
        if roles_ids is not None:
            roles = Role.objects.filter(id__in=roles_ids)
            user.roles.set(roles)
        elif not user.roles.exists():
            default_role = Role.objects.filter(name="client").first()
            if default_role:
                user.roles.set([default_role])

    def create(self, validated_data):
        roles_ids = validated_data.pop("roles_ids", None)
        user = super().create(validated_data)
        self._set_roles(user, roles_ids)
        return user

    def update(self, instance, validated_data):
        roles_ids = validated_data.pop("roles_ids", None)
        user = super().update(instance, validated_data)
        self._set_roles(user, roles_ids)
        return user