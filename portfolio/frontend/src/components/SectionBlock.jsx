export default function SectionBlock({ section, index }) {
  const isEven = index % 2 === 0

  return (
    <div className={`flex flex-col ${section.imageUrl ? 'md:flex-row' : ''} gap-8 items-start ${!isEven && section.imageUrl ? 'md:flex-row-reverse' : ''}`}>
      {section.imageUrl && (
        <div className="w-full md:w-1/2 shrink-0">
          <img
            src={section.imageUrl}
            alt={section.title}
            className="w-full rounded-xl object-cover max-h-72 border border-zinc-800"
          />
        </div>
      )}
      <div className={`flex flex-col justify-center ${section.imageUrl ? 'md:w-1/2' : 'w-full'}`}>
        <h3 className="text-lg font-semibold text-zinc-100 mb-3">
          {section.title}
        </h3>
        <p className="text-zinc-400 leading-relaxed text-sm md:text-base whitespace-pre-line">
          {section.description}
        </p>
      </div>
    </div>
  )
}
