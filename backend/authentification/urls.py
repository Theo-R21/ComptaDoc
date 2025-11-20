from django.urls import path, include
from .views import CustomTokenObtainPairView, MeView, LogoutView, CustomTokenRefreshView, ForgotPasswordView, \
    VerifyResetCodeView, ResetPasswordView, RegisterView

urlpatterns = [
    path("login/", CustomTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("refresh/", CustomTokenRefreshView.as_view(), name="token_refresh"),
    path("users/me/", MeView.as_view(), name="user"),
    path("register/", RegisterView.as_view(), name="register"),
    path("password_reset/", ForgotPasswordView.as_view(), name="password_reset"),
    path("password_reset/code/", VerifyResetCodeView.as_view(), name="reset_code"),
    path("password_reset/change/", ResetPasswordView.as_view(), name="password_reset_change"),
]
