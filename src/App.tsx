import Scene from './three/Scene'
import Hud from './components/Hud'
import TourNav from './components/TourNav'
import HoverCard from './components/HoverCard'
import InfoPanel from './components/InfoPanel'
import StoryCaption from './components/StoryCaption'
import ScaleBar from './components/ScaleBar'
import Intro from './components/Intro'
import Panels from './components/Panels'
import Toast from './components/Toast'
import AppEffects from './components/AppEffects'
import { markerLayer } from './three/markerLayer'

export default function App() {
  return (
    <div className="relative h-dvh w-full overflow-hidden bg-[#05060d]">
      {/* screen-space body labels (drei <Html>) render here, above the canvas */}
      <div
        ref={(el) => {
          if (el) markerLayer.current = el
        }}
        className="pointer-events-none fixed inset-0 z-20 overflow-hidden"
      />
      <Scene />

      {/* 2D overlays */}
      <Hud />
      <TourNav />
      <StoryCaption />
      <ScaleBar />
      <HoverCard />
      <InfoPanel />
      <Panels />
      <Toast />

      {/* title card + loading screen */}
      <Intro />
      <AppEffects />
    </div>
  )
}
