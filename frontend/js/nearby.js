// Nearby Car Wash Discovery Engine & Multi-Location Selection
// Supports Dhule, Shirpur, Songir, Sakri, Sindkheda, Dondaicha, Shahada, Nardana, and Shirdi

let mapInstance = null;
let currentCoords = { lat: 20.9042, lng: 74.7749 }; // Default fallback (Dhule center)
let activeServiceLocation = null;
let activeRegionFilter = 'all';
let allFetchedCarWashes = [];
let displayedCarWashes = [];
let currentDisplayLimit = 8; // Requirement: display up to 8 distinct providers initially
let currentSearchRadius = 75; // Default 75 km

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Leaflet Map
  mapInstance = initMap('map', currentCoords.lat, currentCoords.lng, 12);

  // Initialize Multi-Location UI (Dhule + Shirdi regions)
  initMultiLocationControls();

  // Initialize Search Radius Filter
  const radiusSelect = document.getElementById('radius-select');
  if (radiusSelect) {
    currentSearchRadius = parseInt(radiusSelect.value, 10) || 75;
    radiusSelect.addEventListener('change', (e) => {
      currentSearchRadius = parseInt(e.target.value, 10);
      currentDisplayLimit = 8;
      loadNearby(currentCoords.lat, currentCoords.lng, currentSearchRadius);
    });
  }

  // Load More Button
  const loadMoreBtn = document.getElementById('load-more-btn');
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', handleLoadMore);
  }

  // Check if user had previously selected a service location
  const savedLoc = typeof getSavedServiceLocation === 'function' ? getSavedServiceLocation() : null;
  if (savedLoc) {
    selectServiceLocation(savedLoc.id, false);
  } else {
    // Auto-request GPS location or fallback cleanly
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
 * Initializes Region Tabs, Search Input, Dropdown & Location Cards
 */
function initMultiLocationControls() {
  const allLocations = typeof getAllLocations === 'function' ? getAllLocations() : (typeof getShirdiLocations === 'function' ? getShirdiLocations() : []);
  const dropdown = document.getElementById('location-dropdown-select');
  const searchInput = document.getElementById('location-search-input');
  const regionTabs = document.querySelectorAll('.region-tab');

  // Region tabs click handling
  regionTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      regionTabs.forEach(t => {
        t.classList.remove('active', 'btn-primary');
        t.classList.add('btn-outline');
      });
      tab.classList.add('active', 'btn-primary');
      tab.classList.remove('btn-outline');

      activeRegionFilter = tab.dataset.region || 'all';
      filterAndRenderLocationCards();
    });
  });

  // Populate Dropdown
  if (dropdown && allLocations.length > 0) {
    populateLocationDropdown(allLocations);

    dropdown.addEventListener('change', (e) => {
      if (e.target.value) {
        selectServiceLocation(e.target.value, true);
      }
    });
  }

  // Search input filter
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      filterAndRenderLocationCards();
    });
  }

  // Initial render of cards
  filterAndRenderLocationCards();

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

function populateLocationDropdown(locations) {
  const dropdown = document.getElementById('location-dropdown-select');
  if (!dropdown) return;

  dropdown.innerHTML = '<option value="">-- Choose Town / Area --</option>';

  const dhuleGroup = document.createElement('optgroup');
  dhuleGroup.label = '📍 Dhule & Khandesh Region';

  const shirdiGroup = document.createElement('optgroup');
  shirdiGroup.label = '📍 Shirdi & Vicinity';

  locations.forEach(loc => {
    const opt = document.createElement('option');
    opt.value = loc.id;
    opt.textContent = `${loc.icon} ${loc.name} (${loc.pincode})`;

    if (loc.regionId === 'dhule-region') {
      dhuleGroup.appendChild(opt);
    } else {
      shirdiGroup.appendChild(opt);
    }
  });

  if (dhuleGroup.children.length > 0) dropdown.appendChild(dhuleGroup);
  if (shirdiGroup.children.length > 0) dropdown.appendChild(shirdiGroup);
}

function filterAndRenderLocationCards() {
  const allLocations = typeof getAllLocations === 'function' ? getAllLocations() : [];
  const searchInput = document.getElementById('location-search-input');
  const query = searchInput ? searchInput.value.toLowerCase().trim() : '';

  let filtered = allLocations;

  if (activeRegionFilter !== 'all') {
    filtered = filtered.filter(l => l.regionId === activeRegionFilter);
  }

  if (query) {
    filtered = filtered.filter(loc =>
      loc.name.toLowerCase().includes(query) ||
      loc.description.toLowerCase().includes(query) ||
      loc.area.toLowerCase().includes(query) ||
      loc.pincode.includes(query)
    );
  }

  renderLocationCards(filtered);
}

/**
 * Renders Location Cards Grid
 */
function renderLocationCards(locations) {
  const grid = document.getElementById('shirdi-locations-grid');
  if (!grid) return;

  if (locations.length === 0) {
    grid.innerHTML = `
      <div style="grid-column:1/-1; text-align:center; padding:25px; color:#64748b; background:#f8fafc; border-radius:8px; border:1px dashed #cbd5e1;">
        No service towns match your filter. Try clearing your search keyword.
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
            ${isSelected ? '✓ Selected' : '📍 Select Town'}
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

window.handleCardSelect = function(id) {
  selectServiceLocation(id, true);
};

window.handleCardViewMap = function(id) {
  const loc = typeof getLocationById === 'function' ? getLocationById(id) : null;
  if (loc && mapInstance) {
    selectServiceLocation(id, false);
    document.getElementById('map').scrollIntoView({ behavior: 'smooth' });
    addAreaMarker(loc.latitude, loc.longitude, loc);
  }
};

/**
 * Select a Service Location
 */
function selectServiceLocation(locId, autoScroll = false) {
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
      if (selectBtn) selectBtn.textContent = '📍 Select Town';
    }
  });

  // Display Selected Location Banner
  const banner = document.getElementById('selected-location-banner');
  if (banner) {
    banner.style.display = 'flex';
    document.getElementById('banner-loc-icon').textContent = loc.icon;
    document.getElementById('banner-loc-name').textContent = `${loc.name} (Active Service Town)`;
    document.getElementById('banner-loc-desc').textContent = `${loc.description} • Coordinates: ${loc.latitude.toFixed(4)}, ${loc.longitude.toFixed(4)}`;
    
    const dirBtn = document.getElementById('banner-directions-btn');
    if (dirBtn) dirBtn.href = loc.directionsUrl;
  }

  // Update status header
  const statusEl = document.getElementById('location-status');
  if (statusEl) {
    statusEl.innerHTML = `📍 Active Search Town: <strong>${loc.name}</strong> (${loc.area}) <span style="color:#0284c7; cursor:pointer; text-decoration:underline; font-size:0.85rem;" onclick="clearSelectedLocation(true)">Reset to GPS</span>`;
  }

  // Update map coordinates
  currentCoords.lat = loc.latitude;
  currentCoords.lng = loc.longitude;

  if (mapInstance) {
    addAreaMarker(loc.latitude, loc.longitude, loc);
  }

  currentDisplayLimit = 8;
  loadNearby(loc.latitude, loc.longitude, currentSearchRadius);

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
    if (selectBtn) selectBtn.textContent = '📍 Select Town';
  });

  if (reload) {
    locateUser();
  }
}

// Get user coordinates via HTML5 Geolocation API
function locateUser() {
  const statusEl = document.getElementById('location-status');
  if (statusEl) statusEl.textContent = 'Detecting your GPS location...';

  if (!navigator.geolocation) {
    if (statusEl) statusEl.textContent = 'Geolocation not supported by browser. Showing Maharashtra centers.';
    loadNearby(currentCoords.lat, currentCoords.lng, currentSearchRadius);
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      currentCoords.lat = position.coords.latitude;
      currentCoords.lng = position.coords.longitude;
      if (statusEl) statusEl.textContent = `📍 GPS detected: ${currentCoords.lat.toFixed(4)}, ${currentCoords.lng.toFixed(4)}`;

      if (mapInstance) {
        addUserMarker(currentCoords.lat, currentCoords.lng, 'You are here');
      }

      currentDisplayLimit = 8;
      loadNearby(currentCoords.lat, currentCoords.lng, currentSearchRadius);
    },
    (error) => {
      console.warn('Geolocation denied or failed:', error.message);
      if (statusEl) statusEl.textContent = 'GPS permission not granted. Showing centers sorted from default center.';
      if (mapInstance) {
        addUserMarker(currentCoords.lat, currentCoords.lng, 'Default Search Center');
      }
      currentDisplayLimit = 8;
      loadNearby(currentCoords.lat, currentCoords.lng, currentSearchRadius);
    },
    { timeout: 8000, enableHighAccuracy: true }
  );
}

// Fetch nearby car washes from REST API
async function loadNearby(lat, lng, radius = 75) {
  const listContainer = document.getElementById('carwash-list');
  const titleEl = document.getElementById('results-count-title');
  const metaEl = document.getElementById('results-meta-badge');
  const loadMoreBox = document.getElementById('load-more-container');

  if (!listContainer) return;

  listContainer.innerHTML = '<p style="grid-column:1/-1; text-align:center; padding:35px; color:#64748b;">🔍 Searching available car wash centers for selected location...</p>';

  try {
    // Backend supports limit and radius. We fetch up to 50 within radius so frontend can show up to 8 and support Load More.
    const data = await apiFetch(`/carwashes/nearby?lat=${lat}&lng=${lng}&maxDistance=${radius}&limit=50`);
    const rawWashes = data.carWashes || [];

    // Reliable client-side deduplication by unique _id
    const seen = new Set();
    allFetchedCarWashes = [];
    rawWashes.forEach(w => {
      const id = (w._id || '').toString();
      if (id && !seen.has(id)) {
        seen.add(id);
        allFetchedCarWashes.push(w);
      }
    });

    // Slice to currentDisplayLimit (up to 8 initially)
    displayedCarWashes = allFetchedCarWashes.slice(0, currentDisplayLimit);

    renderCarWashes(displayedCarWashes, allFetchedCarWashes.length);

    if (mapInstance) {
      renderCarWashMarkers(displayedCarWashes);
    }

    // Update Headers & Load More
    if (titleEl) {
      const locationName = activeServiceLocation ? activeServiceLocation.name : 'Your Location';
      titleEl.textContent = `Car Wash Centers Near ${locationName} (${displayedCarWashes.length} of ${allFetchedCarWashes.length})`;
    }

    if (metaEl) {
      metaEl.textContent = `Within ${radius} km radius`;
    }

    if (loadMoreBox) {
      loadMoreBox.style.display = allFetchedCarWashes.length > displayedCarWashes.length ? 'block' : 'none';
    }
  } catch (error) {
    listContainer.innerHTML = `<p style="grid-column:1/-1; text-align:center; color:#ef4444; padding:30px;">Failed to load car washes: ${error.message}</p>`;
  }
}

function handleLoadMore() {
  currentDisplayLimit += 8;
  displayedCarWashes = allFetchedCarWashes.slice(0, currentDisplayLimit);
  renderCarWashes(displayedCarWashes, allFetchedCarWashes.length);

  if (mapInstance) {
    renderCarWashMarkers(displayedCarWashes);
  }

  const titleEl = document.getElementById('results-count-title');
  if (titleEl) {
    const locationName = activeServiceLocation ? activeServiceLocation.name : 'Your Location';
    titleEl.textContent = `Car Wash Centers Near ${locationName} (${displayedCarWashes.length} of ${allFetchedCarWashes.length})`;
  }

  const loadMoreBox = document.getElementById('load-more-container');
  if (loadMoreBox) {
    loadMoreBox.style.display = allFetchedCarWashes.length > displayedCarWashes.length ? 'block' : 'none';
  }
}

// Render provider cards
function renderCarWashes(washes, totalAvailableCount = 0) {
  const listContainer = document.getElementById('carwash-list');
  if (!listContainer) return;

  if (washes.length === 0) {
    const locName = activeServiceLocation ? activeServiceLocation.name : 'the selected area';
    listContainer.innerHTML = `
      <div style="grid-column:1/-1; text-align:center; padding:40px; background:white; border-radius:10px; border:1px solid #e2e8f0; box-shadow:var(--shadow);">
        <div style="font-size:2.5rem; margin-bottom:10px;">ℹ️</div>
        <h3 style="color:#0f172a; margin-bottom:8px;">No car wash center found in ${locName} within ${currentSearchRadius} km.</h3>
        <p style="color:#64748b; max-width:540px; margin:0 auto 18px auto; line-height:1.5;">
          ${activeServiceLocation ? `<strong>${activeServiceLocation.name}</strong> is a registered service area. Currently, no active car wash centers fall within ${currentSearchRadius} km. Try expanding the search radius or pick another nearby town.` : 'No car wash centers found.'}
        </p>
        <div style="display:flex; justify-content:center; gap:12px; flex-wrap:wrap;">
          <button class="btn btn-sm btn-primary" onclick="expandRadius()">
            🔍 Expand Radius to 250 km
          </button>
          <button class="btn btn-sm btn-outline" onclick="selectServiceLocation('dhule', true)">
            📍 View Centers Near Dhule
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

    const washDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${wash.latitude},${wash.longitude}`;

    return `
      <div class="wash-card" id="wash-card-${wash._id}">
        <img src="${wash.imageUrl || 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?auto=format&fit=crop&w=600&q=80'}" class="wash-img" alt="${wash.name}">
        <div class="wash-body">
          <div class="wash-header">
            <h3 class="wash-title">${wash.name}${wash.isDefault ? ' <span style="background:#e0e7ff; color:#3730a3; font-size:0.7rem; font-weight:700; padding:2px 8px; border-radius:12px; vertical-align:middle;">Demo Centre</span>' : ''}</h3>
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
            <button type="button" class="btn btn-outline" onclick="openWashMarker('${wash._id}')" style="flex:1; padding:8px 8px; font-size:0.85rem;" title="Highlight on interactive map">🗺️ Map</button>
            <a href="${washDirectionsUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-outline" style="flex:1; padding:8px 8px; font-size:0.85rem;" title="Get Google Maps Driving Directions">🧭 Directions</a>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

window.expandRadius = function() {
  const radiusSelect = document.getElementById('radius-select');
  if (radiusSelect) {
    radiusSelect.value = '250';
    currentSearchRadius = 250;
    loadNearby(currentCoords.lat, currentCoords.lng, currentSearchRadius);
  }
};

// Client-side text filter across currently loaded centers
function filterCarWashes(e) {
  const query = e.target.value.toLowerCase().trim();
  if (!query) {
    renderCarWashes(displayedCarWashes, allFetchedCarWashes.length);
    if (mapInstance) renderCarWashMarkers(displayedCarWashes);
    return;
  }

  const filtered = allFetchedCarWashes.filter(w =>
    w.name.toLowerCase().includes(query) ||
    w.address.toLowerCase().includes(query) ||
    (w.services && w.services.some(s => s.serviceName.toLowerCase().includes(query)))
  );

  renderCarWashes(filtered, filtered.length);
  if (mapInstance) {
    renderCarWashMarkers(filtered);
  }
}