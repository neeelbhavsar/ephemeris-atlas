import { useMemo, useState } from 'react'
import { useStore } from '../../store'
import { focusBody } from '../../lib/focus'
import { dateTimeFmt } from '../../lib/format'
import { moonPhase, upcomingEvents, type SkyEvent } from '../../lib/events'
import Sheet from '../Sheet'

const DAY = 86_400_000
const RANGE_DAYS = 3650 // scrubber spans ±10 years around today

function toLocalInput(ms: number): string {
  const d = new Date(ms)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function MoonGlyph({ angle, illumination }: { angle: number; illumination: number }) {
  // terminator ellipse: width follows illumination, side follows waxing/waning
  const waxing = angle < 180
  const k = 1 - 2 * illumination // +1 new … −1 full
  const rx = Math.abs(k) * 20
  const lit = '#f1f5f9'
  const dark = '#1e293b'
  return (
    <svg viewBox="-22 -22 44 44" className="h-11 w-11" aria-hidden="true">
      <circle r="20" fill={dark} />
      <path
        d={`M0,-20 A20,20 0 0 ${waxing ? 1 : 0} 0,20 A${rx},20 0 0 ${(k > 0) === waxing ? 0 : 1} 0,-20`}
        fill={lit}
      />
    </svg>
  )
}

/** Date scrubber plus "jump to" the next eclipses, oppositions, conjunctions and Moon phases. */
export default function TimeTravelPanel() {
  const setPanel = useStore((s) => s.setPanel)
  const simDateMs = useStore((s) => s.simDateMs)
  const jumpToDate = useStore((s) => s.jumpToDate)
  const setSpeed = useStore((s) => s.setSpeed)
  const [now] = useState(() => Date.now())

  // event search is relatively heavy — redo it only when the simulated day changes
  const day = Math.floor(simDateMs / DAY)
  const events = useMemo(() => upcomingEvents(new Date(day * DAY)), [day])
  const phase = moonPhase(new Date(simDateMs))

  const go = (ms: number) => {
    setSpeed(0)
    jumpToDate(ms)
  }

  const jump = (e: SkyEvent) => {
    go(e.date.getTime())
    focusBody(e.focus)
    if (window.matchMedia('(max-width: 767px)').matches) setPanel(null)
  }

  const offsetDays = Math.round((simDateMs - now) / DAY)

  return (
    <Sheet title="Time travel" subtitle="Scrub through the ephemeris" accent="#f59e0b" onClose={() => setPanel(null)}>
      <label className="block">
        <span className="text-[10px] uppercase tracking-wide text-slate-500">Date & time (your time zone)</span>
        <input
          type="datetime-local"
          value={toLocalInput(simDateMs)}
          onChange={(e) => {
            const ms = new Date(e.target.value).getTime()
            if (Number.isFinite(ms)) go(ms)
          }}
          className="mt-1 w-full rounded-lg bg-white/5 px-3 py-2 font-mono text-[12px] text-white outline-none [color-scheme:dark]"
        />
      </label>

      <input
        type="range"
        min={-RANGE_DAYS}
        max={RANGE_DAYS}
        step={1}
        value={Math.max(-RANGE_DAYS, Math.min(RANGE_DAYS, offsetDays))}
        onChange={(e) => go(now + Number(e.target.value) * DAY)}
        aria-label="Date scrubber (±10 years)"
        className="mt-3 w-full accent-amber-400"
      />
      <div className="flex justify-between font-mono text-[9px] text-slate-500">
        <span>−10 yrs</span>
        <span>{offsetDays === 0 ? 'today' : `${offsetDays > 0 ? '+' : ''}${offsetDays} days`}</span>
        <span>+10 yrs</span>
      </div>

      <div className="mt-2 grid grid-cols-6 gap-1">
        {[
          ['−1y', -365.25],
          ['−1m', -30.44],
          ['−1d', -1],
          ['+1d', 1],
          ['+1m', 30.44],
          ['+1y', 365.25],
        ].map(([label, d]) => (
          <button
            key={label as string}
            type="button"
            onClick={() => go(simDateMs + (d as number) * DAY)}
            className="rounded-md bg-white/5 py-1 font-mono text-[11px] text-slate-300 hover:bg-white/10 hover:text-white"
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-3 rounded-lg bg-white/5 px-3 py-2">
        <MoonGlyph angle={phase.angle} illumination={phase.illumination} />
        <div>
          <p className="text-sm text-white">{phase.name}</p>
          <p className="font-mono text-[11px] text-slate-400">{Math.round(phase.illumination * 100)}% illuminated</p>
        </div>
      </div>

      <h3 className="mt-4 font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500">Jump to the next…</h3>
      <ul className="mt-2 space-y-1.5">
        {events.map((e) => (
          <li key={e.id}>
            <button
              type="button"
              onClick={() => jump(e)}
              className="flex w-full items-start gap-3 rounded-lg bg-white/5 px-3 py-2 text-left transition-colors hover:bg-white/10"
            >
              <span className="mt-0.5 w-4 text-center text-amber-200">{e.icon}</span>
              <span className="flex-1">
                <span className="block text-[13px] text-white">{e.title}</span>
                <span className="block font-mono text-[11px] text-slate-400">
                  {dateTimeFmt.format(e.date)}
                  {e.detail ? ` · ${e.detail}` : ''}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </Sheet>
  )
}
