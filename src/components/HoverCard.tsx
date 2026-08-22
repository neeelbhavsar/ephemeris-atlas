import { AnimatePresence, motion } from 'framer-motion'
import { useStore } from '../store'
import { distanceFromEarthAu } from '../lib/ephemeris'
import { AU_KM } from '../data/solarSystem'

const fmt = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 })

export default function HoverCard() {
  const hover = useStore((s) => s.hover)
  const pointer = useStore((s) => s.pointer)
  const simDateMs = useStore((s) => s.simDateMs)

  // live distance from Earth, recomputed as the simulation advances
  let earthDistance: string | null = null
  if (hover?.aeBody && hover.aeBody !== 'Earth') {
    try {
      const au = distanceFromEarthAu(hover.aeBody, new Date(simDateMs))
      earthDistance = `${au.toFixed(3)} AU · ${fmt.format(au * AU_KM)} km`
    } catch {
      earthDistance = null
    }
  }

  // keep the card on-screen near the cursor
  const vw = typeof window !== 'undefined' ? window.innerWidth : 1920
  const vh = typeof window !== 'undefined' ? window.innerHeight : 1080
  const flipX = pointer.x > vw - 320
  const flipY = pointer.y > vh - 300
  const left = flipX ? pointer.x - 296 : pointer.x + 20
  const top = flipY ? pointer.y - 20 : pointer.y + 20

  return (
    <AnimatePresence>
      {hover && (
        <motion.div
          key={hover.name}
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
          style={{
            left,
            top,
            transform: flipY ? 'translateY(-100%)' : undefined,
            borderColor: `${hover.color}55`,
            boxShadow: `0 24px 70px -20px ${hover.color}66`,
          }}
          className="glass pointer-events-none fixed z-50 w-72 rounded-2xl p-4"
        >
          <div className="flex items-center gap-2">
            <span
              className="h-3 w-3 rounded-full"
              style={{ background: hover.color, boxShadow: `0 0 12px ${hover.color}` }}
            />
            <h3 className="font-display text-lg font-semibold text-white">
              {hover.name}
            </h3>
          </div>
          <p
            className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.2em]"
            style={{ color: hover.color }}
          >
            {hover.kind}
            {hover.subtitle ? ` · ${hover.subtitle}` : ''}
          </p>

          <p className="mt-2.5 text-[13px] leading-relaxed text-slate-300">
            {hover.brief}
          </p>

          <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 border-t border-white/10 pt-3">
            {hover.facts.map((f) => (
              <div key={f.label} className="flex flex-col">
                <dt className="text-[9px] uppercase tracking-wide text-slate-500">
                  {f.label}
                </dt>
                <dd className="font-mono text-[12px] text-slate-100">{f.value}</dd>
              </div>
            ))}
          </dl>

          {earthDistance && (
            <div className="mt-3 rounded-lg bg-white/5 px-3 py-2">
              <p className="text-[9px] uppercase tracking-wide text-slate-500">
                Distance from Earth · now
              </p>
              <p className="font-mono text-[12px] text-cosmos-cyan">{earthDistance}</p>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
