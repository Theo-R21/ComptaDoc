from rest_framework import serializers
from societe.models import Societe
from .validators import validate_not_blank, validate_siret


class BaseSocieteSerializer(serializers.ModelSerializer):

    def validate_nom(self, value):
        return validate_not_blank(value, "Le nom")

    def validate_ID_SCTE(self, value):
        return validate_siret(value)

    class Meta:
        model = Societe
        fields = ["id", "nom", "ID_SCTE"]
