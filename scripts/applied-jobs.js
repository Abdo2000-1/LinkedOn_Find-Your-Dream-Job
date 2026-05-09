const tbody = document.getElementById("jobs-table-body");

function escapeHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function renderTable(data) {
    tbody.innerHTML = "";

    if (!data.length) {
        tbody.innerHTML = `<tr><td colspan="4">No applications yet</td></tr>`;
        return;
    }

    data.forEach(app => {
        tbody.innerHTML += `
            <tr>
                <td>${escapeHtml(app.job)}</td>
                <td>${escapeHtml(app.company)}</td>
                <td>${escapeHtml(app.date)}</td>
                <td class="status-${escapeHtml(app.status.toLowerCase())}">
                    ${escapeHtml(app.status)}
                </td>
            </tr>
        `;
    });
}

async function loadApplications() {
    let response;
    let data;

    try {
        response = await fetch("/api/applications/");
        data = await response.json();
    } catch (error) {
        console.error(error);
        tbody.innerHTML = `<tr><td colspan="4">Cannot connect to Django server.</td></tr>`;
        return;
    }

    if (!response.ok || !data.ok) {
        tbody.innerHTML = `<tr><td colspan="4">${escapeHtml(data.error || "Could not load applications.")}</td></tr>`;
        return;
    }

    renderTable(data.applications);
}

loadApplications();
