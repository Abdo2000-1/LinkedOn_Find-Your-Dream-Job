let container = document.getElementById("jobsContainer");

function escapeHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function renderJobs(jobs) {
    container.innerHTML = "";

    if (!jobs.length) {
        container.innerHTML = "<p>No current job opportunities.</p>";
        return;
    }

    jobs.forEach((job, index) => {
        let jobDiv = document.createElement("div");
        jobDiv.classList.add("job");

        const status = (job.status || "open").toLowerCase().trim();
        const isClosed = status === "closed";
        jobDiv.innerHTML = `
            <h3>${index + 1}. ${escapeHtml(job.jobTitle)}</h3>

            <p>
                <strong>Company:</strong> ${escapeHtml(job.company)} |
                <strong>Location:</strong> ${escapeHtml(job.location)} |
                <strong>Status:</strong>
                <span style="color:${job.status === "open" ? "green" : "red"};">
                    ${escapeHtml(job.status)}
                </span>
            </p>

            <div class="job-actions">
                <button class="details-btn">View Details </button>
                ${isClosed
                    ? ''
                    : `<a href="apply.html?jobId=${encodeURIComponent(job.id)}" class="apply-btn">Apply Now</a>`
                }
            </div>

            <div class="details">
                <p><strong>Salary:</strong> $${escapeHtml(job.salary)}</p>
                <p><strong>Years of Experience:</strong> ${escapeHtml(job.yearsExperience)}</p>
                <p><strong>Date Added:</strong> ${escapeHtml(job.dateAdded)}</p>
                <p><strong>description: <br></strong>${escapeHtml(job.description || "No description available")}</p>
            </div>
        `;

        container.appendChild(jobDiv);
    });

    addToggle();
}

function addToggle() {
    document.querySelectorAll(".details-btn").forEach(btn => {
        btn.addEventListener("click", function () {
            let details = this.closest(".job").querySelector(".details");

            document.querySelectorAll(".details").forEach(d => {
                if (d !== details) d.style.display = "none";
            });

            details.style.display =
                details.style.display === "block" ? "none" : "block";
        });
    });
}

async function loadJobs() {
    let response;
    let data;

    try {
        response = await fetch("/api/jobs/");
        data = await response.json();
    } catch (error) {
        console.error(error);
        container.innerHTML = `<p>Cannot connect to Django server.</p>`;
        return;
    }

    if (!response.ok || !data.ok) {
        container.innerHTML = `<p>${escapeHtml(data.error || "Could not load jobs.")}</p>`;
        return;
    }

    renderJobs(data.jobs);
}

loadJobs();
