let jobs = [];
let tableBody = document.getElementById("jobTableBody");

function escapeHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

async function apiRequest(url, options = {}) {
    const response = await fetch(url, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(options.headers || {})
        }
    });
    const data = await response.json();
    if (!response.ok || !data.ok) {
        throw new Error(data.error || "Request failed.");
    }
    return data;
}

function updateStats() {
    const cards = document.querySelectorAll(".card h2");
    if (cards[0]) cards[0].textContent = jobs.length;
    if (cards[2]) cards[2].textContent = jobs.filter(job => job.status === "open").length;
}

function renderJobs() {
    tableBody.innerHTML = "";
    updateStats();

    if (!jobs.length) {
        tableBody.innerHTML = `<tr><td colspan="6">No jobs created yet</td></tr>`;
        return;
    }

    jobs.forEach((job) => {
        let row = document.createElement("tr");

        row.innerHTML = `
            <td>${escapeHtml(job.jobTitle)}</td>
            <td>${escapeHtml(job.company)}</td>
            <td>${escapeHtml(job.location)}</td>
            <td>$${escapeHtml(job.salary)}</td>
            <td>${escapeHtml(job.status)}</td>
            <td>
                <button class="edit-btn">Edit</button>
                <button class="delete-btn">Delete</button>
            </td>
        `;

        row.querySelector(".delete-btn").addEventListener("click", async () => {
            if (!confirm("Are you sure?")) return;

            try {
                await apiRequest(`/api/jobs/${job.id}/`, { method: "DELETE", headers: {} });
                jobs = jobs.filter(item => item.id !== job.id);
                renderJobs();
            } catch (err) {
                alert(err.message);
            }
        });

        row.querySelector(".edit-btn").addEventListener("click", async function () {
            let cells = row.children;

            if (!this.classList.contains("editing")) {
                cells[0].innerHTML = `<input value="${escapeHtml(job.jobTitle)}">`;
                cells[1].innerHTML = `<input value="${escapeHtml(job.company)}">`;
                cells[2].innerHTML = `<input value="${escapeHtml(job.location)}">`;
                cells[3].innerHTML = `<input type="number" value="${escapeHtml(job.salary)}">`;
                cells[4].innerHTML = `
                    <select>
                        <option value="open" ${job.status === "open" ? "selected" : ""}>Open</option>
                        <option value="closed" ${job.status === "closed" ? "selected" : ""}>Closed</option>
                    </select>
                `;

                this.classList.add("editing");
                this.textContent = "Save";
                return;
            }

            const payload = {
                jobTitle: cells[0].querySelector("input").value.trim(),
                company: cells[1].querySelector("input").value.trim(),
                location: cells[2].querySelector("input").value.trim(),
                salary: cells[3].querySelector("input").value,
                status: cells[4].querySelector("select").value,
                description: job.description || "",
                yearsExperience: job.yearsExperience || 0
            };

            try {
                const data = await apiRequest(`/api/jobs/${job.id}/`, {
                    method: "PUT",
                    body: JSON.stringify(payload)
                });
                jobs = jobs.map(item => item.id === job.id ? data.job : item);
                renderJobs();
            } catch (err) {
                alert(err.message);
            }
        });

        tableBody.appendChild(row);
    });
}

async function loadJobs() {
    try {
        const data = await apiRequest("/api/admin/jobs/");
        jobs = data.jobs;
        renderJobs();
    } catch (err) {
        console.error(err);
        tableBody.innerHTML = `<tr><td colspan="6">${escapeHtml(err.message)}</td></tr>`;
    }
}

loadJobs();
