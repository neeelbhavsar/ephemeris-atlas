import { useLiveDistance } from './hooks'
import { formatDistance } from '../lib/format'
import { formatLightTime } from '../lib/ephemeris'
import { AU_KM } from '../data/solarSystem'

const int = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 })

/** "Distance from Earth · now" plus how long its light takes to reach you. */
export default function LiveDistance({ id, name }: { id: string; name: string }) {
  const au = useLiveDistance(id)
  if (au == null) return null
  return (
    <div className="mt-3 rounded-lg bg-white/5 px-3 py-2">
      <p className="text-[9px] uppercase tracking-wide text-slate-500">Distance from Earth · now</p>
      <p className="font-mono text-[12px] text-cosmos-cyan">
        {formatDistance(au)}
        {au >= 0.01 && au < 5000 && (
          <span className="text-slate-400"> · {int.format(au * AU_KM)} km</span>
        )}
      </p>
      <p className="mt-1 text-[11px] leading-snug text-slate-300">
        Light from {name.replace(/^The /, 'the ')} takes{' '}
        <span className="font-mono text-amber-200">{formatLightTime(au)}</span> to reach you right
        now.
      </p>
    </div>
  )
}
