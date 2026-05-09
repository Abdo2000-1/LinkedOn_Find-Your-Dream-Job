// ==========================
// Password Toggle
// ==========================

const passwordInput = document.getElementById('password');

if (passwordInput) {

    passwordInput.style.paddingRight = '35px';
    passwordInput.style.boxSizing = 'border-box';

    const wrapper = document.createElement('div');
    wrapper.style.position = 'relative';
    wrapper.style.display = 'inline-block';
    wrapper.style.width = '100%';

    passwordInput.parentNode.insertBefore(wrapper, passwordInput);
    wrapper.appendChild(passwordInput);

    const toggleButton = document.createElement('button');
    toggleButton.type = 'button';
    toggleButton.textContent = '👁️';

    toggleButton.style.position = 'absolute';
    toggleButton.style.right = '8px';
    toggleButton.style.top = '50%';
    toggleButton.style.transform = 'translateY(-50%)';
    toggleButton.style.background = 'none';
    toggleButton.style.border = 'none';
    toggleButton.style.cursor = 'pointer';
    toggleButton.style.fontSize = '18px';

    wrapper.appendChild(toggleButton);

    toggleButton.addEventListener('click', function () {
        const type = passwordInput.type === 'password' ? 'text' : 'password';
        passwordInput.type = type;
        this.textContent = type === 'password' ? '👁️' : '🙈';
    });
}


// ==========================
// Login Logic
// ==========================

const form = document.getElementById('sign-in');

if (form) {
    function showMessage(message, isSuccess = false) {
        const messageBox = document.getElementById('form-message');
        if (messageBox) {
            messageBox.textContent = message;
            messageBox.style.display = 'block';
            messageBox.style.color = isSuccess ? '#28a745' : '#dc3545';
        }
        if (!isSuccess) alert(message);
    }

    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value.trim();

        // ======================
        // Validation
        // ======================

        if (!email || !password) {
            showMessage('Please enter both username/email and password');
            return;
        }

        let response;
        let result;

        try {
            response = await fetch('/api/login/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            result = await response.json();
        } catch (error) {
            console.error(error);
            showMessage('Cannot connect to Django server. Run: .\\.venv\\Scripts\\python.exe manage.py runserver 127.0.0.1:8001 then open http://127.0.0.1:8001/start.html');
            return;
        }

        if (!response.ok || !result.ok) {
            showMessage(result.error || 'Invalid username/email or password!');
            return;
        }

        // UI Feedback
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.innerText = "Login Successful...";
        submitBtn.style.backgroundColor = "#28a745";
        submitBtn.disabled = true;
        showMessage('Login successful. Redirecting...', true);

    
        // Redirect
        setTimeout(() => {

            if (result.user.role === 'admin') {
                window.location.href = "../homeAdmin.html";
            } else {
                window.location.href = "../homeUser.html";
            }

        }, 1200);

    });

}
