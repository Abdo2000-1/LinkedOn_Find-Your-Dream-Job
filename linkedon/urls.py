from django.contrib import admin
from django.urls import include, path, re_path
from django.views.generic import RedirectView

from jobs import views

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("jobs.urls")),
    path("", RedirectView.as_view(url="/start.html", permanent=False)),
    re_path(r"^(?P<page>(start|home|homeAdmin|homeUser)\.html)$", views.html_page),
    re_path(r"^pages/(?P<page>[-\w]+\.html)$", views.html_page, {"prefix": "pages"}),
    re_path(r"^(?P<folder>styles|scripts|images)/(?P<path>.*)$", views.static_asset),
]
