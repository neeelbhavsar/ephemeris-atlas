import { Html } from '@react-three/drei'
import { useStore } from '../store'
import { focusBody } from '../lib/focus'
import { markerLayer } from './markerLayer'

/**
 * Screen-space marker + label that stays readable at any distance. Shown for
 * every body in True-size mode (where planets shrink to sub-pixel specks), for
 * the focused / selected body in Enlarged mode, and always for `always` bodies
 * (spacecraft, comets) that would otherwise be impossible to find.
 */
export default function BodyMarker({
  id,
  name,
  color,
  always = false,
  radius = 0,
}: {
  id: string
  name: string
  color: string
  always?: boolean
  /** Enlarged-mode radius: the label floats just above the body instead of over it */
  radius?: number
}) {
  const scaleMode = useStore((s) => s.scaleMode)
  const focused = useStore((s) => s.focusId === id || s.selectedId === id)
  const inGalaxy = useStore((s) => s.inGalaxyView)
  const intro = useStore((s) => s.intro)

  if (inGalaxy || intro === 'title') return null
  if (!(always || focused || scaleMode === 'true')) return null

  const lifted = scaleMode === 'explore' && radius > 0

  return (
    <Html
      center
      portal={markerLayer}
      position={lifted ? [0, radius * 1.35, 0] : undefined}
      zIndexRange={[20, 0]}
      style={{ pointerEvents: 'none' }}
    >
      <button
        type="button"
        onClick={() => focusBody(id)}
        className="marker-fade pointer-events-auto flex -translate-y-px items-center gap-1.5 whitespace-nowrap rounded-full px-1 py-0.5 outline-none"
        // dot sits on the body; the name trails to the right
        style={lifted ? undefined : { transform: 'translateX(calc(50% - 6px))' }}
      >
        <span
          className={`block rounded-full border ${lifted ? 'h-1.5 w-1.5' : 'h-3 w-3'}`}
          style={{
            borderColor: color,
            boxShadow: focused ? `0 0 10px ${color}` : undefined,
            background: focused ? `${color}55` : 'transparent',
          }}
        />
        <span
          className="font-mono text-[10px] tracking-wide"
          style={{ color: focused ? '#fff' : '#cbd5e1', textShadow: '0 1px 4px #000' }}
        >
          {name}
        </span>
      </button>
    </Html>
  )
}
