import io
import os
import zipfile

from core import settings
from core.permission import IsComptableOrClient
from django.db.models import Count
from django.http import FileResponse, HttpResponse
from django.shortcuts import get_object_or_404, get_list_or_404
from documents.models import SocieteDocument, TypeDocument
from documents.serializers.document import DocumentsSerializer
from documents.serializers.type_document import TypeDocumentsSerializer
from documents.serializers.upload import SocieteDocumentUploadSerializer
from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema
from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework.pagination import PageNumberPagination
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response
from societe.models import Societe, SocieteMonth


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

    @swagger_auto_schema(
        operation_description="Liste des documents d'une société pour un mois donné.",
        manual_parameters=[
            openapi.Parameter(
                'type',
                openapi.IN_QUERY,
                description="Filtrer par type de document",
                type=openapi.TYPE_INTEGER,
                example=1
            ),
            openapi.Parameter(
                'search',
                openapi.IN_QUERY,
                description="Recherche par nom",
                type=openapi.TYPE_STRING,
                example="facture"
            ),
            openapi.Parameter(
                'page',
                openapi.IN_QUERY,
                type=openapi.TYPE_INTEGER,
                example=1
            ),
        ],
        responses={
            200: DocumentsSerializer(many=True)
        }
    )
    @action(detail=True, methods=["get"], url_path=r"months/(?P<mois>[^/.]+)")
    def documents_by_month(self, request, pk=None, mois=None):
        user = request.user
        try:
            societe = Societe.objects.get(pk=pk)
        except Societe.DoesNotExist:
            raise PermissionDenied("Société introuvable ou accès refusé")

        try:
            societe_month = SocieteMonth.objects.get(pk=mois, societe=societe)
        except SocieteMonth.DoesNotExist:
            raise PermissionDenied("Mois introuvable pour cette société")

        if not (user.is_superuser or user.has_role("comptable") or societe.user == user):
            raise PermissionDenied("Vous n'avez pas accès à cette société")

        queryset = SocieteDocument.objects.filter(
            societe_id=pk,
            mois_id=mois
        ).order_by("nom")

        # Stats sur le queryset complet AVANT le filtre type
        stats = {
            "total": queryset.count(),
            "par_type": list(
                queryset.values("type__nom")
                .annotate(count=Count("id"))
                .order_by("-count")
            ),
            "dernier_depot": queryset.order_by("-date_publication")
            .values_list("date_publication", flat=True)
            .first(),
            "types_distincts": queryset.values("type").distinct().count(),
        }

        type_id = request.query_params.get("type")
        if type_id and type_id != "null":
            queryset = queryset.filter(type_id=type_id)

        queryset = self.filter_queryset(queryset, request)
        paginator = DocumentsPagination()
        page = paginator.paginate_queryset(queryset, request)
        serializer = DocumentsSerializer(page, many=True)

        response = paginator.get_paginated_response(serializer.data)
        response.data["stats"] = stats
        return response

    @swagger_auto_schema(
        operation_description="Liste des types de documents disponibles.",
        responses={
            200: TypeDocumentsSerializer(many=True)
        }
    )
    @action(detail=False, methods=["get"], url_path="types")
    def type_doc(self, request):
        queryset = TypeDocument.objects.all().order_by("nom")
        serializer = TypeDocumentsSerializer(queryset, many=True)

        return Response(serializer.data)

    @swagger_auto_schema(
        operation_description="Upload d'un document (multipart/form-data).",
        request_body=SocieteDocumentUploadSerializer,
        responses={
            201: openapi.Response(
                description="Fichier téléversé",
                examples={
                    "application/json": {
                        "detail": "Fichier téléversé avec succès"
                    }
                }
            ),
            400: "Erreur de validation"
        }
    )
    @action(detail=False, methods=["post"], url_path="upload")
    def upload_document(self, request):
        serializer = SocieteDocumentUploadSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"detail": "Fichier téléversé avec succès"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @swagger_auto_schema(
        operation_description="Téléchargement d'un document PDF.",
        responses={
            200: openapi.Response(
                description="Fichier PDF",
                schema=openapi.Schema(
                    type=openapi.TYPE_STRING,
                    format="binary"
                )
            ),
            404: "Document introuvable"
        }
    )
    @action(detail=True, methods=["get"], url_path="download")
    def download(self, request, pk=None):
        document = get_object_or_404(SocieteDocument, pk=pk)

        return FileResponse(
            document.path.open("rb"),
            as_attachment=True,
            filename=os.path.basename(document.path.name),
            content_type="application/pdf",
        )

    @swagger_auto_schema(
        operation_description="Téléchargement multiple de documents au format ZIP.",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=["ids"],
            properties={
                "ids": openapi.Schema(
                    type=openapi.TYPE_ARRAY,
                    items=openapi.Items(type=openapi.TYPE_INTEGER),
                    example=[1, 2, 3]
                )
            }
        ),
        responses={
            200: openapi.Response(
                description="Archive ZIP",
                schema=openapi.Schema(
                    type=openapi.TYPE_STRING,
                    format="binary"
                )
            ),
            400: openapi.Response(
                description="Aucun document sélectionné",
                examples={
                    "application/json": {
                        "error": "Aucun document sélectionné"
                    }
                }
            )
        }
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

