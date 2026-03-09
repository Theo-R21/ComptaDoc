import datetime
import os
import uuid
from unittest.mock import MagicMock

from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase
from django.urls import reverse
from documents.models import SocieteDocument, TypeDocument
from documents.views import DocumentsViewSet
from rest_framework import status
from rest_framework.test import APIClient
from societe.models import Societe, SocieteMonth
from societe.views import ensure_company_months
from user.models import User, Role

from documents.serializers.document import DocumentsSerializer

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


def make_pdf_file(name="test.pdf"):
    return SimpleUploadedFile(name, b"%PDF-1.4 fake pdf content", content_type="application/pdf")


# ---------------------------------------------------------------------------
# DOCUMENTS BY MONTH  GET /documents/{pk}/months/{mois}/
# ---------------------------------------------------------------------------

class DocumentsByMonthTests(TestCase):

    def setUp(self):
        self.client = APIClient()
        self.comptable = make_comptable()
        self.client_user = make_client_user()
        self.societe = Societe.objects.create(nom="societe_doc", ID_SCTE="4444444444", user=self.client_user)
        ensure_company_months(self.societe)
        self.month = SocieteMonth.objects.get(societe=self.societe, year=datetime.datetime.now().year, month=1)
        self.type_doc = TypeDocument.objects.create(nom="Facture")
        self.url = reverse("documents-documents-by-month", kwargs={"pk": str(self.societe.pk), "mois": str(self.month.pk)})

    def test_list_documents_returns_200_for_comptable(self):
        self.client.force_authenticate(user=self.comptable)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_list_documents_returns_200_for_owner_client(self):
        self.client.force_authenticate(user=self.client_user)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_list_documents_forbidden_for_other_client(self):
        other_client = make_client_user(username="other", email="other@test.com")
        self.client.force_authenticate(user=other_client)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_list_documents_unknown_societe_raises_403(self):
        self.client.force_authenticate(user=self.comptable)
        url = reverse("documents-documents-by-month", kwargs={"pk": str(uuid.uuid4()), "mois": str(self.month.pk)})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_list_documents_unknown_month_raises_403(self):
        self.client.force_authenticate(user=self.comptable)
        url = reverse("documents-documents-by-month", kwargs={"pk": str(self.societe.pk), "mois": str(uuid.uuid4())})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_list_documents_filter_by_type(self):
        self.client.force_authenticate(user=self.comptable)
        response = self.client.get(self.url, {"type": str(self.type_doc.pk)})
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_list_documents_search_by_nom(self):
        self.client.force_authenticate(user=self.comptable)
        response = self.client.get(self.url, {"search": "facture"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_list_documents_returns_paginated_results(self):
        self.client.force_authenticate(user=self.comptable)
        response = self.client.get(self.url)
        self.assertIn("results", response.data)
        self.assertIn("count", response.data)

    def test_list_documents_returns_stats(self):
        self.client.force_authenticate(user=self.comptable)
        response = self.client.get(self.url)
        self.assertIn("stats", response.data)
        self.assertIn("total", response.data["stats"])

    def test_list_forbidden_for_anonymous(self):
        response = self.client.get(self.url)
        self.assertIn(response.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN])


# ---------------------------------------------------------------------------
# TYPE DOC  GET /documents/types/
# ---------------------------------------------------------------------------

class TypeDocTests(TestCase):

    def setUp(self):
        self.client = APIClient()
        self.comptable = make_comptable()
        self.client.force_authenticate(user=self.comptable)
        TypeDocument.objects.create(nom="Facture")
        TypeDocument.objects.create(nom="Contrat")
        self.url = reverse("documents-type-doc")

    def test_type_doc_returns_200(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_type_doc_returns_all_types(self):
        response = self.client.get(self.url)
        self.assertGreaterEqual(len(response.data), 2)

    def test_type_doc_forbidden_for_anonymous(self):
        self.client.force_authenticate(user=None)
        response = self.client.get(self.url)
        self.assertIn(response.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN])


# ---------------------------------------------------------------------------
# UPLOAD  POST /documents/upload/
# ---------------------------------------------------------------------------

class DocumentUploadTests(TestCase):

    def setUp(self):
        self.client = APIClient()
        self.comptable = make_comptable()
        self.client_user = make_client_user()
        self.societe = Societe.objects.create(nom="societe_upload", ID_SCTE="5555555555", user=self.client_user)
        ensure_company_months(self.societe)
        self.month = SocieteMonth.objects.get(societe=self.societe, year=datetime.datetime.now().year, month=1)
        self.type_doc = TypeDocument.objects.create(nom="Facture")
        self.client.force_authenticate(user=self.comptable)
        self.url = reverse("documents-upload-document")

    def test_upload_pdf_returns_201(self):
        data = {
            "nom": "facture_test",
            "societe": str(self.societe.pk),
            "mois": str(self.month.pk),
            "type": str(self.type_doc.pk),
            "path": make_pdf_file(),
        }
        response = self.client.post(self.url, data, format="multipart")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_upload_png_returns_201(self):
        data = {
            "nom": "image_test",
            "societe": str(self.societe.pk),
            "mois": str(self.month.pk),
            "type": str(self.type_doc.pk),
            "path": SimpleUploadedFile("image.png", b"\x89PNG fake", content_type="image/png"),
        }
        response = self.client.post(self.url, data, format="multipart")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_upload_jpeg_returns_201(self):
        data = {
            "nom": "photo_test",
            "societe": str(self.societe.pk),
            "mois": str(self.month.pk),
            "type": str(self.type_doc.pk),
            "path": SimpleUploadedFile("photo.jpg", b"\xff\xd8\xff fake", content_type="image/jpeg"),
        }
        response = self.client.post(self.url, data, format="multipart")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_upload_zip_returns_201(self):
        data = {
            "nom": "archive_test",
            "societe": str(self.societe.pk),
            "mois": str(self.month.pk),
            "type": str(self.type_doc.pk),
            "path": SimpleUploadedFile("archive.zip", b"PK fake zip", content_type="application/zip"),
        }
        response = self.client.post(self.url, data, format="multipart")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_upload_format_non_autorise_returns_400(self):
        data = {
            "nom": "virus_test",
            "societe": str(self.societe.pk),
            "mois": str(self.month.pk),
            "type": str(self.type_doc.pk),
            "path": SimpleUploadedFile("script.exe", b"MZ fake", content_type="application/octet-stream"),
        }
        response = self.client.post(self.url, data, format="multipart")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_upload_invalid_data_returns_400(self):
        response = self.client.post(self.url, {}, format="multipart")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_upload_forbidden_for_anonymous(self):
        self.client.force_authenticate(user=None)
        response = self.client.post(self.url, {}, format="multipart")
        self.assertIn(response.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN])


# ---------------------------------------------------------------------------
# DOWNLOAD  GET /documents/{pk}/download/
# ---------------------------------------------------------------------------

class DocumentDownloadTests(TestCase):

    def setUp(self):
        self.client = APIClient()
        self.comptable = make_comptable()
        self.client_user = make_client_user()
        self.societe = Societe.objects.create(nom="societe_dl", ID_SCTE="6666666666", user=self.client_user)
        ensure_company_months(self.societe)
        self.month = SocieteMonth.objects.get(societe=self.societe, year=datetime.datetime.now().year, month=1)
        self.type_doc = TypeDocument.objects.create(nom="Facture")
        self.document = SocieteDocument.objects.create(
            nom="doc_test",
            societe=self.societe,
            mois=self.month,
            type=self.type_doc,
            path=make_pdf_file(),
        )
        self.client.force_authenticate(user=self.comptable)
        self.url = reverse("documents-download", kwargs={"pk": str(self.document.pk)})

    def test_download_existing_document_returns_200(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response["Content-Type"], "application/pdf")

    def test_download_unknown_document_returns_404(self):
        url = reverse("documents-download", kwargs={"pk": str(uuid.uuid4())})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_download_forbidden_for_anonymous(self):
        self.client.force_authenticate(user=None)
        response = self.client.get(self.url)
        self.assertIn(response.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN])

    def test_download_verifie_content_disposition(self):
        response = self.client.get(self.url)
        self.assertIn("attachment", response.get("Content-Disposition", ""))

    def test_download_client_peut_telecharger_son_propre_document(self):
        self.client.force_authenticate(user=self.client_user)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_download_autre_client_ne_peut_pas_telecharger(self):
        other_client = make_client_user(username="other_dl", email="other_dl@test.com")
        self.client.force_authenticate(user=other_client)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

# ---------------------------------------------------------------------------
# DOWNLOAD MULTIPLE  POST /documents/download-multiple/
# ---------------------------------------------------------------------------

class DocumentDownloadMultipleTests(TestCase):

    def setUp(self):
        self.client = APIClient()
        self.comptable = make_comptable()
        self.client_user = make_client_user()
        self.societe = Societe.objects.create(nom="societe_dl_multi", ID_SCTE="7777777777", user=self.client_user)
        ensure_company_months(self.societe)
        self.month = SocieteMonth.objects.get(societe=self.societe, year=datetime.datetime.now().year, month=1)
        self.type_doc = TypeDocument.objects.create(nom="Facture")
        self.doc1 = SocieteDocument.objects.create(
            nom="doc1", societe=self.societe, mois=self.month, type=self.type_doc, path=make_pdf_file("doc1.pdf")
        )
        self.doc2 = SocieteDocument.objects.create(
            nom="doc2", societe=self.societe, mois=self.month, type=self.type_doc, path=make_pdf_file("doc2.pdf")
        )
        self.client.force_authenticate(user=self.comptable)
        self.url = reverse("documents-download-multiple")

    def test_download_multiple_returns_zip(self):
        response = self.client.post(self.url, {"ids": [self.doc1.pk, self.doc2.pk]}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response["Content-Type"], "application/zip")

    def test_download_multiple_empty_ids_returns_400(self):
        response = self.client.post(self.url, {"ids": []}, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_download_multiple_forbidden_for_anonymous(self):
        self.client.force_authenticate(user=None)
        response = self.client.post(self.url, {"ids": [self.doc1.pk]}, format="json")
        self.assertIn(response.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN])

class GetFormatSerializerTests(TestCase):

    def make_obj(self, filename: str):
        obj = MagicMock()
        obj.path.name = filename
        return obj

    def test_format_pdf(self):
        serializer = DocumentsSerializer()
        self.assertEqual(serializer.get_format(self.make_obj("document.pdf")), "PDF")

    def test_format_png(self):
        serializer = DocumentsSerializer()
        self.assertEqual(serializer.get_format(self.make_obj("image.png")), "PNG")

    def test_format_jpeg(self):
        serializer = DocumentsSerializer()
        self.assertEqual(serializer.get_format(self.make_obj("photo.jpeg")), "JPEG")

    def test_format_jpg(self):
        serializer = DocumentsSerializer()
        self.assertEqual(serializer.get_format(self.make_obj("photo.jpg")), "JPG")

    def test_format_zip(self):
        serializer = DocumentsSerializer()
        self.assertEqual(serializer.get_format(self.make_obj("archive.zip")), "ZIP")

    def test_format_sans_extension(self):
        serializer = DocumentsSerializer()
        self.assertEqual(serializer.get_format(self.make_obj("document_sans_extension")), "—")

    def test_format_plusieurs_points(self):
        """rsplit(".", 1) doit prendre uniquement la dernière extension"""
        serializer = DocumentsSerializer()
        self.assertEqual(serializer.get_format(self.make_obj("mon.document.2024.pdf")), "PDF")

    def test_format_majuscule(self):
        """L'extension doit toujours être en majuscule"""
        serializer = DocumentsSerializer()
        self.assertEqual(serializer.get_format(self.make_obj("document.PDF")), "PDF")
