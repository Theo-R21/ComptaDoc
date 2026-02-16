import calendar
from rest_framework import serializers
from societe.models import SocieteMonth

MONTHS_FR = [
    "", "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
]


class SocieteMonthSerializer(serializers.ModelSerializer):
    month_name = serializers.SerializerMethodField()

    class Meta:
        model = SocieteMonth
        fields = ["id", "year", "month", "month_name", "status"]

    def get_month_name(self, obj):
        if 1 <= obj.month <= 12:
            return MONTHS_FR[obj.month]
        return calendar.month_name[obj.month]
