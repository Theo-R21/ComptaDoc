from rest_framework import serializers
from django.utils.text import slugify
from user.models import User
from .base import BaseUserSerializer


class UserCreateSerializer(BaseUserSerializer):

    password = serializers.CharField(write_only=True, required=True)
    password2 = serializers.CharField(
        write_only=True,
        required=True,
        label="Confirmation mot de passe"
    )

    class Meta(BaseUserSerializer.Meta):
        fields = BaseUserSerializer.Meta.fields + [
            "password",
            "password2",
        ]

    def validate(self, attrs):

        if attrs["password"] != attrs["password2"]:
            raise serializers.ValidationError({
                "password2": "Les mots de passe ne correspondent pas."
            })

        return attrs

    def create(self, validated_data):

        validated_data.pop("password2")
        password = validated_data.pop("password")

        first_slug = slugify(validated_data["first_name"])
        last_slug = slugify(validated_data["last_name"])

        base_username = f"{first_slug}.{last_slug}"
        username = base_username
        counter = 1

        while User.objects.filter(username=username).exists():
            username = f"{base_username}{counter}"
            counter += 1

        user = User(username=username, **validated_data)

        user.set_password(password)
        user.is_active = False
        user.save()

        return user
