import phonenumbers
from rest_framework import serializers
from django.core.validators import validate_email
from django.core.exceptions import ValidationError as DjangoValidationError
from user.models import User


def validate_not_blank(value, field):

    if not value or not value.strip():
        raise serializers.ValidationError(f"{field} est obligatoire.")

    return value.strip()


def validate_email_format(value):

    try:
        validate_email(value)
    except DjangoValidationError:
        raise serializers.ValidationError("Format d'email invalide.")

    return value


def validate_unique_email(value, instance=None):

    qs = User.objects.filter(email=value)

    if instance:
        qs = qs.exclude(pk=instance.pk)

    if qs.exists():
        raise serializers.ValidationError("Cet email est déjà utilisé.")

    return value


def validate_phone(value):

    if not value:
        return value

    try:
        parsed = phonenumbers.parse(value, None)

        if not phonenumbers.is_valid_number(parsed):
            raise serializers.ValidationError("Numéro invalide.")

        return phonenumbers.format_number(
            parsed,
            phonenumbers.PhoneNumberFormat.E164
        )

    except phonenumbers.NumberParseException:
        raise serializers.ValidationError("Numéro invalide.")
