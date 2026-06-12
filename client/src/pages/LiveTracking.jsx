import { useEffect, useState, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { Navigation, Clock, MapPin, AlertCircle } from 'lucide-react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import api from '../services/api'
import { useSocket } from '../context/SocketContext'
import { useAuth } from '../context/AuthContext'
import ChatBox from '../components/ChatBox'
import LoadingSpinner from '../components/LoadingSpinner'

const carIcon = L.divIcon({
  html: `<div style="background:#8B5CF6;color:white;border-radius:50%;width:36px;height:36px;display:flex;align-items:center;justify-content:center;font-size:18px;box-shadow:0 2px 8px rgba(0,0,0,0.2)">🚗</div>`,
  className: '',
  iconSize: [36, 36],
  iconAnchor: [18, 18],
})

function RecenterMap({ position }) {
  const map = useMap()
  useEffect(() => {
    if (position) map.setView([position.lat, position.lng], 14)
  }, [position, map])
  return null
}

export default function LiveTracking() {
  const { rideId } = useParams()
  const { user } = useAuth()
  const { joinRide, leaveRide, sendLocation, onEvent } = useSocket()
  const [ride, setRide] = useState(null)
  const [driverPos, setDriverPos] = useState(null)
  const [nearby, setNearby] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showChat, setShowChat] = useState(false)
  const watchRef = useRef(null)

  useEffect(() => {
    api.get(`/rides/${rideId}`).then(({ data }) => setRide(data.ride)).finally(() => setLoading(false))
    joinRide(rideId)

    const offLocation = onEvent('location:update', ({ lat, lng }) => setDriverPos({ lat, lng }))
    const offNearby = onEvent('ride:nearby', () => setNearby(true))

    return () => {
      leaveRide(rideId)
      offLocation?.()
      offNearby?.()
    }
  }, [rideId])

  useEffect(() => {
    if (!ride || !user || ride.driver?._id !== user._id) return
    if (!navigator.geolocation) return
    watchRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        setDriverPos(loc)
        sendLocation(rideId, loc.lat, loc.lng)
      },
      null,
      { enableHighAccuracy: true }
    )
    return () => { if (watchRef.current) navigator.geolocation.clearWatch(watchRef.current) }
  }, [ride, user])

  if (loading) return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="lg" /></div>
  if (!ride) return <div className="p-8 text-center text-gray-500">Ride not found.</div>

  const isDriver = user?._id === ride.driver?._id
  const defaultCenter = ride.origin ? [ride.origin.lat, ride.origin.lng] : [18.97, 72.82]

  return (
    <div className="min-h-[calc(100vh-64px)] bg-violet-50">
      <div className="bg-white border-b border-violet-100 px-4 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="font-bold text-gray-900 flex items-center gap-2">
              <Navigation className="h-5 w-5 text-violet-500" /> Live Tracking
            </h1>
            <p className="text-sm text-gray-500">
              {ride.origin?.name?.split(',')[0]} → {ride.destination?.name?.split(',')[0]}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-sm text-emerald-600 font-medium">Live</span>
          </div>
        </div>
      </div>

      {nearby && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-3 text-center text-sm text-amber-700 flex items-center justify-center gap-2">
          <AlertCircle className="h-4 w-4" /> Driver is nearby — get ready!
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 py-6 grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <MapContainer center={driverPos ? [driverPos.lat, driverPos.lng] : defaultCenter} zoom={13} style={{ height: '480px' }} className="w-full rounded-2xl">
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>' />
            {driverPos && <RecenterMap position={driverPos} />}
            {ride.routePolyline?.length > 1 && (
              <Polyline positions={ride.routePolyline.map((p) => [p.lat, p.lng])} color="#8B5CF6" weight={4} opacity={0.7} />
            )}
            {ride.origin && (
              <Marker position={[ride.origin.lat, ride.origin.lng]}>
                <Popup>Pickup: {ride.origin.name}</Popup>
              </Marker>
            )}
            {ride.destination && (
              <Marker position={[ride.destination.lat, ride.destination.lng]}>
                <Popup>Destination: {ride.destination.name}</Popup>
              </Marker>
            )}
            {driverPos && (
              <Marker position={[driverPos.lat, driverPos.lng]} icon={carIcon}>
                <Popup>Driver is here</Popup>
              </Marker>
            )}
          </MapContainer>

          {!driverPos && (
            <div className="mt-4 bg-violet-50 border border-violet-100 rounded-xl px-4 py-3 text-sm text-violet-600 text-center">
              Waiting for driver's location...
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-3">Ride Info</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-gray-600">{ride.origin?.name?.split(',')[0]}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-400" />
                <span className="text-gray-600">{ride.destination?.name?.split(',')[0]}</span>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-violet-50">
              <p className="text-sm text-gray-500">
                Driver: <span className="font-medium text-gray-800">{ride.driver?.name}</span>
              </p>
              {ride.distance && (
                <p className="text-sm text-gray-500 mt-1">
                  Distance: <span className="font-medium text-gray-800">{ride.distance} km</span>
                </p>
              )}
              <span className={`badge mt-2 ${ride.status === 'in_progress' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'}`}>
                {ride.status?.replace('_', ' ')}
              </span>
            </div>
          </div>

          {isDriver && (
            <div className="card bg-violet-50 border-violet-200">
              <p className="text-sm font-medium text-violet-700">You are sharing your location</p>
              <p className="text-xs text-violet-500 mt-1">Passengers can see you in real-time</p>
            </div>
          )}

          <button onClick={() => setShowChat(!showChat)} className="btn-secondary w-full">
            {showChat ? 'Hide Chat' : 'Open Chat'}
          </button>
          {showChat && <ChatBox rideId={rideId} />}
        </div>
      </div>
    </div>
  )
}
