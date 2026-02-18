import io
import os
import zipfile

from core import settings
from django.http import FileResponse, HttpResponse
from django.shortcuts import get_object_or_404, get_list_or_404
from documents.models import SocieteDocument, TypeDocument
from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.pagination import PageNumberPagination
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response
from core.permission import IsComptableOrClient

from documents.serializers.document import DocumentsSerializer
from documents.serializers.type_document import TypeDocumentsSerializer
from documents.serializers.upload import SocieteDocumentUploadSerializer


class DocumentsPagination(PageNumberPagination):
    page_size = 12
    page_size_query_param = "page_size"
    max_page_size = 100


class DocumentsViewSet(viewsets.ViewSet):
    permission_classes = [IsComptableOrClient]
    parser_classes = [JSONParser, MultiPartParser, FormParser]
    filter_backends = [filters.SearchFilter]
    search_fields = ["nom", "date_publication"]

    def filter_queryset(self, queryset, request):
        for backend in list(self.filter_backends):
            queryset = backend().filter_queryset(request, queryset, self)
        return queryset

    @action(detail=True, methods=["get"], url_path=r"months/(?P<mois>[^/.]+)")
    def documents_by_month(self, request, pk=None, mois=None):
        queryset = SocieteDocument.objects.filter(
            societe_id=pk,
            mois_id=mois
        ).order_by("nom")

        type_id = request.query_params.get("type")
        if type_id and type_id != "null":
            queryset = queryset.filter(type_id=type_id)

        queryset = self.filter_queryset(queryset, request)
        paginator = DocumentsPagination()
        page = paginator.paginate_queryset(queryset, request)
        serializer = DocumentsSerializer(page, many=True)

        return paginator.get_paginated_response(serializer.data)

    @action(detail=False, methods=["get"], url_path="types")
    def type_doc(self, request):
        queryset = TypeDocument.objects.all().order_by("nom")
        serializer = TypeDocumentsSerializer(queryset, many=True)

        return Response(serializer.data)

    @action(detail=False, methods=["post"], url_path="upload")
    def upload_document(self, request):
        serializer = SocieteDocumentUploadSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"detail": "Fichier téléversé avec succès"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=["get"], url_path="download")
    def download(self, request, pk=None):
        document = get_object_or_404(SocieteDocument, pk=pk)

        return FileResponse(
            document.path.open("rb"),
            as_attachment=True,
            filename=os.path.basename(document.path.name),
            content_type="application/pdf",
        )

    @action(detail=False, methods=["post"], url_path="download-multiple")
    def download_multiple(self, request):
        ids = request.data.get("ids", [])

        if not ids:
            return Response(
                {"error": "Aucun document sélectionné"},
                status=400
            )

        documents = get_list_or_404(SocieteDocument, id__in=ids)

        buffer = io.BytesIO()

        with zipfile.ZipFile(buffer, "w", zipfile.ZIP_DEFLATED) as zip_file:
            for doc in documents:
                file_path = doc.path.path
                filename = os.path.basename(doc.path.name)
                zip_file.write(file_path, filename)

        buffer.seek(0)

        response = HttpResponse(
            buffer,
            content_type="application/zip"
        )
        response["Content-Disposition"] = 'attachment; filename="documents.zip"'

        return response

