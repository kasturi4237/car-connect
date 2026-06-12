import { createContext, useContext, useEffect, useRef } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from './AuthContext'

const SocketContext = createContext(null)

export function SocketProvider({ children }) {
  const { token } = useAuth()
  const socketRef = useRef(null)

  useEffect(() => {
    if (token) {
      socketRef.current = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', { transports: ['websocket'] })

    }
    return () => { socketRef.current?.disconnect() }
  }, [token])

  const joinRide = (rideId) => socketRef.current?.emit('ride:join', { rideId })
  const leaveRide = (rideId) => socketRef.current?.emit('ride:leave', { rideId })
  const sendLocation = (rideId, lat, lng) => socketRef.current?.emit('location:send', { rideId, lat, lng })
  const sendMessage = (rideId, content) => socketRef.current?.emit('chat:send', { rideId, content, token })

  const onEvent = (event, cb) => {
    socketRef.current?.on(event, cb)
    return () => socketRef.current?.off(event, cb)
  }

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, joinRide, leaveRide, sendLocation, sendMessage, onEvent }}>
      {children}
    </SocketContext.Provider>
  )
}

export const useSocket = () => useContext(SocketContext)
