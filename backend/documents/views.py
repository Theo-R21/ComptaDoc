from django.shortcuts import render
from rest_framework import viewsets, permissions, filters
from rest_framework.decorators import action
from rest_framework.pagination import PageNumberPagination

from documents.models import SocieteDocument
from documents.serializers import DocumentsSerializer


class DocumentsPagination(PageNumberPagination):
    page_size = 12
    page_size_query_param = "page_size"
    max_page_size = 100

# Create your views here.
class DocumentsViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    # parser_classes = [MultiPartParser, FormParser]
    filter_backends = [filters.SearchFilter]
    search_fields = ["nom", "date"]

    def filter_queryset(self, queryset, request):
        for backend in list(self.filter_backends):
            queryset = backend().filter_queryset(request, queryset, self)
        return queryset

    @action(detail=True,methods=["get"],url_path=r"months/(?P<mois>[^/.]+)")
    def documents_by_month(self, request, pk=None, mois=None):
        #month_id = request.query_params.get("monthId")
        queryset = SocieteDocument.objects.filter(
            societe_id=pk,
            mois_id=mois
        ).order_by("nom")
        queryset = self.filter_queryset(queryset, request)
        paginator = DocumentsPagination()
        page = paginator.paginate_queryset(queryset, request)
        serializer = DocumentsSerializer(page, many=True)

        return paginator.get_paginated_response(serializer.data)

    # @action(detail=False, methods=["get"], url_path="(?P<societe_id>[^/.]+)/months")
    # def months(self, request, societe_id=None):
    #     societe = Societe.objects.get(pk=societe_id)
    #
    #     year = request.query_params.get(
    #         "year", datetime.datetime.now().year
    #     )
    #
    #     months = ensure_company_months(societe, year)
    #
    #     serializer = SocieteMonthSerializer(months, many=True)
    #     return Response(serializer.data)

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
