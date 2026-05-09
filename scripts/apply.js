let box = document.getElementById("uploadBox");
let input = document.getElementById("fileInput");
let titles = document.querySelector("#jobTitle");

function escapeHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

async function loadJobs() {
    let response;
    let data;

    try {
        response = await fetch("/api/jobs/");
        data = await response.json();
    } catch (error) {
        console.error(error);
        alert("Cannot connect to Django server. Run: .\\.venv\\Scripts\\python.exe manage.py runserver 127.0.0.1:8001 then open http://127.0.0.1:8001/start.html");
        return;
    }

    if (!response.ok || !data.ok) {
        alert(data.error || "Could not load jobs.");
        return;
    }

    titles.innerHTML = `<option value="">Select a job</option>`;
    data.jobs
        .filter(job => job.status === "open")
        .forEach((part) => {
            titles.innerHTML += `<option value="${part.id}">${escapeHtml(part.jobTitle)}</option>`;
        });

    const urlParams = new URLSearchParams(window.location.search);
    const selectedJobId = urlParams.get('jobId');
    const selectedJobTitle = urlParams.get('job');

    if (selectedJobId) {
        titles.value = selectedJobId;
    } else if (selectedJobTitle) {
        const match = data.jobs.find(job => job.jobTitle === selectedJobTitle);
        if (match) titles.value = match.id;
    }
}

loadJobs();

box.addEventListener("click", () => {
    input.click();
});

input.addEventListener("change", () => {
    let file = input.files[0];
    if (file) {
        box.innerHTML = `<p style="color: #2da7c9; font-weight: bold;">Selected: ${escapeHtml(file.name)}</p>`;
    }
});

box.addEventListener("dragover", (e) => {
    e.preventDefault();
    box.style.borderColor = "#2da7c9";
});

box.addEventListener("dragleave", () => {
    box.style.borderColor = "#ccc";
});

box.addEventListener("drop", (e) => {
    e.preventDefault();

    let file = e.dataTransfer.files[0];
    input.files = e.dataTransfer.files;

    if (file) {
        box.innerHTML = `<p style="color: #2da7c9; font-weight: bold;">Selected: ${escapeHtml(file.name)}</p>`;
    }
});

function handleSubmit(e) {
    e.preventDefault();

    let name = document.getElementById("fullName").value.trim();
    let email = document.getElementById("email").value.trim();
    let job = document.getElementById("jobTitle").value;
    let exp = document.getElementById("experience").value;
    let file = input.files[0];

    let valid = true;

    if (name === "") {
        showError("name-error");
        valid = false;
    } else hideError("name-error");

    if (!email.includes("@")) {
        showError("email-error");
        valid = false;
    } else hideError("email-error");

    if (job === "") {
        showError("job-error");
        valid = false;
    } else hideError("job-error");

    if (exp === "" || exp < 0) {
        showError("exp-error");
        valid = false;
    } else hideError("exp-error");

    if (!file) {
        showError("file-error");
        valid = false;
    } else {
        hideError("file-error");
    }

    if (valid) {
        saveApplication(job, name, email, exp);
    }
}

function showError(id) {
    let el = document.getElementById(id);
    if (el) el.style.display = "block";
}

function hideError(id) {
    let el = document.getElementById(id);
    if (el) el.style.display = "none";
}

async function saveApplication(jobId, name, email, exp) {
    const formData = new FormData();
    formData.append("jobId", jobId);
    formData.append("name", name);
    formData.append("email", email);
    formData.append("exp", exp);
    formData.append("coverLetter", document.getElementById("coverLetter").value);
    formData.append("resume", input.files[0]);

    let response;
    let result;

    try {
        response = await fetch("/api/applications/", {
            method: "POST",
            body: formData
        });
        result = await response.json();
    } catch (error) {
        console.error(error);
        alert("Cannot connect to Django server. Run: .\\.venv\\Scripts\\python.exe manage.py runserver 127.0.0.1:8001 then open http://127.0.0.1:8001/start.html");
        return;
    }

    if (!response.ok || !result.ok) {
        alert(result.error || "Could not submit application.");
        return;
    }

    let submitBtn = document.querySelector(".submit-btn");
    submitBtn.innerText = "Applied Successfully! Redirecting...";
    submitBtn.style.backgroundColor = "#28a745";
    submitBtn.disabled = true;
    submitBtn.style.cursor = "not-allowed";
    setTimeout(() => {
        window.location.href = "applied-jobs.html";
    }, 2000);
}
