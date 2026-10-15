import { useEffect, useRef } from 'react'
import { tourState } from '../three/tourState'
import { formatDistance, niceScale } from '../lib/format'

/**
 * Live scale bar + "distance from the Sun" counter. Reads the camera rig's
 * per-frame state directly (no React re-renders); on the jump out to the Local
 * Group it sweeps from AU to light-years to millions of light-years.
 */
export default function ScaleBar() {
  const barRef = useRef<HTMLDivElement>(null)
  const labelRef = useRef<HTMLSpanElement>(null)
  const distRef = useRef<HTMLSpanElement>(null)
  const boxRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let raf = 0
    let lastLabel = ''
    let lastDist = ''
    const tick = () => {
      raf = requestAnimationFrame(tick)
      if (!tourState.auPerPx) return
      const s = niceScale(tourState.auPerPx)
      const px = s.au / tourState.auPerPx
      if (barRef.current) barRef.current.style.width = `${px.toFixed(1)}px`
      if (labelRef.current && s.label !== lastLabel) {
        lastLabel = s.label
        labelRef.current.textContent = s.label
      }
      const d = formatDistance(tourState.camDistAu)
      if (distRef.current && d !== lastDist) {
        lastDist = d
        distRef.current.textContent = d
      }
      if (boxRef.current) {
        // the counter takes centre stage while flying out of the galaxy
        boxRef.current.dataset.jump = tourState.galaxyBlend > 0.02 ? 'true' : 'false'
      }
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <div
      ref={boxRef}
      data-jump="false"
      className="group pointer-events-none fixed left-3 top-12 z-30 flex flex-col items-start gap-1 sm:left-auto sm:right-5 sm:top-auto sm:bottom-5 sm:items-end"
    >
      <p className="font-mono text-[10px] text-slate-400 transition-all group-data-[jump=true]:text-amber-200 sm:text-[11px] sm:group-data-[jump=true]:text-sm">
        <span className="uppercase tracking-wider text-slate-500 group-data-[jump=true]:text-amber-200/70">
          <span className="hidden sm:inline">from the </span>Sun{' '}
        </span>
        <span ref={distRef} />
      </p>
      <div className="flex flex-col items-start sm:items-end">
        <div ref={barRef} className="h-1.5 border-x border-b border-slate-300/80" />
        <span ref={labelRef} className="mt-0.5 font-mono text-[10px] text-slate-300" />
      </div>
    </div>
  )
}
