const { haversineKm } = require('../services/routeMatching')

const rideRooms = new Map()

function locationHandler(io, socket) {
  socket.on('ride:join', ({ rideId }) => {
    socket.join(`ride:${rideId}`)
  })

  socket.on('ride:leave', ({ rideId }) => {
    socket.leave(`ride:${rideId}`)
  })

  socket.on('location:send', ({ rideId, lat, lng }) => {
    const key = `ride:${rideId}`
    const prev = rideRooms.get(key)

    rideRooms.set(key, { lat, lng, updatedAt: Date.now() })

    io.to(key).emit('location:update', { rideId, lat, lng })

    if (prev) {
      const dist = haversineKm(prev.lat, prev.lng, lat, lng)
      if (dist < 0.5) {
        io.to(key).emit('ride:nearby', { rideId, distance: Math.round(dist * 1000) })
      }
    }
  })

  socket.on('disconnect', () => {
    socket.rooms.forEach((room) => {
      if (room.startsWith('ride:')) {
        rideRooms.delete(room)
      }
    })
  })
}

module.exports = locationHandler
