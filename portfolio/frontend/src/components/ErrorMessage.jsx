export default function ErrorMessage({ message = 'Something went wrong.' }) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-zinc-950">
      <div className="text-center px-6 py-10 rounded-2xl bg-zinc-900 border border-zinc-800 max-w-md mx-4">
        <svg className="w-10 h-10 text-zinc-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
        </svg>
        <p className="text-zinc-400 text-base">{message}</p>
      </div>
    </div>
  )
}
