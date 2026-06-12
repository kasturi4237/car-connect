import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { Clock, Users, PlusCircle, CheckCircle } from 'lucide-react'
import api from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'

export default function MyRides() {
  const [rides, setRides] = useState([])
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('upcoming')

  useEffect(() => {
    Promise.all([
      api.get('/rides/my'),
      api.get('/bookings/my'),
    ])
      .then(([ridesRes, bookingsRes]) => {
        setRides(ridesRes.data.rides || [])
        setBookings(bookingsRes.data.asDriver || [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleStart = async (id) => {
    await api.put(`/rides/${id}/start`)
    setRides((prev) =>
      prev.map((r) =>
        r._id === id ? { ...r, status: 'in_progress' } : r
      )
    )
  }

  const handleComplete = async (id) => {
    await api.put(`/rides/${id}/complete`)
    setRides((prev) =>
      prev.map((r) =>
        r._id === id ? { ...r, status: 'completed' } : r
      )
    )
  }

  const handleCancel = async (id) => {
    if (!confirm('Cancel this ride?')) return

    await api.delete(`/rides/${id}`)

    setRides((prev) =>
      prev.map((r) =>
        r._id === id ? { ...r, status: 'cancelled' } : r
      )
    )
  }

  const confirmBooking = async (bookingId) => {
    await api.put(`/bookings/${bookingId}/confirm`)

    setBookings((prev) =>
      prev.map((b) =>
        b._id === bookingId
          ? { ...b, status: 'confirmed' }
          : b
      )
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const statusColor = {
    scheduled: 'bg-emerald-100 text-emerald-600',
    in_progress: 'bg-blue-100 text-blue-600',
    completed: 'bg-gray-100 text-gray-500',
    cancelled: 'bg-red-100 text-red-500',
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-violet-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            My Rides
          </h1>

          <Link
            to="/offer-ride"
            className="btn-primary flex items-center gap-2 text-sm"
          >
            <PlusCircle className="h-4 w-4" />
            Offer New Ride
          </Link>
        </div>

        <div className="flex gap-1 bg-white rounded-xl p-1 border border-violet-100 mb-6 w-fit">
          {['upcoming', 'passenger_requests', 'all'].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition capitalize ${
                tab === t
                  ? 'bg-violet-500 text-white'
                  : 'text-gray-600 hover:bg-violet-50'
              }`}
            >
              {t.replace('_', ' ')}
            </button>
          ))}
        </div>

        {tab === 'passenger_requests' ? (
          <div className="space-y-4">

            {bookings.length === 0 ? (
              <div className="card text-center py-10 text-gray-400">
                No passenger requests yet
              </div>
            ) : (
              bookings.map((b) => (
                <div
                  key={b._id}
                  className="card flex items-center justify-between gap-4"
                >

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 font-bold">
                      {b.passenger?.name?.[0]}
                    </div>

                    <div>
                      <p className="font-medium text-gray-900">
                        {b.passenger?.name}
                      </p>

                      <p className="text-sm text-gray-500">
                        {b.seats} seat{b.seats > 1 ? 's' : ''} · ₹{b.totalFare}
                      </p>

                      <p className="text-xs text-gray-400">
                        {b.ride?.origin?.name?.split(',')[0]}
                        {' → '}
                        {b.ride?.destination?.name?.split(',')[0]}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">

                    <span
                      className={`badge ${
                        b.status === 'confirmed'
                          ? 'bg-emerald-100 text-emerald-600'
                          : 'bg-amber-100 text-amber-600'
                      }`}
                    >
                      {b.status}
                    </span>

                    {b.status === 'pending' && (
                      <button
                        onClick={() => confirmBooking(b._id)}
                        className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1"
                      >
                        <CheckCircle className="h-3 w-3" />
                        Confirm
                      </button>
                    )}

                  </div>

                </div>
              ))
            )}

          </div>
        ) : (
          <div className="space-y-4">

            {rides.length === 0 ? (
              <div className="card text-center py-12">

                <div className="text-4xl mb-3">
                  🚗
                </div>

                <p className="text-gray-500 mb-4">
                  You haven't offered any rides yet
                </p>

                <Link
                  to="/offer-ride"
                  className="btn-primary inline-flex items-center gap-2"
                >
                  <PlusCircle className="h-4 w-4" />
                  Offer Your First Ride
                </Link>

              </div>
            ) : (
              rides
                .filter((r) =>
                  tab === 'upcoming'
                    ? ['scheduled', 'in_progress'].includes(r.status)
                    : true
                )
                .map((ride) => (
                  <div
                    key={ride._id}
                    className="card"
                  >

                    <div className="flex items-start justify-between mb-3">

                      <div>
                        <span
                          className={`badge ${
                            statusColor[ride.status] ||
                            'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {ride.status?.replace('_', ' ')}
                        </span>

                        <h3 className="font-semibold text-gray-900 mt-1.5">
                          {ride.origin?.name?.split(',')[0]}
                          {' → '}
                          {ride.destination?.name?.split(',')[0]}
                        </h3>
                      </div>

                      <p className="text-lg font-bold text-violet-600">
                        ₹{ride.pricePerSeat}
                        <span className="text-xs text-gray-400 font-normal">
                          /seat
                        </span>
                      </p>

                    </div>

                    <div className="flex gap-4 text-sm text-gray-500 mb-4">

                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-violet-400" />
                        {format(
                          new Date(ride.departureTime),
                          'MMM d, h:mm a'
                        )}
                      </span>

                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-violet-400" />
                        {ride.seats?.available}/{ride.seats?.total} available
                      </span>

                    </div>

                    <div className="flex gap-2 flex-wrap">

                      <Link
                        to={`/rides/${ride._id}`}
                        className="btn-secondary text-sm py-1.5 px-3"
                      >
                        View
                      </Link>

                      {ride.status === 'scheduled' && (
                        <>
                          <button
                            onClick={() => handleStart(ride._id)}
                            className="btn-primary text-sm py-1.5 px-3"
                          >
                            Start Ride
                          </button>

                          <button
                            onClick={() => handleCancel(ride._id)}
                            className="text-sm py-1.5 px-3 border border-red-200 text-red-500 rounded-xl hover:bg-red-50 transition"
                          >
                            Cancel
                          </button>
                        </>
                      )}

                      {ride.status === 'in_progress' && (
                        <>
                          <Link
                            to={`/track/${ride._id}`}
                            className="btn-primary text-sm py-1.5 px-3"
                          >
                            Track Live
                          </Link>

                          <button
                            onClick={() => handleComplete(ride._id)}
                            className="btn-secondary text-sm py-1.5 px-3"
                          >
                            Complete
                          </button>
                        </>
                      )}

                    </div>

                  </div>
                ))
            )}

          </div>
        )}

      </div>
    </div>
  )
}