async function getCurrentSession() {
    try {
        const response = await fetch("/api/session/");
        return response.json();
    } catch (error) {
        console.error(error);
        return { ok: false, authenticated: false };
    }
}

async function logoutCurrentUser(event) {
    event.preventDefault();
    try {
        await fetch("/api/logout/", { method: "POST" });
    } catch (error) {
        console.error(error);
    }
    localStorage.removeItem("loggedInUser");
    window.location.href = "/home.html";
}

async function applyNavigationRole()
{
    const adminNav = document.getElementById('Admin-Nav');
    const userNav = document.getElementById('User-Nav');

    if (adminNav) adminNav.style.display = 'none';
    if (userNav) userNav.style.display = 'none';

    const data = await getCurrentSession();

    if (!data.authenticated) return;

    const user = data.user;
    localStorage.setItem('loggedInUser', JSON.stringify(user));

    const isAdmin = user.role === 'admin';

    if (adminNav) adminNav.style.display = isAdmin ? 'block' : 'none';
    if (userNav) userNav.style.display = isAdmin ? 'none' : 'block';
}

document.addEventListener('DOMContentLoaded', function () {
    applyNavigationRole();

    document.querySelectorAll('a[href$="home.html"]').forEach(link => {
        if (link.textContent.trim().toLowerCase() === "log out") {
            link.addEventListener("click", logoutCurrentUser);
        }
    });
});
