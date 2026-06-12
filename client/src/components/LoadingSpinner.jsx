export default function LoadingSpinner({ size = 'md' }) {
  const s = size === 'sm' ? 'h-5 w-5' : size === 'lg' ? 'h-12 w-12' : 'h-8 w-8'
  return (
    <div className={`${s} animate-spin rounded-full border-4 border-violet-200 border-t-violet-500`} />
  )
}
