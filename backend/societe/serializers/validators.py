from rest_framework import serializers


def validate_not_blank(value, field="Ce champ"):
    if not value or not value.strip():
        raise serializers.ValidationError(f"{field} est obligatoire.")
    return value.strip()


def validate_siret(value):
    value = validate_not_blank(value, "Le SIRET / matricule")

    if len(value) < 10:
        raise serializers.ValidationError("SIRET/MATRICULE invalide")

    return value
