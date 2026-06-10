import { useEffect, useRef, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { X, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react'

const MIN_SCALE = 1
const MAX_SCALE = 5
const ZOOM_STEP = 0.4

export default function ImageLightbox({ src, alt, onClose }) {
  const [scale, setScale] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const dragStart = useRef(null)
  const imgRef = useRef(null)

  // Close on Escape
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const clampOffset = useCallback((x, y, s) => {
    const el = imgRef.current
    if (!el) return { x, y }
    const maxX = (el.naturalWidth  * s - window.innerWidth)  / 2
    const maxY = (el.naturalHeight * s - window.innerHeight) / 2
    return {
      x: s <= 1 ? 0 : Math.max(-maxX, Math.min(maxX, x)),
      y: s <= 1 ? 0 : Math.max(-maxY, Math.min(maxY, y)),
    }
  }, [])

  const zoom = useCallback((delta, cx, cy) => {
    setScale((prev) => {
      const next = Math.min(MAX_SCALE, Math.max(MIN_SCALE, prev + delta))
      // keep the point under cursor fixed
      setOffset((off) => {
        const factor = next / prev - 1
        const nx = off.x - (cx - window.innerWidth  / 2) * factor
        const ny = off.y - (cy - window.innerHeight / 2) * factor
        return clampOffset(nx, ny, next)
      })
      return next
    })
  }, [clampOffset])

  const reset = () => { setScale(1); setOffset({ x: 0, y: 0 }) }

  // Mouse wheel zoom
  const onWheel = (e) => {
    e.preventDefault()
    zoom(e.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP, e.clientX, e.clientY)
  }

  // Drag to pan
  const onMouseDown = (e) => {
    if (scale <= 1) return
    e.preventDefault()
    setDragging(true)
    dragStart.current = { mx: e.clientX, my: e.clientY, ox: offset.x, oy: offset.y }
  }
  const onMouseMove = (e) => {
    if (!dragging || !dragStart.current) return
    const nx = dragStart.current.ox + (e.clientX - dragStart.current.mx)
    const ny = dragStart.current.oy + (e.clientY - dragStart.current.my)
    setOffset(clampOffset(nx, ny, scale))
  }
  const onMouseUp = () => { setDragging(false); dragStart.current = null }

  // Touch pinch-to-zoom
  const lastTouchDist = useRef(null)
  const onTouchStart = (e) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX
      const dy = e.touches[0].clientY - e.touches[1].clientY
      lastTouchDist.current = Math.hypot(dx, dy)
    } else if (e.touches.length === 1 && scale > 1) {
      dragStart.current = { mx: e.touches[0].clientX, my: e.touches[0].clientY, ox: offset.x, oy: offset.y }
    }
  }
  const onTouchMove = (e) => {
    if (e.touches.length === 2 && lastTouchDist.current != null) {
      const dx = e.touches[0].clientX - e.touches[1].clientX
      const dy = e.touches[0].clientY - e.touches[1].clientY
      const dist = Math.hypot(dx, dy)
      const cx = (e.touches[0].clientX + e.touches[1].clientX) / 2
      const cy = (e.touches[0].clientY + e.touches[1].clientY) / 2
      zoom((dist - lastTouchDist.current) * 0.01, cx, cy)
      lastTouchDist.current = dist
    } else if (e.touches.length === 1 && dragStart.current && scale > 1) {
      const nx = dragStart.current.ox + (e.touches[0].clientX - dragStart.current.mx)
      const ny = dragStart.current.oy + (e.touches[0].clientY - dragStart.current.my)
      setOffset(clampOffset(nx, ny, scale))
    }
  }
  const onTouchEnd = () => { lastTouchDist.current = null; dragStart.current = null }

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.92)' }}
      onWheel={onWheel}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Backdrop click to close (only when not zoomed) */}
      {scale <= 1 && (
        <div className="absolute inset-0" onClick={onClose} />
      )}

      {/* Image */}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        onMouseDown={onMouseDown}
        style={{
          maxWidth: '90vw',
          maxHeight: '85vh',
          transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
          transformOrigin: 'center center',
          transition: dragging ? 'none' : 'transform 0.15s ease',
          cursor: scale > 1 ? (dragging ? 'grabbing' : 'grab') : 'default',
          userSelect: 'none',
          borderRadius: '8px',
          boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
        }}
        draggable={false}
      />

      {/* Controls */}
      <div
        className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2.5 rounded-2xl shadow-2xl"
        style={{ background: 'rgba(24,24,27,0.95)', border: '1px solid rgba(255,255,255,0.08)' }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => zoom(-ZOOM_STEP, window.innerWidth / 2, window.innerHeight / 2)}
          disabled={scale <= MIN_SCALE}
          className="p-2 rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-700 disabled:opacity-30 transition-colors"
          title="Zoom out"
        >
          <ZoomOut className="w-5 h-5" />
        </button>

        <span className="text-xs font-mono text-zinc-400 w-12 text-center select-none">
          {Math.round(scale * 100)}%
        </span>

        <button
          onClick={() => zoom(ZOOM_STEP, window.innerWidth / 2, window.innerHeight / 2)}
          disabled={scale >= MAX_SCALE}
          className="p-2 rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-700 disabled:opacity-30 transition-colors"
          title="Zoom in"
        >
          <ZoomIn className="w-5 h-5" />
        </button>

        <div className="w-px h-5 bg-zinc-700 mx-1" />

        <button
          onClick={reset}
          disabled={scale === 1}
          className="p-2 rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-700 disabled:opacity-30 transition-colors"
          title="Reset zoom"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Close */}
      <button
        onClick={onClose}
        className="fixed top-4 right-4 p-2 rounded-xl text-zinc-300 hover:text-white hover:bg-zinc-700/80 transition-colors"
        style={{ background: 'rgba(24,24,27,0.8)' }}
        title="Close (Esc)"
      >
        <X className="w-5 h-5" />
      </button>
    </div>,
    document.body
  )
}
