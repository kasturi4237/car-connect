const Message = require('../models/Message')
const jwt = require('jsonwebtoken')
const User = require('../models/User')

function chatHandler(io, socket) {
  socket.on('chat:send', async ({ rideId, content, token }) => {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      const sender = await User.findById(decoded.id).select('name avatar')
      if (!sender) return

      const message = await Message.create({ ride: rideId, sender: sender._id, content })

      io.to(`ride:${rideId}`).emit('chat:message', {
        rideId,
        message: {
          _id: message._id,
          content,
          sender: { _id: sender._id, name: sender.name, avatar: sender.avatar },
          createdAt: message.createdAt,
        },
      })
    } catch {
      // invalid token or DB error — silently drop
    }
  })
}

module.exports = chatHandler
