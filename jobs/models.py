from django.conf import settings
from django.db import models


class Profile(models.Model):
    USER = "user"
    ADMIN = "admin"
    ROLE_CHOICES = [
        (USER, "User"),
        (ADMIN, "Company Admin"),
    ]

    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="profile")
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)
    phone = models.CharField(max_length=30, blank=True)
    company_name = models.CharField(max_length=120, blank=True)

    def __str__(self):
        return f"{self.user.email} ({self.role})"


class Job(models.Model):
    OPEN = "open"
    CLOSED = "closed"
    STATUS_CHOICES = [
        (OPEN, "Open"),
        (CLOSED, "Closed"),
    ]

    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="created_jobs")
    title = models.CharField(max_length=150)
    company = models.CharField(max_length=120)
    location = models.CharField(max_length=120)
    salary = models.DecimalField(max_digits=12, decimal_places=2)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default=OPEN)
    description = models.TextField(blank=True)
    years_experience = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.title} at {self.company}"


class Application(models.Model):
    PENDING = "Pending"
    STATUS_CHOICES = [
        (PENDING, "Pending"),
        ("Accepted", "Accepted"),
        ("Rejected", "Rejected"),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="applications")
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name="applications")
    full_name = models.CharField(max_length=120)
    email = models.EmailField()
    years_experience = models.PositiveIntegerField(default=0)
    cover_letter = models.TextField(blank=True)
    resume_name = models.CharField(max_length=255, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=PENDING)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        constraints = [
            models.UniqueConstraint(fields=["user", "job"], name="unique_user_job_application"),
        ]

    def __str__(self):
        return f"{self.full_name} - {self.job.title}"
