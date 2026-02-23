import phonenumbers
from rest_framework import serializers
from django.core.validators import validate_email
from django.core.exceptions import ValidationError as DjangoValidationError
from user.models import User
import re

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

    cleaned = value.strip().replace(" ", "").replace("-", "").replace(".", "")

    FRENCH_PATTERNS = [
        r"^\+33[1-9]\d{8}$",       # +33612345678
        r"^0[1-9]\d{8}$",          # 0612345678
    ]

    LUXEMBOURG_PATTERNS = [
        r"^\+352\d{8,9}$",         # +352621123456
        r"^(6\d{2}|2\d|3\d|4\d|5\d|8\d|9\d)\d{6,7}$",  # 621123456 / 26123456
    ]


    is_french = any(re.match(p, cleaned) for p in FRENCH_PATTERNS)
    is_lux = any(re.match(p, cleaned) for p in LUXEMBOURG_PATTERNS)

    if not is_french and not is_lux:
        raise serializers.ValidationError(
            "Seuls les numéros français et luxembourgeois sont acceptés."
        )

    region = "FR" if is_french else "LU"
    try:
        parsed = phonenumbers.parse(cleaned, region)
        return phonenumbers.format_number(parsed, phonenumbers.PhoneNumberFormat.E164)
    except phonenumbers.NumberParseException:
        raise serializers.ValidationError("Numéro invalide.")