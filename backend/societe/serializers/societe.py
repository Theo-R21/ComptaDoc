from rest_framework import serializers
from user.models import User
from user.serializers.base import BaseUserSerializer
from societe.models import Societe
from .base import BaseSocieteSerializer


class SocieteSerializer(BaseSocieteSerializer):

    user = BaseUserSerializer(read_only=True)
    user_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        write_only=True
    )

    class Meta(BaseSocieteSerializer.Meta):
        fields = BaseSocieteSerializer.Meta.fields + ["user", "user_id"]
