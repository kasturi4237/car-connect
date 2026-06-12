require('dotenv').config()
const express = require('express')
const http = require('http')
const { Server } = require('socket.io')
const cors = require('cors')
const connectDB = require('./config/db')
const locationHandler = require('./socket/locationHandler')
const chatHandler = require('./socket/chatHandler')

connectDB()

const app = express()
const server = http.createServer(app)

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
})

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000' }))
app.use(express.json())

app.use('/api/auth', require('./routes/auth'))
app.use('/api/rides', require('./routes/rides'))
app.use('/api/bookings', require('./routes/bookings'))
app.use('/api/chat', require('./routes/chat'))
app.use('/api/reviews', require('./routes/reviews'))
app.use('/api/ai', require('./routes/ai'))

io.on('connection', (socket) => {
  locationHandler(io, socket)
  chatHandler(io, socket)
})

app.get('/health', (req, res) => res.json({ status: 'ok' }))

const PORT = process.env.PORT || 5000
server.listen(PORT, () => console.log(`Server running on port ${PORT}`))
