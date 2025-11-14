from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.serializers import TokenRefreshSerializer
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .serializers import CustomTokenObtainPairSerializer


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)

        if response.status_code == 200:
            data = response.data
            res = Response(
                {"success": True, "access": data["access"]},
                status=status.HTTP_200_OK
            )

            res.set_cookie(
                key="access",
                value=data["access"],
                httponly=True,
                secure=False,
                samesite="Strict",
                path="/",
            )
            res.set_cookie(
                key="refresh",
                value=data["refresh"],
                httponly=True,
                secure=False,
                samesite="Strict",
                path="/",
            )
            return res

        return response


class CustomTokenRefreshView(TokenRefreshView):
    def post(self, request, *args, **kwargs):
        refresh_token = request.COOKIES.get("refresh")

        if refresh_token is None:
            return Response({"detail": "Refresh token missing."}, status=status.HTTP_401_UNAUTHORIZED)

        serializer = TokenRefreshSerializer(data={"refresh": refresh_token})
        serializer.is_valid(raise_exception=True)

        data = serializer.validated_data
        res = Response(data, status=status.HTTP_200_OK)

        res.set_cookie(
            key="access",
            value=data["access"],
            httponly=True,
            secure=False,
            samesite="Strict",
            path="/",
        )
        return res


class LogoutView(APIView):
    def post(self, request):
        response = Response({"detail": "Logout successful"}, status=status.HTTP_200_OK)

        response.delete_cookie("access", samesite="Strict")
        response.delete_cookie("refresh", samesite="Strict")

        return response

class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({
            "id": user.id,
            "username": user.username,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "email": user.email,
        })
