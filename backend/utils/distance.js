/**
 * Haversine Formula Utility
 * Calculates the great-circle distance between two points on the Earth's surface
 * given their latitude and longitude in decimal degrees.
 * 
 * Viva explanation:
 * Earth is spherical (approximate radius R = 6371 km).
 * The Haversine formula accounts for the Earth's curvature when computing distance.
 */

function toRadians(degrees) {
  return (degrees * Math.PI) / 180;
}

/**
 * Computes distance in kilometers between customer (lat1, lon1) and car wash (lat2, lon2)
 * @param {number} lat1 - Customer latitude
 * @param {number} lon1 - Customer longitude
 * @param {number} lat2 - Car Wash latitude
 * @param {number} lon2 - Car Wash longitude
 * @returns {number} Distance in kilometers rounded to 2 decimal places
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  if (lat1 === null || lon1 === null || lat2 === null || lon2 === null) {
    return null;
  }

  const R = 6371; // Earth's mean radius in kilometers

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const radLat1 = toRadians(lat1);
  const radLat2 = toRadians(lat2);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(radLat1) * Math.cos(radLat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = R * c;
  return Math.round(distance * 100) / 100; // 2 decimal precision
}

module.exports = { calculateDistance };
