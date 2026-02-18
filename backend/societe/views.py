import datetime

from django.db.models.signals import post_save
from django.dispatch import receiver
from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from societe.models import Societe, SocieteMonth

from user.models import User

from societe.serializers.societe import SocieteSerializer
from societe.serializers.societe_month import SocieteMonthSerializer

from core.settings import env

from core.permission import IsComptableOrClient


class SocietePagination(PageNumberPagination):
    page_size = 12
    page_size_query_param = "page_size"
    max_page_size = 100


class SocieteViewSet(viewsets.ViewSet):
    permission_classes = [IsComptableOrClient, permissions.IsAuthenticatedOrReadOnly]
    # parser_classes = [MultiPartParser, FormParser]
    filter_backends = [filters.SearchFilter]
    search_fields = ["user__first_name", "user__last_name", "nom"]

    def filter_queryset(self, queryset, request):
        for backend in list(self.filter_backends):
            queryset = backend().filter_queryset(request, queryset, self)
        return queryset

    def list(self, request):
        user = request.user
        queryset = Societe.objects.all().order_by("nom")

        if not user.is_superuser and not user.has_role("comptable"):
            queryset = queryset.filter(user=user)

        queryset = self.filter_queryset(queryset, request)

        paginator = SocietePagination()
        page = paginator.paginate_queryset(queryset, request)
        serializer = SocieteSerializer(page, many=True)

        return paginator.get_paginated_response(serializer.data)


    @action(detail=False, methods=["get"], url_path="(?P<societe_id>[^/.]+)/months")
    def months(self, request, societe_id=None):
        societe = Societe.objects.get(pk=societe_id)

        year = int(
            request.query_params.get("year", datetime.datetime.now().year)
        )

        status = request.query_params.get("status")

        ensure_company_months(societe, year)

        months = SocieteMonth.objects.filter(
            societe=societe,
            year=year
        ).order_by("month")

        if status in ["OPEN", "CLOSED"]:
            months = months.filter(status=status)

        serializer = SocieteMonthSerializer(months, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"], url_path="(?P<societe_id>[^/.]+)/year")
    def years(self, request, societe_id=None):
        years = (
            SocieteMonth.objects
            .filter(societe_id=societe_id)
            .values_list("year", flat=True)
            .distinct()
            .order_by("-year")
        )

        return Response(years)

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

    def create(self, request):
        serializer = SocieteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.validated_data.pop("user_id")
        societe = Societe.objects.create(user=user, **serializer.validated_data)

        ensure_company_months(societe)

        return Response({
            "id": societe.id,
            "nom": societe.nom,
            "ID_SCTE": societe.ID_SCTE,
            "user": SocieteSerializer(societe).data["user"]
        }, status=status.HTTP_201_CREATED)


def ensure_company_months(company, year=None):
    if year is None:
        year = datetime.datetime.now().year

    for month in range(1, 13):
        SocieteMonth.objects.get_or_create(
            societe=company,
            year=year,
            month=month,
            defaults={"status": "OPEN"},
        )

@receiver(post_save, sender=Societe)
def create_months_for_new_societe(sender, instance, created, **kwargs):
    if created:
        year = datetime.datetime.now().year
        ensure_company_months(instance, year)