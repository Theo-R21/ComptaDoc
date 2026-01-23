from django.db import models
from user.models import User


# Create your models here.

class Societe(models.Model):
    nom = models.CharField(max_length=100)
    user = models.ForeignKey(User, on_delete=models.CASCADE)


class SocieteMonth(models.Model):
    STATUS_CHOICES = (
        ("OPEN", "Ouvert"),
        ("CLOSED", "Fermé"),
    )

    societe = models.ForeignKey(Societe, on_delete=models.CASCADE)
    year = models.IntegerField()
    month = models.IntegerField()
    status = models.CharField(
        max_length=10,
        choices=STATUS_CHOICES,
        default="CLOSED"
    )

    class Meta:
        unique_together = ("societe", "year", "month")
