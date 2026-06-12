const express = require('express')
  const Ride = require('../models/Ride')
  const Booking = require('../models/Booking')
  const { protect } = require('../middleware/auth')
  const { getRoute } = require('../services/osrm')
  const { matchesRoute, scoreRide } = require('../services/routeMatching')

  const router = express.Router()

  router.get('/my', protect, async (req, res) => {
    try {
      const rides = await Ride.find({ driver: req.user._id }).sort({ departureTime: -1 })
      res.json({ rides })
    } catch (err) {
      res.status(500).json({ message: err.message })
    }
  })

  router.get('/', async (req, res) => {
    try {
      const { originLat, originLng, destLat, destLng, date, seats, page = 1 } = req.query
      const limit = 20
      const skip = (page - 1) * limit

      const query = { status: 'scheduled', 'seats.available': { $gte: parseInt(seats) || 1 } }

      if (date) {
        const start = new Date(date)
        const end = new Date(date)
        start.setHours(0, 0, 0, 0)
        end.setHours(23, 59, 59, 999)
        query.departureTime = { $gte: start, $lte: end }
      }

      let rides = await Ride.find(query)
        .populate('driver', 'name avatar rating vehicle')
        .sort({ departureTime: 1 })
        .skip(skip)
        .limit(limit)

      if (originLat && originLng && destLat && destLng) {
        const scored = rides
          .map((ride) => {
            const result = matchesRoute(
              ride,
              parseFloat(originLat), parseFloat(originLng),
              parseFloat(destLat), parseFloat(destLng)
            )
            if (!result.matches) return null
            const timeDiff = Math.abs(new Date(ride.departureTime) - Date.now()) / 60000
            return { ride, score: scoreRide(ride, result.detour, timeDiff), detour: result.detour }
          })
          .filter(Boolean)
          .sort((a, b) => b.score - a.score)
          .map(({ ride, detour }) => ({ ...ride.toObject(), detour }))

        return res.json({ rides: scored, total: scored.length, page: 1 })
      }

      res.json({ rides, total: rides.length, page: parseInt(page) })
    } catch (err) {
      res.status(500).json({ message: err.message })
    }
  })

  router.post('/', protect, async (req, res) => {
    try {
      const { origin, destination, departureTime, seats, pricePerSeat, preferences } = req.body

      let routeData = {}
      try {
        routeData = await getRoute(origin.lat, origin.lng, destination.lat, destination.lng)
      } catch {
        routeData = { polyline: [], distance: 0, duration: 0 }
      }

      const ride = await Ride.create({
        driver: req.user._id,
        origin,
        destination,
        departureTime,
        seats: { total: seats, available: seats },
        pricePerSeat,
        preferences: preferences || {},
        routePolyline: routeData.polyline,
        distance: routeData.distance,
        duration: routeData.duration,
      })

      await ride.populate('driver', 'name avatar rating vehicle')
      res.status(201).json({ ride })
    } catch (err) {
      res.status(500).json({ message: err.message })
    }
  })

  router.get('/:id', async (req, res) => {
    try {
      const ride = await Ride.findById(req.params.id).populate('driver', 'name avatar rating vehicle phone')
      if (!ride) return res.status(404).json({ message: 'Ride not found' })
      const bookings = await Booking.find({ ride: ride._id, status: { $ne: 'cancelled' } })
        .populate('passenger', 'name avatar rating')
      res.json({ ride, bookings })
    } catch (err) {
      res.status(500).json({ message: err.message })
    }
  })

  router.put('/:id/start', protect, async (req, res) => {
    try {
      const ride = await Ride.findById(req.params.id)
      if (!ride) return res.status(404).json({ message: 'Ride not found' })
      if (ride.driver.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not your ride' })
      }
      ride.status = 'in_progress'
      await ride.save()
      res.json({ ride })
    } catch (err) {
      res.status(500).json({ message: err.message })
    }
  })

  router.put('/:id/complete', protect, async (req, res) => {
    try {
      const ride = await Ride.findById(req.params.id)
      if (!ride) return res.status(404).json({ message: 'Ride not found' })
      if (ride.driver.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not your ride' })
      }
      ride.status = 'completed'
      await ride.save()
      await Booking.updateMany(
        { ride: ride._id, status: 'confirmed' },
        { status: 'completed', paymentStatus: 'paid' }
      )
      res.json({ ride })
    } catch (err) {
      res.status(500).json({ message: err.message })
    }
  })

  router.delete('/:id', protect, async (req, res) => {
    try {
      const ride = await Ride.findById(req.params.id)
      if (!ride) return res.status(404).json({ message: 'Ride not found' })
      if (ride.driver.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not your ride' })
      }
      ride.status = 'cancelled'
      await ride.save()
      await Booking.updateMany({ ride: ride._id, status: 'pending' }, { status: 'cancelled', paymentStatus: 'refunded' })
      res.json({ message: 'Ride cancelled' })
    } catch (err) {
      res.status(500).json({ message: err.message })
    }
  })

  module.exports = router
