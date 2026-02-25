import random
import secrets
from datetime import timedelta

from django.core.mail import send_mail
from django.core.validators import validate_email
from django.utils import timezone
from rest_framework import status
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.serializers import TokenRefreshSerializer
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .serializers import CustomTokenObtainPairSerializer
from user.models import User

from societe.models import Societe
from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

    @swagger_auto_schema(
        operation_description="Connexion utilisateur - obtention tokens JWT et cookies sécurisés.",
        request_body=CustomTokenObtainPairSerializer,
        responses={
            200: openapi.Response(
                description="Token d’accès et cookie défini",
                examples={"application/json": {"success": True, "access": "eyJ..."}}
            ),
            401: "Échec d’authentification"
        }
    )
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
                samesite="Lax",
                path="/",
            )
            res.set_cookie(
                key="refresh",
                value=data["refresh"],
                httponly=True,
                secure=False,
                samesite="Lax",
                path="/",
            )
            return res

        return response


class CustomTokenRefreshView(TokenRefreshView):
    @swagger_auto_schema(
        operation_description="Rafraîchissement du token via cookie refresh (HTTPOnly).",
        responses={
            200: openapi.Response(
                description="Nouveau token d’accès",
                examples={"application/json": {"access": "eyJ..."}}
            ),
            401: "Refresh token manquant ou invalide"
        }
    )
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
            samesite="Lax",
            path="/",
        )
        return res


class LogoutView(APIView):
    @swagger_auto_schema(
        operation_description="Déconnexion et suppression des cookies d’authentification.",
        responses={
            200: openapi.Response(
                description="Déconnexion réussie",
                examples={"application/json": {"detail": "Logout successful"}}
            )
        }
    )
    def post(self, request):
        response = Response({"detail": "Logout successful"}, status=status.HTTP_200_OK)

        response.delete_cookie("access", samesite="Lax")
        response.delete_cookie("refresh", samesite="Lax")

        return response

class MeView(APIView):
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_description="Récupération des informations de l’utilisateur connecté.",
        responses={
            200: openapi.Response(
                description="Informations utilisateur",
                examples={
                    "application/json": {
                        "id": 1,
                        "username": "jdoe",
                        "first_name": "John",
                        "last_name": "Doe",
                        "email": "jdoe@example.com",
                        "is_superuser": False,
                        "role": "client",
                    }
                }
            )
        }
    )
    def get(self, request):
        user = request.user

        return Response({
            "id": str(user.id),  # UUID → string
            "username": user.username,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "email": user.email,
            "phone": user.phone,
            "last_login": user.last_login,
            "is_superuser": user.is_superuser,
            "role": user.role,
        })

class ForgotPasswordView(APIView):
    @swagger_auto_schema(
        operation_description="Demande d’envoi d’un code OTP pour réinitialisation de mot de passe.",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=["email"],
            properties={
                "email": openapi.Schema(type=openapi.TYPE_STRING, format="email", example="user@example.com")
            }
        ),
        responses={
            200: openapi.Response(description="OTP envoyé",
                                  examples={"application/json": {"message": "OTP envoyé par email"}}),
            400: openapi.Response(description="Email non trouvé",
                                  examples={"application/json": {"message": "Email non trouvé"}})
        }
    )
    def post(self, request):
        email = request.data.get("email")

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"message": "Email non trouvé"}, status=400)

        code = f"{random.randint(100000, 999999)}"

        user.reset_code = code
        user.reset_code_expires_at = timezone.now() + timedelta(minutes=10)
        user.save()

        send_mail(
            "Votre code OTP",
            f"Votre code pour réinitialiser votre mot de passe est : {code}",
            "noreply@example.com",
            [email],
        )

        return Response({"message": "OTP envoyé par email"}, status=200)


class VerifyResetCodeView(APIView):
    @swagger_auto_schema(
        operation_description="Vérification du code OTP envoyé à l’email.",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=["email", "code"],
            properties={
                "email": openapi.Schema(type=openapi.TYPE_STRING, format="email", example="user@example.com"),
                "code": openapi.Schema(type=openapi.TYPE_STRING, example="123456")
            }
        ),
        responses={
            200: openapi.Response(
                description="Code validé avec reset_token renvoyé",
                examples={"application/json": {"message": "Code validé", "reset_token": "token_abcdef123"}}
            ),
            400: openapi.Response(description="Code ou email invalide", examples={
                "application/json": {"message": "Code invalide ou expiré"}
            }),
        }
    )
    def post(self, request):
        email = request.data.get("email")
        code = request.data.get("code")

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"message": "Email invalide"}, status=400)

        if not user.is_reset_code_valid(code):
            return Response({"message": "Code invalide ou expiré"}, status=400)

        reset_token = secrets.token_urlsafe(32)

        user.reset_password_token = reset_token
        user.save()

        return Response({
            "message": "Code validé",
            "reset_token": reset_token
        }, status=200)

class ResetPasswordView(APIView):
    @swagger_auto_schema(
        operation_description="Réinitialisation du mot de passe avec token et nouveaux mots de passe.",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=["reset_token", "password1", "password2"],
            properties={
                "reset_token": openapi.Schema(type=openapi.TYPE_STRING, example="token_abcdef123"),
                "password1": openapi.Schema(type=openapi.TYPE_STRING, format="password", example="NewPass123!"),
                "password2": openapi.Schema(type=openapi.TYPE_STRING, format="password", example="NewPass123!")
            }
        ),
        responses={
            200: openapi.Response(description="Mot de passe changé avec succès",
                                  examples={"application/json": {"message": "Mot de passe changé avec succès"}}),
            400: openapi.Response(description="Erreurs de validation", examples={
                "application/json": {"message": "Les mots de passe ne correspondent pas."}
            }),
        }
    )
    def post(self, request):
        reset_token = request.data.get('reset_token')
        new_password1 = request.data.get('password1')
        new_password2 = request.data.get('password2')

        if new_password1 != new_password2:
            return Response({"message": "Les mots de passe ne correspondent pas."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(reset_password_token=reset_token)
        except User.DoesNotExist:
            return Response({"message": "Token invalide"}, status=400)

        user.set_password(new_password1)

        user.reset_code = None
        user.reset_code_expires_at = None
        user.reset_password_token = None

        user.save()

        return Response({"message": "Mot de passe changé avec succès"})

class RegisterView(APIView):
    permission_classes = [AllowAny]

    @swagger_auto_schema(
        operation_description="Création d’un nouvel utilisateur.",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=["email", "password1", "password2"],
            properties={
                "first_name": openapi.Schema(type=openapi.TYPE_STRING, example="John"),
                "last_name": openapi.Schema(type=openapi.TYPE_STRING, example="Doe"),
                "email": openapi.Schema(type=openapi.TYPE_STRING, format="email", example="john@example.com"),
                "phone": openapi.Schema(type=openapi.TYPE_STRING, example="+33123456789"),
                "societe": openapi.Schema(type=openapi.TYPE_STRING, example="Ma Société"),
                "password1": openapi.Schema(type=openapi.TYPE_STRING, format="password", example="Pass1234!"),
                "password2": openapi.Schema(type=openapi.TYPE_STRING, format="password", example="Pass1234!"),
            }
        ),
        responses={
            201: openapi.Response(
                description="Utilisateur créé",
                examples={
                    "application/json": {
                        "message": "Utilisateur créé avec succès.",
                        "user": {
                            "id": 12,
                            "username": "john@example.com",
                            "email": "john@example.com",
                            "first_name": "John",
                            "last_name": "Doe",
                            "phone": "+33123456789",
                            "societe": "Ma Société"
                        }
                    }
                }
            ),
            400: openapi.Response(description="Erreur de validation", examples={
                "application/json": {"message": "Tous les champs sont obligatoires."}
            }),
        }
    )
    def post(self, request):
        data = request.data

        first_name = data.get("first_name")
        last_name = data.get("last_name")
        email = data.get("email")
        username = data.get("email")
        phone = data.get("phone")
        societe = data.get("societe")
        password = data.get("password1")
        password2 = data.get("password2")

        if not email or not password or not password2:
            return Response({"message": "Tous les champs sont obligatoires."}, status=status.HTTP_400_BAD_REQUEST)

        if password != password2:
            return Response({"message": "Les mots de passe ne correspondent pas."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            validate_email(email)
        except ValidationError:
            return Response({"message": "Adresse email invalide."}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(username=username).exists():
            return Response({"message": "Nom d’utilisateur déjà utilisé."}, status=status.HTTP_400_BAD_REQUEST)
        if User.objects.filter(email=email).exists():
            return Response({"message": "Adresse email déjà utilisée."}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.create_user(
            username=username,
            email=email,
            first_name=first_name,
            last_name=last_name,
            phone=phone,
            societe_name=societe,
            password=password,
            is_active=False,
        )

        return Response({
            "message": "Utilisateur créé avec succès.",
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "phone": user.phone,
                "societe": user.societe_name,
            }
        }, status=status.HTTP_201_CREATED)