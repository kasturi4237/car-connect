import { useState, useEffect, useRef } from 'react'
import { MapPin, Search, Calendar, Users, SlidersHorizontal } from 'lucide-react'
import api from '../services/api'
import RideCard from '../components/RideCard'
import LoadingSpinner from '../components/LoadingSpinner'
import axios from 'axios'

function LocationInput({ label, value, onChange, placeholder }) {
  const [query, setQuery] = useState(value?.name || '')
  const [suggestions, setSuggestions] = useState([])
  const [open, setOpen] = useState(false)
  const timerRef = useRef(null)

  const search = (q) => {
    setQuery(q)
    clearTimeout(timerRef.current)
    if (q.length < 3) { setSuggestions([]); return }
    timerRef.current = setTimeout(async () => {
      try {
        const { data } = await axios.get(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=5&countrycodes=in`,
          { headers: { 'User-Agent': 'CarpoolConnect/1.0' } }
        )
        setSuggestions(data.map((r) => ({ name: r.display_name.split(',').slice(0, 2).join(','), lat: parseFloat(r.lat), lng: parseFloat(r.lon) })))
        setOpen(true)
      } catch {}
    }, 400)
  }

  const select = (s) => {
    setQuery(s.name)
    onChange(s)
    setSuggestions([])
    setOpen(false)
  }

  return (
    <div className="relative flex-1 min-w-0">
      <label className="label">{label}</label>
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-violet-400" />
        <input
          className="input pl-9"
          placeholder={placeholder}
          value={query}
          onChange={(e) => search(e.target.value)}
          onFocus={() => suggestions.length && setOpen(true)}
        />
      </div>
      {open && suggestions.length > 0 && (
        <div className="absolute z-20 mt-1 w-full bg-white border border-violet-100 rounded-xl shadow-lg overflow-hidden">
          {suggestions.map((s, i) => (
            <button key={i} onClick={() => select(s)} className="w-full text-left px-4 py-2.5 hover:bg-violet-50 text-sm text-gray-700 border-b border-violet-50 last:border-0">
              <MapPin className="inline h-3.5 w-3.5 text-violet-400 mr-2" />
              {s.name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function SearchRides() {
  const [origin, setOrigin] = useState(null)
  const [destination, setDestination] = useState(null)
  const [date, setDate] = useState('')
  const [seats, setSeats] = useState(1)
  const [rides, setRides] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const handleSearch = async (e) => {
    e.preventDefault()
    setLoading(true)
    setSearched(true)
    try {
      const params = { seats }
      if (origin) { params.originLat = origin.lat; params.originLng = origin.lng }
      if (destination) { params.destLat = destination.lat; params.destLng = destination.lng }
      if (date) params.date = date
      const { data } = await api.get('/rides', { params })
      setRides(data.rides)
    } catch {
      setRides([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    api.get('/rides').then(({ data }) => setRides(data.rides)).catch(() => {})
  }, [])

  return (
    <div className="min-h-[calc(100vh-64px)] bg-violet-50">
      <div className="bg-white border-b border-violet-100 py-8 px-4">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Find a Ride</h1>
          <form onSubmit={handleSearch}>
            <div className="flex flex-wrap gap-4 items-end">
              <LocationInput label="From" value={origin} onChange={setOrigin} placeholder="Mumbai Central" />
              <LocationInput label="To" value={destination} onChange={setDestination} placeholder="Pune Station" />
              <div className="w-40">
                <label className="label">Date</label>
                <input type="date" className="input" value={date} onChange={(e) => setDate(e.target.value)} min={new Date().toISOString().split('T')[0]} />
              </div>
              <div className="w-28">
                <label className="label">Seats</label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-violet-400" />
                  <input type="number" min="1" max="6" className="input pl-9" value={seats} onChange={(e) => setSeats(parseInt(e.target.value))} />
                </div>
              </div>
              <button type="submit" className="btn-primary flex items-center gap-2 h-[42px] px-6 mt-5">
                <Search className="h-4 w-4" /> Search
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
        ) : rides.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🚗</div>
            <p className="text-gray-500 text-lg">{searched ? 'No rides found. Try different locations or date.' : 'Search above to find available rides.'}</p>
          </div>
        ) : (
          <>
            <p className="text-gray-500 text-sm mb-4">{rides.length} ride{rides.length !== 1 ? 's' : ''} found</p>
            <div className="grid md:grid-cols-2 gap-4">
              {rides.map((ride) => <RideCard key={ride._id} ride={ride} />)}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
