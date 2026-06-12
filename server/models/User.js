const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['driver', 'passenger', 'both'], default: 'passenger' },
  phone: { type: String },
  avatar: { type: String, default: '' },
  rating: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 },
  },
  vehicle: {
    make: String,
    model: String,
    color: String,
    plate: String,
    seats: { type: Number, default: 4 },
  },
  verified: { type: Boolean, default: false },
}, { timestamps: true })

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  this.password = await bcrypt.hash(this.password, 10)
  next()
})

userSchema.methods.matchPassword = function (entered) {
  return bcrypt.compare(entered, this.password)
}

module.exports = mongoose.model('User', userSchema)
