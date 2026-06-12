const express = require('express')
const Message = require('../models/Message')
const Booking = require('../models/Booking')
const Ride = require('../models/Ride')
const { protect } = require('../middleware/auth')

const router = express.Router()

router.get('/:rideId', protect, async (req, res) => {
  try {
    const messages = await Message.find({ ride: req.params.rideId })
      .populate('sender', 'name avatar')
      .sort({ createdAt: 1 })
      .limit(100)
    res.json({ messages })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.post('/:rideId', protect, async (req, res) => {
  try {
    const { content } = req.body
    const message = await Message.create({ ride: req.params.rideId, sender: req.user._id, content })
    await message.populate('sender', 'name avatar')
    res.status(201).json({ message })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
