import { AnimatePresence, motion } from 'framer-motion'
import { useStore } from '../store'
import { STOPS } from '../three/tour'

/** One short story per stop — why Venus spins backwards, why Uranus rolls… */
export default function StoryCaption() {
  const focusId = useStore((s) => s.focusId)
  const intro = useStore((s) => s.intro)
  const hidden = useStore((s) => s.panel !== null || s.selectedId !== null)
  const stop = STOPS.find((s) => s.id === focusId)
  if (!stop || intro !== 'done') return null

  return (
    <div
      className={`pointer-events-none fixed inset-x-3 bottom-[6.75rem] z-30 flex justify-center transition-opacity duration-300 md:bottom-6 md:inset-x-auto md:left-1/2 md:w-[min(36rem,calc(100vw-30rem))] md:-translate-x-1/2 ${
        hidden ? 'max-md:opacity-0' : 'opacity-100'
      }`}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={stop.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.35 }}
          className="rounded-xl bg-black/35 px-4 py-2.5 text-center backdrop-blur-sm"
        >
          <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-cosmos-glow">
            {stop.label}
          </p>
          <p className="mt-1 text-[12px] leading-snug text-slate-200 sm:text-[13px]">{stop.story}</p>
          {stop.id === 'sun' && (
            <p className="mt-1.5 hidden font-mono text-[10px] uppercase tracking-[0.25em] text-slate-500 md:block">
              Scroll or ↓ to travel · click anything to focus · ⌘K to search
            </p>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
