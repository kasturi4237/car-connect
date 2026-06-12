import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { Clock, Users, MapPin, Star } from 'lucide-react'
import api from '../services/api'
import StarRating from '../components/StarRating'
import LoadingSpinner from '../components/LoadingSpinner'

function ReviewModal({ booking, onClose, onDone }) {
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    setLoading(true)
    try {
      await api.post('/reviews', {
        rideId: booking.ride?._id,
        revieweeId: booking.ride?.driver?._id,
        rating,
        comment,
      })
      onDone()
      onClose()
    } catch {}
    finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-5">
        <h2 className="font-bold text-gray-900 mb-4">Rate your ride</h2>
        <div className="flex justify-center mb-4">
          <StarRating rating={rating} interactive onRate={setRating} size="lg" />
        </div>
        <textarea
          className="input resize-none h-24 mb-4"
          placeholder="Leave a comment (optional)..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        <div className="flex gap-2">
          <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button onClick={submit} disabled={loading} className="btn-primary flex-1">
            {loading ? 'Submitting...' : 'Submit Review'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function MyBookings() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [reviewBooking, setReviewBooking] = useState(null)
  const [reviewed, setReviewed] = useState(new Set())

  useEffect(() => {
    api.get('/bookings/my').then(({ data }) => setBookings(data.asPassenger || [])).finally(() => setLoading(false))
  }, [])

  const handleCancel = async (id) => {
    if (!confirm('Cancel this booking?')) return
    await api.put(`/bookings/${id}/cancel`)
    setBookings((prev) => prev.map((b) => b._id === id ? { ...b, status: 'cancelled', paymentStatus: 'refunded' } : b))
  }

  const statusColor = {
    pending: 'bg-amber-100 text-amber-600',
    confirmed: 'bg-emerald-100 text-emerald-600',
    completed: 'bg-violet-100 text-violet-600',
    cancelled: 'bg-red-100 text-red-500',
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="lg" /></div>

  return (
    <div className="min-h-[calc(100vh-64px)] bg-violet-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">My Bookings</h1>

        {bookings.length === 0 ? (
          <div className="card text-center py-12">
            <div className="text-4xl mb-3">🗺️</div>
            <p className="text-gray-500 mb-4">No bookings yet</p>
            <Link to="/search" className="btn-primary inline-block">Find a Ride</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => {
              const ride = booking.ride || {}
              const driver = ride.driver || {}
              return (
                <div key={booking._id} className="card">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <span className={`badge ${statusColor[booking.status]}`}>{booking.status}</span>
                      {booking.paymentStatus === 'refunded' && (
                        <span className="badge bg-blue-100 text-blue-500 ml-2">Refunded</span>
                      )}
                      <h3 className="font-semibold text-gray-900 mt-1.5">
                        {ride.origin?.name?.split(',')[0]} → {ride.destination?.name?.split(',')[0]}
                      </h3>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-violet-600">₹{booking.totalFare}</p>
                      <p className="text-xs text-gray-400">{booking.seats} seat{booking.seats > 1 ? 's' : ''}</p>
                    </div>
                  </div>

                  <div className="flex gap-4 text-sm text-gray-500 mb-3 flex-wrap">
                    {ride.departureTime && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-violet-400" />
                        {format(new Date(ride.departureTime), 'MMM d, h:mm a')}
                      </span>
                    )}
                    <span className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 text-xs font-bold">
                        {driver.name?.[0]}
                      </div>
                      {driver.name}
                    </span>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    {ride._id && (
                      <Link to={`/rides/${ride._id}`} className="btn-secondary text-sm py-1.5 px-3">View Ride</Link>
                    )}
                    {ride._id && booking.status === 'in_progress' && (
                      <Link to={`/track/${ride._id}`} className="btn-primary text-sm py-1.5 px-3">Track Live</Link>
                    )}
                    {['pending', 'confirmed'].includes(booking.status) && (
                      <button onClick={() => handleCancel(booking._id)} className="text-sm py-1.5 px-3 border border-red-200 text-red-500 rounded-xl hover:bg-red-50 transition">
                        Cancel
                      </button>
                    )}
                    {booking.status === 'completed' && !reviewed.has(booking._id) && (
                      <button onClick={() => setReviewBooking(booking)} className="btn-secondary text-sm py-1.5 px-3 flex items-center gap-1">
                        <Star className="h-3.5 w-3.5" /> Rate Ride
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {reviewBooking && (
        <ReviewModal
          booking={reviewBooking}
          onClose={() => setReviewBooking(null)}
          onDone={() => setReviewed((prev) => new Set([...prev, reviewBooking._id]))}
        />
      )}
    </div>
  )
}
