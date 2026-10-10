// Base API configuration (dynamically adapts to localhost or Render deployment)
const API_BASE_URL = window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1')
  ? 'http://localhost:5000/api'
  : `${window.location.origin}/api`;

// Auth State Helpers
function getToken() {
  return localStorage.getItem('carwash_token');
}

function getUser() {
  const user = localStorage.getItem('carwash_user');
  return user ? JSON.parse(user) : null;
}

function setAuth(token, user) {
  localStorage.setItem('carwash_token', token);
  localStorage.setItem('carwash_user', JSON.stringify(user));
}

function clearAuth() {
  localStorage.removeItem('carwash_token');
  localStorage.removeItem('carwash_user');
  window.location.href = 'login.html';
}

function isLoggedIn() {
  return !!getToken();
}

// Unified API caller
async function apiFetch(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `Request failed with status ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error.message);
    throw error;
  }
}

// Dynamic Navbar Renderer for all pages
function setupNavbar() {
  const navLinksContainer = document.getElementById('navbar-links');
  if (!navLinksContainer) return;

  const user = getUser();

  if (user) {
    let dashboardLink = user.role === 'provider' 
      ? '<a href="provider-dashboard.html">Provider Dashboard</a>' 
      : '<a href="dashboard.html">Dashboard</a>';

    let bookingsLink = user.role === 'customer'
      ? '<a href="my-bookings.html">My Bookings</a>'
      : '';

    navLinksContainer.innerHTML = `
      <li><a href="index.html">Home</a></li>
      <li><a href="nearby.html">Find Centers</a></li>
      <li>${dashboardLink}</li>
      ${bookingsLink ? `<li>${bookingsLink}</li>` : ''}
      <li>
        <span style="font-weight:600; color:var(--primary-dark); margin-right:10px;">
          👤 ${user.name} (${user.role})
        </span>
        <button class="btn btn-sm btn-outline" onclick="clearAuth()">Logout</button>
      </li>
    `;
  } else {
    navLinksContainer.innerHTML = `
      <li><a href="index.html">Home</a></li>
      <li><a href="nearby.html">Find Centers</a></li>
      <li><a href="login.html" class="btn btn-sm btn-outline">Login</a></li>
      <li><a href="register.html" class="btn btn-sm btn-primary">Sign Up</a></li>
      <li><a href="register-provider.html" style="font-size:0.85rem; color:var(--text-muted);">Partner Register</a></li>
    `;
  }
}

document.addEventListener('DOMContentLoaded', setupNavbar);