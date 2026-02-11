import calendar

from rest_framework import serializers
from societe.models import Societe, SocieteMonth
from user.models import User
from user.serializers import UserSerializer


class SocieteSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    user_id = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), write_only=True)

    class Meta:
        model = Societe
        fields = ["id","nom","ID_SCTE","user","user_id"]
        extra_kwargs = {
            "user": {"required": True},
            "nom": {"required": True},
            "ID_SCTE": {"required": True},
        }

    def validate_nom(self, value):
        if not value.strip():
            raise serializers.ValidationError("Le nom est obligatoire")
        return value

    def validate_ID_SCTE(self, value):
        if len(value) < 10:
            raise serializers.ValidationError("SIRET/MATRICULE invalide")
        return value


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