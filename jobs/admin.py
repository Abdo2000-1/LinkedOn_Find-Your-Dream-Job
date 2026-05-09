from django.contrib import admin

from .models import Application, Job, Profile


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "role", "company_name", "phone")
    search_fields = ("user__username", "user__email", "company_name")


@admin.register(Job)
class JobAdmin(admin.ModelAdmin):
    list_display = ("title", "company", "status", "years_experience", "created_by", "created_at")
    list_filter = ("status", "company")
    search_fields = ("title", "company", "description")


@admin.register(Application)
class ApplicationAdmin(admin.ModelAdmin):
    list_display = ("full_name", "email", "job", "status", "created_at")
    list_filter = ("status", "job__company")
    search_fields = ("full_name", "email", "job__title")
