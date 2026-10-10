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
 * Renders multiple car wash markers on the map
 */
function renderCarWashMarkers(carWashes = []) {
  if (!globalLeafletMap || !markersGroup) return;

  markersGroup.clearLayers();

  const bounds = [];

  carWashes.forEach((wash) => {
    if (wash.latitude && wash.longitude) {
      bounds.push([wash.latitude, wash.longitude]);

      const popupContent = `
        <div style="font-family:sans-serif; min-width:180px;">
          <h4 style="margin:0 0 4px 0; color:#0f172a;">${wash.name}</h4>
          <p style="margin:0 0 4px 0; font-size:12px; color:#64748b;">${wash.address}</p>
          ${wash.distance !== undefined ? `<p style="margin:0 0 8px 0; font-size:12px; font-weight:bold; color:#0284c7;">📏 ${wash.distance} km away</p>` : ''}
          <a href="carwash-details.html?id=${wash._id}" class="btn btn-sm btn-primary" style="display:inline-block; text-decoration:none; padding:4px 10px; font-size:12px;">View & Book</a>
        </div>
      `;

      L.marker([wash.latitude, wash.longitude])
        .addTo(markersGroup)
        .bindPopup(popupContent);
    }
  });

  if (bounds.length > 0) {
    globalLeafletMap.fitBounds(bounds, { padding: [40, 40] });
  }
}