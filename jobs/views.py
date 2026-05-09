import json
from decimal import Decimal, InvalidOperation

from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from django.db import IntegrityError
from django.db.models import Q
from django.http import JsonResponse
from django.shortcuts import get_object_or_404, render
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.views.static import serve

from .models import Application, Job, Profile


def html_page(request, page, prefix=""):
    template_name = f"{prefix}/{page}" if prefix else page
    return render(request, template_name)


def static_asset(request, folder, path):
    from django.conf import settings

    return serve(request, path, document_root=settings.BASE_DIR / folder)


def read_payload(request):
    if request.content_type and request.content_type.startswith("application/json"):
        try:
            return json.loads(request.body.decode("utf-8") or "{}")
        except json.JSONDecodeError:
            return {}
    return request.POST


def error(message, status=400):
    return JsonResponse({"ok": False, "error": message}, status=status)


def require_authenticated(request):
    if not request.user.is_authenticated:
        return error("Please login first.", status=401)
    return None


def require_admin(request):
    auth_error = require_authenticated(request)
    if auth_error:
        return auth_error

    profile = getattr(request.user, "profile", None)
    if not profile or profile.role != Profile.ADMIN:
        return error("Company admin permission is required.", status=403)
    return None


def serialize_user(user):
    profile = getattr(user, "profile", None)
    return {
        "id": user.id,
        "email": user.email,
        "username": user.username,
        "role": profile.role if profile else "user",
        "phone": profile.phone if profile else "",
        "company": profile.company_name if profile else "",
    }


def serialize_job(job):
    return {
        "id": job.id,
        "jobTitle": job.title,
        "title": job.title,
        "company": job.company,
        "location": job.location,
        "salary": str(job.salary).rstrip("0").rstrip("."),
        "status": job.status,
        "description": job.description,
        "yearsExperience": job.years_experience,
        "dateAdded": job.created_at.strftime("%Y-%m-%d"),
    }


def serialize_application(application):
    return {
        "id": application.id,
        "job": application.job.title,
        "jobId": application.job_id,
        "company": application.job.company,
        "date": application.created_at.strftime("%Y-%m-%d"),
        "status": application.status,
        "name": application.full_name,
        "email": application.email,
        "exp": application.years_experience,
    }


def parse_job_payload(payload, user):
    title = (payload.get("jobTitle") or payload.get("title") or "").strip()
    company = (payload.get("company") or getattr(user.profile, "company_name", "") or "").strip()
    location = (payload.get("location") or "").strip()
    salary_value = str(payload.get("salary") or "").strip()
    status = (payload.get("status") or Job.OPEN).strip().lower()
    description = (payload.get("description") or "").strip()
    years_value = str(payload.get("yearsExperience") or payload.get("years_experience") or "0").strip()

    if not title:
        raise ValueError("Job title is required.")
    if not company:
        raise ValueError("Company name is required.")
    if not location:
        raise ValueError("Location is required.")
    if status not in {Job.OPEN, Job.CLOSED}:
        raise ValueError("Job status must be open or closed.")

    try:
        salary = Decimal(salary_value)
    except (InvalidOperation, ValueError):
        raise ValueError("Salary must be a valid number.")
    if salary <= 0:
        raise ValueError("Salary must be greater than zero.")

    try:
        years_experience = int(years_value or 0)
    except ValueError:
        raise ValueError("Years of experience must be a valid number.")
    if years_experience < 0:
        raise ValueError("Years of experience cannot be negative.")

    return {
        "title": title,
        "company": company,
        "location": location,
        "salary": salary,
        "status": status,
        "description": description,
        "years_experience": years_experience,
    }


@require_http_methods(["GET"])
def session_view(request):
    if not request.user.is_authenticated:
        return JsonResponse({"ok": True, "authenticated": False})
    return JsonResponse({"ok": True, "authenticated": True, "user": serialize_user(request.user)})


@csrf_exempt
@require_http_methods(["POST"])
def signup_view(request):
    payload = read_payload(request)
    username = (payload.get("username") or "").strip()
    email = (payload.get("email") or "").strip().lower()
    password = payload.get("password") or ""
    confirm_password = payload.get("confirmPassword") or payload.get("confirm-password") or ""
    role = (payload.get("role") or "").strip()
    phone = (payload.get("phone") or "").strip()
    company = (payload.get("company") or "").strip()

    if not username:
        username = email
    if not email:
        return error("Email is required.")
    try:
        validate_email(email)
    except ValidationError:
        return error("Please enter a valid email address.")
    if len(password) < 6:
        return error("Password must be at least 6 characters.")
    if password != confirm_password:
        return error("Passwords do not match.")
    if role not in {Profile.USER, Profile.ADMIN}:
        return error("Please select User or Admin.")
    if role == Profile.ADMIN and not company:
        return error("Company name is required for company admins.")
    if User.objects.filter(username=username).exists():
        return error("This username is already registered.")
    if User.objects.filter(email=email).exists():
        return error("This email is already registered.")

    user = User.objects.create_user(username=username, email=email, password=password)
    Profile.objects.create(user=user, role=role, phone=phone, company_name=company if role == Profile.ADMIN else "")
    return JsonResponse({"ok": True, "user": serialize_user(user)}, status=201)


@csrf_exempt
@require_http_methods(["POST"])
def login_view(request):
    payload = read_payload(request)
    identifier = (payload.get("email") or payload.get("username") or "").strip()
    password = payload.get("password") or ""

    if not identifier or not password:
        return error("Please enter both username/email and password.")

    lookup = identifier.lower()
    account = User.objects.filter(Q(email__iexact=lookup) | Q(username__iexact=identifier)).first()
    user = authenticate(request, username=account.username if account else identifier, password=password)
    if user is None:
        return error("Invalid email or password.", status=401)

    login(request, user)
    return JsonResponse({"ok": True, "user": serialize_user(user)})


@csrf_exempt
@require_http_methods(["POST"])
def logout_view(request):
    logout(request)
    return JsonResponse({"ok": True})


@csrf_exempt
@require_http_methods(["GET", "POST"])
def jobs_view(request):
    if request.method == "GET":
        query = (request.GET.get("q") or "").strip()
        jobs = Job.objects.all()
        if query:
            filters = Q(title__icontains=query)
            if query.isdigit():
                filters |= Q(years_experience=int(query))
            jobs = jobs.filter(filters)
        return JsonResponse({"ok": True, "jobs": [serialize_job(job) for job in jobs]})

    admin_error = require_admin(request)
    if admin_error:
        return admin_error

    try:
        data = parse_job_payload(read_payload(request), request.user)
    except ValueError as exc:
        return error(str(exc))

    job = Job.objects.create(created_by=request.user, **data)
    return JsonResponse({"ok": True, "job": serialize_job(job)}, status=201)


@require_http_methods(["GET"])
def admin_jobs_view(request):
    admin_error = require_admin(request)
    if admin_error:
        return admin_error
    jobs = Job.objects.filter(created_by=request.user)
    return JsonResponse({"ok": True, "jobs": [serialize_job(job) for job in jobs]})


@csrf_exempt
@require_http_methods(["GET", "PUT", "DELETE"])
def job_detail_view(request, job_id):
    job = get_object_or_404(Job, id=job_id)

    if request.method == "GET":
        return JsonResponse({"ok": True, "job": serialize_job(job)})

    admin_error = require_admin(request)
    if admin_error:
        return admin_error
    if job.created_by_id != request.user.id:
        return error("You can only edit jobs created by your company account.", status=403)

    if request.method == "DELETE":
        job.delete()
        return JsonResponse({"ok": True})

    try:
        data = parse_job_payload(read_payload(request), request.user)
    except ValueError as exc:
        return error(str(exc))

    for key, value in data.items():
        setattr(job, key, value)
    job.save()
    return JsonResponse({"ok": True, "job": serialize_job(job)})


@csrf_exempt
@require_http_methods(["GET", "POST"])
def applications_view(request):
    auth_error = require_authenticated(request)
    if auth_error:
        return auth_error

    profile = getattr(request.user, "profile", None)
    if profile and profile.role == Profile.ADMIN:
        return error("Applications are available for user accounts only.", status=403)

    if request.method == "GET":
        applications = Application.objects.filter(user=request.user).select_related("job")
        return JsonResponse({"ok": True, "applications": [serialize_application(app) for app in applications]})

    payload = request.POST
    job_id = payload.get("jobId") or payload.get("job")
    full_name = (payload.get("name") or "").strip()
    email_value = (payload.get("email") or "").strip()
    exp_value = str(payload.get("exp") or "0").strip()
    cover_letter = (payload.get("coverLetter") or "").strip()
    resume = request.FILES.get("resume")

    if not full_name:
        return error("Full name is required.")
    try:
        validate_email(email_value)
    except ValidationError:
        return error("Please enter a valid email address.")
    try:
        years_experience = int(exp_value)
    except ValueError:
        return error("Years of experience must be a valid number.")
    if years_experience < 0:
        return error("Years of experience cannot be negative.")
    if not resume:
        return error("Resume file is required.")

    job = get_object_or_404(Job, id=job_id, status=Job.OPEN)
    try:
        application = Application.objects.create(
            user=request.user,
            job=job,
            full_name=full_name,
            email=email_value,
            years_experience=years_experience,
            cover_letter=cover_letter,
            resume_name=resume.name,
        )
    except IntegrityError:
        return error("You already applied for this job.")

    return JsonResponse({"ok": True, "application": serialize_application(application)}, status=201)
