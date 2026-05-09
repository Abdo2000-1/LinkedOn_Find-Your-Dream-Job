async function validateForm(event) {
    event.preventDefault();

    const jobTitle = document.getElementById('jobTitle').value.trim();
    const company = document.getElementById('company').value.trim();
    const location = document.getElementById('location').value.trim();
    const salary = document.getElementById('salary').value.trim();
    const status = document.getElementById('status').value;
    const description = document.getElementById('description').value;
    const yearsExperience = document.getElementById('yearsExperience')?.value || 0;


    if (!jobTitle || !company || !location || !salary) {
        alert('Please fill in all mandatory fields!');
        return false;
    }

    if (isNaN(salary) || Number(salary) <= 0) {
        alert('Salary must be a valid positive number!');
        return false;
    }

    if (isNaN(yearsExperience) || Number(yearsExperience) < 0) {
        alert('Years of experience must be a valid number!');
        return false;
    }

    let response;
    let result;

    try {
        response = await fetch('/api/jobs/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ jobTitle, company, location, salary, status, description, yearsExperience })
        });
        result = await response.json();
    } catch (error) {
        console.error(error);
        alert('Cannot connect to Django server. Run: .\\.venv\\Scripts\\python.exe manage.py runserver 127.0.0.1:8001 then open http://127.0.0.1:8001/start.html');
        return false;
    }

    if (!response.ok || !result.ok) {
        alert(result.error || 'Could not add job.');
        return false;
    }

    alert('Job added successfully!');
    window.location.href = "admin-jobs.html";

    return true;
}
