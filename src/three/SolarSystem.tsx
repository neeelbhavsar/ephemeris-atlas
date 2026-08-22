import { Suspense } from 'react'
import { PLANETS } from '../data/solarSystem'
import Sun from './Sun'
import Planet3D from './Planet3D'
import OrbitPath from './OrbitPath'
import AsteroidBelt from './AsteroidBelt'

export default function SolarSystem() {
  return (
    <group>
      <Suspense fallback={null}>
        <Sun />
        {PLANETS.map((p) => (
          <group key={p.id}>
            <OrbitPath
              aeBody={p.aeBody!}
              periodDays={p.orbitalPeriodDays!}
              color={p.color}
            />
            <Planet3D body={p} />
          </group>
        ))}
        <AsteroidBelt />
      </Suspense>
    </group>
  )
}
