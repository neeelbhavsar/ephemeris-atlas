import { useMemo, useState } from 'react'
import { useStore } from '../../store'
import { getInfo } from '../../data/catalog'
import { focusBody } from '../../lib/focus'
import { compass, dateFmt, timeFmt } from '../../lib/format'
import { loadLocation, saveLocation, tonight, type Location, type TonightBody } from '../../lib/sky'
import Sheet from '../Sheet'

const VIS_LABEL: Record<TonightBody['visibility'], string> = {
  'naked-eye': 'Naked eye',
  binoculars: 'Binoculars',
  telescope: 'Telescope',
  'below-horizon': 'Not up tonight',
}

/** Polar sky dome: zenith at the centre, horizon at the rim, north up. */
function SkyChart({ bodies }: { bodies: TonightBody[] }) {
  const R = 92
  return (
    <svg viewBox="-110 -110 220 220" className="mx-auto mt-3 w-full max-w-[15rem]" role="img" aria-label="Sky chart">
      <circle r={R} fill="#0b1026" stroke="#334155" />
      <circle r={R * (2 / 3)} fill="none" stroke="#1e293b" strokeDasharray="2 3" />
      <circle r={R / 3} fill="none" stroke="#1e293b" strokeDasharray="2 3" />
      {(['N', 'E', 'S', 'W'] as const).map((d, i) => {
        const a = (i * Math.PI) / 2
        return (
          <text
            key={d}
            x={-Math.sin(a) * (R + 10)}
            y={-Math.cos(a) * (R + 10) + 3}
            textAnchor="middle"
            className="fill-slate-400 font-mono text-[9px]"
          >
            {d}
          </text>
        )
      })}
      {bodies
        .filter((b) => b.chartAlt > 0)
        .map((b) => {
          const r = R * (1 - b.chartAlt / 90)
          const a = (b.chartAz * Math.PI) / 180
          // looking up at the sky: east is to the left when north is up
          const x = -Math.sin(a) * r
          const y = -Math.cos(a) * r
          const color = getInfo(b.id)?.color ?? '#fff'
          return (
            <g key={b.id}>
              <circle cx={x} cy={y} r={b.id === 'moon' ? 5 : 3.2} fill={color} />
              <text x={x + 6} y={y + 3} className="fill-slate-200 font-mono text-[8px]">
                {b.name}
              </text>
            </g>
          )
        })}
    </svg>
  )
}

/** Which planets you can see tonight from where you are — with rise/set times and direction. */
export default function TonightPanel() {
  const setPanel = useStore((s) => s.setPanel)
  const simDateMs = useStore((s) => s.simDateMs)
  const [loc, setLoc] = useState<Location | null>(() => loadLocation())
  const [status, setStatus] = useState<string | null>(null)
  const [manual, setManual] = useState({ lat: '', lon: '' })

  // recompute once per simulated quarter-hour, not every clock tick
  const bucket = Math.floor(simDateMs / 900_000)
  const report = useMemo(
    () => (loc ? tonight(new Date(bucket * 900_000), loc) : null),
    [loc, bucket],
  )

  const locate = () => {
    if (!navigator.geolocation) {
      setStatus('Geolocation is not available — enter coordinates below.')
      return
    }
    setStatus('Finding you…')
    navigator.geolocation.getCurrentPosition(
      (p) => {
        const l = { lat: p.coords.latitude, lon: p.coords.longitude }
        saveLocation(l)
        setLoc(l)
        setStatus(null)
      },
      () => setStatus('Location permission denied — enter coordinates below.'),
      { maximumAge: 3_600_000, timeout: 10_000 },
    )
  }

  const applyManual = () => {
    const lat = Number(manual.lat)
    const lon = Number(manual.lon)
    if (!Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) {
      setStatus('Latitude −90…90, longitude −180…180')
      return
    }
    const l = { lat, lon }
    saveLocation(l)
    setLoc(l)
    setStatus(null)
  }

  const visible = report?.bodies.filter((b) => b.visibility !== 'below-horizon') ?? []
  const hiddenBodies = report?.bodies.filter((b) => b.visibility === 'below-horizon') ?? []

  return (
    <Sheet title="Tonight’s sky" subtitle="What’s up from where you are" accent="#22d3ee" onClose={() => setPanel(null)}>
      {!loc ? (
        <div className="space-y-3 text-[13px] text-slate-300">
          <p>
            See which planets are visible tonight, when they rise and set, and which way to look.
            Your location never leaves your browser.
          </p>
          <button
            type="button"
            onClick={locate}
            className="w-full rounded-lg bg-cosmos-cyan/20 px-3 py-2 font-mono text-[12px] text-white transition-colors hover:bg-cosmos-cyan/30"
          >
            Use my location
          </button>
        </div>
      ) : (
        report && (
          <div>
            <p className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
              {loc.lat.toFixed(2)}°, {loc.lon.toFixed(2)}° · {dateFmt.format(report.start)}
            </p>
            <p className="mt-1 text-[12px] text-slate-300">
              Dark from <span className="font-mono text-white">{timeFmt.format(report.start)}</span> to{' '}
              <span className="font-mono text-white">{timeFmt.format(report.end)}</span>
            </p>

            <SkyChart bodies={report.bodies} />
            <p className="text-center font-mono text-[9px] text-slate-500">
              Sky at {timeFmt.format(report.chartTime)} — centre is straight up
            </p>

            <ul className="mt-3 space-y-1.5">
              {visible.map((b) => (
                <li key={b.id}>
                  <button
                    type="button"
                    onClick={() => focusBody(b.id)}
                    className="w-full rounded-lg bg-white/5 px-3 py-2 text-left transition-colors hover:bg-white/10"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-2 text-sm text-white">
                        <span className="h-2 w-2 rounded-full" style={{ background: getInfo(b.id)?.color }} />
                        {b.name}
                      </span>
                      <span className="font-mono text-[10px] uppercase tracking-wider text-cosmos-cyan">
                        {VIS_LABEL[b.visibility]}
                      </span>
                    </div>
                    <p className="mt-0.5 font-mono text-[11px] text-slate-400">
                      Best {b.bestTime ? timeFmt.format(b.bestTime) : '—'} · {Math.round(b.maxAlt)}° up in
                      the {compass(b.bestAz)} · mag {b.mag.toFixed(1)}
                    </p>
                    <p className="font-mono text-[11px] text-slate-500">
                      Rises {b.rise ? timeFmt.format(b.rise) : '—'} · Sets {b.set ? timeFmt.format(b.set) : '—'}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
            {hiddenBodies.length > 0 && (
              <p className="mt-3 text-[11px] text-slate-500">
                Below the horizon all night: {hiddenBodies.map((b) => b.name).join(', ')}.
              </p>
            )}
            <button
              type="button"
              onClick={() => {
                setLoc(null)
                setStatus(null)
              }}
              className="mt-3 font-mono text-[10px] uppercase tracking-wider text-slate-500 hover:text-white"
            >
              Change location
            </button>
          </div>
        )
      )}

      {!loc && (
        <div className="mt-4 border-t border-white/10 pt-3">
          <p className="text-[11px] text-slate-500">Or enter coordinates</p>
          <div className="mt-2 flex gap-2">
            <input
              inputMode="decimal"
              placeholder="Lat"
              aria-label="Latitude"
              value={manual.lat}
              onChange={(e) => setManual((m) => ({ ...m, lat: e.target.value }))}
              className="w-full rounded-lg bg-white/5 px-2 py-1.5 font-mono text-[12px] text-white outline-none"
            />
            <input
              inputMode="decimal"
              placeholder="Lon"
              aria-label="Longitude"
              value={manual.lon}
              onChange={(e) => setManual((m) => ({ ...m, lon: e.target.value }))}
              className="w-full rounded-lg bg-white/5 px-2 py-1.5 font-mono text-[12px] text-white outline-none"
            />
            <button
              type="button"
              onClick={applyManual}
              className="rounded-lg bg-white/10 px-3 font-mono text-[11px] text-white hover:bg-white/20"
            >
              Go
            </button>
          </div>
        </div>
      )}
      {status && <p className="mt-2 text-[11px] text-amber-200">{status}</p>}
      <p className="mt-4 text-[10px] leading-snug text-slate-600">
        Times are in your device’s time zone. “Tonight” follows the simulated date — time-travel to
        plan ahead.
      </p>
    </Sheet>
  )
}
