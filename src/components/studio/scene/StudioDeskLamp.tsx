import { useRef, useMemo, useState, useCallback } from 'react'
import * as THREE from 'three'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { useStudioLighting } from '@/context/StudioLightingContext'
import { useWorkspaceFocus } from '@/context/WorkspaceFocusContext'
import { lampAudio } from '@/utils/lampAudio'
import { createLampshadeFabricTexture, createLampBaseTexture } from './deskLampTextures'

interface StudioDeskLampProps {
  position?: [number, number, number]
  rotation?: [number, number, number]
}

/**
 * Photorealistic Botanical Linen Cylinder Desk Lamp matching the reference photo:
 * - Cylindrical woven linen lampshade with embroidered dark flowers & foliage
 * - Dark bronze lamp stem and socket neck
 * - Distressed sage green ceramic cylindrical base with carved walnut rings
 * - Tactile Day / Night Studio Lighting toggle switch with sound effect
 */
export function StudioDeskLamp({
  position = [-0.75, 0.759, -0.22],
  rotation = [0, 0.45, 0],
}: StudioDeskLampProps) {
  const { isNightMode, toggleDayNight } = useStudioLighting()
  const { isAnyObjectOpen } = useWorkspaceFocus()
  const [isHovered, setIsHovered] = useState(false)

  const lampshadeTexture = useMemo(() => createLampshadeFabricTexture(), [])
  const baseTexture = useMemo(() => createLampBaseTexture(), [])

  const shadeMatRef = useRef<THREE.MeshStandardMaterial>(null)
  const spotLightRef = useRef<THREE.SpotLight>(null)
  const bulbLightRef = useRef<THREE.PointLight>(null)
  const indicatorRingRef = useRef<THREE.MeshBasicMaterial>(null)

  const isClickable = !isAnyObjectOpen

  const onPointerOver = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation()
      if (!isClickable) return
      setIsHovered(true)
      document.body.style.cursor = 'pointer'
    },
    [isClickable]
  )

  const onPointerOut = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation()
      setIsHovered(false)
      document.body.style.cursor = 'auto'
    },
    []
  )

  const handleClick = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation()
      if (!isClickable) return
      const nextNightMode = !isNightMode
      lampAudio.playClick(nextNightMode)
      toggleDayNight()
    },
    [isClickable, isNightMode, toggleDayNight]
  )

  // Smooth light intensity and lampshade glow interpolation
  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime()
    const targetLampGlow = isNightMode ? 1.0 : 0.0
    const targetSpotIntensity = isNightMode ? 3.4 : 0.0
    const targetBulbIntensity = isNightMode ? 1.6 : 0.0

    if (shadeMatRef.current) {
      shadeMatRef.current.emissiveIntensity = THREE.MathUtils.damp(
        shadeMatRef.current.emissiveIntensity,
        targetLampGlow,
        8,
        delta
      )
    }

    if (spotLightRef.current) {
      spotLightRef.current.intensity = THREE.MathUtils.damp(
        spotLightRef.current.intensity,
        targetSpotIntensity,
        8,
        delta
      )
    }

    if (bulbLightRef.current) {
      bulbLightRef.current.intensity = THREE.MathUtils.damp(
        bulbLightRef.current.intensity,
        targetBulbIntensity,
        8,
        delta
      )
    }

    // Interactive electric yellow indicator pulsing halo
    if (indicatorRingRef.current && isClickable) {
      const pulse = 0.4 + Math.sin(t * 3.5) * 0.35
      indicatorRingRef.current.opacity = isHovered ? 0.95 : pulse
    }
  })

  return (
    <group
      name="StudioDeskLamp"
      position={position}
      rotation={rotation}
      onClick={handleClick}
      onPointerOver={onPointerOver}
      onPointerOut={onPointerOut}
    >
      {/* 1. Subtle Interactive Electric Yellow Glow Dot at base */}
      {isClickable && (
        <group position={[0, 0.005, 0.1]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.012, 0.024, 24]} />
            <meshBasicMaterial
              ref={indicatorRingRef}
              color="#f5d000"
              transparent
              opacity={0.6}
              side={THREE.DoubleSide}
            />
          </mesh>
          <mesh position={[0, 0.008, 0]}>
            <sphereGeometry args={[0.007, 16, 16]} />
            <meshBasicMaterial color="#f5d000" />
          </mesh>
        </group>
      )}

      {/* 2. Base Assembly: Distressed Sage Green Ceramic & Carved Walnut Rings (Exact match) */}
      <mesh position={[0, 0.052, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.07, 0.072, 0.104, 36]} />
        <meshStandardMaterial
          map={baseTexture}
          roughness={0.7}
          metalness={0.08}
        />
      </mesh>

      {/* Felt bottom pad */}
      <mesh position={[0, 0.001, 0]}>
        <cylinderGeometry args={[0.068, 0.068, 0.002, 32]} />
        <meshStandardMaterial color="#1a1c18" roughness={0.9} />
      </mesh>

      {/* 3. Central Stem & Socket Neck */}
      {/* Brass collar ring */}
      <mesh position={[0, 0.108, 0]} castShadow>
        <cylinderGeometry args={[0.016, 0.018, 0.01, 24]} />
        <meshStandardMaterial color="#c5a059" roughness={0.3} metalness={0.8} />
      </mesh>

      {/* Matte black metal stem */}
      <mesh position={[0, 0.165, 0]} castShadow>
        <cylinderGeometry args={[0.009, 0.009, 0.11, 20]} />
        <meshStandardMaterial color="#1c1d1a" roughness={0.4} metalness={0.6} />
      </mesh>

      {/* Socket fixture under shade */}
      <mesh position={[0, 0.225, 0]} castShadow>
        <cylinderGeometry args={[0.015, 0.013, 0.028, 20]} />
        <meshStandardMaterial color="#252420" roughness={0.5} metalness={0.7} />
      </mesh>

      {/* 4. Cylindrical Botanical Linen Lampshade with Embroidered Wildflowers */}
      <group position={[0, 0.35, 0]}>
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.11, 0.11, 0.23, 40, 1, true]} />
          <meshStandardMaterial
            ref={shadeMatRef}
            map={lampshadeTexture}
            emissiveMap={lampshadeTexture}
            emissive={new THREE.Color('#ffe1b5')}
            emissiveIntensity={isNightMode ? 1.0 : 0.05}
            roughness={0.85}
            metalness={0.02}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Top & Bottom Metal Lampshade Wire Rims */}
        <mesh position={[0, 0.115, 0]}>
          <torusGeometry args={[0.11, 0.0025, 12, 36]} />
          <meshStandardMaterial color="#e5dac8" roughness={0.5} />
        </mesh>
        <mesh position={[0, -0.115, 0]}>
          <torusGeometry args={[0.11, 0.0025, 12, 36]} />
          <meshStandardMaterial color="#e5dac8" roughness={0.5} />
        </mesh>

        {/* Internal Bulb Light (Soft Warm Core Glow) */}
        <pointLight
          ref={bulbLightRef}
          position={[0, 0, 0]}
          color="#ffc87a"
          intensity={isNightMode ? 1.6 : 0.0}
          distance={1.4}
          decay={2}
        />

        {/* Downward Desk Spotlight Cone (Illuminates Desk Surface in Night Mode) */}
        <spotLight
          ref={spotLightRef}
          position={[0, -0.05, 0]}
          target-position={[0, -0.45, 0.08]}
          color="#ffdba6"
          intensity={isNightMode ? 3.4 : 0.0}
          angle={0.85}
          penumbra={0.75}
          distance={2.4}
          decay={2}
          
        />
      </group>

      {/* 5. Braided Black Power Cable running off the desk back */}
      <mesh position={[0, 0.015, -0.08]} rotation={[0.2, 0, 0]}>
        <cylinderGeometry args={[0.003, 0.003, 0.08, 12]} />
        <meshStandardMaterial color="#1a1c18" roughness={0.8} />
      </mesh>
    </group>
  )
}
