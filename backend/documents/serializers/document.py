from rest_framework import serializers
from documents.models import SocieteDocument
from .type_document import TypeDocumentsSerializer


class DocumentsSerializer(serializers.ModelSerializer):

    type = TypeDocumentsSerializer(read_only=True)
    format = serializers.SerializerMethodField()

    class Meta:
        model = SocieteDocument
        fields = ["id", "nom", "date_publication", "type", "path", "format"]
        read_only_fields = fields

    def get_format(self, obj) -> str:
        extension = obj.path.name.rsplit(".", 1)[-1].upper()
        return extension if "." in obj.path.name else "—"
