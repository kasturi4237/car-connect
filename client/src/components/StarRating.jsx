import { Star } from 'lucide-react'


export default function StarRating({ rating, count, interactive = false, onRate, size = 'sm' }) {
  const s = size === 'lg' ? 'h-6 w-6' : 'h-4 w-4'
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${s} ${star <= Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'} ${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : ''}`}
          onClick={() => interactive && onRate?.(star)}
        />
      ))}
      {count !== undefined && (
        <span className="text-sm text-gray-500 ml-1">({count})</span>
      )}
    </div>
  )
}
