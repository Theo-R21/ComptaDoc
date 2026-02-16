from rest_framework import serializers
from documents.models import TypeDocument


class TypeDocumentsSerializer(serializers.ModelSerializer):

    class Meta:
        model = TypeDocument
        fields = "__all__"
