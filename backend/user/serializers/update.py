from rest_framework import serializers
from .base import BaseUserSerializer


class UserUpdateSerializer(BaseUserSerializer):
    username = serializers.CharField()
    last_login = serializers.CharField()

    class Meta(BaseUserSerializer.Meta):
        fields = BaseUserSerializer.Meta.fields + [
            "username",
            "last_login",
        ]

    def validate(self, attrs):
        email = attrs.get("email") or getattr(self.instance, "email", None)
        phone = attrs.get("phone") or getattr(self.instance, "phone", None)

        if not email and not phone:
            raise serializers.ValidationError(
                "L'email ou le téléphone doit être renseigné."
            )

        return attrs
