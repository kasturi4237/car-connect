import { Link } from 'react-router-dom'
import { Car, MapPin, CreditCard, Shield, Users, Leaf, ArrowRight, Star } from 'lucide-react'

const stats = [
  { label: 'Active Riders', value: '12,000+' },
  { label: 'Rides Completed', value: '85,000+' },
  { label: 'Cities Covered', value: '40+' },
  { label: 'CO₂ Saved (kg)', value: '2.4L+' },
]

const features = [
  { icon: MapPin, title: 'Smart Route Matching', desc: 'Our algorithm finds rides whose route passes near your pickup and dropoff points.', color: 'bg-violet-100 text-violet-600' },
  { icon: CreditCard, title: 'Auto Payment Split', desc: 'Fares are split equally among riders. Pay once, track easily.', color: 'bg-emerald-100 text-emerald-600' },
  { icon: MapPin, title: 'Real-Time Tracking', desc: 'See your driver live on the map with ETA updates throughout the ride.', color: 'bg-blue-100 text-blue-600' },
  { icon: Shield, title: 'Verified Rides', desc: 'Drivers and passengers are rated after every ride for community safety.', color: 'bg-pink-100 text-pink-600' },
]

const testimonials = [
  { name: 'Ananya M.', role: 'Daily Commuter', text: 'I save ₹4,000 a month commuting Pune–Mumbai. CarpoolConnect made it seamless.', rating: 5 },
  { name: 'Rohan K.', role: 'Driver', text: 'I cover my fuel costs and meet great people. Best decision I made this year.', rating: 5 },
  { name: 'Divya S.', role: 'Passenger', text: 'The live tracking gives me peace of mind every single ride.', rating: 4 },
]

export default function Landing() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-violet-50 via-white to-violet-50 pt-16 pb-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-violet-100 text-violet-600 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <Leaf className="h-4 w-4" /> Eco-friendly commuting for everyone
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Share the ride,<br />
            <span className="text-violet-600">split the cost.</span>
          </h1>
          <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto">
            CarpoolConnect matches you with drivers going your way. Smart route matching, real-time tracking, and automatic fare splitting.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/search" className="btn-primary flex items-center justify-center gap-2 text-base px-8 py-3">
              <MapPin className="h-5 w-5" /> Find a Ride
            </Link>
            <Link to="/register" className="btn-secondary flex items-center justify-center gap-2 text-base px-8 py-3">
              Offer Your Seat <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-violet-600 py-12 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center text-white">
          {stats.map((s) => (
            <div key={s.label}>
              <p className="text-3xl font-bold">{s.value}</p>
              <p className="text-violet-200 text-sm mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-3">Everything you need</h2>
          <p className="text-center text-gray-500 mb-12">Built for daily commuters and weekend travelers alike</p>
          <div className="grid md:grid-cols-2 gap-6">
            {features.map((f) => (
              <div key={f.title} className="card flex gap-4">
                <div className={`${f.color} p-3 rounded-xl h-fit`}>
                  <f.icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{f.title}</h3>
                  <p className="text-gray-500 text-sm">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4 bg-violet-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">How it works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'Search a ride', desc: 'Enter your origin, destination and travel date to find matching rides.', icon: MapPin },
              { step: '2', title: 'Book & Pay', desc: 'Select your seats, pay the split fare, and get instant confirmation.', icon: CreditCard },
              { step: '3', title: 'Track & Go', desc: 'Watch your driver live on the map, chat, and enjoy the ride.', icon: Car },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-violet-500 text-white flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Loved by commuters</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="card">
                <div className="flex gap-1 mb-3">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-gray-600 text-sm mb-4">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 font-bold">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{t.name}</p>
                    <p className="text-gray-400 text-xs">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-gradient-to-br from-violet-600 to-violet-700 text-white text-center">
        <h2 className="text-4xl font-bold mb-4">Ready to ride smarter?</h2>
        <p className="text-violet-200 mb-8 text-lg">Join thousands of commuters saving money every day.</p>
        <Link to="/register" className="bg-white text-violet-600 font-bold px-10 py-3.5 rounded-xl hover:bg-violet-50 transition inline-block text-base">
          Get Started Free
        </Link>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-10 px-4 text-center text-sm">
        <div className="flex items-center justify-center gap-2 text-white font-bold text-lg mb-3">
          <Car className="h-5 w-5 text-violet-400" /> CarpoolConnect
        </div>
        <p>© 2026 CarpoolConnect · Smart ride sharing for everyone</p>
      </footer>
    </div>
  )
}
