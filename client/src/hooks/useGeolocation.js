import { useState, useCallback } from 'react'

export function useGeolocation() {
  const [location, setLocation] = useState(null)
  const [error, setError] = useState(null)

  const getLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported')
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => setError(err.message)
    )
  }, [])

  const watchLocation = useCallback((onUpdate) => {
    if (!navigator.geolocation) return null
    return navigator.geolocation.watchPosition(
      (pos) => onUpdate({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => setError(err.message),
      { enableHighAccuracy: true, maximumAge: 5000 }
    )
  }, [])

  const clearWatch = useCallback((watchId) => {
    if (watchId) navigator.geolocation.clearWatch(watchId)
  }, [])

  return { location, error, getLocation, watchLocation, clearWatch }
}
