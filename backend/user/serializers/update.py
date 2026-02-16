from rest_framework import serializers
from .base import BaseUserSerializer


class UserUpdateSerializer(BaseUserSerializer):

    def validate(self, attrs):

        if not attrs.get("email") and not attrs.get("phone"):
            raise serializers.ValidationError(
                "L'email ou le téléphone doit être renseigné."
            )

        return attrs
