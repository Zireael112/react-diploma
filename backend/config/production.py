import os
from dotenv import load_dotenv
from .base import *

load_dotenv()

DEBUG = False

ALLOWED_HOSTS = []

SECURE_CROSS_ORIGIN_OPENER_POLICY = None

WSGI_APPLICATION = "webstorage.wsgi.application"

SECRET_KEY = os.getenv("SECRET_KEY")

# basic static folder of the project
STATIC_URL = "static/"
# for collection of additional static files into static folder of the project
STATICFILES_DIRS = [os.path.join(BASE_DIR, "build/static")]
# MAIN STATIC FILE to be served BY NGINX!
STATIC_ROOT = "/var/www/html/static"

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": os.getenv("DB_NAME"),
        "USER": os.getenv("DB_USER"),
        "PASSWORD": os.getenv("DB_PASSWORD"),
        "HOST": "localhost",
    }
}
