import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '../store'
import { STOPS } from '../three/tour'

/** Vertical rail listing every tour stop (desktop); a swipeable chip strip on phones. */
export default function TourNav() {
  const focusId = useStore((s) => s.focusId)
  const requestScrollTo = useStore((s) => s.requestScrollTo)
  const stripRef = useRef<HTMLDivElement>(null)

  // keep the active chip in view on phones
  useEffect(() => {
    const el = stripRef.current?.querySelector<HTMLElement>('[aria-current="true"]')
    el?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' })
  }, [focusId])

  return (
    <>
      <motion.nav
        aria-label="Tour stops"
        initial={{ opacity: 0, x: 16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        className="pointer-events-auto fixed right-5 top-1/2 z-40 hidden -translate-y-1/2 flex-col gap-2.5 md:flex"
      >
        {STOPS.map((stop, i) => {
          const active = focusId === stop.id
          return (
            <button
              key={stop.id}
              type="button"
              onClick={() => requestScrollTo(i)}
              aria-current={active ? 'true' : undefined}
              className="group flex items-center justify-end gap-3 outline-none"
            >
              <span
                className={`whitespace-nowrap font-mono text-[11px] tracking-wide transition-all duration-300 ${
                  active
                    ? 'text-white opacity-100'
                    : 'text-slate-400 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100'
                }`}
              >
                {stop.label}
              </span>
              <span
                className={`h-2 w-2 rounded-full border transition-all duration-300 ${
                  active
                    ? 'border-cosmos-glow bg-cosmos-glow'
                    : 'border-slate-500 bg-transparent group-hover:border-white'
                }`}
                style={active ? { boxShadow: '0 0 10px var(--ring)' } : undefined}
              />
            </button>
          )
        })}
      </motion.nav>

      {/* phones: horizontal chips above the controls */}
      <div
        ref={stripRef}
        aria-label="Tour stops"
        role="navigation"
        className="no-scrollbar pointer-events-auto fixed inset-x-0 bottom-16 z-40 flex gap-1.5 overflow-x-auto px-3 md:hidden"
      >
        {STOPS.map((stop, i) => {
          const active = focusId === stop.id
          return (
            <button
              key={stop.id}
              type="button"
              onClick={() => requestScrollTo(i)}
              aria-current={active ? 'true' : undefined}
              className={`glass shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 font-mono text-[11px] transition-colors ${
                active ? 'border-cosmos-glow/70 text-white' : 'text-slate-400'
              }`}
            >
              {stop.label}
            </button>
          )
        })}
      </div>
    </>
  )
}
