import { useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { Wall } from './Wall'
import { Floor } from './Floor'
import { Desk } from './Desk'
import { Chair } from './Chair'
import { ComputerSetup } from './ComputerSetup'
import { RoomDoor } from './RoomDoor'
import { LeftGlassDoorAndBike } from './LeftGlassDoorAndBike'
import { useStudioLighting } from '@/context/StudioLightingContext'

export function Room() {
  const { isNightMode } = useStudioLighting()
  const fogRef = useRef<THREE.Fog>(null)
  const targetFogColor = useRef(new THREE.Color('#f0eee8'))

  useFrame((_, delta) => {
    targetFogColor.current.set(isNightMode ? '#10141e' : '#f0eee8')
    if (fogRef.current) {
      const dr = Math.abs(fogRef.current.color.r - targetFogColor.current.r)
      if (dr > 0.001) {
        fogRef.current.color.lerp(targetFogColor.current, delta * 4)
      }
    }
  })

  return (
    <group name="Room">
      {/* Dynamic atmospheric depth fog adapting to Day / Midnight Dev Mode */}
      <fog ref={fogRef} attach="fog" args={['#f0eee8', 5.5, 13]} />
      <Floor />
      <Wall />
      <LeftGlassDoorAndBike />
      <Desk />
      <ComputerSetup />
      <Chair />
      <RoomDoor />
    </group>
  )
}
