
function showRequestError(error) {
    console.error(error);
    showMessage('Cannot connect to Django server. Run: .\\.venv\\Scripts\\python.exe manage.py runserver 127.0.0.1:8001 then open http://127.0.0.1:8001/start.html');
}

function showMessage(message, isSuccess = false) {
    const messageBox = document.getElementById('form-message');
    if (messageBox) {
        messageBox.textContent = message;
        messageBox.style.display = 'block';
        messageBox.style.color = isSuccess ? '#28a745' : '#dc3545';
    }
    if (!isSuccess) alert(message);
}

document.getElementById('admin').addEventListener('change', function() {
    document.getElementById('companyInput').style.display = 'block';
});

document.getElementById('user').addEventListener('change', function() {
    document.getElementById('companyInput').style.display = 'none';
});

document.getElementById('companyInput').style.display = 'none';


document.getElementById('confirm-password').addEventListener('input', function() {
    let pw = document.getElementById('password').value;
    if (this.value !== pw) {
        this.style.borderColor = 'red';
    } else {
        this.style.borderColor = 'green';
    }
});


document.getElementById('toggleBothPw').addEventListener('click', function() {
    let pw = document.getElementById('password');
    let confirmPw = document.getElementById('confirm-password');
    
    if (pw.type === 'password') {
        pw.type = 'text';
        confirmPw.type = 'text';
        this.textContent = '🫣'; 
    } else {
        pw.type = 'password';
        confirmPw.type = 'password';
        this.textContent = '👁️'; 
    }
});

document.querySelector('form').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    let username = document.getElementById("username").value.trim();
    let email = document.getElementById("email").value;
    let password = document.getElementById("password").value;
    let confirmPassword = document.getElementById("confirm-password").value;
    let roleElement = document.querySelector('input[name="role"]:checked');

    if (!roleElement) {
        showMessage('Please select User or Admin');
        return;
    }

    let role = roleElement.value;
    let company = document.getElementById("company").value.trim();
    let phone = document.getElementById("phone").value;

    if (username === '') {
        showMessage('Please enter your username');
        return;
    }

    // Check passwords
    if (password !== confirmPassword) {
        showMessage('Passwords do not match!');
        return;
    }

    // Check company for admin
    if (role === 'admin' && company === '') {
        showMessage('Please enter your company name');
        return;
    }

    let response;
    let result;

    try {
        response = await fetch('/api/signup/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: email,
                username: username,
                password: password,
                confirmPassword: confirmPassword,
                role: role,
                phone: phone,
                company: role === 'admin' ? company : ''
            })
        });
        result = await response.json();
    } catch (error) {
        showRequestError(error);
        return;
    }

    if (!response.ok || !result.ok) {
        showMessage(result.error || 'Could not create account.');
        return;
    }

    // UI feedback
    let submitBtn = document.querySelector('button[type="submit"]');
    submitBtn.innerText = "Account Created Successfully!";
    submitBtn.style.backgroundColor = "#28a745";
    submitBtn.disabled = true;
    showMessage('Account created successfully. Redirecting to login...', true);

    setTimeout(() => {
        window.location.href = "sign-in.html";
    }, 1500);
});
