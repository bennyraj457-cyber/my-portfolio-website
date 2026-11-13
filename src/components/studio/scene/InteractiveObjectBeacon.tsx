import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Billboard } from '@react-three/drei'
import * as THREE from 'three'
import { useRoomEntrance } from '@/context/RoomEntranceContext'

export interface InteractiveObjectBeaconProps {
  /** 3D local offset where the indicator dot floats */
  position?: [number, number, number]
  /** Whether the parent object is hovered */
  isHovered?: boolean
  /** Whether this object is currently open/focused */
  isOpen: boolean
  /** Whether any other experience is open (which hides all indicators) */
  isAnyObjectOpen?: boolean
  /** Custom distance scale factor (default 2.4) */
  distanceFactor?: number
}

/**
 * Pure WebGL Billboard Interactive Beacon Indicator (Zero DOM / Zero Layout Thrashing).
 * Replaces @react-three/drei's <Html> so camera flight never triggers per-frame DOM CSS projections.
 */
export function InteractiveObjectBeacon({
  position = [0, 0.15, 0],
  isHovered = false,
  isOpen,
  isAnyObjectOpen = false,
  distanceFactor = 2.4,
}: InteractiveObjectBeaconProps) {
  const { stage } = useRoomEntrance()
  const pulseRingRef = useRef<THREE.Mesh>(null)
  const pulseMatRef = useRef<THREE.MeshBasicMaterial>(null)
  const coreDotRef = useRef<THREE.Mesh>(null)

  const isVisible = stage === 'WORKSPACE' && !isAnyObjectOpen && !isOpen
  const baseScale = (distanceFactor / 2.4) * 0.022

  useFrame((state) => {
    if (!isVisible) return
    const t = state.clock.getElapsedTime()
    const cycle = (t * 1.35) % 1

    if (pulseRingRef.current && pulseMatRef.current) {
      const ringScale = 1 + cycle * (isHovered ? 1.85 : 1.45)
      pulseRingRef.current.scale.setScalar(ringScale)
      pulseMatRef.current.opacity = (1 - cycle) * (isHovered ? 0.75 : 0.48)
    }

    if (coreDotRef.current) {
      const targetCore = isHovered ? 1.28 : 1.0
      coreDotRef.current.scale.setScalar(targetCore)
    }
  })

  if (!isVisible) return null

  return (
    <Billboard position={position} follow={true}>
      <group scale={[baseScale, baseScale, baseScale]}>
        {/* Outer expanding radar pulse ring */}
        <mesh ref={pulseRingRef} raycast={() => null}>
          <ringGeometry args={[0.75, 1.15, 24]} />
          <meshBasicMaterial
            ref={pulseMatRef}
            color="#f5d000"
            transparent
            opacity={0.5}
            depthTest={false}
            depthWrite={false}
          />
        </mesh>

        {/* Soft ambient aura disc */}
        <mesh raycast={() => null}>
          <circleGeometry args={[1.15, 24]} />
          <meshBasicMaterial
            color="#f5d000"
            transparent
            opacity={isHovered ? 0.32 : 0.18}
            depthTest={false}
            depthWrite={false}
          />
        </mesh>

        {/* Dark contrast border ring */}
        <mesh ref={coreDotRef} raycast={() => null}>
          <circleGeometry args={[0.68, 24]} />
          <meshBasicMaterial
            color="#181917"
            depthTest={false}
            depthWrite={false}
          />
          {/* Core Electric-Yellow Dot */}
          <mesh position={[0, 0, 0.01]} raycast={() => null}>
            <circleGeometry args={[0.52, 24]} />
            <meshBasicMaterial
              color="#f5d000"
              depthTest={false}
              depthWrite={false}
            />
          </mesh>
        </mesh>
      </group>
    </Billboard>
  )
}
