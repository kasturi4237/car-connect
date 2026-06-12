require('dotenv').config()
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const User = require('./models/User')
const Ride = require('./models/Ride')
const Booking = require('./models/Booking')
const Review = require('./models/Review')

const CITIES = [
  { name: 'Mumbai Central', lat: 18.9696, lng: 72.8197 },
  { name: 'Pune Station', lat: 18.5285, lng: 73.8741 },
  { name: 'Bandra West', lat: 19.0596, lng: 72.8295 },
  { name: 'Andheri East', lat: 19.1136, lng: 72.8697 },
  { name: 'Thane', lat: 19.2183, lng: 72.9781 },
  { name: 'Navi Mumbai', lat: 19.0330, lng: 73.0297 },
  { name: 'Lonavala', lat: 18.7481, lng: 73.4072 },
  { name: 'Nashik', lat: 19.9975, lng: 73.7898 },
]

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI)
  await User.deleteMany()
  await Ride.deleteMany()
  await Booking.deleteMany()
  await Review.deleteMany()
  console.log('Cleared existing data')

  const password = await bcrypt.hash('password123', 10)

  const users = await User.insertMany([
    {
      name: 'Arjun Sharma', email: 'arjun@demo.com', password,
      role: 'both', phone: '9876543210',
      rating: { average: 4.8, count: 24 },
      vehicle: { make: 'Maruti', model: 'Swift', color: 'White', plate: 'MH12AB1234', seats: 4 },
    },
    {
      name: 'Priya Patel', email: 'priya@demo.com', password,
      role: 'both', phone: '9876543211',
      rating: { average: 4.6, count: 18 },
      vehicle: { make: 'Honda', model: 'City', color: 'Silver', plate: 'MH01CD5678', seats: 4 },
    },
    {
      name: 'Rahul Mehta', email: 'rahul@demo.com', password,
      role: 'driver', phone: '9876543212',
      rating: { average: 4.9, count: 41 },
      vehicle: { make: 'Hyundai', model: 'Creta', color: 'Blue', plate: 'MH04EF9012', seats: 5 },
    },
    {
      name: 'Sneha Kulkarni', email: 'sneha@demo.com', password,
      role: 'passenger', phone: '9876543213',
      rating: { average: 4.7, count: 12 },
    },
    {
      name: 'Vikram Nair', email: 'vikram@demo.com', password,
      role: 'both', phone: '9876543214',
      rating: { average: 4.5, count: 30 },
      vehicle: { make: 'Toyota', model: 'Fortuner', color: 'Black', plate: 'MH06GH3456', seats: 6 },
    },
  ])

  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const dayAfter = new Date()
  dayAfter.setDate(dayAfter.getDate() + 2)

  const rides = await Ride.insertMany([
    {
      driver: users[0]._id,
      origin: CITIES[0], destination: CITIES[1],
      departureTime: new Date(tomorrow.setHours(7, 30)),
      seats: { total: 3, available: 2 },
      pricePerSeat: 250,
      preferences: { smoking: false, pets: false, music: true, womenOnly: false },
      distance: 148, duration: 180, status: 'scheduled',
    },
    {
      driver: users[1]._id,
      origin: CITIES[2], destination: CITIES[3],
      departureTime: new Date(tomorrow.setHours(9, 0)),
      seats: { total: 3, available: 3 },
      pricePerSeat: 80,
      preferences: { smoking: false, pets: true, music: true, womenOnly: false },
      distance: 8, duration: 25, status: 'scheduled',
    },
    {
      driver: users[2]._id,
      origin: CITIES[0], destination: CITIES[6],
      departureTime: new Date(dayAfter.setHours(6, 0)),
      seats: { total: 4, available: 4 },
      pricePerSeat: 180,
      preferences: { smoking: false, pets: false, music: false, womenOnly: false },
      distance: 83, duration: 90, status: 'scheduled',
    },
    {
      driver: users[4]._id,
      origin: CITIES[4], destination: CITIES[1],
      departureTime: new Date(dayAfter.setHours(8, 30)),
      seats: { total: 5, available: 3 },
      pricePerSeat: 200,
      preferences: { smoking: false, pets: false, music: true, womenOnly: false },
      distance: 120, duration: 150, status: 'scheduled',
    },
    {
      driver: users[0]._id,
      origin: CITIES[1], destination: CITIES[7],
      departureTime: new Date(tomorrow.setHours(14, 0)),
      seats: { total: 3, available: 1 },
      pricePerSeat: 300,
      preferences: { smoking: false, pets: false, music: true, womenOnly: true },
      distance: 210, duration: 240, status: 'scheduled',
    },
  ])

  await Booking.create({
    ride: rides[0]._id, passenger: users[3]._id,
    seats: 1, totalFare: 250, status: 'confirmed', paymentStatus: 'paid',
  })

  await Review.create({
    reviewer: users[3]._id, reviewee: users[0]._id,
    ride: rides[0]._id, rating: 5, comment: 'Very smooth ride, great driver!',
  })

  console.log(`Seeded: ${users.length} users, ${rides.length} rides`)
  console.log('Login with any demo@demo.com / password123')
  await mongoose.disconnect()
}

seed().catch(console.error)
