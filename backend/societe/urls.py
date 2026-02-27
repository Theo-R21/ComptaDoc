from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import SocieteViewSet

router = DefaultRouter()
router.register(r"societe", SocieteViewSet, basename="societe")

urlpatterns = [
    path("", include(router.urls)),
]