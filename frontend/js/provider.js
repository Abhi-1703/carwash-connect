// Provider Dashboard Management

let myWash = null;
let myServices = [];
let myBookings = [];

document.addEventListener('DOMContentLoaded', async () => {
  const user = getUser();
  if (!user || user.role !== 'provider') {
    alert('Access restricted to verified Service Providers.');
    window.location.href = 'login.html';
    return;
  }

  await loadProviderData();

  // Wash Form Submit
  const washForm = document.getElementById('wash-details-form');
  if (washForm) {
    washForm.addEventListener('submit', handleSaveWash);
  }

  // Service Form Submit
  const serviceForm = document.getElementById('add-service-form');
  if (serviceForm) {
    serviceForm.addEventListener('submit', handleAddService);
  }
});

async function loadProviderData() {
  try {
    const data = await apiFetch('/carwashes/provider/my');
    myWash = data.carWash;

    if (myWash) {
      // Fetch all packages including inactive ones for provider dashboard
      const srvRes = await apiFetch(`/services/wash/${myWash._id}?includeInactive=true`);
      myServices = srvRes.services || [];
    } else {
      myServices = [];
    }

    renderWashDetails();
    renderServicesTable();
    await loadBookings();
  } catch (error) {
    console.error('Error loading provider data:', error);
  }
}

function renderWashDetails() {
  if (!myWash) {
    document.getElementById('no-wash-alert').style.display = 'block';
    return;
  }

  document.getElementById('no-wash-alert').style.display = 'none';
  document.getElementById('wash-name-input').value = myWash.name || '';
  document.getElementById('wash-phone-input').value = myWash.phone || '';
  document.getElementById('wash-address-input').value = myWash.address || '';
  document.getElementById('wash-lat-input').value = myWash.latitude || '';
  document.getElementById('wash-lng-input').value = myWash.longitude || '';
  document.getElementById('wash-open-input').value = myWash.openingTime || '09:00';
  document.getElementById('wash-close-input').value = myWash.closingTime || '18:00';
  document.getElementById('wash-desc-input').value = myWash.description || '';
}

async function handleSaveWash(e) {
  e.preventDefault();
  const payload = {
    name: document.getElementById('wash-name-input').value.trim(),
    phone: document.getElementById('wash-phone-input').value.trim(),
    address: document.getElementById('wash-address-input').value.trim(),
    latitude: parseFloat(document.getElementById('wash-lat-input').value),
    longitude: parseFloat(document.getElementById('wash-lng-input').value),
    openingTime: document.getElementById('wash-open-input').value,
    closingTime: document.getElementById('wash-close-input').value,
    description: document.getElementById('wash-desc-input').value.trim()
  };

  try {
    const res = await apiFetch('/carwashes', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    alert(res.message || 'Car wash details saved successfully!');
    myWash = res.carWash;
    renderWashDetails();
  } catch (error) {
    alert('Failed to save center: ' + error.message);
  }
}

function renderServicesTable() {
  const tbody = document.getElementById('services-tbody');
  if (!tbody) return;

  if (myServices.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding:20px; color:#64748b;">No service packages added yet.</td></tr>';
    return;
  }

  tbody.innerHTML = myServices.map((s, idx) => {
    const isActive = s.isActive !== false;
    const includedText = s.includedServices && s.includedServices.length > 0
      ? s.includedServices.join(', ')
      : '<span style="color:#94a3b8;">-</span>';

    return `
      <tr>
        <td>${idx + 1}</td>
        <td><strong>${s.serviceName}</strong></td>
        <td>${s.description}</td>
        <td style="font-size:0.85rem; color:#475569;">${includedText}</td>
        <td><span style="font-weight:bold; color:#0284c7;">₹${s.price}</span></td>
        <td>${s.estimatedDuration || '45 mins'}</td>
        <td>
          <span class="badge ${isActive ? 'badge-Confirmed' : 'badge-Rejected'}">
            ${isActive ? 'Active' : 'Inactive'}
          </span>
        </td>
        <td>
          <div style="display:flex; gap:6px; flex-wrap:wrap;">
            <button class="btn btn-sm ${isActive ? 'btn-outline' : 'btn-success'}" onclick="toggleServiceStatus('${s._id}', ${!isActive})">
              ${isActive ? 'Deactivate' : 'Activate'}
            </button>
            <button class="btn btn-sm btn-danger" onclick="deleteService('${s._id}')">
              Delete
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

async function toggleServiceStatus(serviceId, newActiveStatus) {
  try {
    const res = await apiFetch(`/services/${serviceId}`, {
      method: 'PUT',
      body: JSON.stringify({ isActive: newActiveStatus })
    });
    const sIdx = myServices.findIndex(s => s._id === serviceId);
    if (sIdx !== -1) {
      myServices[sIdx] = res.service;
      renderServicesTable();
    }
  } catch (error) {
    alert('Status toggle error: ' + error.message);
  }
}

async function handleAddService(e) {
  e.preventDefault();
  if (!myWash) {
    alert('Please register and save your Car Wash center details first.');
    return;
  }

  const includedVal = document.getElementById('srv-included') ? document.getElementById('srv-included').value.trim() : '';

  const payload = {
    washId: myWash._id,
    serviceName: document.getElementById('srv-name').value.trim(),
    price: parseFloat(document.getElementById('srv-price').value),
    estimatedDuration: document.getElementById('srv-duration').value.trim(),
    description: document.getElementById('srv-desc').value.trim(),
    includedServices: includedVal ? includedVal.split(',').map(s => s.trim()).filter(Boolean) : []
  };

  try {
    const res = await apiFetch('/services', {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    myServices.push(res.service);
    renderServicesTable();
    e.target.reset();
    alert('Service package added successfully!');
  } catch (error) {
    alert('Failed to add service: ' + error.message);
  }
}

async function deleteService(serviceId) {
  if (!confirm('Are you sure you want to remove this service?')) return;

  try {
    await apiFetch(`/services/${serviceId}`, { method: 'DELETE' });
    myServices = myServices.filter(s => s._id !== serviceId);
    renderServicesTable();
  } catch (error) {
    alert('Delete error: ' + error.message);
  }
}

async function loadBookings() {
  try {
    const res = await apiFetch('/bookings/provider');
    myBookings = res.bookings || [];

    // Update Stats
    document.getElementById('stat-total-bookings').textContent = myBookings.length;
    document.getElementById('stat-pending').textContent = myBookings.filter(b => b.status === 'Pending').length;
    document.getElementById('stat-confirmed').textContent = myBookings.filter(b => b.status === 'Confirmed').length;

    const completedRev = myBookings
      .filter(b => b.status === 'Completed')
      .reduce((sum, b) => sum + (b.totalPrice || 0), 0);
    document.getElementById('stat-revenue').textContent = `₹${completedRev}`;

    renderBookingsTable(myBookings);
  } catch (error) {
    console.error('Failed to load bookings:', error);
  }
}

function renderBookingsTable(bookings) {
  const tbody = document.getElementById('bookings-tbody');
  if (!tbody) return;

  if (bookings.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:20px; color:#64748b;">No customer bookings received yet.</td></tr>';
    return;
  }

  tbody.innerHTML = bookings.map(b => {
    let actionButtons = '';
    if (b.status === 'Pending') {
      actionButtons = `
        <button class="btn btn-sm btn-success" onclick="updateStatus('${b._id}', 'Confirmed')">Accept</button>
        <button class="btn btn-sm btn-danger" onclick="updateStatus('${b._id}', 'Rejected')">Reject</button>
      `;
    } else if (b.status === 'Confirmed') {
      actionButtons = `
        <button class="btn btn-sm btn-primary" onclick="updateStatus('${b._id}', 'Completed')">Mark Done</button>
      `;
    } else {
      actionButtons = `<span style="color:#94a3b8; font-size:12px;">Closed</span>`;
    }

    return `
      <tr>
        <td><strong>#${b._id.slice(-6)}</strong></td>
        <td>
          ${b.userId ? b.userId.name : 'Unknown'}<br>
          <small style="color:#64748b;">📞 ${b.userId ? b.userId.phone : 'N/A'}</small>
          ${b.serviceLocation ? `<br><small style="color:#0369a1; font-weight:600;">📍 ${b.serviceLocation}</small>` : ''}
        </td>
        <td>
          ${b.vehicleType} (${b.vehicleNumber})<br>
          <small style="color:#0284c7;">${b.serviceId ? b.serviceId.serviceName : 'Custom'}</small>
        </td>
        <td>
          ${b.date}<br>
          <strong>${b.time}</strong>
        </td>
        <td>₹${b.totalPrice}</td>
        <td><span class="badge badge-${b.status}">${b.status}</span></td>
        <td>${actionButtons}</td>
      </tr>
    `;
  }).join('');
}

async function updateStatus(bookingId, status) {
  try {
    await apiFetch(`/bookings/${bookingId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
    alert(`Booking status updated to ${status}!`);
    await loadBookings();
  } catch (error) {
    alert('Status update error: ' + error.message);
  }
}