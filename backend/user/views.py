from core.permission import IsComptable
from rest_framework import viewsets, filters, status, permissions
from rest_framework.decorators import action
from rest_framework.pagination import PageNumberPagination
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from user.models import User

from user.serializers.list import UserListSerializer
from user.serializers.action import UserDetailsSerializer
from user.serializers.create import UserCreateSerializer
from user.serializers.update import UserUpdateSerializer
from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema

from societe.models import Societe
from societe.serializers.base import BaseSocieteSerializer


class UserPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 100

class SocietePagination(PageNumberPagination):
    page_size = 5
    page_size_query_param = "page_size"
    max_page_size = 50

class UserViewSet(viewsets.ViewSet):
    serializer_class = UserListSerializer
    permission_classes = [IsComptable]
    parser_classes = [JSONParser, MultiPartParser, FormParser]
    filter_backends = [filters.SearchFilter]
    search_fields = ["username", "first_name", "last_name", "email"]

    def filter_queryset(self, queryset, request):
        for backend in list(self.filter_backends):
            queryset = backend().filter_queryset(request, queryset, self)
        return queryset

    @swagger_auto_schema(
        operation_description="Liste des utilisateurs (Comptable uniquement).",
        manual_parameters=[
            openapi.Parameter(
                'search',
                openapi.IN_QUERY,
                description="Recherche par username, prénom, nom ou email",
                type=openapi.TYPE_STRING,
                example="dupont"
            ),
            openapi.Parameter(
                'page',
                openapi.IN_QUERY,
                type=openapi.TYPE_INTEGER,
                example=1
            ),
        ],
        responses={200: UserListSerializer(many=True)}
    )
    def list(self, request):
        queryset = User.objects.all().order_by("-date_joined")
        queryset = self.filter_queryset(queryset, request)
        paginator = UserPagination()
        page = paginator.paginate_queryset(queryset, request)
        serializer = UserListSerializer(page, many=True)

        return paginator.get_paginated_response(serializer.data)

    @swagger_auto_schema(
        operation_description="Détail d'un utilisateur.",
        responses={
            200: UserDetailsSerializer,
            404: "Utilisateur non trouvé"
        }
    )
    def retrieve(self, request, pk=None):
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

        societes = Societe.objects.filter(user=user).order_by("nom")
        paginator = SocietePagination()
        page = paginator.paginate_queryset(societes, request)
        societes_serialized = BaseSocieteSerializer(page, many=True)

        user_serializer = UserDetailsSerializer(user)

        data = user_serializer.data
        data["societes"] = paginator.get_paginated_response(societes_serialized.data).data

        return Response(data)

    def retrieve(self, request, pk=None):
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

        # Paginer les sociétés du user, pas le user lui-même
        societes = Societe.objects.filter(user=user).order_by("nom")
        paginator = SocietePagination()
        page = paginator.paginate_queryset(societes, request)
        societes_serialized = BaseSocieteSerializer(page, many=True)

        # Sérialiser le user séparément
        user_serializer = UserDetailsSerializer(user)

        data = user_serializer.data
        data["societes"] = paginator.get_paginated_response(societes_serialized.data).data

        return Response(data)

    @swagger_auto_schema(
        operation_description="Création d'un nouvel utilisateur.",
        request_body=UserCreateSerializer,
        responses={
            201: UserCreateSerializer,
            400: "Erreur de validation"
        }
    )
    def create(self, request):
        serializer = UserCreateSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @swagger_auto_schema(
        operation_description="Modification partielle d'un utilisateur.",
        request_body=UserUpdateSerializer,
        responses={
            200: UserUpdateSerializer,
            400: "Erreur de validation",
            404: "Utilisateur non trouvé"
        }
    )
    def update(self, request, pk=None):
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        serializer = UserUpdateSerializer(user, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        print(serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @swagger_auto_schema(
        operation_description="Suppression d'un utilisateur.",
        responses={
            204: "Utilisateur supprimé",
            404: "Utilisateur non trouvé"
        }
    )
    def destroy(self, request, pk=None):
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @swagger_auto_schema(
        operation_description="Active ou désactive un utilisateur.",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=["actif"],
            properties={
                "actif": openapi.Schema(
                    type=openapi.TYPE_BOOLEAN,
                    example=True
                )
            }
        ),
        responses={
            200: openapi.Response(
                description="Statut modifié",
                examples={
                    "application/json": {
                        "id": 5,
                        "actif": True
                    }
                }
            ),
            400: openapi.Response(
                description="Champ manquant",
                examples={
                    "application/json": {
                        "detail": "Le champ 'actif' est requis"
                    }
                }
            ),
            404: openapi.Response(
                description="Utilisateur non trouvé",
                examples={
                    "application/json": {
                        "detail": "Utilisateur non trouvé"
                    }
                }
            )
        }
    )
    @action(detail=True, methods=["patch"], url_path="toggle-actif", permission_classes=[IsAuthenticated, IsComptable])
    def toggle_actif(self, request, pk=None):
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({"detail": "Utilisateur non trouvé"}, status=status.HTTP_404_NOT_FOUND)

        actif = request.data.get("actif")
        if actif is None:
            return Response({"detail": "Le champ 'actif' est requis"}, status=status.HTTP_400_BAD_REQUEST)

        user.is_active = actif
        user.save()

        return Response({"id": user.id, "actif": user.is_active}, status=status.HTTP_200_OK)