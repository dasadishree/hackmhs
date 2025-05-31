let isLogin = true;

// Get DOM elements
const formTitle = document.getElementById('formTitle');
const submitButton = document.getElementById('submitButton');
const switchLink = document.getElementById('switchLink');
const switchForm = document.getElementById('switchForm');

// Switch between login and register
switchLink.addEventListener('click', function(e) {
    e.preventDefault();
    isLogin = !isLogin;
    formTitle.textContent = isLogin ? 'sign in' : 'register';
    submitButton.textContent = isLogin ? 'login' : 'register';
    switchForm.innerHTML = isLogin ? 
        'don\'t have an account? <a href="#" id="switchLink">register</a>' :
        'already have an account? <a href="#" id="switchLink">login</a>';
});

// Handle form submission
document.getElementById('loginForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const email = document.getElementById('exampleInputEmail1').value;
    const password = document.getElementById('exampleInputPassword1').value;

    try {
        if (isLogin) {
            // Login
            const response = await fetch('http://localhost:3000/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password })
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('currentUser', JSON.stringify(data.user));
                window.location.href = "landing.html";
            } else {
                alert("Invalid email or password.");
            }
        } else {
            // Register
            const response = await fetch('http://localhost:3000/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password })
            });

            if (response.ok) {
                alert("Registration successful! Please login.");
                // Switch back to login form
                isLogin = true;
                formTitle.textContent = 'sign in';
                submitButton.textContent = 'login';
                switchForm.innerHTML = 'don\'t have an account? <a href="#" id="switchLink">register</a>';
            } else {
                const data = await response.json();
                alert(data.error || "Registration failed. Please try again.");
            }
        }
    } catch (error) {
        console.error('Error:', error);
        alert("Error connecting to server. Please try again.");
    }
});