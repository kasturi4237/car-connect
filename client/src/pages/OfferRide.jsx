import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, Clock, Users, IndianRupee, Sparkles } from 'lucide-react'
import api from '../services/api'
import MapView from '../components/MapView'
import axios from 'axios'

function LocationInput({ label, value, onChange, placeholder }) {
  const [query, setQuery] = useState(value?.name || '')
  const [suggestions, setSuggestions] = useState([])
  const timerRef = useRef(null)

  const search = (q) => {
    setQuery(q)
    clearTimeout(timerRef.current)
    if (q.length < 3) { setSuggestions([]); return }
    timerRef.current = setTimeout(async () => {
      const { data } = await axios.get(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=5&countrycodes=in`,
        { headers: { 'User-Agent': 'CarpoolConnect/1.0' } }
      )
      setSuggestions(data.map((r) => ({ name: r.display_name.split(',').slice(0, 2).join(','), lat: parseFloat(r.lat), lng: parseFloat(r.lon) })))
    }, 400)
  }

  const select = (s) => { setQuery(s.name); onChange(s); setSuggestions([]) }

  return (
    <div className="relative">
      <label className="label">{label}</label>
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-violet-400" />
        <input className="input pl-9" placeholder={placeholder} value={query} onChange={(e) => search(e.target.value)} />
      </div>
      {suggestions.length > 0 && (
        <div className="absolute z-20 mt-1 w-full bg-white border border-violet-100 rounded-xl shadow-lg overflow-hidden">
          {suggestions.map((s, i) => (
            <button key={i} onClick={() => select(s)} className="w-full text-left px-4 py-2.5 hover:bg-violet-50 text-sm text-gray-700 border-b border-violet-50 last:border-0">
              <MapPin className="inline h-3.5 w-3.5 text-violet-400 mr-2" />{s.name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function OfferRide() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    origin: null, destination: null, departureTime: '', seats: 2, pricePerSeat: '',
    preferences: { smoking: false, pets: false, music: true, womenOnly: false },
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [priceHint, setPriceHint] = useState(null)
  const [priceLoading, setPriceLoading] = useState(false)

  const update = (k, v) => setForm((p) => ({ ...p, [k]: v }))
  const updatePref = (k) => setForm((p) => ({ ...p, preferences: { ...p.preferences, [k]: !p.preferences[k] } }))

  const getAIPrice = async () => {
    if (!form.origin || !form.destination) return
    setPriceLoading(true)
    try {
      const { data } = await api.post('/ai/price-estimate', { distance: 50 })
      update('pricePerSeat', data.estimatedPrice)
      setPriceHint(data.reasoning)
    } catch {}
    finally { setPriceLoading(false) }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.origin || !form.destination) { setError('Please select origin and destination'); return }
    setError('')
    setLoading(true)
    try {
      const { data } = await api.post('/rides', {
        origin: form.origin,
        destination: form.destination,
        departureTime: form.departureTime,
        seats: form.seats,
        pricePerSeat: parseFloat(form.pricePerSeat),
        preferences: form.preferences,
      })
      navigate(`/rides/${data.ride._id}`)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post ride')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-violet-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Offer a Ride</h1>

        <div className="grid lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="card space-y-4">
                <h2 className="font-semibold text-gray-900">Route</h2>
                <LocationInput label="From" value={form.origin} onChange={(v) => update('origin', v)} placeholder="Pickup city or area" />
                <LocationInput label="To" value={form.destination} onChange={(v) => update('destination', v)} placeholder="Destination city or area" />
              </div>

              <div className="card space-y-4">
                <h2 className="font-semibold text-gray-900">Trip Details</h2>
                <div>
                  <label className="label">Departure Date & Time</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-violet-400" />
                    <input
                      type="datetime-local"
                      className="input pl-9"
                      value={form.departureTime}
                      onChange={(e) => update('departureTime', e.target.value)}
                      min={new Date().toISOString().slice(0, 16)}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Available Seats</label>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-violet-400" />
                      <input type="number" min="1" max="6" className="input pl-9" value={form.seats} onChange={(e) => update('seats', parseInt(e.target.value))} required />
                    </div>
                  </div>
                  <div>
                    <label className="label">Price per Seat (₹)</label>
                    <div className="flex gap-2">
                      <input type="number" min="1" className="input" placeholder="250" value={form.pricePerSeat} onChange={(e) => update('pricePerSeat', e.target.value)} required />
                      <button type="button" onClick={getAIPrice} disabled={priceLoading} className="btn-secondary px-3 flex-shrink-0" title="AI price suggestion">
                        <Sparkles className="h-4 w-4 text-violet-500" />
                      </button>
                    </div>
                    {priceHint && <p className="text-xs text-violet-500 mt-1">{priceHint}</p>}
                  </div>
                </div>
              </div>

              <div className="card space-y-3">
                <h2 className="font-semibold text-gray-900">Preferences</h2>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { key: 'smoking', label: 'Smoking Allowed', emoji: '🚬' },
                    { key: 'pets', label: 'Pets Allowed', emoji: '🐾' },
                    { key: 'music', label: 'Music On', emoji: '🎵' },
                    { key: 'womenOnly', label: 'Women Only', emoji: '👩' },
                  ].map((opt) => (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => updatePref(opt.key)}
                      className={`p-3 rounded-xl border-2 text-sm font-medium text-left transition ${
                        form.preferences[opt.key]
                          ? 'border-violet-500 bg-violet-50 text-violet-700'
                          : 'border-gray-200 text-gray-600 hover:border-violet-200'
                      }`}
                    >
                      <span className="mr-2">{opt.emoji}</span>{opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {error && <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

              <button type="submit" disabled={loading} className="btn-primary w-full text-base py-3">
                {loading ? 'Posting Ride...' : 'Post Ride'}
              </button>
            </form>
          </div>

          <div className="lg:col-span-2">
            <div className="card sticky top-24">
              <h3 className="font-semibold text-gray-900 mb-3">Route Preview</h3>
              <MapView
                origin={form.origin}
                destination={form.destination}
                center={[18.9696, 72.8197]}
                height="350px"
              />
              {form.origin && form.destination && (
                <div className="mt-3 text-sm text-gray-500 space-y-1">
                  <p className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />{form.origin.name}</p>
                  <p className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-red-400 flex-shrink-0" />{form.destination.name}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
