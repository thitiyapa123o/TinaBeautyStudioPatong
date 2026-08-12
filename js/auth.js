// Authentication System for Tina Beauty Studio
// Admin login is handled entirely by Supabase Auth (supabaseClient.auth.*).
// Admin accounts are created in the Supabase dashboard (Authentication -> Users),
// not from this website - there is no public sign-up for the dashboard.

let currentUser = null; // { id, email } of the logged-in admin, or null

// Initialize authentication
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on login page
    if (document.getElementById('login-form')) {
        initializeLoginPage();
    } else {
        // Check authentication status on other pages
        checkAuthStatus();
    }
});

// Initialize login page
function initializeLoginPage() {
    const loginForm = document.getElementById('login-form');
    const togglePassword = document.getElementById('toggle-password');

    // Handle login form submission
    loginForm.addEventListener('submit', handleLogin);

    // Handle password visibility toggle
    togglePassword.addEventListener('click', function() {
        const passwordInput = document.getElementById('password');
        const passwordIcon = document.getElementById('password-icon');

        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            passwordIcon.className = 'fas fa-eye-slash';
        } else {
            passwordInput.type = 'password';
            passwordIcon.className = 'fas fa-eye';
        }
    });

    // Check if user is already logged in
    supabaseClient.auth.getSession().then(({ data }) => {
        if (data.session) {
            window.location.href = 'dashboard.html';
        }
    });
}

// Handle login form submission
async function handleLogin(e) {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    if (!email || !password) {
        showError('Please enter both email and password');
        return;
    }

    setLoading(true);
    hideError();

    const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });

    setLoading(false);

    if (error || !data.session) {
        showError('Invalid email or password');
        return;
    }

    currentUser = { id: data.user.id, email: data.user.email };
    window.location.href = 'dashboard.html';
}

// Check authentication status
async function checkAuthStatus() {
    const { data } = await supabaseClient.auth.getSession();

    if (data.session) {
        currentUser = { id: data.session.user.id, email: data.session.user.email };
        updateUIForAuthenticatedUser();
        return true;
    }

    handleUnauthenticated();
    return false;
}

// Handle unauthenticated state
function handleUnauthenticated() {
    currentUser = null;

    // If on dashboard page, redirect to login
    if (window.location.pathname.includes('dashboard.html')) {
        window.location.href = 'login.html';
        return;
    }

    updateUIForUnauthenticatedUser();
}

// Update UI for authenticated user
function updateUIForAuthenticatedUser() {
    // Add admin dashboard link to navigation
    addAdminNavigationLinks();

    // Show logout option
    addLogoutOption();
}

// Update UI for unauthenticated user
function updateUIForUnauthenticatedUser() {
    // Show login link in navigation
    addLoginLink();
}

// Add admin navigation links
function addAdminNavigationLinks() {
    if (!currentUser) return;

    const nav = document.querySelector('nav ul, .nav-links, .navigation');
    if (nav && !document.getElementById('admin-dashboard-link')) {
        const dashboardLink = document.createElement('li');
        dashboardLink.innerHTML = `
            <a href="dashboard.html" id="admin-dashboard-link"
               class="text-white hover:text-purple-200 transition px-4 py-2 rounded-lg hover:bg-white/10">
                <i class="fas fa-chart-bar mr-2"></i>Dashboard
            </a>
        `;
        nav.insertBefore(dashboardLink, nav.firstChild);
    }
}

// Add logout option
function addLogoutOption() {
    if (!currentUser) return;

    const nav = document.querySelector('nav ul, .nav-links, .navigation');
    if (nav && !document.getElementById('logout-option')) {
        const logoutItem = document.createElement('li');
        logoutItem.innerHTML = `
            <button onclick="logout()" id="logout-option"
                    class="text-white hover:text-purple-200 transition px-4 py-2 rounded-lg hover:bg-white/10 flex items-center">
                <i class="fas fa-user mr-2"></i>${currentUser.email}
                <i class="fas fa-sign-out-alt ml-2"></i>
            </button>
        `;
        nav.appendChild(logoutItem);
    }
}

// Add login link
function addLoginLink() {
    const nav = document.querySelector('nav ul, .nav-links, .navigation');
    if (nav && !document.getElementById('login-link')) {
        const loginLink = document.createElement('li');
        loginLink.innerHTML = `
            <a href="login.html" id="login-link"
               class="text-white hover:text-purple-200 transition px-4 py-2 rounded-lg hover:bg-white/10">
                <i class="fas fa-sign-in-alt mr-2"></i>Admin Login
            </a>
        `;
        nav.appendChild(loginLink);
    }
}

// Logout function
async function logout() {
    await supabaseClient.auth.signOut();
    currentUser = null;
    window.location.href = 'index.html';
}

// Check if user is logged in
function isLoggedIn() {
    return currentUser !== null;
}

// Check if user is admin (any authenticated Supabase Auth session is an admin -
// there is no separate "general user" login on this site)
function isAdmin() {
    return currentUser !== null;
}

// Get current user
function getCurrentUser() {
    return currentUser;
}

// Require admin access - resolves the live Supabase session (don't rely on
// stale in-memory state), redirects to login if there isn't one
async function requireAdmin() {
    const { data } = await supabaseClient.auth.getSession();

    if (!data.session) {
        window.location.href = 'login.html';
        return false;
    }

    currentUser = { id: data.session.user.id, email: data.session.user.email };
    return true;
}

// UI Helper functions for login page
function showError(message) {
    const errorDiv = document.getElementById('error-message');
    const errorText = document.getElementById('error-text');

    if (errorDiv && errorText) {
        errorText.textContent = message;
        errorDiv.classList.remove('hidden');
    }
}

function hideError() {
    const errorDiv = document.getElementById('error-message');
    if (errorDiv) {
        errorDiv.classList.add('hidden');
    }
}

function setLoading(loading) {
    const loginBtn = document.getElementById('login-btn');
    const loginText = document.getElementById('login-text');
    const loginSpinner = document.getElementById('login-spinner');
    const loadingOverlay = document.getElementById('loading');

    if (loginBtn && loginText && loginSpinner) {
        if (loading) {
            loginBtn.disabled = true;
            loginText.textContent = 'Signing In...';
            loginSpinner.classList.remove('hidden');
            if (loadingOverlay) loadingOverlay.classList.remove('hidden');
        } else {
            loginBtn.disabled = false;
            loginText.textContent = 'Sign In';
            loginSpinner.classList.add('hidden');
            if (loadingOverlay) loadingOverlay.classList.add('hidden');
        }
    }
}

// Export functions for global use
window.logout = logout;
window.isLoggedIn = isLoggedIn;
window.isAdmin = isAdmin;
window.getCurrentUser = getCurrentUser;
window.requireAdmin = requireAdmin;
