import re

from django.core.validators import validate_email
from rest_framework import serializers
from user.models import User
from django.core.exceptions import ValidationError as DjangoValidationError


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'username', 'email', 'phone']

class UserListSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id','first_name', 'last_name','phone', 'last_login','date_joined','is_superuser','username', 'is_active', 'email', 'role']

class UserActionSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = "__all__"


class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "first_name",
            "last_name",
            "email",
            "company_name",
            "phone",
        ]

    def validate_first_name(self, value):
        if not value.strip():
            raise serializers.ValidationError("Le prénom est obligatoire.")
        return value

    def validate_last_name(self, value):
        if not value.strip():
            raise serializers.ValidationError("Le nom est obligatoire.")
        return value

    def validate_email(self, value):
        if not value.strip():
            raise serializers.ValidationError("L'email est obligatoire.")
        try:
            validate_email(value)
        except DjangoValidationError:
            raise serializers.ValidationError("Format d'email invalide.")

        user_id = self.instance.pk if self.instance else None
        if User.objects.filter(email=value).exclude(pk=user_id).exists():
            raise serializers.ValidationError("Cet email est déjà utilisé.")
        return value

    def validate_phone(self, value):
        if not value.strip():
            raise serializers.ValidationError(
                "Le numéro de téléphone est obligatoire."
            )

        phone = re.sub(r"[^\d+]", "", value)

        french_phone = re.compile(r"^(?:\+33|0033|0)[1-9]\d{8}$")
        lux_phone = re.compile(r"^(?:\+352|00352)?[2-9]\d{7,8}$")

        if not (french_phone.match(phone) or lux_phone.match(phone)):
            raise serializers.ValidationError(
                "Numéro français ou luxembourgeois invalide."
            )
        return value

    def validate(self, attrs):
        if not attrs.get("email") and not attrs.get("phone"):
            raise serializers.ValidationError(
                "L'email ou le téléphone doit être renseigné."
            )
        return attrs
