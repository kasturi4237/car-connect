const express = require('express')
const Booking = require('../models/Booking')
const Ride = require('../models/Ride')
const { protect } = require('../middleware/auth')

const router = express.Router()

router.post('/', protect, async (req, res) => {
  try {
    const { rideId, seats } = req.body
    const ride = await Ride.findById(rideId)
    if (!ride) return res.status(404).json({ message: 'Ride not found' })
    if (ride.status !== 'scheduled') return res.status(400).json({ message: 'Ride not available' })
    if (ride.seats.available < seats) return res.status(400).json({ message: 'Not enough seats' })
    if (ride.driver.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot book your own ride' })
    }

    const existing = await Booking.findOne({ ride: rideId, passenger: req.user._id, status: { $ne: 'cancelled' } })
    if (existing) return res.status(400).json({ message: 'Already booked this ride' })

    const booking = await Booking.create({
      ride: rideId,
      passenger: req.user._id,
      seats,
      totalFare: ride.pricePerSeat * seats,
      paymentStatus: 'paid',
    })

    ride.seats.available -= seats
    await ride.save()

    await booking.populate([
      { path: 'ride', populate: { path: 'driver', select: 'name avatar' } },
      { path: 'passenger', select: 'name avatar' },
    ])

    res.status(201).json({ booking })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.get('/my', protect, async (req, res) => {
  try {
    const asPassenger = await Booking.find({ passenger: req.user._id })
      .populate({ path: 'ride', populate: { path: 'driver', select: 'name avatar rating' } })
      .sort({ createdAt: -1 })

    const myRides = await Ride.find({ driver: req.user._id }).select('_id')
    const rideIds = myRides.map((r) => r._id)
    const asDriver = await Booking.find({ ride: { $in: rideIds }, status: { $ne: 'cancelled' } })
      .populate('passenger', 'name avatar rating')
      .populate('ride', 'origin destination departureTime')
      .sort({ createdAt: -1 })

    res.json({ asPassenger, asDriver })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.put('/:id/confirm', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('ride')
    if (!booking) return res.status(404).json({ message: 'Booking not found' })
    if (booking.ride.driver.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not your ride' })
    }
    booking.status = 'confirmed'
    await booking.save()
    res.json({ booking })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.put('/:id/cancel', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('ride')
    if (!booking) return res.status(404).json({ message: 'Booking not found' })

    const isPassenger = booking.passenger.toString() === req.user._id.toString()
    const isDriver = booking.ride.driver.toString() === req.user._id.toString()
    if (!isPassenger && !isDriver) return res.status(403).json({ message: 'Not authorized' })

    booking.status = 'cancelled'
    booking.paymentStatus = 'refunded'
    booking.cancelledAt = new Date()
    await booking.save()

    await Ride.findByIdAndUpdate(booking.ride._id, {
      $inc: { 'seats.available': booking.seats },
    })

    res.json({ booking })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
