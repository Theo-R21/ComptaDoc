import datetime

from rest_framework import viewsets, permissions, filters
from rest_framework.decorators import action
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from societe.models import Societe, SocieteMonth
from societe.serializers import SocieteSerializer, SocieteMonthSerializer


class SocietePagination(PageNumberPagination):
    page_size = 12
    page_size_query_param = "page_size"
    max_page_size = 100


class SocieteViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    # parser_classes = [MultiPartParser, FormParser]
    filter_backends = [filters.SearchFilter]
    search_fields = ["user__first_name", "user__last_name", "nom"]

    def filter_queryset(self, queryset, request):
        for backend in list(self.filter_backends):
            queryset = backend().filter_queryset(request, queryset, self)
        return queryset

    def list(self, request):
        queryset = Societe.objects.all().order_by("nom")
        queryset = self.filter_queryset(queryset, request)
        paginator = SocietePagination()
        page = paginator.paginate_queryset(queryset, request)
        serializer = SocieteSerializer(page, many=True)

        return paginator.get_paginated_response(serializer.data)

    @action(detail=False, methods=["get"], url_path="(?P<societe_id>[^/.]+)/months")
    def months(self, request, societe_id=None):
        societe = Societe.objects.get(pk=societe_id)

        year = request.query_params.get(
            "year", datetime.datetime.now().year
        )

        months = ensure_company_months(societe, year)

        serializer = SocieteMonthSerializer(months, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["patch"], url_path="months/(?P<month>\\d+)", )
    def update_month(self, request, pk=None, month=None):
        societe = Societe.objects.get(pk=pk)
        year = datetime.datetime.now().year
        status = request.data.get("status")

        obj = SocieteMonth.objects.get(
            societe=societe,
            year=year,
            month=month,
        )

        if obj.status == "LOCKED":
            return Response(
                {"error": "Mois verrouillé"},
                status=403
            )

        obj.status = status
        obj.save()

        return Response(SocieteMonthSerializer(obj).data)

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


def ensure_company_months(company, year=None):
    if year is None:
        year = datetime.now().year

    months = []

    for month in range(1, 13):
        obj, _ = SocieteMonth.objects.get_or_create(
            societe=company,
            year=year,
            month=month,
            defaults={"status": "OPEN"},
        )
        months.append(obj)

    return months
