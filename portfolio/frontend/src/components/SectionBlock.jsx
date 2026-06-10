import { useState } from 'react'
import { renderLines } from '../lib/markdown.jsx'
import ImageLightbox from './ImageLightbox.jsx'

export default function SectionBlock({ section }) {
  const [lightboxOpen, setLightboxOpen] = useState(false)

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-lg font-semibold" style={{ color: 'var(--c-text)' }}>
        {section.title}
      </h3>
      {section.imageUrl && (
        <div className="relative group cursor-zoom-in" onClick={() => setLightboxOpen(true)}>
          <img
            src={section.imageUrl}
            alt={section.title}
            className="w-full rounded-xl object-contain transition-opacity group-hover:opacity-90"
            style={{ border: '1px solid var(--c-border)' }}
          />
          <div className="absolute inset-0 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ background: 'rgba(0,0,0,0.25)' }}>
            <span className="px-3 py-1.5 rounded-lg text-xs font-medium text-white"
              style={{ background: 'rgba(0,0,0,0.55)' }}>
              Click to expand
            </span>
          </div>
        </div>
      )}
      {section.description && (
        <div className="w-full leading-relaxed text-sm md:text-base" style={{ color: 'var(--c-text-2)' }}>
          {renderLines(section.description)}
        </div>
      )}
      {lightboxOpen && (
        <ImageLightbox
          src={section.imageUrl}
          alt={section.title}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </div>
  )
}
