import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import { Car, Users, IndianRupee, Leaf, Star, TrendingUp } from 'lucide-react'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import LoadingSpinner from '../components/LoadingSpinner'

export default function Dashboard() {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/bookings/my'),
      api.get('/rides'),
    ]).then(([bookingsRes, ridesRes]) => {
      const asPassenger = bookingsRes.data.asPassenger || []
      const asDriver = bookingsRes.data.asDriver || []

      const completedAsPassenger = asPassenger.filter((b) => b.status === 'completed')
      const totalSpent = completedAsPassenger.reduce((s, b) => s + b.totalFare, 0)
      const totalEarned = asDriver.filter((b) => b.status === 'completed').reduce((s, b) => s + b.totalFare, 0)
      const co2Saved = completedAsPassenger.reduce((s, b) => s + (b.ride?.distance || 0) * 0.12, 0)
      const moneySaved = completedAsPassenger.reduce((s, b) => s + (b.ride?.distance || 0) * 6 - b.totalFare, 0)

      const monthly = Array.from({ length: 6 }, (_, i) => {
        const d = new Date()
        d.setMonth(d.getMonth() - (5 - i))
        const label = d.toLocaleString('default', { month: 'short' })
        const rides = completedAsPassenger.filter((b) => {
          const bd = new Date(b.createdAt)
          return bd.getMonth() === d.getMonth() && bd.getFullYear() === d.getFullYear()
        }).length
        const earned = asDriver.filter((b) => {
          const bd = new Date(b.createdAt)
          return bd.getMonth() === d.getMonth() && bd.getFullYear() === d.getFullYear() && b.status === 'completed'
        }).reduce((s, b) => s + b.totalFare, 0)
        return { month: label, rides, earned }
      })

      setData({
        totalRides: completedAsPassenger.length,
        totalOffered: asDriver.length,
        totalSpent,
        totalEarned,
        co2Saved: Math.round(co2Saved),
        moneySaved: Math.round(moneySaved),
        monthly,
      })
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="lg" /></div>

  const stats = [
    { label: 'Rides Taken', value: data?.totalRides || 0, icon: Users, color: 'bg-violet-100 text-violet-600' },
    { label: 'Rides Offered', value: data?.totalOffered || 0, icon: Car, color: 'bg-blue-100 text-blue-600' },
    { label: 'Total Spent', value: `₹${data?.totalSpent || 0}`, icon: IndianRupee, color: 'bg-amber-100 text-amber-600' },
    { label: 'Total Earned', value: `₹${data?.totalEarned || 0}`, icon: TrendingUp, color: 'bg-emerald-100 text-emerald-600' },
    { label: 'CO₂ Saved', value: `${data?.co2Saved || 0} kg`, icon: Leaf, color: 'bg-green-100 text-green-600' },
    { label: 'Money Saved', value: `₹${Math.max(0, data?.moneySaved || 0)}`, icon: Star, color: 'bg-pink-100 text-pink-600' },
  ]

  return (
    <div className="min-h-[calc(100vh-64px)] bg-violet-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 rounded-2xl bg-violet-100 flex items-center justify-center text-violet-600 font-bold text-2xl">
            {user?.name?.[0]}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name?.split(' ')[0]}!</h1>
            <p className="text-gray-500 text-sm">{user?.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {stats.map((s) => (
            <div key={s.label} className="card flex items-center gap-4">
              <div className={`${s.color} p-3 rounded-xl`}>
                <s.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="card">
            <h2 className="font-semibold text-gray-900 mb-4">Rides Taken (6 months)</h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data?.monthly || []}>
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="rides" fill="#8B5CF6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card">
            <h2 className="font-semibold text-gray-900 mb-4">Earnings as Driver (₹)</h2>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={data?.monthly || []}>
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="earned" stroke="#8B5CF6" strokeWidth={2.5} dot={{ fill: '#8B5CF6', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card mt-6 bg-gradient-to-br from-violet-500 to-violet-600 text-white">
          <div className="flex items-center gap-3 mb-2">
            <Leaf className="h-6 w-6 text-violet-200" />
            <h2 className="font-bold text-lg">Your Green Impact</h2>
          </div>
          <p className="text-violet-100 text-sm mb-4">By carpooling instead of driving alone, you've contributed to a cleaner planet.</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/20 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold">{data?.co2Saved || 0} kg</p>
              <p className="text-violet-200 text-sm mt-1">CO₂ emissions saved</p>
            </div>
            <div className="bg-white/20 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold">{data?.totalRides || 0}</p>
              <p className="text-violet-200 text-sm mt-1">Solo cars off the road</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
