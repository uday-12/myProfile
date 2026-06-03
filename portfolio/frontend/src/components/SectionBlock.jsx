import { renderLines } from '../lib/markdown.jsx'

export default function SectionBlock({ section }) {
  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-lg font-semibold" style={{ color: 'var(--c-text)' }}>
        {section.title}
      </h3>
      {section.imageUrl && (
        <img
          src={section.imageUrl}
          alt={section.title}
          className="w-full rounded-xl object-cover max-h-[480px]"
          style={{ border: '1px solid var(--c-border)' }}
        />
      )}
      <div className="w-full leading-relaxed text-sm md:text-base" style={{ color: 'var(--c-text-2)' }}>
        {renderLines(section.description)}
      </div>
    </div>
  )
}
