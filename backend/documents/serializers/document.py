from rest_framework import serializers
from documents.models import SocieteDocument
from .type_document import TypeDocumentsSerializer


class DocumentsSerializer(serializers.ModelSerializer):

    type = TypeDocumentsSerializer(read_only=True)

    class Meta:
        model = SocieteDocument
        fields = ["id", "nom", "date_publication", "type", "path"]
        read_only_fields = fields

