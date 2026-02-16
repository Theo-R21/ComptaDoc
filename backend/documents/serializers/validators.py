from rest_framework import serializers

MAX_FILE_SIZE = 10 * 1024 * 1024

ALLOWED_TYPES = {
    "application/pdf",
    "image/png",
    "image/jpeg",
}


def validate_file(file):
    if not file:
        raise serializers.ValidationError("Vous devez fournir un fichier.")

    if file.size > MAX_FILE_SIZE:
        raise serializers.ValidationError(
            "Le fichier ne doit pas dépasser 10 Mo."
        )

    if file.content_type not in ALLOWED_TYPES:
        raise serializers.ValidationError(
            "Format non autorisé. PDF, PNG ou JPEG uniquement."
        )

    return file


def validate_not_blank(value):
    if not value or not value.strip():
        raise serializers.ValidationError("Le nom est obligatoire.")
    return value.strip()
