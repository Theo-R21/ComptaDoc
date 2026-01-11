from rest_framework import serializers
from societe.models import Societe

from user.serializers import UserSerializer


class SocieteSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    class Meta:
        model = Societe
        fields = ["id","nom","user"]