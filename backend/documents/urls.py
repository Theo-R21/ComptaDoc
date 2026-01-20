from django.urls import include, path
from rest_framework.routers import DefaultRouter

from documents.views import DocumentsViewSet

router = DefaultRouter()
router.register(r"documents", DocumentsViewSet, basename="documents")

urlpatterns = [
    path("", include(router.urls)),
]