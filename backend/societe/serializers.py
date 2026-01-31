import calendar

from rest_framework import serializers
from societe.models import Societe, SocieteMonth

from user.serializers import UserSerializer



class SocieteSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    class Meta:
        model = Societe
        fields = ["id","nom","ID_SCTE","user"]

class SocieteMonthSerializer(serializers.ModelSerializer):
    month_name = serializers.SerializerMethodField()

    class Meta:
        model = SocieteMonth
        fields = ["id","year", "month", "month_name", "status"]

    def get_month_name(self, obj):
        month_name = calendar.month_name[obj.month]

        months_fr = [
            "", "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
            "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
        ]
        return months_fr[obj.month]