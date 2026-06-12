import { useState } from 'react'
import { X, IndianRupee, Users, CheckCircle } from 'lucide-react'
import api from '../services/api'

export default function BookingModal({ ride, onClose, onSuccess }) {
  const [seats, setSeats] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const total = ride.pricePerSeat * seats
  const maxSeats = ride.seats?.available || 1

  const handleBook = async () => {
    setLoading(true)
    setError('')
    try {
      await api.post('/bookings', { rideId: ride._id, seats })
      setDone(true)
      setTimeout(() => { onSuccess?.(); onClose() }, 1800)
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-violet-100">
          <h2 className="text-lg font-bold text-gray-900">Confirm Booking</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {done ? (
          <div className="p-8 flex flex-col items-center gap-3">
            <CheckCircle className="h-16 w-16 text-emerald-500" />
            <p className="text-lg font-semibold text-gray-900">Booking Confirmed!</p>
            <p className="text-gray-500 text-sm">Your seat is reserved. Have a safe ride!</p>
          </div>
        ) : (
          <div className="p-5 space-y-4">
            <div className="bg-violet-50 rounded-xl p-4">
              <p className="text-sm font-medium text-gray-700">{ride.origin?.name}</p>
              <p className="text-xs text-gray-400 mt-1">→</p>
              <p className="text-sm font-medium text-gray-700">{ride.destination?.name}</p>
            </div>

            <div>
              <label className="label">Number of Seats</label>
              <div className="flex items-center gap-3">
                <button
                  className="w-9 h-9 rounded-xl bg-violet-100 text-violet-600 font-bold hover:bg-violet-200 transition"
                  onClick={() => setSeats(Math.max(1, seats - 1))}
                >−</button>
                <span className="text-xl font-bold w-8 text-center">{seats}</span>
                <button
                  className="w-9 h-9 rounded-xl bg-violet-100 text-violet-600 font-bold hover:bg-violet-200 transition"
                  onClick={() => setSeats(Math.min(maxSeats, seats + 1))}
                >+</button>
                <span className="text-sm text-gray-400">({maxSeats} available)</span>
              </div>
            </div>

            <div className="bg-violet-50 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Fare</p>
                <p className="text-2xl font-bold text-violet-600">₹{total}</p>
              </div>
              <div className="text-right text-sm text-gray-500">
                <p>₹{ride.pricePerSeat} × {seats} seat{seats > 1 ? 's' : ''}</p>
                <p className="text-emerald-600 font-medium mt-1">✓ Instant confirmation</p>
              </div>
            </div>

            {error && <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

            <button
              onClick={handleBook}
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {loading ? 'Processing...' : `Pay ₹${total} & Book`}
            </button>
            <p className="text-xs text-center text-gray-400">Simulated payment — no real charge</p>
          </div>
        )}
      </div>
    </div>
  )
}
