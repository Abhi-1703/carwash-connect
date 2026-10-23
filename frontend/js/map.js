// Leaflet + OpenStreetMap Mapping Engine

let globalLeafletMap = null;
let markersGroup = null;

/**
 * Initializes a Leaflet map in the specified HTML container
 * @param {string} containerId - ID of the div element
 * @param {number} centerLat - Latitude
 * @param {number} centerLng - Longitude
 * @param {number} zoom - Initial zoom level
 */
function initMap(containerId = 'map', centerLat = 18.5204, centerLng = 73.8567, zoom = 13) {
  const container = document.getElementById(containerId);
  if (!container) return null;

  if (globalLeafletMap) {
    globalLeafletMap.remove();
  }

  globalLeafletMap = L.map(containerId).setView([centerLat, centerLng], zoom);

  // Free OpenStreetMap Tile Layer
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(globalLeafletMap);

  markersGroup = L.layerGroup().addTo(globalLeafletMap);

  return globalLeafletMap;
}

/**
 * Adds customer location marker with a distinctive blue pulse
 */
function addUserMarker(lat, lng, label = 'Your Current Location') {
  if (!globalLeafletMap) return;

  const userIcon = L.divIcon({
    className: 'user-marker',
    html: `<div style="background:#0284c7; width:20px; height:20px; border-radius:50%; border:3px solid #ffffff; box-shadow:0 0 10px rgba(2,132,199,0.7);"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });

  const marker = L.marker([lat, lng], { icon: userIcon })
    .addTo(globalLeafletMap)
    .bindPopup(`<b>📍 ${label}</b>`)
    .openPopup();

  globalLeafletMap.setView([lat, lng], 13);
  return marker;
}

/**
 * Adds or highlights a designated service area on the map with custom styling & directions
 */
let currentAreaMarker = null;

function addAreaMarker(lat, lng, areaObj) {
  if (!globalLeafletMap) return;

  if (currentAreaMarker) {
    globalLeafletMap.removeLayer(currentAreaMarker);
    currentAreaMarker = null;
  }

  const areaIcon = L.divIcon({
    className: 'area-marker',
    html: `<div style="background:#0f172a; color:#ffffff; width:34px; height:34px; border-radius:50%; border:3px solid #38bdf8; display:flex; align-items:center; justify-content:center; font-size:16px; box-shadow:0 0 14px rgba(15,23,42,0.8);">${areaObj.icon || '📍'}</div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17]
  });

  const directionsUrl = areaObj.directionsUrl || `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  const gmapsSearchUrl = areaObj.googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

  const popupHtml = `
    <div style="font-family:sans-serif; min-width:200px; padding:4px;">
      <div style="font-size:1.4rem; margin-bottom:4px;">${areaObj.icon || '📍'}</div>
      <h4 style="margin:0 0 4px 0; color:#0f172a; font-size:14px;">${areaObj.name}</h4>
      <p style="margin:0 0 6px 0; font-size:11px; color:#64748b; line-height:1.3;">${areaObj.description || ''}</p>
      <div style="background:#f1f5f9; padding:4px 8px; border-radius:4px; font-size:10px; color:#475569; margin-bottom:8px;">
        📌 Proposed Service Area (Shirdi)
      </div>
      <div style="display:flex; gap:6px;">
        <a href="${directionsUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-sm" style="flex:1; background:#10b981; color:#ffffff; padding:4px 6px; font-size:11px; text-decoration:none; text-align:center; border-radius:4px;">🧭 Directions</a>
        <a href="${gmapsSearchUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-outline" style="flex:1; padding:4px 6px; font-size:11px; text-decoration:none; text-align:center; border-radius:4px;">Google Maps</a>
      </div>
    </div>
  `;

  currentAreaMarker = L.marker([lat, lng], { icon: areaIcon })
    .addTo(globalLeafletMap)
    .bindPopup(popupHtml)
    .openPopup();

  globalLeafletMap.setView([lat, lng], 14);
  return currentAreaMarker;
}

/**
 * Renders multiple car wash markers on the map
 */
const washMarkersMap = new Map();

function renderCarWashMarkers(carWashes = []) {
  if (!globalLeafletMap || !markersGroup) return;

  markersGroup.clearLayers();
  washMarkersMap.clear();

  const bounds = [];

  carWashes.forEach((wash) => {
    if (typeof wash.latitude === 'number' && typeof wash.longitude === 'number' && !isNaN(wash.latitude) && !isNaN(wash.longitude)) {
      bounds.push([wash.latitude, wash.longitude]);

      const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${wash.latitude},${wash.longitude}`;

      const popupContent = `
        <div style="font-family:sans-serif; min-width:190px;">
          <h4 style="margin:0 0 4px 0; color:#0f172a;">${wash.name}</h4>
          <p style="margin:0 0 4px 0; font-size:12px; color:#64748b;">${wash.address}</p>
          ${wash.distance !== undefined ? `<p style="margin:0 0 8px 0; font-size:12px; font-weight:bold; color:#0284c7;">📏 ${wash.distance} km away</p>` : ''}
          <div style="display:flex; gap:6px; margin-top:8px;">
            <a href="carwash-details.html?id=${wash._id}" class="btn btn-sm btn-primary" style="flex:1; display:inline-block; text-decoration:none; padding:4px 8px; font-size:11px; text-align:center;">Book</a>
            <a href="${directionsUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-outline" style="flex:1; display:inline-block; text-decoration:none; padding:4px 8px; font-size:11px; text-align:center;">Directions</a>
          </div>
        </div>
      `;

      const m = L.marker([wash.latitude, wash.longitude])
        .addTo(markersGroup)
        .bindPopup(popupContent);

      washMarkersMap.set(wash._id.toString(), m);
    }
  });

  if (bounds.length > 0) {
    globalLeafletMap.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
  }
}

/**
 * Highlights and opens the marker popup on map for a specific wash center
 */
function openWashMarker(washId) {
  if (!globalLeafletMap || !washMarkersMap) return;
  const m = washMarkersMap.get(washId.toString());
  if (m) {
    document.getElementById('map').scrollIntoView({ behavior: 'smooth' });
    m.openPopup();
    globalLeafletMap.setView(m.getLatLng(), 15);
  }
}