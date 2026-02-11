from rest_framework import serializers

from documents.models import SocieteDocument, TypeDocument

from societe.models import SocieteMonth, Societe


class TypeDocumentsSerializer(serializers.ModelSerializer):
    class Meta:
        model = TypeDocument
        fields = '__all__'

class DocumentsSerializer(serializers.ModelSerializer):
    type = TypeDocumentsSerializer(read_only=True)
    class Meta:
        model = SocieteDocument
        fields = ["id","nom","date_publication","type","path"]


class SocieteDocumentUploadSerializer(serializers.ModelSerializer):
    nom = serializers.CharField(required=True)
    path = serializers.FileField(required=True)
    type = serializers.PrimaryKeyRelatedField(queryset=TypeDocument.objects.all())
    mois = serializers.PrimaryKeyRelatedField(queryset=SocieteMonth.objects.all())
    societe = serializers.PrimaryKeyRelatedField(queryset=Societe.objects.all())

    class Meta:
        model = SocieteDocument
        fields = ["nom", "path","type", "mois", "societe"]

    def validate_nom(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Le nom est obligatoire.")
        return value

    def validate_path(self, file):
        if not file:
            raise serializers.ValidationError("Vous devez fournir un fichier.")

        if file.size > 10 * 1024 * 1024:
            raise serializers.ValidationError("Le fichier ne doit pas dépasser 10 Mo.")

        allowed_types = ["application/pdf", "image/png", "image/jpeg"]
        if file.content_type not in allowed_types:
            raise serializers.ValidationError("Format non autorisé. PDF, PNG ou JPEG uniquement.")

        return file

    def create(self, validated_data):
        if not validated_data.get("nom") and validated_data.get("path"):
            validated_data["nom"] = validated_data["path"].name
        return super().create(validated_data)
