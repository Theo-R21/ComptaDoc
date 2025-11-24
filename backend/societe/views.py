from django.shortcuts import render
from rest_framework import viewsets, permissions
from rest_framework.response import Response

from societe.models import Societe

from societe.serializers import SocieteSerializer


# Create your views here.


# class SocietePagination(PageNumberPagination):
#     page_size = 10
#     page_size_query_param = "page_size"
#     max_page_size = 100


class SocieteViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    # parser_classes = [MultiPartParser, FormParser]
    # filter_backends = [filters.SearchFilter]
    # search_fields = ["username",]

    # def filter_queryset(self, queryset, request):
    #     for backend in list(self.filter_backends):
    #         queryset = backend().filter_queryset(request, queryset, self)
    #     return queryset

    def list(self, request):
        queryset = Societe.objects.all().order_by("-nom")
        serializer = SocieteSerializer(queryset, many=True)
        # queryset = self.filter_queryset(queryset, request)
        # paginator = UserPagination()
        # page = paginator.paginate_queryset(queryset, request)
        # serializer = UserListSerializer(page, many=True)

        # return paginator.get_paginated_response(serializer.data)
        return Response(serializer.data)

    # def retrieve(self, request, pk=None):
    #     try:
    #         user = User.objects.get(pk=pk)
    #     except User.DoesNotExist:
    #         return Response(status=status.HTTP_404_NOT_FOUND)
    #     serializer = UserActionSerializer(user)
    #     return Response(serializer.data)
    #
    # def create(self, request):
    #     serializer = UserActionSerializer(data=request.data)
    #     if serializer.is_valid():
    #         serializer.save()
    #         return Response(serializer.data, status=status.HTTP_201_CREATED)
    #     return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    #
    # def update(self, request, pk=None):
    #     try:
    #         user = User.objects.get(pk=pk)
    #     except User.DoesNotExist:
    #         return Response(status=status.HTTP_404_NOT_FOUND)
    #     serializer = UserActionSerializer(user, data=request.data)
    #
    #     if serializer.is_valid():
    #         serializer.save()
    #         return Response(serializer.data)
    #     return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    #
    # def destroy(self, request, pk=None):
    #     try:
    #         user = User.objects.get(pk=pk)
    #     except User.DoesNotExist:
    #         return Response(status=status.HTTP_404_NOT_FOUND)
    #     user.delete()
    #     return Response(status=status.HTTP_204_NO_CONTENT)