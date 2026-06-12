const express = require('express')
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const { protect } = require('../middleware/auth')

const router = express.Router()

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' })

const userPublic = (u) => ({
  _id: u._id, name: u.name, email: u.email, role: u.role,
  avatar: u.avatar, rating: u.rating, vehicle: u.vehicle, phone: u.phone,
})

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body
    if (await User.findOne({ email })) {
      return res.status(400).json({ message: 'Email already registered' })
    }
    const user = await User.create({ name, email, password, role: role || 'passenger', phone })
    res.status(201).json({ token: signToken(user._id), user: userPublic(user) })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email })
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }
    res.json({ token: signToken(user._id), user: userPublic(user) })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.get('/me', protect, (req, res) => {
  res.json({ user: userPublic(req.user) })
})

router.put('/profile', protect, async (req, res) => {
  try {
    const { name, phone, vehicle } = req.body
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone, vehicle },
      { new: true }
    )
    res.json({ user: userPublic(user) })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
