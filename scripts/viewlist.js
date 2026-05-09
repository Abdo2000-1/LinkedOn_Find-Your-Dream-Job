let tabel = document.querySelector(".table");

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
        tabel.innerHTML += `<tr><td colspan="4">Cannot connect to Django server.</td></tr>`;
        return;
    }

    if (!response.ok || !data.ok) {
        tabel.innerHTML += `<tr><td colspan="4">${escapeHtml(data.error || "Could not load jobs.")}</td></tr>`;
        return;
    }

    if (!data.jobs.length) {
        tabel.innerHTML += `<tr><td colspan="4">No jobs available yet</td></tr>`;
        return;
    }

    data.jobs.forEach((part) => {
        tabel.innerHTML += `<tr>
            <td>${escapeHtml(part.jobTitle)}</td>
            <td>${escapeHtml(part.company)}</td>
            <td>${escapeHtml(part.location)}</td>
            <td>${escapeHtml(part.status)}</td>
        </tr>`;
    });
}

loadJobs();
