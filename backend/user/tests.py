import os
import uuid

from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from societe.models import Societe
from user.models import User, Role
from user.views import UserViewSet

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings_test")

def make_comptable(**kwargs):
    user = User.objects.create_user(
        username=kwargs.get("username", "comptable"),
        email=kwargs.get("email", "comptable@test.com"),
        password=kwargs.get("password", "password123"),
        is_active=True,
    )
    role, _ = Role.objects.get_or_create(name="comptable")
    user.roles.add(role)
    return user


def make_client_user(**kwargs):
    user = User.objects.create_user(
        username=kwargs.get("username", "client"),
        email=kwargs.get("email", "client@test.com"),
        password=kwargs.get("password", "password123"),
        is_active=True,
    )
    role, _ = Role.objects.get_or_create(name="client")
    user.roles.add(role)
    return user

class UserListTests(TestCase):

    def setUp(self):
        self.client = APIClient()
        self.comptable = make_comptable()
        self.client.force_authenticate(user=self.comptable)
        self.url = reverse("user-list")

    def test_list_returns_200_for_comptable(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_list_returns_paginated_results(self):
        for i in range(15):
            User.objects.create_user(username=f"user{i}", password="pass")
        response = self.client.get(self.url)
        self.assertIn("results", response.data)
        self.assertIn("count", response.data)

    def test_list_search_by_username(self):
        User.objects.create_user(username="dupont_search", password="pass")
        response = self.client.get(self.url, {"search": "dupont_search"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        usernames = [u["username"] for u in response.data["results"]]
        self.assertIn("dupont_search", usernames)

    def test_list_forbidden_for_anonymous(self):
        self.client.force_authenticate(user=None)
        response = self.client.get(self.url)
        self.assertIn(response.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN])

    def test_list_forbidden_for_client(self):
        self.client.force_authenticate(user=make_client_user())
        response = self.client.get(self.url)
        self.assertIn(response.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN])


class UserRetrieveTests(TestCase):

    def setUp(self):
        self.client = APIClient()
        self.comptable = make_comptable()
        self.client.force_authenticate(user=self.comptable)
        self.target = User.objects.create_user(username="target", password="pass")
        self.url = reverse("user-detail", kwargs={"pk": str(self.target.pk)})

    def test_retrieve_existing_user_returns_200(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["username"], self.target.username)

    def test_retrieve_includes_societes(self):
        Societe.objects.create(user=self.target, nom="Société A")
        response = self.client.get(self.url)
        self.assertIn("societes", response.data)

    def test_retrieve_unknown_user_returns_404(self):
        url = reverse("user-detail", kwargs={"pk": str(uuid.uuid4())})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


class UserCreateTests(TestCase):

    def setUp(self):
        self.client = APIClient()
        self.url = reverse("user-list")

    def test_create_user_returns_201(self):
        data = {
            "first_name": "ADMIN",
            "last_name": "user",
            "email": "newuser@test.com",
            "phone": "0707070707",
            "password": "StrongPass123!",
            "password2": "StrongPass123!",
            "roles": "cllient",
        }
        response = self.client.post(self.url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_create_user_without_required_fields_returns_400(self):
        response = self.client.post(self.url, {}, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_user_with_duplicate_username_returns_400(self):
        User.objects.create_user(username="existing", password="pass")
        data = {
            "username": "existing",
            "email": "other@test.com",
            "password1": "StrongPass123!",
            "password2": "StrongPass123!",
        }
        response = self.client.post(self.url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_accessible_without_authentication(self):
        """L'endpoint create doit être public (AllowAny)."""
        self.client.force_authenticate(user=None)
        data = {
            "username": "publicuser",
            "email": "pub@test.com",
            "password1": "StrongPass123!",
            "password2": "StrongPass123!",
        }
        response = self.client.post(self.url, data, format="json")
        self.assertNotIn(response.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN])


class UserUpdateTests(TestCase):

    def setUp(self):
        self.client = APIClient()
        self.user = make_client_user()
        self.client.force_authenticate(user=self.user)
        self.url = reverse("user-detail", kwargs={"pk": str(self.user.pk)})

    def test_update_own_user_returns_200(self):
        response = self.client.put(self.url, {"first_name": "Jean"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_update_unknown_user_returns_404(self):
        url = reverse("user-detail", kwargs={"pk": str(uuid.uuid4())})
        response = self.client.put(url, {"first_name": "Jean"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_update_with_invalid_email_returns_400(self):
        response = self.client.put(self.url, {"email": "not-an-email"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

class UserDestroyTests(TestCase):

    def setUp(self):
        self.client = APIClient()
        self.comptable = make_comptable()
        self.client.force_authenticate(user=self.comptable)

    def test_destroy_existing_user_returns_204(self):
        target = User.objects.create_user(username="todelete", password="pass")
        url = reverse("user-detail", kwargs={"pk": target.pk})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(User.objects.filter(pk=target.pk).exists())

    def test_destroy_unknown_user_returns_404(self):
        url = reverse("user-detail", kwargs={"pk": str(uuid.uuid4())})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_destroy_forbidden_for_anonymous(self):
        target = User.objects.create_user(username="todelete2", password="pass")
        url = reverse("user-detail", kwargs={"pk": target.pk})
        self.client.force_authenticate(user=None)
        response = self.client.delete(url)
        self.assertIn(response.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN])

class UserToggleActifTests(TestCase):

    def setUp(self):
        self.client = APIClient()
        self.comptable = make_comptable()
        self.client.force_authenticate(user=self.comptable)
        self.target = User.objects.create_user(username="toggled", password="pass", is_active=True)
        self.url = reverse("user-toggle-actif", kwargs={"pk": self.target.pk})

    def test_deactivate_user(self):
        response = self.client.patch(self.url, {"actif": False}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.target.refresh_from_db()
        self.assertFalse(self.target.is_active)

    def test_activate_user(self):
        self.target.is_active = False
        self.target.save()
        response = self.client.patch(self.url, {"actif": True}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.target.refresh_from_db()
        self.assertTrue(self.target.is_active)

    def test_missing_actif_field_returns_400(self):
        response = self.client.patch(self.url, {}, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("actif", response.data["detail"])

    def test_unknown_user_returns_404(self):
        url = reverse("user-toggle-actif", kwargs={"pk": str(uuid.uuid4())})
        response = self.client.patch(url, {"actif": True}, format="json")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_forbidden_for_non_comptable(self):
        self.client.force_authenticate(user=make_client_user(username="c2", email="c2@test.com"))
        response = self.client.patch(self.url, {"actif": False}, format="json")
        self.assertIn(response.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN])


class UserListRolesTests(TestCase):

    def setUp(self):
        self.client = APIClient()
        self.comptable = make_comptable()
        self.client.force_authenticate(user=self.comptable)
        self.url = reverse("user-list-roles")

    def test_list_roles_returns_200(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_list_roles_returns_all_roles(self):
        Role.objects.get_or_create(name="admin")
        Role.objects.get_or_create(name="client")
        response = self.client.get(self.url)
        self.assertIsInstance(response.data, list)
        self.assertGreaterEqual(len(response.data), 1)

    def test_list_roles_forbidden_for_anonymous(self):
        self.client.force_authenticate(user=None)
        response = self.client.get(self.url)
        self.assertIn(response.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN])

    def test_list_roles_forbidden_for_client(self):
        self.client.force_authenticate(user=make_client_user(username="c3", email="c3@test.com"))
        response = self.client.get(self.url)
        self.assertIn(response.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN])


class ChangePasswordTests(TestCase):

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="passuser",
            email="pass@test.com",
            password="OldPassword123!",
            is_active=True,
        )
        self.client.force_authenticate(user=self.user)
        self.url = reverse("user-change-password")

    def test_change_password_success(self):
        data = {
            "current_password": "OldPassword123!",
            "password1": "NewPassword456!",
            "password2": "NewPassword456!",
        }
        response = self.client.post(self.url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("message", response.data)

    def test_change_password_mismatch_returns_400(self):
        data = {
            "current_password": "OldPassword123!",
            "password1": "NewPassword456!",
            "password2": "DifferentPassword789!",
        }
        response = self.client.post(self.url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_change_password_wrong_old_password_returns_400(self):
        data = {
            "current_password": "WrongOldPassword!",
            "password1": "NewPassword456!",
            "password2": "NewPassword456!",
        }
        response = self.client.post(self.url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_change_password_forbidden_for_anonymous(self):
        self.client.force_authenticate(user=None)
        response = self.client.post(self.url, {}, format="json")
        self.assertIn(response.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN])