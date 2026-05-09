"""ASGI config for LinkedOn."""
import os

from django.core.asgi import get_asgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "linkedon.settings")

application = get_asgi_application()
