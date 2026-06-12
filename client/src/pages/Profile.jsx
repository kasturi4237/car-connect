import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Car, Star, Phone, Calendar, Shield } from 'lucide-react'
import { format } from 'date-fns'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import StarRating from '../components/StarRating'
import LoadingSpinner from '../components/LoadingSpinner'

export default function Profile() {
  const { id } = useParams()
  const { user: me } = useAuth()
  const [profile, setProfile] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get(`/auth/me`).catch(() => null),
      api.get(`/reviews/user/${id}`),
    ]).then(async ([_, reviewsRes]) => {
      const res = await fetch(`/api/auth/me`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      }).catch(() => null)
      setReviews(reviewsRes.data.reviews || [])
    }).finally(() => setLoading(false))

    fetch(`/api/auth/me`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (data) setProfile(data.user) })
      .catch(() => {})

    api.get('/reviews/user/' + id).then(({ data }) => {
      setReviews(data.reviews || [])
      setLoading(false)
    })
  }, [id])

  const isMe = me?._id === id

  if (loading) return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="lg" /></div>

  const displayUser = profile || me

  return (
    <div className="min-h-[calc(100vh-64px)] bg-violet-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="card mb-6">
          <div className="flex items-start gap-5">
            <div className="w-20 h-20 rounded-2xl bg-violet-100 flex items-center justify-center text-violet-600 font-bold text-3xl flex-shrink-0">
              {displayUser?.name?.[0] || '?'}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold text-gray-900">{displayUser?.name}</h1>
                {displayUser?.verified && (
                  <span className="badge bg-blue-100 text-blue-600">
                    <Shield className="h-3 w-3" /> Verified
                  </span>
                )}
                <span className="badge bg-violet-100 text-violet-600 capitalize">{displayUser?.role}</span>
              </div>
              <StarRating rating={displayUser?.rating?.average || 0} count={displayUser?.rating?.count || 0} size="lg" />
              {displayUser?.phone && (
                <p className="text-sm text-gray-500 mt-2 flex items-center gap-1.5">
                  <Phone className="h-4 w-4 text-violet-400" />{displayUser.phone}
                </p>
              )}
              {displayUser?.createdAt && (
                <p className="text-xs text-gray-400 mt-1 flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  Member since {format(new Date(displayUser.createdAt), 'MMMM yyyy')}
                </p>
              )}
            </div>
          </div>

          {displayUser?.vehicle && (displayUser.role === 'driver' || displayUser.role === 'both') && (
            <div className="mt-4 pt-4 border-t border-violet-50">
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Car className="h-4 w-4 text-violet-500" /> Vehicle
              </h3>
              <div className="flex items-center gap-3 bg-violet-50 rounded-xl p-3 text-sm">
                <div className="w-10 h-10 rounded-lg bg-violet-200 flex items-center justify-center text-xl">🚗</div>
                <div>
                  <p className="font-medium text-gray-800">
                    {displayUser.vehicle.color} {displayUser.vehicle.make} {displayUser.vehicle.model}
                  </p>
                  <p className="text-gray-500">{displayUser.vehicle.plate} · {displayUser.vehicle.seats} seats</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Reviews ({reviews.length})
          </h2>
          {reviews.length === 0 ? (
            <div className="card text-center py-8 text-gray-400">No reviews yet</div>
          ) : (
            <div className="space-y-4">
              {reviews.map((r) => (
                <div key={r._id} className="card">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 font-semibold text-sm">
                      {r.reviewer?.name?.[0]}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{r.reviewer?.name}</p>
                      <StarRating rating={r.rating} />
                    </div>
                    <p className="text-xs text-gray-400 ml-auto">{format(new Date(r.createdAt), 'MMM d, yyyy')}</p>
                  </div>
                  {r.comment && <p className="text-sm text-gray-600">{r.comment}</p>}
                  {r.ride && (
                    <p className="text-xs text-gray-400 mt-2">
                      {r.ride.origin?.name?.split(',')[0]} → {r.ride.destination?.name?.split(',')[0]}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
