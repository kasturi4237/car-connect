import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import { useEffect } from 'react'

const carIcon = L.divIcon({
  html: `<div class="bg-violet-500 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-lg text-sm">🚗</div>`,
  className: '',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
})

const pinIcon = (color = 'violet') => L.divIcon({
  html: `<div class="bg-${color}-500 w-4 h-4 rounded-full border-2 border-white shadow-md"></div>`,
  className: '',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
})

function FitBounds({ positions }) {
  const map = useMap()
  useEffect(() => {
    if (positions && positions.length > 1) {
      map.fitBounds(positions, { padding: [40, 40] })
    }
  }, [positions, map])
  return null
}

export default function MapView({
  center = [18.9696, 72.8197],
  zoom = 12,
  origin,
  destination,
  polyline = [],
  driverLocation,
  height = '400px',
  className = '',
}) {
  const bounds = []
  if (origin) bounds.push([origin.lat, origin.lng])
  if (destination) bounds.push([destination.lat, destination.lng])

  return (
    <MapContainer center={center} zoom={zoom} style={{ height }} className={`w-full ${className}`}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>'
      />
      {bounds.length > 1 && <FitBounds positions={bounds} />}

      {polyline.length > 1 && (
        <Polyline
          positions={polyline.map((p) => [p.lat, p.lng])}
          color="#8B5CF6"
          weight={4}
          opacity={0.8}
        />
      )}

      {origin && (
        <Marker position={[origin.lat, origin.lng]} icon={pinIcon('emerald')}>
          <Popup><strong>Pickup:</strong> {origin.name}</Popup>
        </Marker>
      )}

      {destination && (
        <Marker position={[destination.lat, destination.lng]} icon={pinIcon('red')}>
          <Popup><strong>Dropoff:</strong> {destination.name}</Popup>
        </Marker>
      )}

      {driverLocation && (
        <Marker position={[driverLocation.lat, driverLocation.lng]} icon={carIcon}>
          <Popup>Driver is here</Popup>
        </Marker>
      )}
    </MapContainer>
  )
}
