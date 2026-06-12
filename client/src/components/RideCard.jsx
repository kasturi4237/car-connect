import { Link } from 'react-router-dom'
import { MapPin, Clock, Users, IndianRupee, Star, Car } from 'lucide-react'
import { format } from 'date-fns'

export default function RideCard({ ride }) {
  const driver = ride.driver || {}
  const available = ride.seats?.available ?? 0
  const total = ride.seats?.total ?? 0

  return (
    <Link to={`/rides/${ride._id}`} className="card hover:shadow-md hover:border-violet-200 transition-all duration-200 block group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 font-bold text-lg">
            {driver.name?.[0] || '?'}
          </div>
          <div>
            <p className="font-semibold text-gray-900">{driver.name || 'Driver'}</p>
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span>{driver.rating?.average?.toFixed(1) || '—'}</span>
              <span className="text-gray-300">·</span>
              <span>{driver.vehicle?.make} {driver.vehicle?.model}</span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold text-violet-600">₹{ride.pricePerSeat}</p>
          <p className="text-xs text-gray-400">per seat</p>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm">
          <div className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
          <span className="text-gray-700 truncate">{ride.origin?.name}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className="w-2 h-2 rounded-full bg-red-400 flex-shrink-0" />
          <span className="text-gray-700 truncate">{ride.destination?.name}</span>
        </div>
      </div>

      <div className="flex items-center gap-4 text-sm text-gray-500 flex-wrap">
        <span className="flex items-center gap-1">
          <Clock className="h-4 w-4 text-violet-400" />
          {format(new Date(ride.departureTime), 'MMM d, h:mm a')}
        </span>
        <span className="flex items-center gap-1">
          <Users className="h-4 w-4 text-violet-400" />
          {available}/{total} seats
        </span>
        {ride.distance && (
          <span className="flex items-center gap-1">
            <Car className="h-4 w-4 text-violet-400" />
            {ride.distance} km
          </span>
        )}
      </div>

      {ride.preferences && (
        <div className="flex gap-2 mt-3 flex-wrap">
          {ride.preferences.womenOnly && (
            <span className="badge bg-pink-100 text-pink-600">Women Only</span>
          )}
          {ride.preferences.pets && (
            <span className="badge bg-amber-100 text-amber-600">Pets OK</span>
          )}
          {ride.preferences.smoking && (
            <span className="badge bg-gray-100 text-gray-500">Smoking</span>
          )}
          {!ride.preferences.smoking && (
            <span className="badge bg-emerald-100 text-emerald-600">No Smoking</span>
          )}
        </div>
      )}
    </Link>
  )
}
