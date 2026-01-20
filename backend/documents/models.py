from django.db import models

from datetime import timezone
from django.utils.text import slugify
import uuid


from societe.models import Societe,SocieteMonth



def societe_document_upload_path(instance, filename):
    now = timezone.now()
    societe_slug = slugify(instance.societe.nom)
    ext = filename.split('.')[-1]
    filename = f"{uuid.uuid4()}.{ext}"

    return f"documents/{societe_slug}/{now:%Y/%m}/{filename}"

class TypeDocument(models.Model):
    nom = models.CharField(max_length=100)

class SocieteDocument(models.Model):
    nom = models.CharField(max_length=100)
    date_publication = models.DateField(auto_now_add=True)
    path = models.FileField(upload_to=societe_document_upload_path)
    type = models.ForeignKey(TypeDocument,on_delete=models.DO_NOTHING, default=1)
    mois = models.ForeignKey(SocieteMonth, on_delete=models.PROTECT, default=1)
    societe = models.ForeignKey(Societe, on_delete=models.CASCADE)
