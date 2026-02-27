from rest_framework import serializers
from user.models import User
from user.serializers.base import BaseUserSerializer
from societe.models import Societe
from societe.serializers.base import BaseSocieteSerializer


class UserDetailsSerializer(BaseUserSerializer):
    username = serializers.CharField()
    last_login = serializers.CharField()
    is_active = serializers.BooleanField()
    societes = BaseSocieteSerializer(many=True, read_only=True, source="societe_set")

    class Meta(BaseUserSerializer.Meta):
        fields = BaseUserSerializer.Meta.fields + [
            "username",
            "last_login",
            "is_active",
            "societes",
        ]

