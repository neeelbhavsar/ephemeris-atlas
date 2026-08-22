import { motion } from 'framer-motion'
import { useStore } from '../store'

const SPEEDS: { label: string; value: number }[] = [
  { label: 'Pause', value: 0 },
  { label: '1 day/s', value: 1 },
  { label: '1 wk/s', value: 7 },
  { label: '1 mo/s', value: 30 },
  { label: '1 yr/s', value: 365 },
]

const dateFmt = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
})
const timeFmt = new Intl.DateTimeFormat('en-GB', {
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'UTC',
})

export default function Hud() {
  const speed = useStore((s) => s.speed)
  const setSpeed = useStore((s) => s.setSpeed)
  const scaleMode = useStore((s) => s.scaleMode)
  const setScaleMode = useStore((s) => s.setScaleMode)
  const simDateMs = useStore((s) => s.simDateMs)
  const resetNow = useStore((s) => s.resetNow)

  const d = new Date(simDateMs)

  return (
    <>
      {/* top bar */}
      <div className="pointer-events-none fixed inset-x-0 top-0 z-40 flex items-start justify-between p-5">
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <h1 className="font-display text-xl font-bold tracking-tight text-white sm:text-2xl">
            The Solar System
          </h1>
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-cosmos-glow">
            Real-time orbital atlas
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
          className="glass pointer-events-auto rounded-xl px-4 py-2 text-right"
        >
          <p className="font-mono text-sm text-white">
            {dateFmt.format(d)} · {timeFmt.format(d)} UTC
          </p>
          <button
            type="button"
            onClick={resetNow}
            className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-slate-400 transition-colors hover:text-cosmos-cyan"
          >
            ↺ reset to now
          </button>
        </motion.div>
      </div>

      {/* bottom-left controls */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="pointer-events-auto fixed bottom-5 left-5 z-40 flex flex-col gap-3"
      >
        <div className="glass flex items-center gap-1 rounded-xl p-1.5">
          {SPEEDS.map((s) => (
            <button
              key={s.label}
              type="button"
              onClick={() => setSpeed(s.value)}
              className={`rounded-lg px-2.5 py-1.5 font-mono text-[11px] transition-colors ${
                speed === s.value
                  ? 'bg-cosmos-glow/30 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div className="glass flex items-center gap-1 rounded-xl p-1.5">
          <span className="px-2 font-mono text-[10px] uppercase tracking-wider text-slate-500">
            Scale
          </span>
          {(['explore', 'true'] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setScaleMode(m)}
              className={`rounded-lg px-2.5 py-1.5 font-mono text-[11px] capitalize transition-colors ${
                scaleMode === m
                  ? 'bg-cosmos-cyan/25 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {m === 'explore' ? 'Enlarged' : 'True size'}
            </button>
          ))}
        </div>
      </motion.div>

      {/* bottom-center hint */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 1 }}
        className="pointer-events-none fixed bottom-6 left-1/2 z-30 -translate-x-1/2 text-center font-mono text-[11px] uppercase tracking-[0.3em] text-slate-500"
      >
        Scroll to travel · Hover to learn
      </motion.p>
    </>
  )
}
