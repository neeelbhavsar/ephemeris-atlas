import { AnimatePresence } from 'framer-motion'
import { useStore } from '../store'
import { getEntry } from '../data/catalog'
import { formatDays, formatHours } from '../lib/format'
import Sheet from './Sheet'
import LiveDistance from './LiveDistance'

/** Details for the tapped / searched body. */
export default function InfoPanel() {
  const selectedId = useStore((s) => s.selectedId)
  const panel = useStore((s) => s.panel)
  const select = useStore((s) => s.select)
  const entry = getEntry(selectedId)
  // only add derived facts the body's own fact list doesn't already cover
  const has = (...labels: string[]) => !!entry?.info.facts.some((f) => labels.includes(f.label))
  // on phones only one sheet fits — a tool panel takes precedence
  const show = !!entry && !(panel && window.matchMedia('(max-width: 767px)').matches)

  return (
    <AnimatePresence>
      {show && entry && (
        <Sheet
          key={entry.id}
          title={entry.info.name}
          subtitle={`${entry.info.kind}${entry.info.subtitle ? ` · ${entry.info.subtitle}` : ''}`}
          accent={entry.info.color}
          onClose={() => select(null)}
          side="left"
          className="md:bottom-36"
        >
          <p className="text-[13px] leading-relaxed text-slate-300">{entry.info.brief}</p>

          <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 border-t border-white/10 pt-3">
            {entry.info.facts.map((f) => (
              <div key={f.label} className="flex flex-col">
                <dt className="text-[9px] uppercase tracking-wide text-slate-500">{f.label}</dt>
                <dd className="font-mono text-[12px] text-slate-100">{f.value}</dd>
              </div>
            ))}
            {entry.gravity != null && !has('Gravity') && (
              <div className="flex flex-col">
                <dt className="text-[9px] uppercase tracking-wide text-slate-500">Gravity</dt>
                <dd className="font-mono text-[12px] text-slate-100">
                  {(entry.gravity / 9.81).toFixed(2)} g
                </dd>
              </div>
            )}
            {entry.rotationHours != null && entry.id !== 'sun' && !has('Day', 'Rotation', 'Spin') && (
              <div className="flex flex-col">
                <dt className="text-[9px] uppercase tracking-wide text-slate-500">Spin</dt>
                <dd className="font-mono text-[12px] text-slate-100">
                  {formatHours(entry.rotationHours)}
                  {entry.rotationHours < 0 ? ' retro' : ''}
                </dd>
              </div>
            )}
            {entry.orbitalPeriodDays != null && !has('Year', 'Orbit', 'Period') && (
              <div className="flex flex-col">
                <dt className="text-[9px] uppercase tracking-wide text-slate-500">Orbit</dt>
                <dd className="font-mono text-[12px] text-slate-100">
                  {formatDays(entry.orbitalPeriodDays)}
                </dd>
              </div>
            )}
          </dl>

          <LiveDistance id={entry.id} name={entry.info.name} />
        </Sheet>
      )}
    </AnimatePresence>
  )
}
