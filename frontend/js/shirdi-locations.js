// Centralized Service Areas around Shirdi, Maharashtra
// Note: These represent proposed service coverage regions / pick-up points.
// We avoid fabricating fake shop names or exact unverified shop addresses.

const SHIRDI_SERVICE_LOCATIONS = [
  {
    id: 'shirdi-main-road',
    name: 'Shirdi Main Road',
    area: 'Shirdi, Maharashtra',
    pincode: '423109',
    description: 'Central transit corridor connecting commercial shops, hotels, and key town amenities.',
    icon: '🛣️',
    latitude: 19.7685,
    longitude: 74.4785,
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Shirdi+Main+Road+Shirdi+Maharashtra',
    directionsUrl: 'https://www.google.com/maps/dir/?api=1&destination=Shirdi+Main+Road+Shirdi+Maharashtra'
  },
  {
    id: 'shirdi-bus-stand',
    name: 'Shirdi Bus Stand Area',
    area: 'Shirdi, Maharashtra',
    pincode: '423109',
    description: 'High-density transit hub with intercity MSRTC buses and tourist taxi stands.',
    icon: '🚌',
    latitude: 19.7712,
    longitude: 74.4754,
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Shirdi+Bus+Stand+Area+Maharashtra',
    directionsUrl: 'https://www.google.com/maps/dir/?api=1&destination=Shirdi+Bus+Stand+Area+Maharashtra'
  },
  {
    id: 'sai-baba-temple',
    name: 'Sai Baba Temple Area, Shirdi',
    area: 'Shirdi, Maharashtra',
    pincode: '423109',
    description: 'Sacred pilgrim core zone surrounding Shri Saibaba Sansthan Temple.',
    icon: '🛕',
    latitude: 19.7663,
    longitude: 74.4764,
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Sai+Baba+Temple+Shirdi+Maharashtra',
    directionsUrl: 'https://www.google.com/maps/dir/?api=1&destination=Sai+Baba+Temple+Shirdi+Maharashtra'
  },
  {
    id: 'rahata-road-shirdi',
    name: 'Rahata Road, Shirdi',
    area: 'Shirdi, Maharashtra',
    pincode: '423109',
    description: 'Suburban arterial road heading south towards Rahata agricultural & trade belt.',
    icon: '🚗',
    latitude: 19.7521,
    longitude: 74.4812,
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Rahata+Road+Shirdi+Maharashtra',
    directionsUrl: 'https://www.google.com/maps/dir/?api=1&destination=Rahata+Road+Shirdi+Maharashtra'
  },
  {
    id: 'nagar-manmad-highway',
    name: 'Nagar-Manmad Highway, Shirdi',
    area: 'Shirdi, Maharashtra',
    pincode: '423109',
    description: 'Major state expressway corridor (SH-10) catering to regional traffic and commercial logistics.',
    icon: '🚦',
    latitude: 19.7785,
    longitude: 74.4832,
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Nagar+Manmad+Highway+Shirdi+Maharashtra',
    directionsUrl: 'https://www.google.com/maps/dir/?api=1&destination=Nagar+Manmad+Highway+Shirdi+Maharashtra'
  },
  {
    id: 'kopargaon-road-shirdi',
    name: 'Kopargaon Road, Shirdi',
    area: 'Shirdi, Maharashtra',
    pincode: '423109',
    description: 'Northern exit towards Kopargaon Railway Station and Godavari river valley.',
    icon: '🛤️',
    latitude: 19.7891,
    longitude: 74.4855,
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Kopargaon+Road+Shirdi+Maharashtra',
    directionsUrl: 'https://www.google.com/maps/dir/?api=1&destination=Kopargaon+Road+Shirdi+Maharashtra'
  },
  {
    id: 'rahata-maharashtra',
    name: 'Rahata, Maharashtra',
    area: 'Rahata Taluka, Ahmednagar District',
    pincode: '423107',
    description: 'Neighboring municipal town center with residential colonies and local markets.',
    icon: '📍',
    latitude: 19.7135,
    longitude: 74.4988,
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Rahata+Maharashtra',
    directionsUrl: 'https://www.google.com/maps/dir/?api=1&destination=Rahata+Maharashtra'
  }
];

// Helper functions for locations
function getShirdiLocations() {
  return SHIRDI_SERVICE_LOCATIONS;
}

function getLocationById(id) {
  return SHIRDI_SERVICE_LOCATIONS.find(loc => loc.id === id) || null;
}

function getSavedServiceLocation() {
  const saved = localStorage.getItem('carwash_selected_location');
  if (!saved) return null;
  try {
    return JSON.parse(saved);
  } catch (e) {
    return null;
  }
}

function saveServiceLocation(locationObj) {
  if (locationObj) {
    localStorage.setItem('carwash_selected_location', JSON.stringify(locationObj));
  } else {
    localStorage.removeItem('carwash_selected_location');
  }
}

// Generate Google Maps Directions URL dynamically if needed
function buildGoogleMapsDirectionsUrl(destName, destLat, destLng) {
  if (destLat && destLng) {
    return `https://www.google.com/maps/dir/?api=1&destination=${destLat},${destLng}`;
  }
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destName)}`;
}

function buildGoogleMapsViewUrl(locationName, lat, lng) {
  if (lat && lng) {
    return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locationName)}`;
}

// Node.js module export support if required in backend
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    SHIRDI_SERVICE_LOCATIONS,
    getShirdiLocations,
    getLocationById,
    buildGoogleMapsDirectionsUrl,
    buildGoogleMapsViewUrl
  };
}
