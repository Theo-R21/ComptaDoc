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
        fields = ["id","nom","type","path"]