from rest_framework import serializers
from documents.models import SocieteDocument, TypeDocument
from societe.models import SocieteMonth, Societe
from .validators import validate_file, validate_not_blank


class SocieteDocumentUploadSerializer(serializers.ModelSerializer):

    nom = serializers.CharField(required=False)
    path = serializers.FileField(validators=[validate_file])

    type = serializers.PrimaryKeyRelatedField(
        queryset=TypeDocument.objects.all()
    )

    mois = serializers.PrimaryKeyRelatedField(
        queryset=SocieteMonth.objects.all()
    )

    societe = serializers.PrimaryKeyRelatedField(
        queryset=Societe.objects.all()
    )

    class Meta:
        model = SocieteDocument
        fields = ["nom", "path", "type", "mois", "societe"]

    def validate_nom(self, value):
        return validate_not_blank(value)

    def create(self, validated_data):

        if not validated_data.get("nom"):
            validated_data["nom"] = validated_data["path"].name

        return super().create(validated_data)
