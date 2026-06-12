import { useParams, useNavigate, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { Clock, Users, Car, MapPin, MessageSquare, Navigation, Shield } from 'lucide-react'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import MapView from '../components/MapView'
import BookingModal from '../components/BookingModal'
import StarRating from '../components/StarRating'
import ChatBox from '../components/ChatBox'
import LoadingSpinner from '../components/LoadingSpinner'

export default function RideDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [ride, setRide] = useState(null)
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [showBook, setShowBook] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [safetyTips, setSafetyTips] = useState([])

  useEffect(() => {
    Promise.all([
      api.get(`/rides/${id}`),
      api.get('/ai/safety-tips').catch(() => ({ data: { tips: [] } })),
    ]).then(([{ data: rideData }, { data: aiData }]) => {
      setRide(rideData.ride)
      setBookings(rideData.bookings)
      setSafetyTips(aiData.tips || [])
    }).finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="lg" /></div>
  if (!ride) return <div className="p-8 text-center text-gray-500">Ride not found.</div>

  const driver = ride.driver || {}
  const isDriver = user?._id === driver._id
  const alreadyBooked = user && bookings.some((b) => b.passenger?._id === user._id && b.status !== 'cancelled')
  const canBook = user && !isDriver && !alreadyBooked && ride.status === 'scheduled' && ride.seats?.available > 0

  return (
    <div className="min-h-[calc(100vh-64px)] bg-violet-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <button onClick={() => navigate(-1)} className="text-violet-600 hover:underline text-sm mb-6 flex items-center gap-1">
          ← Back to results
        </button>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* Left */}
          <div className="lg:col-span-3 space-y-5">
            <div className="card">
              <div className="flex items-start justify-between mb-5">
                <div>
                  <span className={`badge ${ride.status === 'scheduled' ? 'bg-emerald-100 text-emerald-600' : ride.status === 'in_progress' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                    {ride.status.replace('_', ' ')}
                  </span>
                  <h1 className="text-xl font-bold text-gray-900 mt-2">
                    {ride.origin?.name?.split(',')[0]} → {ride.destination?.name?.split(',')[0]}
                  </h1>
                  <p className="text-gray-500 text-sm mt-1 flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {format(new Date(ride.departureTime), 'EEEE, MMMM d · h:mm a')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-violet-600">₹{ride.pricePerSeat}</p>
                  <p className="text-gray-400 text-sm">per seat</p>
                </div>
              </div>

              <div className="space-y-3 mb-5">
                <div className="flex gap-3 items-center text-sm">
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                  <span className="text-gray-700">{ride.origin?.name}</span>
                </div>
                <div className="ml-1 border-l-2 border-dashed border-violet-200 h-4" />
                <div className="flex gap-3 items-center text-sm">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <span className="text-gray-700">{ride.destination?.name}</span>
                </div>
              </div>

              <div className="flex gap-4 text-sm text-gray-500 flex-wrap border-t border-violet-50 pt-4">
                <span className="flex items-center gap-1.5">
                  <Users className="h-4 w-4 text-violet-400" />
                  {ride.seats?.available}/{ride.seats?.total} seats available
                </span>
                {ride.distance && (
                  <span className="flex items-center gap-1.5">
                    <Car className="h-4 w-4 text-violet-400" />
                    {ride.distance} km · {ride.duration} min
                  </span>
                )}
              </div>

              {ride.preferences && (
                <div className="flex gap-2 mt-4 flex-wrap">
                  {ride.preferences.womenOnly && <span className="badge bg-pink-100 text-pink-600">Women Only</span>}
                  {ride.preferences.pets && <span className="badge bg-amber-100 text-amber-600">Pets OK</span>}
                  <span className={`badge ${ride.preferences.smoking ? 'bg-gray-100 text-gray-500' : 'bg-emerald-100 text-emerald-600'}`}>
                    {ride.preferences.smoking ? 'Smoking Allowed' : 'No Smoking'}
                  </span>
                  {ride.preferences.music && <span className="badge bg-violet-100 text-violet-600">Music On</span>}
                </div>
              )}
            </div>

            <div className="card">
              <MapView
                origin={ride.origin}
                destination={ride.destination}
                polyline={ride.routePolyline || []}
                center={[ride.origin?.lat || 18.97, ride.origin?.lng || 72.82]}
                height="320px"
              />
            </div>

            {(user && (isDriver || alreadyBooked)) && (
              <div>
                <button
                  onClick={() => setShowChat(!showChat)}
                  className="btn-secondary flex items-center gap-2 mb-3"
                >
                  <MessageSquare className="h-4 w-4" />
                  {showChat ? 'Hide Chat' : 'Open Ride Chat'}
                </button>
                {showChat && <ChatBox rideId={id} />}
              </div>
            )}

            {ride.status === 'in_progress' && (
              <Link to={`/track/${id}`} className="btn-primary flex items-center gap-2 justify-center">
                <Navigation className="h-4 w-4" /> Track Live
              </Link>
            )}

            {safetyTips.length > 0 && (
              <div className="card">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Shield className="h-4 w-4 text-violet-500" /> Safety Tips
                </h3>
                <ul className="space-y-2">
                  {safetyTips.slice(0, 4).map((tip, i) => (
                    <li key={i} className="text-sm text-gray-600 flex gap-2">
                      <span className="text-violet-400 font-bold">·</span> {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Right */}
          <div className="lg:col-span-2 space-y-5">
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-4">Driver</h3>
              <Link to={`/profile/${driver._id}`} className="flex items-center gap-3 mb-4 hover:bg-violet-50 -m-2 p-2 rounded-xl transition">
                <div className="w-14 h-14 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 font-bold text-xl">
                  {driver.name?.[0] || '?'}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{driver.name}</p>
                  <StarRating rating={driver.rating?.average || 0} count={driver.rating?.count || 0} />
                </div>
              </Link>
              {driver.vehicle && (
                <div className="bg-violet-50 rounded-xl p-3 text-sm text-gray-600 flex items-center gap-2">
                  <Car className="h-4 w-4 text-violet-400" />
                  <span>{driver.vehicle.color} {driver.vehicle.make} {driver.vehicle.model} · {driver.vehicle.plate}</span>
                </div>
              )}
            </div>

            {bookings.length > 0 && (
              <div className="card">
                <h3 className="font-semibold text-gray-900 mb-3">Passengers ({bookings.length})</h3>
                <div className="space-y-2">
                  {bookings.map((b) => (
                    <div key={b._id} className="flex items-center gap-2 text-sm">
                      <div className="w-7 h-7 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 font-semibold text-xs">
                        {b.passenger?.name?.[0]}
                      </div>
                      <span className="text-gray-700">{b.passenger?.name}</span>
                      <span className={`badge ml-auto ${b.status === 'confirmed' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                        {b.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="card">
              {!user ? (
                <div className="text-center">
                  <p className="text-gray-500 text-sm mb-3">Sign in to book this ride</p>
                  <Link to="/login" className="btn-primary block text-center">Sign In to Book</Link>
                </div>
              ) : isDriver ? (
                <div className="text-center text-gray-500 text-sm py-2">You are the driver of this ride</div>
              ) : alreadyBooked ? (
                <div className="text-center">
                  <div className="text-2xl mb-2">✓</div>
                  <p className="font-semibold text-emerald-600">Seat Booked!</p>
                  <p className="text-gray-400 text-sm mt-1">You have a seat on this ride</p>
                </div>
              ) : ride.seats?.available === 0 ? (
                <div className="text-center text-gray-500 text-sm py-2">No seats available</div>
              ) : (
                <button onClick={() => setShowBook(true)} className="btn-primary w-full">
                  Book Seat — ₹{ride.pricePerSeat}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {showBook && (
        <BookingModal
          ride={ride}
          onClose={() => setShowBook(false)}
          onSuccess={() => window.location.reload()}
        />
      )}
    </div>
  )
}
