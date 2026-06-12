const mongoose = require('mongoose')

const rideSchema = new mongoose.Schema({
  driver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  origin: {
    name: { type: String, required: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  destination: {
    name: { type: String, required: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  routePolyline: [{ lat: Number, lng: Number }],
  departureTime: { type: Date, required: true },
  seats: {
    total: { type: Number, required: true },
    available: { type: Number, required: true },
  },
  pricePerSeat: { type: Number, required: true },
  preferences: {
    smoking: { type: Boolean, default: false },
    pets: { type: Boolean, default: false },
    music: { type: Boolean, default: true },
    womenOnly: { type: Boolean, default: false },
  },
  status: {
    type: String,
    enum: ['scheduled', 'in_progress', 'completed', 'cancelled'],
    default: 'scheduled',
  },
  distance: Number,
  duration: Number,
}, { timestamps: true })

rideSchema.index({ 'origin.lat': 1, 'origin.lng': 1 })
rideSchema.index({ departureTime: 1, status: 1 })

module.exports = mongoose.model('Ride', rideSchema)
