from rest_framework import serializers
from societe.models import Societe



class SocieteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Societe
        fields = "__all__"