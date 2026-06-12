const axios = require('axios')

const OSRM_BASE = 'http://router.project-osrm.org/route/v1/driving'

async function getRoute(originLat, originLng, destLat, destLng) {
  const url = `${OSRM_BASE}/${originLng},${originLat};${destLng},${destLat}?overview=full&geometries=geojson`
  const { data } = await axios.get(url, { timeout: 8000 })
  if (!data.routes || data.routes.length === 0) throw new Error('No route found')

  const route = data.routes[0]
  const coordinates = route.geometry.coordinates.map(([lng, lat]) => ({ lat, lng }))

  return {
    polyline: coordinates,
    distance: Math.round(route.distance / 1000),
    duration: Math.round(route.duration / 60),
  }
}

async function geocode(query) {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5`
  const { data } = await axios.get(url, {
    headers: { 'User-Agent': 'CarpoolConnect/1.0' },
    timeout: 5000,
  })
  return data.map((r) => ({
    name: r.display_name,
    lat: parseFloat(r.lat),
    lng: parseFloat(r.lon),
  }))
}

module.exports = { getRoute, geocode }
