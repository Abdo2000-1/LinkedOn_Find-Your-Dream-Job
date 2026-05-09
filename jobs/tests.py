from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase

from .models import Application, Job


class LinkedOnApiTests(TestCase):
    def signup(self, email, role, company=""):
        response = self.client.post(
            "/api/signup/",
            {
                "email": email,
                "username": email.split("@")[0],
                "password": "secret123",
                "confirmPassword": "secret123",
                "role": role,
                "phone": "01000000000",
                "company": company,
            },
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 201)

    def login(self, email):
        response = self.client.post(
            "/api/login/",
            {"email": email, "password": "secret123"},
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 200)

    def test_login_accepts_username(self):
        self.signup("named@example.com", "user")
        response = self.client.post(
            "/api/login/",
            {"email": "named", "password": "secret123"},
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 200)

    def test_full_admin_and_user_flow(self):
        self.signup("admin@example.com", "admin", "LinkedOn")
        self.login("admin@example.com")

        response = self.client.post(
            "/api/jobs/",
            {
                "jobTitle": "Backend Developer",
                "company": "LinkedOn",
                "location": "Cairo",
                "salary": "25000",
                "status": "open",
                "description": "Build Django APIs.",
                "yearsExperience": "2",
            },
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 201)
        job_id = response.json()["job"]["id"]
        self.assertEqual(Job.objects.count(), 1)

        response = self.client.get("/api/jobs/?q=Backend")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()["jobs"]), 1)

        response = self.client.put(
            f"/api/jobs/{job_id}/",
            {
                "jobTitle": "Senior Backend Developer",
                "company": "LinkedOn",
                "location": "Giza",
                "salary": "30000",
                "status": "open",
                "description": "Build and maintain Django APIs.",
                "yearsExperience": "3",
            },
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["job"]["yearsExperience"], 3)

        self.client.post("/api/logout/")
        self.signup("user@example.com", "user")
        self.login("user@example.com")

        response = self.client.post(
            "/api/applications/",
            {
                "jobId": str(job_id),
                "name": "Test User",
                "email": "user@example.com",
                "exp": "3",
                "resume": SimpleUploadedFile("resume.pdf", b"fake pdf", content_type="application/pdf"),
            },
        )
        self.assertEqual(response.status_code, 201)
        self.assertEqual(Application.objects.count(), 1)

        response = self.client.get("/api/applications/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["applications"][0]["job"], "Senior Backend Developer")
