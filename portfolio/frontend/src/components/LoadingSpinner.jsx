export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-zinc-950">
      <div className="w-10 h-10 rounded-full border-4 border-zinc-800 border-t-indigo-500 animate-spin" />
    </div>
  )
}
