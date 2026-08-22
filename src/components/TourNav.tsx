import { motion } from 'framer-motion'
import { useStore } from '../store'
import { STOPS } from '../three/tour'

/** Vertical rail listing every tour stop; click to fly there. */
export default function TourNav() {
  const focusId = useStore((s) => s.focusId)
  const requestScrollTo = useStore((s) => s.requestScrollTo)

  return (
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
              style={
                active ? { boxShadow: '0 0 10px var(--ring)' } : undefined
              }
            />
          </button>
        )
      })}
    </motion.nav>
  )
}
