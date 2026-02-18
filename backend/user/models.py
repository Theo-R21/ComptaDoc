from django.utils import timezone
from django.contrib.auth.models import AbstractUser
from django.db import models

# Create your models here.

class User(AbstractUser):
    phone = models.CharField(unique=True, max_length=20, null=True, blank=True)
    reset_code = models.CharField(max_length=6, null=True, blank=True)
    reset_code_expires_at = models.DateTimeField(null=True, blank=True)
    reset_password_token = models.CharField(max_length=255, null=True, blank=True)
    ROLE_CHOICES = (
        ('comptable', 'Comptable'),
        ('client', 'Client'),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='client')

    def is_reset_code_valid(self, code):
        if not self.reset_code or not self.reset_code_expires_at:
            return False
        if timezone.now() > self.reset_code_expires_at:
            return False
        return self.reset_code == code

    def has_role(self, role_name):
        return self.role == role_name