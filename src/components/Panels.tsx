import { lazy, Suspense } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useStore } from '../store'

// code-split: the tool panels (and their astronomy searches) load on first use
const SearchPalette = lazy(() => import('./panels/SearchPalette'))
const TonightPanel = lazy(() => import('./panels/TonightPanel'))
const TimeTravelPanel = lazy(() => import('./panels/TimeTravelPanel'))
const ComparePanel = lazy(() => import('./panels/ComparePanel'))

export default function Panels() {
  const panel = useStore((s) => s.panel)
  return (
    <Suspense fallback={null}>
      <AnimatePresence>
        {panel === 'search' && <SearchPalette key="search" />}
        {panel === 'tonight' && <TonightPanel key="tonight" />}
        {panel === 'time' && <TimeTravelPanel key="time" />}
        {panel === 'compare' && <ComparePanel key="compare" />}
      </AnimatePresence>
    </Suspense>
  )
}
