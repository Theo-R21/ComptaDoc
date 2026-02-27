import uuid

from django.db import models
from user.models import User


# Create your models here.

class Societe(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    nom = models.CharField(max_length=100)
    ID_SCTE = models.CharField(max_length=100, null=True, blank=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)


class SocieteMonth(models.Model):
    STATUS_CHOICES = (
        ("OPEN", "Ouvert"),
        ("CLOSED", "Fermé"),
    )
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    year = models.IntegerField()
    month = models.IntegerField()
    status = models.CharField(
        max_length=10,
        choices=STATUS_CHOICES,
        default="CLOSED"
    )
    societe = models.ForeignKey(Societe, on_delete=models.CASCADE)

    class Meta:
        unique_together = ("societe", "year", "month")
