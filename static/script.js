// Show the registration form
function showRegister() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'block';
}

// Show the login form
function showLogin() {
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('registerForm').style.display = 'none';
}

// Handle login
function login(event) {
    event.preventDefault();

    const username = document.getElementById('loginUsername').value;
    const errorMessage = document.getElementById('errorMessage');

    if (!username) {
        errorMessage.textContent = 'Username is required';
        errorMessage.style.display = 'block';
        return;
    }

    // Simulating WebSocket connection to server
    const ws = new WebSocket("ws://localhost:8080/ws");

    ws.onopen = function() {
        const msg = { type: 'login', user: username };
        ws.send(JSON.stringify(msg));
    };

    ws.onmessage = function(event) {
        const response = JSON.parse(event.data);

        if (response.type === 'error') {
            errorMessage.textContent = response.content;
            errorMessage.style.display = 'block';
        } else if (response.type === 'login') {
            window.location.href = 'main.html';  // Redirect to main chat page
        }
    };

    ws.onerror = function() {
        errorMessage.textContent = 'Error connecting to WebSocket server.';
        errorMessage.style.display = 'block';
    };
}

// Handle registration
function register(event) {
    event.preventDefault();

    const username = document.getElementById('regUsername').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    const errorMessage = document.getElementById('errorMessage');

    if (!username || !email || !password) {
        errorMessage.textContent = 'All fields are required';
        errorMessage.style.display = 'block';
        return;
    }

    // Simulating WebSocket connection to server
    const ws = new WebSocket("ws://localhost:8080/ws");

    ws.onopen = function() {
        const msg = { type: 'register', user: username, email: email, password: password };
        ws.send(JSON.stringify(msg));
    };

    ws.onmessage = function(event) {
        const response = JSON.parse(event.data);

        if (response.type === 'error') {
            errorMessage.textContent = response.content;
            errorMessage.style.display = 'block';
        } else if (response.type === 'register') {
            window.location.href = 'main.html';  // Redirect to main chat page
        }
    };

    ws.onerror = function() {
        errorMessage.textContent = 'Error connecting to WebSocket server.';
        errorMessage.style.display = 'block';
    };
}


