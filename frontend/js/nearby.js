// Nearby Car Wash Discovery Engine

let mapInstance = null;
let currentCoords = { lat: 18.5204, lng: 73.8567 }; // Default fallback (Pune center)

document.addEventListener('DOMContentLoaded', () => {
  mapInstance = initMap('map', currentCoords.lat, currentCoords.lng, 13);

  // Auto-request location if supported
  locateUser();

  const locateBtn = document.getElementById('locate-btn');
  if (locateBtn) {
    locateBtn.addEventListener('click', locateUser);
  }

  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('input', filterCarWashes);
  }
});

let fetchedCarWashes = [];

// Get user coordinates via HTML5 Geolocation API
function locateUser() {
  const statusEl = document.getElementById('location-status');
  if (statusEl) statusEl.textContent = 'Detecting your location...';

  if (!navigator.geolocation) {
    if (statusEl) statusEl.textContent = 'Geolocation not supported by browser. Using default city location.';
    loadNearby(currentCoords.lat, currentCoords.lng);
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      currentCoords.lat = position.coords.latitude;
      currentCoords.lng = position.coords.longitude;
      if (statusEl) statusEl.textContent = `📍 Location detected: ${currentCoords.lat.toFixed(4)}, ${currentCoords.lng.toFixed(4)}`;

      if (mapInstance) {
        addUserMarker(currentCoords.lat, currentCoords.lng, 'You are here');
      }

      loadNearby(currentCoords.lat, currentCoords.lng);
    },
    (error) => {
      console.warn('Geolocation denied or failed:', error.message);
      if (statusEl) statusEl.textContent = 'Location permission denied. Showing centers near Pune city center.';
      if (mapInstance) {
        addUserMarker(currentCoords.lat, currentCoords.lng, 'Default City Location');
      }
      loadNearby(currentCoords.lat, currentCoords.lng);
    },
    { timeout: 10000, enableHighAccuracy: true }
  );
}

// Fetch nearby car washes from REST API
async function loadNearby(lat, lng) {
  const listContainer = document.getElementById('carwash-list');
  if (!listContainer) return;

  listContainer.innerHTML = '<p style="grid-column:1/-1; text-align:center; padding:30px;">🔍 Searching nearby car wash centers...</p>';

  try {
    const data = await apiFetch(`/carwashes/nearby?lat=${lat}&lng=${lng}&maxDistance=50`);
    fetchedCarWashes = data.carWashes || [];

    renderCarWashes(fetchedCarWashes);

    if (mapInstance) {
      renderCarWashMarkers(fetchedCarWashes);
    }
  } catch (error) {
    listContainer.innerHTML = `<p style="grid-column:1/-1; text-align:center; color:red;">Failed to load car washes: ${error.message}</p>`;
  }
}

// Render cards
function renderCarWashes(washes) {
  const listContainer = document.getElementById('carwash-list');
  if (!listContainer) return;

  if (washes.length === 0) {
    listContainer.innerHTML = `
      <div style="grid-column:1/-1; text-align:center; padding:40px; background:white; border-radius:10px; border:1px solid #e2e8f0;">
        <h3>No car wash centers found within 50 km.</h3>
        <p style="color:#64748b; margin-top:8px;">Try widening your search or load the seed sample data.</p>
      </div>
    `;
    return;
  }

  listContainer.innerHTML = washes.map(wash => {
    const servicesHtml = wash.services && wash.services.length > 0 
      ? wash.services.slice(0, 3).map(s => `
          <div class="preview-service-item">
            <span>${s.serviceName}</span>
            <span class="preview-price">₹${s.price}</span>
          </div>
        `).join('')
      : '<p style="font-size:12px; color:#94a3b8;">No services listed yet.</p>';

    return `
      <div class="wash-card">
        <img src="${wash.imageUrl || 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?auto=format&fit=crop&w=600&q=80'}" class="wash-img" alt="${wash.name}">
        <div class="wash-body">
          <div class="wash-header">
            <h3 class="wash-title">${wash.name}</h3>
            <span class="distance-badge">📏 ${wash.distance !== undefined ? wash.distance + ' km' : 'Nearby'}</span>
          </div>
          <p class="wash-address">📍 ${wash.address}</p>
          <p class="wash-timing">🕒 Hours: ${wash.openingTime} - ${wash.closingTime} | ⭐ ${wash.rating || '4.8'}</p>

          <div class="wash-services-preview">
            <h4 style="font-size:0.85rem; color:#0f172a; margin-bottom:8px; text-transform:uppercase;">Popular Services</h4>
            ${servicesHtml}
          </div>

          <div style="margin-top:auto; display:flex; gap:10px;">
            <a href="carwash-details.html?id=${wash._id}" class="btn btn-primary" style="flex:1;">View Details & Book</a>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// Client-side text filter
function filterCarWashes(e) {
  const query = e.target.value.toLowerCase();
  const filtered = fetchedCarWashes.filter(w => 
    w.name.toLowerCase().includes(query) || 
    w.address.toLowerCase().includes(query)
  );
  renderCarWashes(filtered);
}