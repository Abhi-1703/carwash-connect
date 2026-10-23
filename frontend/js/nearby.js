// Nearby Car Wash Discovery Engine & Shirdi Service Area Selection

let mapInstance = null;
let currentCoords = { lat: 18.5204, lng: 73.8567 }; // Default fallback (Pune center)
let activeServiceLocation = null;
let fetchedCarWashes = [];

document.addEventListener('DOMContentLoaded', () => {
  mapInstance = initMap('map', currentCoords.lat, currentCoords.lng, 13);

  // Initialize Shirdi Service Locations UI
  initShirdiLocationControls();

  // Check if user had previously selected a service location
  const savedLoc = typeof getSavedServiceLocation === 'function' ? getSavedServiceLocation() : null;
  if (savedLoc) {
    selectShirdiLocation(savedLoc.id, false);
  } else {
    // Auto-request GPS location if supported
    locateUser();
  }

  const locateBtn = document.getElementById('locate-btn');
  if (locateBtn) {
    locateBtn.addEventListener('click', () => {
      clearSelectedLocation(false);
      locateUser();
    });
  }

  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('input', filterCarWashes);
  }
});

/**
 * Initializes Location Search, Dropdown & 7 Cards
 */
function initShirdiLocationControls() {
  const locations = typeof getShirdiLocations === 'function' ? getShirdiLocations() : [];
  const dropdown = document.getElementById('location-dropdown-select');
  const searchInput = document.getElementById('location-search-input');

  // Populate Dropdown
  if (dropdown && locations.length > 0) {
    dropdown.innerHTML = '<option value="">-- Or Pick from Dropdown --</option>';
    locations.forEach(loc => {
      const opt = document.createElement('option');
      opt.value = loc.id;
      opt.textContent = `${loc.icon} ${loc.name} (${loc.pincode})`;
      dropdown.appendChild(opt);
    });

    dropdown.addEventListener('change', (e) => {
      if (e.target.value) {
        selectShirdiLocation(e.target.value, true);
      }
    });
  }

  // Location search filter
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase().trim();
      const filtered = locations.filter(loc => 
        loc.name.toLowerCase().includes(q) ||
        loc.description.toLowerCase().includes(q) ||
        loc.area.toLowerCase().includes(q) ||
        loc.pincode.includes(q)
      );
      renderLocationCards(filtered);
    });
  }

  // Render initial 7 cards
  renderLocationCards(locations);

  // Banner Actions
  const viewMapBtn = document.getElementById('banner-view-map-btn');
  if (viewMapBtn) {
    viewMapBtn.addEventListener('click', () => {
      if (activeServiceLocation && mapInstance) {
        document.getElementById('map').scrollIntoView({ behavior: 'smooth' });
        addAreaMarker(activeServiceLocation.latitude, activeServiceLocation.longitude, activeServiceLocation);
      }
    });
  }

  const clearBtn = document.getElementById('banner-clear-btn');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      clearSelectedLocation(true);
      locateUser();
    });
  }
}

/**
 * Renders the 7 Location Cards
 */
function renderLocationCards(locations) {
  const grid = document.getElementById('shirdi-locations-grid');
  if (!grid) return;

  if (locations.length === 0) {
    grid.innerHTML = `
      <div style="grid-column:1/-1; text-align:center; padding:20px; color:#64748b; background:#f8fafc; border-radius:8px; border:1px dashed #cbd5e1;">
        No service areas match your search keyword.
      </div>
    `;
    return;
  }

  grid.innerHTML = locations.map(loc => {
    const isSelected = activeServiceLocation && activeServiceLocation.id === loc.id;
    return `
      <div class="loc-card ${isSelected ? 'selected' : ''}" data-loc-id="${loc.id}">
        <div class="loc-card-header">
          <span class="loc-card-icon">${loc.icon}</span>
          <span class="loc-card-name">${loc.name}</span>
        </div>
        <p class="loc-card-desc">${loc.description}</p>
        <div style="font-size:0.75rem; color:#64748b; margin-bottom:8px;">
          📍 ${loc.area} (PIN: ${loc.pincode})
        </div>
        <div class="loc-card-actions">
          <button type="button" class="btn-loc-action btn-loc-select" onclick="handleCardSelect('${loc.id}')">
            ${isSelected ? '✓ Selected' : '📍 Select Area'}
          </button>
          <button type="button" class="btn-loc-action" onclick="handleCardViewMap('${loc.id}')">
            🗺️ Map
          </button>
          <a href="${loc.directionsUrl}" target="_blank" rel="noopener noreferrer" class="btn-loc-action btn-loc-directions" onclick="event.stopPropagation();">
            🧭 Directions
          </a>
        </div>
      </div>
    `;
  }).join('');
}

// Global click handlers for inline card buttons
window.handleCardSelect = function(id) {
  selectShirdiLocation(id, true);
};

window.handleCardViewMap = function(id) {
  const loc = typeof getLocationById === 'function' ? getLocationById(id) : null;
  if (loc && mapInstance) {
    selectShirdiLocation(id, true);
    document.getElementById('map').scrollIntoView({ behavior: 'smooth' });
    addAreaMarker(loc.latitude, loc.longitude, loc);
  }
};

/**
 * Select a Shirdi Location
 */
function selectShirdiLocation(locId, autoScroll = false) {
  const loc = typeof getLocationById === 'function' ? getLocationById(locId) : null;
  if (!loc) return;

  activeServiceLocation = loc;
  saveServiceLocation(loc);

  // Update dropdown selection
  const dropdown = document.getElementById('location-dropdown-select');
  if (dropdown) dropdown.value = loc.id;

  // Highlight active card
  document.querySelectorAll('.loc-card').forEach(card => {
    if (card.dataset.locId === loc.id) {
      card.classList.add('selected');
      const selectBtn = card.querySelector('.btn-loc-select');
      if (selectBtn) selectBtn.textContent = '✓ Selected';
    } else {
      card.classList.remove('selected');
      const selectBtn = card.querySelector('.btn-loc-select');
      if (selectBtn) selectBtn.textContent = '📍 Select Area';
    }
  });

  // Display Selected Location Banner
  const banner = document.getElementById('selected-location-banner');
  if (banner) {
    banner.style.display = 'flex';
    document.getElementById('banner-loc-icon').textContent = loc.icon;
    document.getElementById('banner-loc-name').textContent = `${loc.name} (Active Service Area)`;
    document.getElementById('banner-loc-desc').textContent = `${loc.description} • Coordinates: ${loc.latitude.toFixed(4)}, ${loc.longitude.toFixed(4)}`;
    
    const dirBtn = document.getElementById('banner-directions-btn');
    if (dirBtn) dirBtn.href = loc.directionsUrl;
  }

  // Update status header
  const statusEl = document.getElementById('location-status');
  if (statusEl) {
    statusEl.innerHTML = `📍 Service Area Selected: <strong>${loc.name}</strong> (${loc.area}) <span style="color:#0284c7; cursor:pointer; text-decoration:underline; font-size:0.85rem;" onclick="clearSelectedLocation(true)">Change Location</span>`;
  }

  // Update map coordinates
  currentCoords.lat = loc.latitude;
  currentCoords.lng = loc.longitude;

  if (mapInstance) {
    addAreaMarker(loc.latitude, loc.longitude, loc);
  }

  // Fetch car washes for this selected location
  loadNearby(loc.latitude, loc.longitude);

  if (autoScroll) {
    const listEl = document.getElementById('carwash-list');
    if (listEl) {
      listEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}

/**
 * Clear Selected Location and reset to GPS
 */
function clearSelectedLocation(reload = true) {
  activeServiceLocation = null;
  saveServiceLocation(null);

  const banner = document.getElementById('selected-location-banner');
  if (banner) banner.style.display = 'none';

  const dropdown = document.getElementById('location-dropdown-select');
  if (dropdown) dropdown.value = '';

  document.querySelectorAll('.loc-card').forEach(card => {
    card.classList.remove('selected');
    const selectBtn = card.querySelector('.btn-loc-select');
    if (selectBtn) selectBtn.textContent = '📍 Select Area';
  });

  if (reload) {
    locateUser();
  }
}

// Get user coordinates via HTML5 Geolocation API
function locateUser() {
  const statusEl = document.getElementById('location-status');
  if (statusEl) statusEl.textContent = 'Detecting your location...';

  if (!navigator.geolocation) {
    if (statusEl) statusEl.textContent = 'Geolocation not supported by browser. Showing default centers.';
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
      if (statusEl) statusEl.textContent = 'Location permission denied. Showing centers near Pune/Shirdi.';
      if (mapInstance) {
        addUserMarker(currentCoords.lat, currentCoords.lng, 'Default Location');
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

  listContainer.innerHTML = '<p style="grid-column:1/-1; text-align:center; padding:30px; color:#64748b;">🔍 Searching available car wash centers for selected location...</p>';

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
    const locName = activeServiceLocation ? activeServiceLocation.name : 'the selected area';
    listContainer.innerHTML = `
      <div style="grid-column:1/-1; text-align:center; padding:40px; background:white; border-radius:10px; border:1px solid #e2e8f0; box-shadow:var(--shadow);">
        <div style="font-size:2.5rem; margin-bottom:10px;">ℹ️</div>
        <h3 style="color:#0f172a; margin-bottom:8px;">No car wash center is registered in ${locName} yet.</h3>
        <p style="color:#64748b; max-width:540px; margin:0 auto 18px auto; line-height:1.5;">
          ${activeServiceLocation ? `We have listed <strong>${activeServiceLocation.name}</strong> as a proposed service coverage area. Local service providers have not yet registered centers within 50 km of this zone.` : 'No car wash centers found within 50 km.'}
        </p>
        <div style="display:flex; justify-content:center; gap:12px; flex-wrap:wrap;">
          ${activeServiceLocation ? `
            <a href="${activeServiceLocation.directionsUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-outline">
              🧭 Open ${activeServiceLocation.name} on Google Maps
            </a>
          ` : ''}
          <button class="btn btn-sm btn-primary" onclick="clearSelectedLocation(true)">
            📍 View Centers in Pune / All Areas
          </button>
        </div>
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

    // Build directions link for this wash center
    const washDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${wash.latitude},${wash.longitude}`;

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

          <div style="margin-top:auto; display:flex; gap:8px;">
            <a href="carwash-details.html?id=${wash._id}" class="btn btn-primary" style="flex:2;">View & Book</a>
            <a href="${washDirectionsUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-outline" style="flex:1; padding:8px 10px; font-size:0.85rem;" title="Get Google Maps Driving Directions">🧭 Directions</a>
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