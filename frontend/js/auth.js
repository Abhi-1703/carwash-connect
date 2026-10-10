// Authentication logic for login and registration forms

// Utility to display alert message
function showAlert(message, type = 'danger') {
  const alertEl = document.getElementById('alert-box');
  if (!alertEl) return;

  alertEl.className = `alert alert-${type}`;
  alertEl.textContent = message;
  alertEl.style.display = 'block';

  setTimeout(() => {
    // Keep visible if error, or user can read
  }, 4000);
}

// Handle Customer / Provider Login
async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  if (!email || !password) {
    showAlert('Please enter both email and password.');
    return;
  }

  try {
    const data = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });

    setAuth(data.token, data.user);
    showAlert('Login successful! Redirecting...', 'success');

    setTimeout(() => {
      if (data.user.role === 'provider') {
        window.location.href = 'provider-dashboard.html';
      } else {
        window.location.href = 'dashboard.html';
      }
    }, 1000);
  } catch (error) {
    showAlert(error.message || 'Login failed. Please check credentials.');
  }
}

// Handle Customer Registration
async function handleCustomerRegister(e) {
  e.preventDefault();
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;

  if (password !== confirmPassword) {
    showAlert('Passwords do not match.');
    return;
  }

  try {
    const data = await apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name,
        email,
        phone,
        password,
        role: 'customer'
      })
    });

    setAuth(data.token, data.user);
    showAlert('Customer account created! Redirecting...', 'success');
    setTimeout(() => {
      window.location.href = 'dashboard.html';
    }, 1000);
  } catch (error) {
    showAlert(error.message || 'Registration failed.');
  }
}

// Handle Provider Registration
async function handleProviderRegister(e) {
  e.preventDefault();
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;

  if (password !== confirmPassword) {
    showAlert('Passwords do not match.');
    return;
  }

  try {
    const data = await apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name,
        email,
        phone,
        password,
        role: 'provider'
      })
    });

    setAuth(data.token, data.user);
    showAlert('Provider account created! Redirecting...', 'success');
    setTimeout(() => {
      window.location.href = 'provider-dashboard.html';
    }, 1000);
  } catch (error) {
    showAlert(error.message || 'Provider registration failed.');
  }
}