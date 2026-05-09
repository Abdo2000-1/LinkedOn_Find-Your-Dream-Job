let search = document.querySelector(".search-input");
let search_btn = document.querySelector(".search-btn");
let container = document.querySelector(".table-container");

function escapeHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

async function searchJobs() {
    let val = search.value.trim();
    let response;
    let data;

    try {
        response = await fetch(`/api/jobs/?q=${encodeURIComponent(val)}`);
        data = await response.json();
    } catch (error) {
        console.error(error);
        container.innerHTML = `<p>Cannot connect to Django server.</p>`;
        return;
    }

    container.innerHTML = "";

    if (!response.ok || !data.ok) {
        container.innerHTML = `<p>${escapeHtml(data.error || "Could not search jobs.")}</p>`;
        return;
    }

    let table = document.createElement("table");
    table.border = "1";

    table.innerHTML = `
        <thead>
            <tr>
                <th>Job Title</th>
                <th>Company</th>
                <th>Location</th>
                <th>Years</th>
                <th>Status</th>
                <th>Apply </th>
            </tr>
        </thead>
        <tbody></tbody>
    `;

    let tbody = table.querySelector("tbody");

    if (!data.jobs.length) {
        tbody.innerHTML = `<tr><td colspan="6">No matching jobs found</td></tr>`;
    }

    data.jobs.forEach(job => {
        tbody.innerHTML += `
            <tr>
                <td>${escapeHtml(job.jobTitle)}</td>
                <td>${escapeHtml(job.company)}</td>
                <td>${escapeHtml(job.location)}</td>
                <td>${escapeHtml(job.yearsExperience)}</td>
                <td>${escapeHtml(job.status)}</td>
                <td>${job.status === "open" ? `<a href="../pages/apply.html?jobId=${encodeURIComponent(job.id)}">Apply Now</a>` : "Closed"}</td>
            </tr>
        `;
    });

    container.appendChild(table);
}

search_btn.onclick = searchJobs;
search.addEventListener("keydown", function (event) {
    if (event.key === "Enter") searchJobs();
});
