from rest_framework import serializers

from documents.models import SocieteDocument, TypeDocument


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
    class Meta:
        model = SocieteDocument
        fields = ["nom", "path","type", "mois", "societe"]

    def create(self, validated_data):
        if not validated_data.get("nom") and validated_data.get("path"):
            validated_data["nom"] = validated_data["path"].name
        return super().create(validated_data)
