import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

os.environ.setdefault('DJANGO_SECRET_KEY', 'test-secret-key-not-for-production')
os.environ.setdefault('DJANGO_ALLOWED_HOSTS', 'localhost')
os.environ.setdefault('DB_NAME', 'test_db')
os.environ.setdefault('DB_USER', 'test_user')
os.environ.setdefault('DB_PASSWORD', 'test_password')
os.environ.setdefault('DB_HOST', 'localhost')
os.environ.setdefault('DB_PORT', '3306')
os.environ.setdefault('CORS_ALLOWED_ORIGINS', 'http://localhost:3000')
os.environ.setdefault('CSRF_TRUSTED_ORIGINS', 'http://localhost:3000')

from .settings import *

# Écrase la DB par SQLite en mémoire
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': ':memory:',
    }
}

class DisableMigrations:
    def __contains__(self, item):
        return True
    def __getitem__(self, item):
        return None

MIGRATION_MODULES = DisableMigrations()