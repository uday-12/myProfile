const DIRECT_EXTS = /\.(mp4|webm|ogg|mov)(\?.*)?$/i

function parseVideo(url) {
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  if (yt) return { type: 'iframe', src: `https://www.youtube.com/embed/${yt[1]}?rel=0&modestbranding=1` }

  const vimeo = url.match(/vimeo\.com\/(\d+)/)
  if (vimeo) return { type: 'iframe', src: `https://player.vimeo.com/video/${vimeo[1]}?dnt=1` }

  if (DIRECT_EXTS.test(url)) return { type: 'video', src: url }

  const gdrive = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/)
  if (gdrive) return { type: 'iframe', src: `https://drive.google.com/file/d/${gdrive[1]}/preview` }

  // unknown URL — attempt iframe as best-effort
  return { type: 'iframe', src: url }
}

export default function VideoPlayer({ url }) {
  if (!url) return null
  const { type, src } = parseVideo(url)

  return (
    <div className="relative w-full rounded-xl overflow-hidden bg-zinc-900 shadow-2xl shadow-black/50"
      style={{ paddingTop: '56.25%' }}>
      {type === 'video' ? (
        <video
          src={src}
          controls
          playsInline
          className="absolute inset-0 w-full h-full object-contain bg-black"
        />
      ) : (
        <iframe
          src={src}
          title="Project video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full border-0"
        />
      )}
    </div>
  )
}
