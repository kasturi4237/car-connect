const mongoose = require('mongoose')

const bookingSchema = new mongoose.Schema({
  ride: { type: mongoose.Schema.Types.ObjectId, ref: 'Ride', required: true },
  passenger: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  seats: { type: Number, required: true, min: 1 },
  totalFare: { type: Number, required: true },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending',
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded'],
    default: 'pending',
  },
  cancelledAt: Date,
}, { timestamps: true })

module.exports = mongoose.model('Booking', bookingSchema)
