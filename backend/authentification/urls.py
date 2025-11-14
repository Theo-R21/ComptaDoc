from django.urls import path, include
from .views import CustomTokenObtainPairView, MeView, LogoutView, CustomTokenRefreshView

urlpatterns = [
    path("login/", CustomTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("refresh/", CustomTokenRefreshView.as_view(), name="token_refresh"),
    path("users/me/", MeView.as_view(), name="user"),
]
