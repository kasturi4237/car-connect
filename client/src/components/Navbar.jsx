import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Car, Menu, X, LayoutDashboard, MapPin, PlusCircle, BookOpen, LogOut, User } from 'lucide-react'
import { useState } from 'react'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [open, setOpen] = useState(false)

  const handleLogout = () => { logout(); navigate('/') }
  const active = (path) => location.pathname === path ? 'text-violet-600 font-semibold' : 'text-gray-600 hover:text-violet-600'

  return (
    <nav className="bg-white border-b border-violet-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl text-violet-700">
            <div className="bg-violet-100 p-2 rounded-xl">
              <Car className="h-5 w-5 text-violet-600" />
            </div>
            CarpoolConnect
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link to="/search" className={`flex items-center gap-1.5 text-sm transition ${active('/search')}`}>
              <MapPin className="h-4 w-4" /> Find a Ride
            </Link>
            {user && (
              <>
                <Link to="/offer-ride" className={`flex items-center gap-1.5 text-sm transition ${active('/offer-ride')}`}>
                  <PlusCircle className="h-4 w-4" /> Offer Ride
                </Link>
                <Link to="/my-bookings" className={`flex items-center gap-1.5 text-sm transition ${active('/my-bookings')}`}>
                  <BookOpen className="h-4 w-4" /> My Bookings
                </Link>
                <Link to="/my-rides" className={`flex items-center gap-1.5 text-sm transition ${active('/my-rides')}`}>
                  <Car className="h-4 w-4" /> My Rides
                </Link>
                <Link to="/dashboard" className={`flex items-center gap-1.5 text-sm transition ${active('/dashboard')}`}>
                  <LayoutDashboard className="h-4 w-4" /> Dashboard
                </Link>
              </>
            )}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <Link to={`/profile/${user._id}`} className="flex items-center gap-2 text-sm text-gray-700 hover:text-violet-600 transition">
                  <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 font-semibold text-sm">
                    {user.name[0]}
                  </div>
                  <span className="font-medium">{user.name.split(' ')[0]}</span>
                </Link>
                <button onClick={handleLogout} className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-500 transition">
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Link to="/login" className="btn-ghost text-sm">Login</Link>
                <Link to="/register" className="btn-primary text-sm">Sign Up</Link>
              </div>
            )}
          </div>

          <button className="md:hidden p-2" onClick={() => setOpen(!open)}>
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden bg-white border-t border-violet-100 px-4 py-3 space-y-2">
          <Link to="/search" className="flex items-center gap-2 py-2 text-gray-700" onClick={() => setOpen(false)}>
            <MapPin className="h-4 w-4" /> Find a Ride
          </Link>
          {user && (
            <>
              <Link to="/offer-ride" className="flex items-center gap-2 py-2 text-gray-700" onClick={() => setOpen(false)}>
                <PlusCircle className="h-4 w-4" /> Offer Ride
              </Link>
              <Link to="/my-bookings" className="flex items-center gap-2 py-2 text-gray-700" onClick={() => setOpen(false)}>
                <BookOpen className="h-4 w-4" /> My Bookings
              </Link>
              <Link to="/my-rides" className="flex items-center gap-2 py-2 text-gray-700" onClick={() => setOpen(false)}>
                <Car className="h-4 w-4" /> My Rides
              </Link>
              <Link to="/dashboard" className="flex items-center gap-2 py-2 text-gray-700" onClick={() => setOpen(false)}>
                <LayoutDashboard className="h-4 w-4" /> Dashboard
              </Link>
              <button onClick={handleLogout} className="flex items-center gap-2 py-2 text-red-500 w-full">
                <LogOut className="h-4 w-4" /> Logout
              </button>
            </>
          )}
          {!user && (
            <div className="flex gap-2 pt-2">
              <Link to="/login" className="btn-ghost flex-1 text-center text-sm" onClick={() => setOpen(false)}>Login</Link>
              <Link to="/register" className="btn-primary flex-1 text-center text-sm" onClick={() => setOpen(false)}>Sign Up</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  )
}
