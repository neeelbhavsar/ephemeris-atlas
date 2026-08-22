import { Loader } from '@react-three/drei'
import Scene from './three/Scene'
import Hud from './components/Hud'
import TourNav from './components/TourNav'
import HoverCard from './components/HoverCard'

export default function App() {
  return (
    <div className="relative h-dvh w-full overflow-hidden bg-[#05060d]">
      <Scene />

      {/* 2D overlays */}
      <Hud />
      <TourNav />
      <HoverCard />

      {/* texture loading screen */}
      <Loader
        containerStyles={{ background: '#05060d' }}
        barStyles={{ background: 'linear-gradient(90deg,#22d3ee,#8b5cf6,#fb7185)' }}
        dataStyles={{
          color: '#cbd5e1',
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '12px',
        }}
        dataInterpolation={(p) => `Charting the solar system… ${p.toFixed(0)}%`}
      />
    </div>
  )
}
