import { Clock3, ImageIcon, ListChecks, PlayCircle, Video } from 'lucide-react'

import { formatSeconds } from '../../lib/helpers'
import { Button } from '../ui/Button'
import type { ExerciseIntroContent } from './ExerciseIntroContext'

interface ExerciseIntroOverlayProps {
  intro: ExerciseIntroContent
  onStart: () => void
}

function IntroMediaPreview({
  media,
}: {
  media: ExerciseIntroContent['introMedia']
}) {
  if (!media) {
    return null
  }

  const MediaIcon = media.type === 'video' ? Video : ImageIcon

  return (
    <div className="mx-auto grid w-full max-w-xl gap-3 rounded-[1.75rem] border border-slate-200 bg-slate-50/85 p-4 text-center [@media(max-height:800px)]:gap-2 [@media(max-height:800px)]:p-3">
      <div className="flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
        <MediaIcon className="h-4 w-4" />
        {media.type === 'video' ? 'Midia de apoio' : 'Imagem de apoio'}
      </div>

      {media.src ? (
        media.type === 'video' ? (
          <video
            controls
            preload="metadata"
            poster={media.posterSrc}
            className="max-h-[40dvh] min-h-[220px] w-full rounded-[1.5rem] border border-slate-200 bg-slate-950 object-cover [@media(max-height:800px)]:max-h-[28dvh] [@media(max-height:800px)]:min-h-[140px]"
          >
            <source src={media.src} />
          </video>
        ) : (
          <img
            src={media.src}
            alt={media.alt}
            className="max-h-[34dvh] min-h-[180px] w-full rounded-[1.5rem] border border-slate-200 bg-slate-950 object-cover [@media(max-height:800px)]:max-h-[22dvh] [@media(max-height:800px)]:min-h-[120px]"
          />
        )
      ) : (
        <div className="flex min-h-[180px] flex-col justify-between rounded-[1.5rem] border border-dashed border-slate-300 bg-[radial-gradient(circle_at_top,_rgba(15,23,42,0.08),_transparent_42%),linear-gradient(180deg,_#ffffff_0%,_#f8fafc_100%)] p-5 text-center [@media(max-height:800px)]:min-h-[120px] [@media(max-height:800px)]:p-4">
          <div>
            <div className="text-sm font-semibold text-slate-950">
              {media.title ?? 'Espaco pronto para demonstracao visual'}
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {media.caption ?? 'Adicione aqui um video ou imagem explicando o movimento.'}
            </p>
          </div>

          {media.expectedPath ? (
            <div className="rounded-2xl bg-white px-3 py-2 text-xs font-medium text-slate-500 shadow-sm">
              Caminho sugerido: <span className="font-semibold text-slate-900">{media.expectedPath}</span>
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}

export function ExerciseIntroOverlay({
  intro,
  onStart,
}: ExerciseIntroOverlayProps) {
  const hasIntroMedia = Boolean(intro.introMedia)

  return (
    <div
      className="absolute inset-0 z-20 max-h-[100dvh] overflow-y-auto rounded-[2rem] bg-slate-950/40 p-4 backdrop-blur-sm [@media(max-height:800px)]:p-3"
      role="dialog"
      aria-modal="true"
      aria-labelledby={`exercise-intro-${intro.id}`}
    >
      <div className="flex min-h-full items-center justify-center">
        <div
          className={`w-full rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_32px_80px_rgba(15,23,42,0.18)] sm:p-6 lg:p-6 [@media(max-height:800px)]:p-4 ${
            hasIntroMedia ? 'max-w-4xl [@media(max-height:800px)]:max-w-3xl' : 'max-w-3xl'
          }`}
        >
          <div
            className={`grid gap-5 [@media(max-height:800px)]:gap-4 ${
              hasIntroMedia ? 'lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.8fr)] lg:items-center' : ''
            }`}
          >
            <div className="grid justify-items-center gap-4 text-center [@media(max-height:800px)]:gap-3">
              <div className="w-full">
                <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                  <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5">
                    <Clock3 className="h-4 w-4" />
                    {formatSeconds(intro.duration)}
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5">
                    <ListChecks className="h-4 w-4" />
                    Modo guiado
                  </span>
                </div>

                <h2
                  id={`exercise-intro-${intro.id}`}
                  className="mt-4 text-[clamp(1.55rem,2.6vw,2.2rem)] font-semibold tracking-tight text-slate-950 [@media(max-height:800px)]:mt-3 [@media(max-height:800px)]:text-[clamp(1.35rem,2.2vw,1.85rem)]"
                >
                  {intro.title}
                </h2>
                <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base [@media(max-height:800px)]:mt-2 [@media(max-height:800px)]:text-[0.92rem] [@media(max-height:800px)]:leading-6">
                  {intro.description}
                </p>
              </div>

              <div className="w-full max-w-2xl rounded-[1.5rem] border border-slate-200 bg-slate-50/80 p-4 sm:p-5 [@media(max-height:800px)]:p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                  Como executar
                </div>
                <div className="mt-4 grid gap-3 [@media(max-height:800px)]:mt-3 [@media(max-height:800px)]:gap-2">
                  {intro.instructions.map((instruction, index) => (
                    <div
                      key={`${intro.id}-instruction-${index}`}
                      className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-center text-sm leading-6 text-slate-700 shadow-sm [@media(max-height:800px)]:px-3 [@media(max-height:800px)]:py-2.5"
                    >
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-950 text-xs font-semibold text-white">
                        {index + 1}
                      </div>
                      <p className="max-w-xl text-center">{instruction}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap justify-center gap-3">
                <Button
                  onClick={onStart}
                  size="lg"
                  className="min-w-[14rem] [@media(max-height:800px)]:h-11"
                >
                  <PlayCircle className="h-5 w-5" />
                  Comecar exercicio
                </Button>
              </div>
            </div>

            <IntroMediaPreview media={intro.introMedia} />
          </div>
        </div>
      </div>
    </div>
  )
}
