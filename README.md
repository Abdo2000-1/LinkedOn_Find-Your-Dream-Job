# Web-Technology-Assignment

LinkedOn Job Search Website - Phase 3 Django version.

## Run the project

```powershell
.\.venv\Scripts\python.exe manage.py migrate
.\.venv\Scripts\python.exe manage.py runserver 127.0.0.1:8001
```

Open `http://127.0.0.1:8001/start.html`.

Do not open the `.html` files directly from File Explorer, because the AJAX APIs need the Django server.

If you do not have the local virtual environment, install dependencies first:

```powershell
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

## Phase 3 features

- Django backend with SQLite database.
- Company admin signup/login and job create, edit, delete, and list APIs.
- User signup/login, job search/list/details, apply, and applied-jobs APIs.
- Existing frontend pages connected to the backend using AJAX.
