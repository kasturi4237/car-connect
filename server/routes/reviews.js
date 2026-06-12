const express = require('express')
const Review = require('../models/Review')
const User = require('../models/User')
const { protect } = require('../middleware/auth')

const router = express.Router()

router.post('/', protect, async (req, res) => {
  try {
    const { rideId, revieweeId, rating, comment } = req.body

    const existing = await Review.findOne({ reviewer: req.user._id, ride: rideId })
    if (existing) return res.status(400).json({ message: 'Already reviewed this ride' })

    const review = await Review.create({
      reviewer: req.user._id,
      reviewee: revieweeId,
      ride: rideId,
      rating,
      comment,
    })

    const reviews = await Review.find({ reviewee: revieweeId })
    const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    await User.findByIdAndUpdate(revieweeId, {
      'rating.average': Math.round(avg * 10) / 10,
      'rating.count': reviews.length,
    })

    await review.populate('reviewer', 'name avatar')
    res.status(201).json({ review })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.get('/user/:userId', async (req, res) => {
  try {
    const reviews = await Review.find({ reviewee: req.params.userId })
      .populate('reviewer', 'name avatar')
      .populate('ride', 'origin destination departureTime')
      .sort({ createdAt: -1 })

    const averageRating = reviews.length
      ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10
      : 0

    res.json({ reviews, averageRating })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
