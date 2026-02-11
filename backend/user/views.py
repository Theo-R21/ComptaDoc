from core.permission import IsComptable
from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.pagination import PageNumberPagination
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from user.models import User
from user.serializers import UserListSerializer, UserActionSerializer,UserUpdateSerializer


# Create your views here.


class UserPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 100

class UserViewSet(viewsets.ViewSet):
    queryset = User.objects.all()
    serializer_class = UserListSerializer

    def get_permissions(self):
        if self.action in ["create", "destroy"]:
            permission_classes = [IsAuthenticated, IsComptable]
        else:
            permission_classes = [IsAuthenticated]

        return [permission() for permission in permission_classes]

    parser_classes = [JSONParser, MultiPartParser, FormParser]
    permission_classes = [IsAuthenticated, IsComptable]
    filter_backends = [filters.SearchFilter]
    search_fields = ["username", "first_name", "last_name", "email"]

    def filter_queryset(self, queryset, request):
        for backend in list(self.filter_backends):
            queryset = backend().filter_queryset(request, queryset, self)
        return queryset

    def list(self, request):
        queryset = User.objects.all().order_by("-date_joined")
        queryset = self.filter_queryset(queryset, request)
        paginator = UserPagination()
        page = paginator.paginate_queryset(queryset, request)
        serializer = UserListSerializer(page, many=True)

        return paginator.get_paginated_response(serializer.data)

    def retrieve(self, request, pk=None):
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        serializer = UserActionSerializer(user)
        return Response(serializer.data)

    def create(self, request):
        serializer = UserActionSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, pk=None):
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        serializer = UserUpdateSerializer(user, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, pk=None):
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

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