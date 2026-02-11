import re

from django.core.exceptions import ValidationError as DjangoValidationError
from django.core.validators import validate_email
from rest_framework import serializers
from user.models import User


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


class UserCreateSerializer(serializers.ModelSerializer):
    password2 = serializers.CharField(write_only=True, required=True, label="Confirmation mot de passe")

    class Meta:
        model = User
        fields = [
            "first_name",
            "last_name",
            "email",
            "phone",
            "password",
            "password2",
        ]
        extra_kwargs = {
            "password": {"write_only": True, "required": True},
        }

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

        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Cet email est déjà utilisé.")
        return value

    def validate_phone(self, value):
        if not value:
            return value  # facultatif

        phone = re.sub(r"[^\d+]", "", value)
        french_phone = re.compile(r"^(?:\+33|0033|0)[1-9]\d{8}$")
        lux_phone = re.compile(r"^(?:\+352|00352)?[2-9]\d{7,8}$")

        if not (french_phone.match(phone) or lux_phone.match(phone)):
            raise serializers.ValidationError(
                "Numéro français ou luxembourgeois invalide."
            )
        return value

    def validate(self, attrs):
        if attrs.get("password") != attrs.get("password2"):
            raise serializers.ValidationError({"password2": "Les mots de passe ne correspondent pas."})
        return attrs


    def create(self, validated_data):
        validated_data.pop("password2")
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.is_active = False
        user.save()
        return user


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
