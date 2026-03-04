import datetime
import os
import uuid

from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient, APIRequestFactory, force_authenticate

from user.models import User, Role
from societe.models import Societe, SocieteMonth
from societe.views import SocieteViewSet, ensure_company_months

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings_test")


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

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


# ---------------------------------------------------------------------------
# LIST  GET /societe/
# ---------------------------------------------------------------------------

class SocieteListTests(TestCase):

    def setUp(self):
        self.client = APIClient()
        self.comptable = make_comptable()
        self.client.force_authenticate(user=self.comptable)
        self.url = reverse("societe-list")

    def test_list_all_returns_200_for_comptable(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_list_self_returns_200_for_client(self):
        self.client.force_authenticate(user=make_client_user())
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_list_returns_paginated_results(self):
        for i in range(15):
            Societe.objects.create(nom=f"societe{i}", ID_SCTE=f"{i}", user=self.comptable)
        response = self.client.get(self.url)
        self.assertIn("results", response.data)
        self.assertIn("count", response.data)

    def test_list_search_by_nom(self):
        Societe.objects.create(nom="societe_dupont", ID_SCTE="1111111111", user=self.comptable)
        response = self.client.get(self.url, {"search": "societe_dupont"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        name = [u["nom"] for u in response.data["results"]]
        self.assertIn("societe_dupont", name)

    def test_list_forbidden_for_anonymous(self):
        self.client.force_authenticate(user=None)
        response = self.client.get(self.url)
        self.assertIn(response.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN])


# ---------------------------------------------------------------------------
# RETRIEVE  GET /societe/{pk}/
# ---------------------------------------------------------------------------

class SocieteRetrieveTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.comptable = make_comptable()
        self.client.force_authenticate(user=self.comptable)
        self.target = Societe.objects.create(nom="societe_dupont", ID_SCTE="1111111111", user=self.comptable)
        self.url = reverse("societe-detail", kwargs={"pk": str(self.target.pk)})

    def test_retrieve_existing_societe_returns_200(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["ID_SCTE"], self.target.ID_SCTE)

    def test_retrieve_unknown_societe_returns_404(self):
        url = reverse("societe-detail", kwargs={"pk": str(uuid.uuid4())})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


# ---------------------------------------------------------------------------
# CREATE  POST /societe/
# ---------------------------------------------------------------------------

class SocieteCreateTests(TestCase):

    def setUp(self):
        self.client = APIClient()
        self.comptable = make_comptable()
        self.client.force_authenticate(user=self.comptable)
        self.url = reverse("societe-list")

    def test_create_societe_returns_201(self):
        data = {
            "nom": "societe_dupont",
            "ID_SCTE": "1111111111",
            "user_id": self.comptable.id,
        }
        response = self.client.post(self.url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_create_societe_invalid_data_returns_400(self):
        response = self.client.post(self.url, {}, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_forbidden_for_client(self):
        self.client.force_authenticate(user=make_client_user(username="c2", email="c2@test.com"))
        response = self.client.post(self.url, {
            "nom": "societe_dupont",
            "ID_SCTE": "1111111111",
            "user_id": self.comptable.id,
        }, format="json")
        self.assertIn(response.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN])

# ---------------------------------------------------------------------------
# UPDATE  PATCH /societe/{pk}/
# ---------------------------------------------------------------------------

class SocieteUpdateTests(TestCase):

    def setUp(self):
        self.client = APIClient()
        self.comptable = make_comptable()
        self.client_user = make_client_user()
        self.client.force_authenticate(user=self.comptable)
        self.target = Societe.objects.create(nom="societe_dupont", ID_SCTE="1111111111", user=self.comptable)
        ensure_company_months(self.target)
        self.url = reverse("societe-detail", kwargs={"pk": str(self.target.pk)})

    def test_partial_update_returns_200(self):
        response = self.client.patch(self.url, {"nom": "societe_bois"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_partial_update_unknown_societe_returns_404(self):
        url = reverse("societe-detail", kwargs={"pk": str(uuid.uuid4())})
        response = self.client.patch(url, {"nom": "societe_bois"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_update_month_by_comptable_returns_200(self):
        month = SocieteMonth.objects.get(societe=self.target, year=datetime.datetime.now().year, month=1)
        url = reverse("societe-update-month", kwargs={"pk": str(self.target.pk), "month": 1})
        response = self.client.patch(url, {"status": "CLOSED"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        month.refresh_from_db()
        self.assertEqual(month.status, "CLOSED")

    # def test_update_month_locked_returns_403(self):
    #     month = SocieteMonth.objects.get(societe=self.target, year=datetime.datetime.now().year, month=1)
    #     month.status = "LOCKED"
    #     month.save()
    #     url = reverse("societe-update-month", kwargs={"pk": str(self.target.pk), "month": 1})
    #     response = self.client.patch(url, {"status": "OPEN"}, format="json")
    #     self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_update_month_forbidden_for_client(self):
        self.client.force_authenticate(user=make_client_user(username="c2", email="c2@test.com"))
        url = reverse("societe-update-month", kwargs={"pk": str(self.target.pk), "month": 1})
        response = self.client.patch(url, {"status": "CLOSED"}, format="json")
        self.assertIn(response.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN])

# ---------------------------------------------------------------------------
# DELETE  DELETE /societe/{pk}/
# ---------------------------------------------------------------------------

class SocieteDeleteTests(TestCase):

    def setUp(self):
        self.client = APIClient()
        self.comptable = make_comptable()
        self.client.force_authenticate(user=self.comptable)

    def test_destroy_existing_societe_returns_204(self):
        target = Societe.objects.create(nom="todelete", ID_SCTE="111111", user=self.comptable)
        url = reverse("societe-detail", kwargs={"pk": target.pk})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Societe.objects.filter(pk=target.pk).exists())

    def test_destroy_unknown_societe_returns_404(self):
        url = reverse("societe-detail", kwargs={"pk": str(uuid.uuid4())})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_destroy_forbidden_for_client(self):
        target = Societe.objects.create(nom="todelete", ID_SCTE="111111", user=self.comptable)
        self.client.force_authenticate(user=make_client_user(username="c2", email="c2@test.com"))
        url = reverse("societe-detail", kwargs={"pk": target.pk})
        response = self.client.delete(url)
        self.assertIn(response.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN])


# ---------------------------------------------------------------------------
# MONTHS  GET /societe/{societe_id}/months/
# ---------------------------------------------------------------------------

class SocieteMonthTests(TestCase):

    def setUp(self):
        self.client = APIClient()
        self.comptable = make_comptable()
        self.client_user = make_client_user()
        self.client.force_authenticate(user=self.comptable)
        self.societe = Societe.objects.create(nom="societe_test", ID_SCTE="2222222222", user=self.client_user)
        ensure_company_months(self.societe)
        self.month = SocieteMonth.objects.get(societe=self.societe, year=datetime.datetime.now().year, month=1)
        self.url = reverse("societe-months", kwargs={"societe_id": str(self.societe.pk)})

    def test_months_returns_200(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_months_filter_by_status_open(self):
        response = self.client.get(self.url, {"status": "OPEN"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        for month in response.data:
            self.assertEqual(month["status"], "OPEN")

    def test_months_filter_by_status_closed(self):
        self.month.status = "CLOSED"
        self.month.save()
        response = self.client.get(self.url, {"status": "CLOSED"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        for month in response.data:
            self.assertEqual(month["status"], "CLOSED")

    def test_months_unknown_societe_raises_403(self):
        url = reverse("societe-months", kwargs={"societe_id": str(uuid.uuid4())})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_months_client_without_access_raises_403(self):
        other_client = make_client_user(username="other_client", email="other@test.com")
        self.client.force_authenticate(user=other_client)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


# ---------------------------------------------------------------------------
# YEARS  GET /societe/{societe_id}/year/
# ---------------------------------------------------------------------------

class SocieteYearsTests(TestCase):

    def setUp(self):
        self.client = APIClient()
        self.comptable = make_comptable()
        self.client.force_authenticate(user=self.comptable)
        self.societe = Societe.objects.create(nom="societe_years", ID_SCTE="3333333333", user=self.comptable)
        ensure_company_months(self.societe, year=2024)
        ensure_company_months(self.societe, year=2025)
        self.url = reverse("societe-years", kwargs={"societe_id": str(self.societe.pk)})

    def test_years_returns_200(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_years_returns_distinct_years(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        years = list(response.data)
        self.assertIn(2024, years)
        self.assertIn(2025, years)
        self.assertEqual(len(years), len(set(years)))  # pas de doublons