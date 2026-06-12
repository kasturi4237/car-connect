const DETOUR_THRESHOLD_KM = 3

function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function nearestPointIndex(polyline, lat, lng) {
  let minDist = Infinity
  let idx = 0
  polyline.forEach((pt, i) => {
    const d = haversineKm(lat, lng, pt.lat, pt.lng)
    if (d < minDist) { minDist = d; idx = i }
  })
  return { idx, dist: minDist }
}

function matchesRoute(ride, passengerOriginLat, passengerOriginLng, passengerDestLat, passengerDestLng) {
  const polyline = ride.routePolyline
  if (!polyline || polyline.length === 0) {
    const directDist = haversineKm(
      ride.origin.lat, ride.origin.lng,
      ride.destination.lat, ride.destination.lng
    )
    const pickupDist = haversineKm(passengerOriginLat, passengerOriginLng, ride.origin.lat, ride.origin.lng)
    const dropoffDist = haversineKm(passengerDestLat, passengerDestLng, ride.destination.lat, ride.destination.lng)
    return pickupDist <= DETOUR_THRESHOLD_KM && dropoffDist <= DETOUR_THRESHOLD_KM
      ? { matches: true, detour: (pickupDist + dropoffDist) / 2 }
      : { matches: false }
  }

  const { idx: pickupIdx, dist: pickupDist } = nearestPointIndex(polyline, passengerOriginLat, passengerOriginLng)
  const { idx: dropoffIdx, dist: dropoffDist } = nearestPointIndex(polyline, passengerDestLat, passengerDestLng)

  if (pickupDist > DETOUR_THRESHOLD_KM || dropoffDist > DETOUR_THRESHOLD_KM) return { matches: false }
  if (pickupIdx >= dropoffIdx) return { matches: false }

  return { matches: true, detour: (pickupDist + dropoffDist) / 2 }
}

function scoreRide(ride, detour, timeDiffMinutes) {
  const detourScore = Math.max(0, 1 - detour / DETOUR_THRESHOLD_KM) * 40
  const timeScore = Math.max(0, 1 - timeDiffMinutes / 120) * 30
  const ratingScore = (ride.driver?.rating?.average || 3) / 5 * 20
  const priceScore = Math.max(0, 1 - ride.pricePerSeat / 200) * 10
  return detourScore + timeScore + ratingScore + priceScore
}

module.exports = { matchesRoute, scoreRide, haversineKm }
