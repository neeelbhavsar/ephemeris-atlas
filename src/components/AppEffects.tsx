import { useEffect } from 'react'
import { initialFocus, useStore } from '../store'
import { getEntry } from '../data/catalog'
import { focusBody, stepStop } from '../lib/focus'
import { writeUrlState } from '../lib/urlState'
import { GALAXY_STOP, stopIndex } from '../three/tour'

function isTyping(e: KeyboardEvent) {
  const el = e.target as HTMLElement | null
  return !!el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)
}

/**
 * App-wide side effects with no UI: keyboard navigation, the URL deep link,
 * keeping the address bar in sync, and following the reduced-motion setting.
 */
export default function AppEffects() {
  // keyboard: ⌘K search · ←/→/↑/↓/Space step stops · Home/End · Esc closes
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const s = useStore.getState()
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        s.togglePanel('search')
        return
      }
      if (e.key === 'Escape') {
        if (s.panel) s.setPanel(null)
        else if (s.selectedId) s.select(null)
        return
      }
      if (isTyping(e) || s.panel === 'search' || e.metaKey || e.ctrlKey || e.altKey) return
      switch (e.key) {
        case '/':
          e.preventDefault()
          s.setPanel('search')
          break
        case 'ArrowRight':
        case 'ArrowDown':
        case 'PageDown':
          e.preventDefault()
          stepStop(1)
          break
        case 'ArrowLeft':
        case 'ArrowUp':
        case 'PageUp':
          e.preventDefault()
          stepStop(-1)
          break
        case ' ':
          e.preventDefault()
          stepStop(e.shiftKey ? -1 : 1)
          break
        case 'Home':
          e.preventDefault()
          s.requestScrollTo(0)
          break
        case 'End':
          e.preventDefault()
          s.requestScrollTo(GALAXY_STOP)
          break
      }
    }
    // capture so the scroll container doesn't also scroll natively
    window.addEventListener('keydown', onKey, { capture: true })
    return () => window.removeEventListener('keydown', onKey, { capture: true })
  }, [])

  // deep link: ?focus=mars — wait until the title card is gone, then fly there
  useEffect(() => {
    if (!initialFocus) return
    const stop = stopIndex(initialFocus)
    const entry = getEntry(initialFocus)
    if (stop >= 0 || (entry && entry.stop >= 0)) {
      useStore.getState().requestScrollTo(stop >= 0 ? stop : entry!.stop, true)
      return
    }
    if (!entry) return
    return useStore.subscribe((s, prev) => {
      if (s.intro === 'done' && prev.intro !== 'done') focusBody(initialFocus!)
    })
  }, [])

  // keep the URL shareable: focus + scale always, time only when paused
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined
    const sync = () => {
      clearTimeout(timer)
      timer = setTimeout(() => {
        const s = useStore.getState()
        if (s.intro !== 'done') return
        writeUrlState({
          focus: s.selectedId ?? s.focusId,
          scale: s.scaleMode,
          t: s.speed === 0 ? s.simDateMs : undefined,
        })
      }, 400)
    }
    const unsub = useStore.subscribe((s, p) => {
      if (
        s.focusId !== p.focusId ||
        s.selectedId !== p.selectedId ||
        s.scaleMode !== p.scaleMode ||
        s.speed !== p.speed ||
        (s.speed === 0 && s.simDateMs !== p.simDateMs) ||
        s.intro !== p.intro
      ) {
        sync()
      }
    })
    return () => {
      unsub()
      clearTimeout(timer)
    }
  }, [])

  // follow live changes to the OS reduced-motion setting
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const on = () => {
      useStore.getState().setReducedMotion(mq.matches)
      if (mq.matches) useStore.getState().setSpeed(0)
    }
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])

  return null
}
