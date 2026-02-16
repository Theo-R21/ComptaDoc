from rest_framework import serializers
from user.models import User
from .validators import (
    validate_not_blank,
    validate_email_format,
    validate_unique_email,
    validate_phone,
)


class BaseUserSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = [
            "first_name",
            "last_name",
            "email",
            "phone",
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
