from django.urls import path

from . import views

urlpatterns = [
    path("session/", views.session_view, name="api-session"),
    path("signup/", views.signup_view, name="api-signup"),
    path("login/", views.login_view, name="api-login"),
    path("logout/", views.logout_view, name="api-logout"),
    path("jobs/", views.jobs_view, name="api-jobs"),
    path("admin/jobs/", views.admin_jobs_view, name="api-admin-jobs"),
    path("jobs/<int:job_id>/", views.job_detail_view, name="api-job-detail"),
    path("applications/", views.applications_view, name="api-applications"),
]
