// Centralized Service Areas & Locations Data for CarWash Connect
// Covers Northern Maharashtra regions (Dhule, Shirpur, Songir, Sakri, Sindkheda, Dondaicha, Shahada, Nardana)
// and preserves existing Shirdi & Vicinity locations.

const REGIONS = [
  { id: 'dhule-region', name: 'Dhule & Khandesh Region' },
  { id: 'shirdi-region', name: 'Shirdi & Ahmednagar Vicinity' }
];

const SERVICE_LOCATIONS = [
  // ---------------------------------------------------------
  // 8 Selectable Locations in Northern Maharashtra (Dhule / Khandesh)
  // ---------------------------------------------------------
  {
    id: 'dhule',
    name: 'Dhule',
    regionId: 'dhule-region',
    area: 'Dhule City, Maharashtra',
    pincode: '424001',
    description: 'Major commercial, textile, and educational hub at intersection of NH-52 and NH-53.',
    icon: '🏙️',
    latitude: 20.9042,
    longitude: 74.7749,
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Dhule+Maharashtra',
    directionsUrl: 'https://www.google.com/maps/dir/?api=1&destination=20.9042,74.7749'
  },
  {
    id: 'shirpur',
    name: 'Shirpur',
    regionId: 'dhule-region',
    area: 'Shirpur, Dhule District, Maharashtra',
    pincode: '425405',
    description: 'Prominent educational and industrial town renowned for textile mills and Tapi river basin.',
    icon: '🏫',
    latitude: 21.3533,
    longitude: 74.8794,
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Shirpur+Maharashtra',
    directionsUrl: 'https://www.google.com/maps/dir/?api=1&destination=21.3533,74.8794'
  },
  {
    id: 'songir',
    name: 'Songir',
    regionId: 'dhule-region',
    area: 'Songir, Dhule District, Maharashtra',
    pincode: '424309',
    description: 'Historic town known for brass & copper handicrafts located on the Mumbai-Agra highway.',
    icon: '🏺',
    latitude: 21.0833,
    longitude: 74.8333,
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Songir+Maharashtra',
    directionsUrl: 'https://www.google.com/maps/dir/?api=1&destination=21.0833,74.8333'
  },
  {
    id: 'sakri',
    name: 'Sakri',
    regionId: 'dhule-region',
    area: 'Sakri, Dhule District, Maharashtra',
    pincode: '424304',
    description: 'Western taluka headquarters on Surat-Nagpur Highway (NH-53) and solar power zone.',
    icon: '☀️',
    latitude: 20.9333,
    longitude: 74.3167,
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Sakri+Dhule+Maharashtra',
    directionsUrl: 'https://www.google.com/maps/dir/?api=1&destination=20.9333,74.3167'
  },
  {
    id: 'sindkheda',
    name: 'Sindkheda (Sindkhede)',
    regionId: 'dhule-region',
    area: 'Sindkheda, Dhule District, Maharashtra',
    pincode: '425406',
    description: 'Agricultural hub and railway junction on the Western Railway Bhusawal-Surat sector.',
    icon: '🌾',
    latitude: 21.2667,
    longitude: 74.7500,
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Sindkheda+Maharashtra',
    directionsUrl: 'https://www.google.com/maps/dir/?api=1&destination=21.2667,74.7500'
  },
  {
    id: 'dondaicha',
    name: 'Dondaicha',
    regionId: 'dhule-region',
    area: 'Dondaicha, Dhule District, Maharashtra',
    pincode: '425408',
    description: 'Bustling commercial trade market and famous chilly export market in Khandesh.',
    icon: '🌶️',
    latitude: 21.3300,
    longitude: 74.5700,
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Dondaicha+Maharashtra',
    directionsUrl: 'https://www.google.com/maps/dir/?api=1&destination=21.3300,74.5700'
  },
  {
    id: 'shahada',
    name: 'Shahada',
    regionId: 'dhule-region',
    area: 'Shahada, Nandurbar District, Maharashtra',
    pincode: '425409',
    description: 'Flourishing agricultural, educational, and sugar cooperative center near Satpura range.',
    icon: '🏭',
    latitude: 21.5422,
    longitude: 74.4714,
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Shahada+Maharashtra',
    directionsUrl: 'https://www.google.com/maps/dir/?api=1&destination=21.5422,74.4714'
  },
  {
    id: 'nardana',
    name: 'Nardana',
    regionId: 'dhule-region',
    area: 'Nardana MIDC, Dhule District, Maharashtra',
    pincode: '425404',
    description: 'Rapidly growing Maharashtra Industrial Development Corporation (MIDC) manufacturing zone.',
    icon: '⚙️',
    latitude: 21.2333,
    longitude: 74.8833,
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Nardana+Dhule+Maharashtra',
    directionsUrl: 'https://www.google.com/maps/dir/?api=1&destination=21.2333,74.8833'
  },

  // ---------------------------------------------------------
  // Existing Shirdi & Vicinity Service Locations (Preserved)
  // ---------------------------------------------------------
  {
    id: 'shirdi-main-road',
    name: 'Shirdi Main Road',
    regionId: 'shirdi-region',
    area: 'Shirdi, Maharashtra',
    pincode: '423109',
    description: 'Central transit corridor connecting commercial shops, hotels, and key town amenities.',
    icon: '🛣️',
    latitude: 19.7685,
    longitude: 74.4785,
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Shirdi+Main+Road+Shirdi+Maharashtra',
    directionsUrl: 'https://www.google.com/maps/dir/?api=1&destination=19.7685,74.4785'
  },
  {
    id: 'shirdi-bus-stand',
    name: 'Shirdi Bus Stand Area',
    regionId: 'shirdi-region',
    area: 'Shirdi, Maharashtra',
    pincode: '423109',
    description: 'High-density transit hub with intercity MSRTC buses and tourist taxi stands.',
    icon: '🚌',
    latitude: 19.7712,
    longitude: 74.4754,
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Shirdi+Bus+Stand+Area+Maharashtra',
    directionsUrl: 'https://www.google.com/maps/dir/?api=1&destination=19.7712,74.4754'
  },
  {
    id: 'sai-baba-temple',
    name: 'Sai Baba Temple Area, Shirdi',
    regionId: 'shirdi-region',
    area: 'Shirdi, Maharashtra',
    pincode: '423109',
    description: 'Sacred pilgrim core zone surrounding Shri Saibaba Sansthan Temple.',
    icon: '🛕',
    latitude: 19.7663,
    longitude: 74.4764,
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Sai+Baba+Temple+Shirdi+Maharashtra',
    directionsUrl: 'https://www.google.com/maps/dir/?api=1&destination=19.7663,74.4764'
  },
  {
    id: 'rahata-road-shirdi',
    name: 'Rahata Road, Shirdi',
    regionId: 'shirdi-region',
    area: 'Shirdi, Maharashtra',
    pincode: '423109',
    description: 'Suburban arterial road heading south towards Rahata agricultural & trade belt.',
    icon: '🚗',
    latitude: 19.7521,
    longitude: 74.4812,
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Rahata+Road+Shirdi+Maharashtra',
    directionsUrl: 'https://www.google.com/maps/dir/?api=1&destination=19.7521,74.4812'
  },
  {
    id: 'nagar-manmad-highway',
    name: 'Nagar-Manmad Highway, Shirdi',
    regionId: 'shirdi-region',
    area: 'Shirdi, Maharashtra',
    pincode: '423109',
    description: 'Major state expressway corridor (SH-10) catering to regional traffic and commercial logistics.',
    icon: '🚦',
    latitude: 19.7785,
    longitude: 74.4832,
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Nagar+Manmad+Highway+Shirdi+Maharashtra',
    directionsUrl: 'https://www.google.com/maps/dir/?api=1&destination=19.7785,74.4832'
  },
  {
    id: 'kopargaon-road-shirdi',
    name: 'Kopargaon Road, Shirdi',
    regionId: 'shirdi-region',
    area: 'Shirdi, Maharashtra',
    pincode: '423109',
    description: 'Northern exit towards Kopargaon Railway Station and Godavari river valley.',
    icon: '🛤️',
    latitude: 19.7891,
    longitude: 74.4855,
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Kopargaon+Road+Shirdi+Maharashtra',
    directionsUrl: 'https://www.google.com/maps/dir/?api=1&destination=19.7891,74.4855'
  },
  {
    id: 'rahata-maharashtra',
    name: 'Rahata, Maharashtra',
    regionId: 'shirdi-region',
    area: 'Rahata Taluka, Ahmednagar District',
    pincode: '423107',
    description: 'Neighboring municipal town center with residential colonies and local markets.',
    icon: '📍',
    latitude: 19.7135,
    longitude: 74.4988,
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Rahata+Maharashtra',
    directionsUrl: 'https://www.google.com/maps/dir/?api=1&destination=19.7135,74.4988'
  }
];

// Compatibility alias for Shirdi locations
const SHIRDI_SERVICE_LOCATIONS = SERVICE_LOCATIONS.filter(l => l.regionId === 'shirdi-region');

function getAllLocations() {
  return SERVICE_LOCATIONS;
}

function getShirdiLocations() {
  return SHIRDI_SERVICE_LOCATIONS;
}

function getDhuleLocations() {
  return SERVICE_LOCATIONS.filter(l => l.regionId === 'dhule-region');
}

function getLocationById(id) {
  return SERVICE_LOCATIONS.find(loc => loc.id === id) || null;
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

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    REGIONS,
    SERVICE_LOCATIONS,
    SHIRDI_SERVICE_LOCATIONS,
    getAllLocations,
    getShirdiLocations,
    getDhuleLocations,
    getLocationById,
    getSavedServiceLocation,
    saveServiceLocation,
    buildGoogleMapsDirectionsUrl,
    buildGoogleMapsViewUrl
  };
}
