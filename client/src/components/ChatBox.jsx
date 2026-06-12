import { useState, useEffect, useRef } from 'react'
import { Send } from 'lucide-react'
import { useSocket } from '../context/SocketContext'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import { format } from 'date-fns'


export default function ChatBox({ rideId }) {
  const { user } = useAuth()
  const { sendMessage, onEvent } = useSocket()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const bottomRef = useRef(null)

  useEffect(() => {
    api.get(`/chat/${rideId}`).then(({ data }) => setMessages(data.messages))
  }, [rideId])

  useEffect(() => {
    const off = onEvent('chat:message', ({ rideId: rid, message }) => {
      if (rid === rideId) setMessages((prev) => [...prev, message])
    })
    return off
  }, [rideId, onEvent])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = (e) => {
    e.preventDefault()
    if (!input.trim()) return
    sendMessage(rideId, input.trim())
    setInput('')
  }

  return (
    <div className="flex flex-col h-80 bg-white rounded-2xl border border-violet-100">
      <div className="px-4 py-3 border-b border-violet-100 font-semibold text-gray-800 text-sm">
        Ride Chat
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <p className="text-center text-gray-400 text-sm py-4">No messages yet. Say hello!</p>
        )}
        {messages.map((msg) => {
          const mine = msg.sender?._id === user?._id
          return (
            <div key={msg._id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs rounded-2xl px-4 py-2.5 ${mine ? 'bg-violet-500 text-white rounded-br-sm' : 'bg-violet-50 text-gray-800 rounded-bl-sm'}`}>
                {!mine && <p className="text-xs font-medium text-violet-600 mb-1">{msg.sender?.name}</p>}
                <p className="text-sm">{msg.content}</p>
                <p className={`text-xs mt-1 ${mine ? 'text-violet-200' : 'text-gray-400'}`}>
                  {format(new Date(msg.createdAt), 'h:mm a')}
                </p>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={handleSend} className="p-3 border-t border-violet-100 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className="input flex-1 py-2 text-sm"
        />
        <button type="submit" className="bg-violet-500 hover:bg-violet-600 text-white p-2.5 rounded-xl transition">
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  )
}
