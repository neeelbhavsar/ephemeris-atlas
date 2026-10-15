import { useState } from 'react'
import { useStore } from '../../store'
import { getEntry } from '../../data/catalog'
import { focusBody } from '../../lib/focus'
import { formatDays, formatHours } from '../../lib/format'
import Sheet from '../Sheet'

const WORLDS = ['mercury', 'venus', 'earth', 'moon', 'mars', 'ceres', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto']
const EARTH_G = 9.81

const STORAGE_KEY = 'ephemeris-atlas.weight'
function loadWeight(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? '70'
  } catch {
    return '70'
  }
}

/** Side-by-side size strip: true relative diameters, with the Sun's limb on the left. */
function SizeStrip() {
  const entries = WORLDS.map((id) => getEntry(id)!).filter((e) => e.radiusKm)
  const maxR = Math.max(...entries.map((e) => e.radiusKm!))
  const scale = 34 / maxR // Jupiter → 34 px radius
  const sunR = 696_340 * scale
  let x = 26
  const placed = entries.map((e) => {
    const r = Math.max(e.radiusKm! * scale, 0.6)
    const cx = x + r
    x = cx + r + 5
    return { e, r, cx }
  })
  let small = 0
  return (
    <svg viewBox={`0 0 ${x + 4} 104`} className="mt-2 w-full" role="img" aria-label="Relative sizes">
      <circle cx={18 - sunR} cy={52} r={sunR} fill="#ffcc55" opacity="0.85" />
      {placed.map(({ e, r, cx }) => {
        // tiny worlds alternate their labels above / below so they don't collide
        const below = r > 8 || small++ % 2 === 0
        const y = below ? 52 + Math.max(r, 3) + 9 : 52 - Math.max(r, 3) - 4
        return (
          <g key={e.id} className="cursor-pointer" onClick={() => focusBody(e.id)}>
            <circle cx={cx} cy={52} r={r} fill={e.info.color} />
            <text x={cx} y={y} textAnchor="middle" className="fill-slate-400 font-mono text-[6px]">
              {e.info.name.replace('The ', '')}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

/** Your weight on each world, day / year length, and a true-scale size comparison. */
export default function ComparePanel() {
  const setPanel = useStore((s) => s.setPanel)
  const [weight, setWeight] = useState(loadWeight)
  const kg = Number(weight) || 0

  return (
    <Sheet title="Compare worlds" subtitle="Weight · day · year · size" accent="#fb7185" onClose={() => setPanel(null)}>
      <label className="flex items-center gap-2 text-[12px] text-slate-300">
        Your weight on Earth
        <input
          inputMode="decimal"
          value={weight}
          onChange={(e) => {
            setWeight(e.target.value)
            try {
              localStorage.setItem(STORAGE_KEY, e.target.value)
            } catch {
              /* ignore */
            }
          }}
          className="w-16 rounded-md bg-white/5 px-2 py-1 text-right font-mono text-white outline-none"
          aria-label="Your weight in kilograms"
        />
        kg
      </label>

      <table className="mt-3 w-full text-left">
        <thead>
          <tr className="font-mono text-[9px] uppercase tracking-wider text-slate-500">
            <th className="pb-1 font-normal">World</th>
            <th className="pb-1 text-right font-normal">You’d weigh</th>
            <th className="pb-1 text-right font-normal">Spin</th>
            <th className="pb-1 text-right font-normal">Year</th>
          </tr>
        </thead>
        <tbody>
          {WORLDS.map((id) => {
            const e = getEntry(id)!
            const g = e.gravity ?? 0
            return (
              <tr
                key={id}
                onClick={() => focusBody(id)}
                className="cursor-pointer border-t border-white/5 text-[12px] hover:bg-white/5"
              >
                <td className="py-1.5">
                  <span className="flex items-center gap-1.5 text-slate-100">
                    <span className="h-2 w-2 rounded-full" style={{ background: e.info.color }} />
                    {e.info.name.replace('The ', '')}
                  </span>
                </td>
                <td className="py-1.5 text-right font-mono text-white">
                  {((kg * g) / EARTH_G).toFixed(1)} kg
                  <span className="block text-[10px] text-slate-500">{(g / EARTH_G).toFixed(2)} g</span>
                </td>
                <td className="py-1.5 text-right font-mono text-slate-300">
                  {e.rotationHours != null ? formatHours(e.rotationHours) : '—'}
                </td>
                <td className="py-1.5 text-right font-mono text-slate-300">
                  {id === 'moon' ? '27.3 days' : e.orbitalPeriodDays ? formatDays(e.orbitalPeriodDays) : '—'}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      <h3 className="mt-4 font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500">True relative size</h3>
      <SizeStrip />
      <p className="text-[10px] text-slate-500">
        The yellow arc is the edge of the Sun — 109 Earths across.
      </p>
    </Sheet>
  )
}
