DJANGO_SETTINGS_MODULE=core.settings_test python -m pytest -qfrom .settings import *

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