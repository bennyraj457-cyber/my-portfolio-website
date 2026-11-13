import { useMemo, useRef, useState, useCallback, useEffect } from 'react'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import { useRoomEntrance } from '@/context/RoomEntranceContext'
import { entranceAudio } from '@/utils/entranceAudio'
import { EntranceWallDecor } from './EntranceWallDecor'
import {
  createGlassDecalTexture,
  createDoorBottomDecalTexture,
} from './doorGraphicsTextures'

export function RoomDoor() {
  const { stage, handleDoorClick, isReducedMotion } = useRoomEntrance()

  const [isHandleHovered, setIsHandleHovered] = useState(false)
  const [isDoorHovered, setIsDoorHovered] = useState(false)

  const doorPivotRef = useRef<THREE.Group>(null)
  const handlePivotRef = useRef<THREE.Group>(null)
  const indicatorRingRef = useRef<THREE.MeshBasicMaterial>(null)

  // Procedural textures
  const glassDecalTexture = useMemo(() => createGlassDecalTexture(), [])
  const doorBottomDecalTexture = useMemo(() => createDoorBottomDecalTexture(), [])

  // Animation state values
  const doorAngleRef = useRef(0)
  const handleAngleRef = useRef(0)
  const unlockTriggeredRef = useRef(false)
  const swingTriggeredRef = useRef(false)

  // Dimensions
  const doorWidth = 1.15
  const doorHeight = 2.45
  const doorThickness = 0.048
  const doorZ = 3.65 // Front wall position

  const doorTeal = '#439d8e'
  const frameTeal = '#358276'

  // Window aperture dimensions
  const winW = 0.46
  const winH = 0.78
  const winY = 0.44

  const isClickable = stage === 'ENTRANCE'

  const onPointerOver = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation()
      if (isClickable) {
        setIsDoorHovered(true)
        document.body.style.cursor = 'pointer'
      }
    },
    [isClickable],
  )

  const onPointerOut = useCallback((e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    setIsDoorHovered(false)
    setIsHandleHovered(false)
    document.body.style.cursor = 'auto'
  }, [])

  const onHandlePointerOver = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation()
      if (isClickable) {
        setIsHandleHovered(true)
        document.body.style.cursor = 'pointer'
      }
    },
    [isClickable],
  )

  const onClick = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation()
      if (isClickable) {
        entranceAudio.playKnock()
        handleDoorClick()
        document.body.style.cursor = 'auto'
      }
    },
    [isClickable, handleDoorClick],
  )

  // Reset triggers and door angles when returning to ENTRANCE
  useEffect(() => {
    if (stage === 'ENTRANCE') {
      unlockTriggeredRef.current = false
      swingTriggeredRef.current = false
      doorAngleRef.current = 0
      handleAngleRef.current = 0
      if (doorPivotRef.current) {
        doorPivotRef.current.rotation.y = 0
      }
      if (handlePivotRef.current) {
        handlePivotRef.current.rotation.z = 0
      }
    }
  }, [stage])

  // Trigger unlock sound when stage changes to DOOR_OPENING
  useEffect(() => {
    if (stage === 'DOOR_OPENING' && !unlockTriggeredRef.current) {
      unlockTriggeredRef.current = true
      entranceAudio.playHandleTurn()
      setTimeout(() => {
        entranceAudio.playUnlock()
      }, 250)
      setTimeout(() => {
        entranceAudio.playDoorSwing()
        swingTriggeredRef.current = true
      }, 600)
    }
  }, [stage])

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.1)

    // Pulse the indicator ring around handle when at entrance
    if (indicatorRingRef.current && isClickable) {
      const pulse = 0.4 + 0.45 * Math.sin(state.clock.elapsedTime * 4.5)
      indicatorRingRef.current.opacity = isHandleHovered || isDoorHovered ? 0.95 : pulse
    }

    const targetHandleAngle =
      stage === 'DOOR_OPENING' || stage === 'ENTERING_ROOM' || stage === 'WORKSPACE'
        ? 0.58
        : 0

    const targetDoorAngle =
      stage === 'DOOR_OPENING' || stage === 'ENTERING_ROOM' || stage === 'WORKSPACE'
        ? -Math.PI * 0.6
        : 0

    // Early-exit when inside WORKSPACE and door swing has already settled
    if (
      stage === 'WORKSPACE' &&
      Math.abs(doorAngleRef.current - targetDoorAngle) < 0.001 &&
      Math.abs(handleAngleRef.current - targetHandleAngle) < 0.001
    ) {
      return
    }

    handleAngleRef.current = THREE.MathUtils.damp(
      handleAngleRef.current,
      targetHandleAngle,
      stage === 'EXITING_ROOM' ? 2.5 : 6.0,
      dt,
    )

    if (handlePivotRef.current) {
      handlePivotRef.current.rotation.z = -handleAngleRef.current
    }

    if (stage === 'ENTRANCE') {
      doorAngleRef.current = THREE.MathUtils.damp(doorAngleRef.current, 0, 15.0, dt)
    } else if (stage === 'EXITING_ROOM') {
      doorAngleRef.current = THREE.MathUtils.damp(doorAngleRef.current, 0, 1.8, dt)
    } else if (swingTriggeredRef.current || isReducedMotion || stage === 'WORKSPACE') {
      const swingSpeed = isReducedMotion ? 20.0 : 2.2
      doorAngleRef.current = THREE.MathUtils.damp(
        doorAngleRef.current,
        targetDoorAngle,
        swingSpeed,
        dt,
      )
    }

    if (doorPivotRef.current) {
      doorPivotRef.current.rotation.y = doorAngleRef.current
    }
  })

  const topH = doorHeight / 2 - (winY + winH / 2)
  const bottomH = winY - winH / 2 - (-doorHeight / 2)
  const sideW = (doorWidth - winW) / 2

  return (
    <group name="RoomEntranceEnvironment" position={[0, 0, doorZ]}>
      {/* 1. Surrounding Clean Architectural Walls */}
      <mesh position={[-2.4, doorHeight / 2, 0]} receiveShadow raycast={() => null}>
        <boxGeometry args={[3.6, 3.6, 0.1]} />
        <meshStandardMaterial color="#f8f8f6" roughness={0.9} metalness={0.02} />
      </mesh>
      <mesh position={[2.4, doorHeight / 2, 0]} receiveShadow raycast={() => null}>
        <boxGeometry args={[3.6, 3.6, 0.1]} />
        <meshStandardMaterial color="#f8f8f6" roughness={0.9} metalness={0.02} />
      </mesh>
      <mesh position={[0, doorHeight + 0.55, 0]} receiveShadow raycast={() => null}>
        <boxGeometry args={[doorWidth + 0.18, 1.1, 0.1]} />
        <meshStandardMaterial color="#f8f8f6" roughness={0.9} metalness={0.02} />
      </mesh>

      {/* Wall Vertical Panel Seam / Shadow Lines */}
      <mesh position={[-0.78, doorHeight / 2, 0.052]} raycast={() => null}>
        <planeGeometry args={[0.003, 3.6]} />
        <meshBasicMaterial color="#dcdad4" />
      </mesh>
      <mesh position={[0.78, doorHeight / 2, 0.052]} raycast={() => null}>
        <planeGeometry args={[0.003, 3.6]} />
        <meshBasicMaterial color="#dcdad4" />
      </mesh>

      {/* 2. Architectural Clean-Room Matching Teal Frame */}
      <mesh position={[-doorWidth / 2 - 0.045, doorHeight / 2, 0]} receiveShadow raycast={() => null}>
        <boxGeometry args={[0.09, doorHeight + 0.09, 0.12]} />
        <meshStandardMaterial color={frameTeal} roughness={0.5} metalness={0.12} />
      </mesh>
      <mesh position={[doorWidth / 2 + 0.045, doorHeight / 2, 0]} receiveShadow raycast={() => null}>
        <boxGeometry args={[0.09, doorHeight + 0.09, 0.12]} />
        <meshStandardMaterial color={frameTeal} roughness={0.5} metalness={0.12} />
      </mesh>
      <mesh position={[0, doorHeight + 0.045, 0]} receiveShadow raycast={() => null}>
        <boxGeometry args={[doorWidth + 0.18, 0.09, 0.12]} />
        <meshStandardMaterial color={frameTeal} roughness={0.5} metalness={0.12} />
      </mesh>

      {/* Clean-Room Curved Floor Baseboard */}
      <mesh position={[0, 0.04, 0.052]} receiveShadow raycast={() => null}>
        <boxGeometry args={[doorWidth + 0.22, 0.08, 0.015]} />
        <meshStandardMaterial color="#eae8e2" roughness={0.4} />
      </mesh>

      {/* Architectural Entrance Wall Decor (Sconce, Plaque, Plant) */}
      <EntranceWallDecor />

      {/* 3. Swiveling Clean-Room Teal Door Assembly with Glass Window */}
      <group
        ref={doorPivotRef}
        position={[-doorWidth / 2, 0, 0]}
        onPointerOver={onPointerOver}
        onPointerOut={onPointerOut}
        onClick={onClick}
      >
        <group position={[doorWidth / 2, doorHeight / 2, 0]}>
          {/* Single invisible hit-plane for the door slab when at ENTRANCE */}
          <mesh visible={false}>
            <boxGeometry args={[doorWidth, doorHeight, doorThickness + 0.02]} />
            <meshBasicMaterial />
          </mesh>

          {/* A. Solid Panels around the Window Cutout (raycast disabled since hit-box handles it) */}
          <mesh position={[0, doorHeight / 2 - topH / 2, 0]} receiveShadow raycast={() => null}>
            <boxGeometry args={[doorWidth - 0.01, topH, doorThickness]} />
            <meshStandardMaterial color={doorTeal} roughness={0.5} metalness={0.1} />
          </mesh>

          <mesh position={[0, -doorHeight / 2 + bottomH / 2, 0]} receiveShadow raycast={() => null}>
            <boxGeometry args={[doorWidth - 0.01, bottomH, doorThickness]} />
            <meshStandardMaterial color={doorTeal} roughness={0.5} metalness={0.1} />
          </mesh>

          <mesh position={[-doorWidth / 2 + sideW / 2 + 0.005, winY, 0]} receiveShadow raycast={() => null}>
            <boxGeometry args={[sideW, winH, doorThickness]} />
            <meshStandardMaterial color={doorTeal} roughness={0.5} metalness={0.1} />
          </mesh>

          <mesh position={[doorWidth / 2 - sideW / 2 - 0.005, winY, 0]} receiveShadow raycast={() => null}>
            <boxGeometry args={[sideW, winH, doorThickness]} />
            <meshStandardMaterial color={doorTeal} roughness={0.5} metalness={0.1} />
          </mesh>

          {/* B. Glass Window Pane with Black Rounded Rubber Gasket Frame */}
          <group position={[0, winY, 0]} raycast={() => null}>
            <mesh position={[0, winH / 2 + 0.015, 0]}>
              <boxGeometry args={[winW + 0.06, 0.03, doorThickness + 0.008]} />
              <meshStandardMaterial color="#1a1b18" roughness={0.8} metalness={0.15} />
            </mesh>
            <mesh position={[0, -winH / 2 - 0.015, 0]}>
              <boxGeometry args={[winW + 0.06, 0.03, doorThickness + 0.008]} />
              <meshStandardMaterial color="#1a1b18" roughness={0.8} metalness={0.15} />
            </mesh>
            <mesh position={[-winW / 2 - 0.015, 0, 0]}>
              <boxGeometry args={[0.03, winH, doorThickness + 0.008]} />
              <meshStandardMaterial color="#1a1b18" roughness={0.8} metalness={0.15} />
            </mesh>
            <mesh position={[winW / 2 + 0.015, 0, 0]}>
              <boxGeometry args={[0.03, winH, doorThickness + 0.008]} />
              <meshStandardMaterial color="#1a1b18" roughness={0.8} metalness={0.15} />
            </mesh>

            {/* Clear Transparent Glass Pane */}
            <mesh position={[0, 0, 0]}>
              <planeGeometry args={[winW + 0.01, winH + 0.01]} />
              <meshStandardMaterial
                color="#e8f4f8"
                transparent
                opacity={0.22}
                roughness={0.05}
                metalness={0.1}
                side={THREE.DoubleSide}
                depthWrite={false}
              />
            </mesh>

            {/* Subtle Frosted Safety Manifestation Decal */}
            <mesh position={[0, 0, 0.002]}>
              <planeGeometry args={[winW - 0.02, winH - 0.02]} />
              <meshBasicMaterial
                map={glassDecalTexture}
                transparent
                opacity={0.6}
                side={THREE.DoubleSide}
                depthWrite={false}
              />
            </mesh>

            <mesh position={[-winW * 0.15, winH * 0.2, 0.003]} rotation={[0, 0, -0.6]}>
              <planeGeometry args={[0.035, 0.28]} />
              <meshBasicMaterial color="#ffffff" transparent opacity={0.35} depthWrite={false} />
            </mesh>
          </group>

          {/* D. Lower Door Architectural Graphics Decal */}
          <group position={[0, -0.72, doorThickness / 2 + 0.003]} raycast={() => null}>
            <mesh position={[0, 0, 0.001]}>
              <planeGeometry args={[doorWidth - 0.2, 0.22]} />
              <meshBasicMaterial
                map={doorBottomDecalTexture}
                transparent
                opacity={0.9}
                side={THREE.FrontSide}
              />
            </mesh>
          </group>

          {/* E. Modern Stainless Steel Door Handle & Keyhole */}
          <group position={[doorWidth / 2 - 0.13, -0.08, doorThickness / 2 + 0.004]}>
            <mesh rotation={[Math.PI / 2, 0, 0]} raycast={() => null}>
              <cylinderGeometry args={[0.028, 0.028, 0.006, 16]} />
              <meshStandardMaterial color="#c8cbce" metalness={0.92} roughness={0.2} />
            </mesh>

            <mesh position={[0, -0.09, 0]} rotation={[Math.PI / 2, 0, 0]} raycast={() => null}>
              <cylinderGeometry args={[0.022, 0.022, 0.006, 16]} />
              <meshStandardMaterial color="#c8cbce" metalness={0.92} roughness={0.2} />
            </mesh>
            <mesh position={[0, -0.09, 0.004]} raycast={() => null}>
              <circleGeometry args={[0.008, 12]} />
              <meshBasicMaterial color="#1a1b18" />
            </mesh>

            {isClickable && (
              <mesh position={[0, 0, 0.004]} raycast={() => null}>
                <ringGeometry args={[0.034, 0.044, 24]} />
                <meshBasicMaterial
                  ref={indicatorRingRef}
                  color="#f5d000"
                  transparent
                  opacity={0.7}
                  side={THREE.DoubleSide}
                />
              </mesh>
            )}

            <group
              ref={handlePivotRef}
              position={[0, 0, 0.012]}
              onPointerOver={onHandlePointerOver}
            >
              <mesh rotation={[Math.PI / 2, 0, 0]} raycast={() => null}>
                <cylinderGeometry args={[0.009, 0.009, 0.026, 12]} />
                <meshStandardMaterial color="#d8dade" metalness={0.95} roughness={0.15} />
              </mesh>
              <RoundedBox
                args={[0.135, 0.018, 0.018]}
                position={[-0.058, 0, 0.014]}
                radius={0.004}
                smoothness={2}
              >
                <meshStandardMaterial
                  color="#d4d7db"
                  roughness={0.18}
                  metalness={0.94}
                />
              </RoundedBox>
              <mesh position={[-0.124, 0, 0.014]} raycast={() => null}>
                <boxGeometry args={[0.006, 0.016, 0.016]} />
                <meshBasicMaterial color="#f5d000" />
              </mesh>
            </group>
          </group>

          {/* Interior Door Handle on Inside Face (-Z) */}
          <group position={[doorWidth / 2 - 0.13, -0.08, -doorThickness / 2 - 0.004]} raycast={() => null}>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.028, 0.028, 0.006, 16]} />
              <meshStandardMaterial color="#c8cbce" metalness={0.92} roughness={0.2} />
            </mesh>
            <mesh position={[-0.058, 0, -0.022]}>
              <boxGeometry args={[0.135, 0.018, 0.018]} />
              <meshStandardMaterial color="#d4d7db" roughness={0.2} metalness={0.94} />
            </mesh>
          </group>
        </group>
      </group>
    </group>
  )
}
