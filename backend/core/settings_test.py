from .settings import *


os.environ.setdefault('DJANGO_ALLOWED_HOSTS', 'localhost')
os.environ.setdefault('DJANGO_SECRET_KEY', 'test-secret-key-not-for-production')
os.environ.setdefault('DATABASE_URL', 'sqlite://:memory:')
os.environ.setdefault('CORS_ALLOWED_ORIGINS', 'http://localhost:3000')
os.environ.setdefault('CSRF_TRUSTED_ORIGINS', 'http://localhost:3000')

# Override de la base de données pour les tests
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': ':memory:',
    }
}

# Désactive les variables d'env obligatoires
SECRET_KEY = 'test-secret-key-not-for-production'
DEBUG = True
ALLOWED_HOSTS = ['*']