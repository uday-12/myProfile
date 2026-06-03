export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[var(--c-bg)]">
      <div className="w-10 h-10 rounded-full border-4 border-[var(--c-border)] border-t-[var(--c-accent)] animate-spin" />
    </div>
  )
}
