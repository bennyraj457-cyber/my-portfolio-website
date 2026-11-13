import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { PerspectiveCamera } from '@react-three/drei'
import * as THREE from 'three'
import { useCameraInteraction } from '@/hooks/useCameraInteraction'
import { useWorkspaceFocus } from '@/context/WorkspaceFocusContext'
import { useRoomEntrance } from '@/context/RoomEntranceContext'
import { updateAudioListener } from '@/hooks/useMusicPlayer'

// Strict spatial safety bounds so the camera never clips walls, floor, or furniture
const BOUNDS = {
  minAzimuth: -0.34, // ~ -19.5 deg horizontal arc to comfortably see left bike showroom
  maxAzimuth: 0.26, // ~ +15 deg max horizontal arc
  minY: 1.42, // Safely above chair & desk plane
  maxY: 2.15, // Safely below ceiling
  minZ: 1.48, // Strictly behind the seated chair position
  maxZ: 2.75,
} as const

// 0. Entrance Door Coordinates:
const ENTRANCE_CAMERA_DESKTOP_POS = new THREE.Vector3(0, 1.45, 5.25)
const ENTRANCE_CAMERA_MOBILE_POS = new THREE.Vector3(0, 1.50, 5.95)
const ENTRANCE_LOOK_AT = new THREE.Vector3(0, 1.35, 3.65)

// 1. Notebook world coordinates:
const NOTEBOOK_CAMERA_DESKTOP_POS = new THREE.Vector3(-0.755, 1.18, -0.58)
const NOTEBOOK_CAMERA_MOBILE_POS = new THREE.Vector3(-0.755, 1.40, -0.48)
const NOTEBOOK_LOOK_AT = new THREE.Vector3(-0.755, 0.768, -0.795)
const NOTEBOOK_UP = new THREE.Vector3(0, 0.85, -0.52).normalize()

// 2. Smartphone world coordinates:
const SMARTPHONE_CAMERA_DESKTOP_POS = new THREE.Vector3(0.56, 1.015, -0.565)
const SMARTPHONE_CAMERA_MOBILE_POS = new THREE.Vector3(0.56, 1.14, -0.52)
const SMARTPHONE_LOOK_AT = new THREE.Vector3(0.56, 0.768, -0.675)
const SMARTPHONE_UP = new THREE.Vector3(0, 0.88, -0.47).normalize()

// 3. Music Player world coordinates:
const MUSIC_PLAYER_CAMERA_DESKTOP_POS = new THREE.Vector3(0.55, 1.12, -0.42)
const MUSIC_PLAYER_CAMERA_MOBILE_POS = new THREE.Vector3(0.55, 1.24, -0.35)
const MUSIC_PLAYER_LOOK_AT = new THREE.Vector3(0.62, 0.90, -1.02)
const MUSIC_PLAYER_UP = new THREE.Vector3(0, 0.92, -0.39).normalize()

// 4. Bookshelf & Skill Books world coordinates:
const BOOKSHELF_CAMERA_DESKTOP_POS = new THREE.Vector3(-0.91, 1.85, -0.65)
const BOOKSHELF_CAMERA_MOBILE_POS = new THREE.Vector3(-0.91, 1.85, -0.42)
const BOOKSHELF_LOOK_AT = new THREE.Vector3(-0.91, 1.845, -1.3)
const BOOKSHELF_UP = new THREE.Vector3(0, 1, 0)

// 5. Pinned Wall Note world coordinates:
const WALL_NOTE_CAMERA_DESKTOP_POS = new THREE.Vector3(0.78, 1.84, -0.92)
const WALL_NOTE_CAMERA_MOBILE_POS = new THREE.Vector3(0.78, 1.84, -0.72)
const WALL_NOTE_LOOK_AT = new THREE.Vector3(0.78, 1.84, -1.37)
const WALL_NOTE_UP = new THREE.Vector3(0, 1, 0)

// 6. Framed Wall Art world coordinates:
const WALL_ART_CAMERA_DESKTOP_POS = new THREE.Vector3(1.55, 1.68, -0.72)
const WALL_ART_CAMERA_MOBILE_POS = new THREE.Vector3(1.55, 1.68, -0.48)
const WALL_ART_LOOK_AT = new THREE.Vector3(1.55, 1.68, -1.37)
const WALL_ART_UP = new THREE.Vector3(0, 1, 0)

// 7. Honda CB750 Bike Showroom & Left Glass Patio Door world coordinates:
const BIKE_SHOWROOM_CAMERA_DESKTOP_POS = new THREE.Vector3(-0.35, 1.38, 1.15)
const BIKE_SHOWROOM_CAMERA_MOBILE_POS = new THREE.Vector3(0.12, 1.52, 1.85)
const BIKE_SHOWROOM_LOOK_AT = new THREE.Vector3(-2.35, 0.92, -0.15)
const BIKE_SHOWROOM_UP = new THREE.Vector3(0, 1, 0)

// Individual Book Stage 2 Close-Up framing:
const BOOK_OPEN_CAMERA_DESKTOP_POS = new THREE.Vector3(-0.90, 1.94, -0.62)
const BOOK_OPEN_CAMERA_MOBILE_POS = new THREE.Vector3(-0.90, 1.96, -0.42)
const BOOK_OPEN_LOOK_AT = new THREE.Vector3(-0.90, 1.83, -1.02)
const BOOK_OPEN_UP = new THREE.Vector3(0, 0.95, -0.31).normalize()

export function Camera() {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null)
  const { size } = useThree()
  const aspect = size.width / Math.max(size.height, 1)
  const isMobile = size.width < 768
  const isPortrait = aspect < 1.0

  // Dynamically calculate camera vertical FOV based on aspect ratio
  // In Three.js, fov is VERTICAL degrees. When screen is narrow (portrait / mobile),
  // horizontal FOV = 2 * atan(tan(fov/2) * aspect).
  // If we don't increase vertical FOV on tall narrow screens, the horizontal field of view
  // shrinks dramatically, cutting off the desk sides, motorcycle room, and controls.
  const dynamicFov = useMemo(() => {
    if (aspect < 0.6) return 66 // Tall phones (e.g. 9:19.5, 9:20)
    if (aspect < 0.8) return 58 // Standard mobile portrait (e.g. 390x844)
    if (aspect < 1.05) return 52 // Square/Tablet portrait (e.g. iPad portrait 3:4)
    if (aspect < 1.45) return 47 // Tablet landscape / Small laptop
    return 45 // Standard desktop & ultrawide
  }, [aspect])

  const interactionRef = useCameraInteraction()
  const { activeObject, activeBook, isAnyObjectOpen } = useWorkspaceFocus()
  const { stage, completeEntrance, completeExit, isReducedMotion } = useRoomEntrance()

  // Default third-person elevated position behind the chair
  // On portrait/mobile, move slightly further back and up to give a comfortable panorama
  const defaultPos = useMemo(() => {
    if (aspect < 0.65) {
      return new THREE.Vector3(0.18, 1.95, 2.85)
    }
    if (isMobile || isPortrait) {
      return new THREE.Vector3(0.2, 1.88, 2.55)
    }
    return new THREE.Vector3(0.28, 1.75, 2.05)
  }, [aspect, isMobile, isPortrait])

  // Default focal point looking at the desk and monitor
  const defaultLookAt = new THREE.Vector3(0, 0.92, -0.75)

  // Entrance transition state
  const isEntranceMode = stage !== 'WORKSPACE'
  const entranceTRef = useRef<number>(stage === 'WORKSPACE' ? 1 : 0)
  const entranceTravelDelayRef = useRef<number>(0)

  // Camera current flight coordinates
  const currentPosRef = useRef<THREE.Vector3>(
    stage === 'WORKSPACE'
      ? defaultPos.clone()
      : (isMobile ? ENTRANCE_CAMERA_MOBILE_POS : ENTRANCE_CAMERA_DESKTOP_POS).clone(),
  )
  const currentLookAtRef = useRef<THREE.Vector3>(
    stage === 'WORKSPACE' ? defaultLookAt.clone() : ENTRANCE_LOOK_AT.clone(),
  )
  const currentUpRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 1, 0))

  // Instant Target Goals calculated each frame
  const goalPosRef = useRef<THREE.Vector3>(defaultPos.clone())
  const goalLookRef = useRef<THREE.Vector3>(defaultLookAt.clone())
  const goalUpRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 1, 0))

  // Scratch vectors
  const workspacePosScratch = useRef<THREE.Vector3>(new THREE.Vector3())
  const workspaceLookScratch = useRef<THREE.Vector3>(new THREE.Vector3())

  // Smoothing buffers for pointer & scroll
  const smoothedPointerRef = useRef<{ x: number; y: number; scroll: number }>({
    x: 0,
    y: 0,
    scroll: 0,
  })

  const lastAudioUpdatePos = useRef<THREE.Vector3>(new THREE.Vector3())

  useFrame(({ clock }, delta) => {
    if (!cameraRef.current) return

    // Update dynamic FOV smoothly if window resized or rotated
    if (Math.abs(cameraRef.current.fov - dynamicFov) > 0.05) {
      cameraRef.current.fov = THREE.MathUtils.lerp(cameraRef.current.fov, dynamicFov, 0.1)
      cameraRef.current.updateProjectionMatrix()
    }

    const { pointerX, pointerY, scrollProgress, reducedMotion, isTouch } =
      interactionRef.current

    const dt = Math.min(delta, 0.05)

    // Handle entrance stage travel progress
    if (stage === 'DOOR_OPENING' || stage === 'ENTERING_ROOM') {
      if (stage === 'DOOR_OPENING') {
        entranceTravelDelayRef.current += dt
      }
      if (stage === 'ENTERING_ROOM' || entranceTravelDelayRef.current > 0.45) {
        const travelSpeed = isReducedMotion ? 2.5 : 0.85
        entranceTRef.current = Math.min(1, entranceTRef.current + travelSpeed * dt)
        if (entranceTRef.current >= 0.999) {
          entranceTRef.current = 1
          completeEntrance()
        }
      }
    } else if (stage === 'EXITING_ROOM') {
      const exitSpeed = isReducedMotion ? 3.0 : 0.85
      entranceTRef.current = Math.max(0, entranceTRef.current - exitSpeed * dt)
      if (entranceTRef.current <= 0.001) {
        entranceTRef.current = 0
        completeExit()
      }
    } else if (stage === 'WORKSPACE') {
      entranceTRef.current = 1
    }

    // 1. Calculate Workspace Overview coordinates
    const targetPX = reducedMotion || isAnyObjectOpen || isEntranceMode ? 0 : pointerX
    const targetPY = reducedMotion || isAnyObjectOpen || isEntranceMode ? 0 : pointerY
    const targetScroll = reducedMotion || isAnyObjectOpen || isEntranceMode ? 0 : scrollProgress
    const damp = 1 - Math.exp((isTouch ? 10.0 : 8.0) * -dt)

    smoothedPointerRef.current.x = THREE.MathUtils.lerp(smoothedPointerRef.current.x, targetPX, damp)
    smoothedPointerRef.current.y = THREE.MathUtils.lerp(smoothedPointerRef.current.y, targetPY, damp)
    smoothedPointerRef.current.scroll = THREE.MathUtils.lerp(smoothedPointerRef.current.scroll, targetScroll, damp)

    const px = smoothedPointerRef.current.x
    const py = smoothedPointerRef.current.y
    const s = smoothedPointerRef.current.scroll

    const baseRadius = (isMobile ? 2.55 : 2.05) - s * 0.28
    const baseY = (isMobile ? 1.85 : 1.75) - s * 0.08
    const baseX = (isMobile ? 0.2 : 0.28) * (1 - s * 0.35)

    const maxYaw = isTouch ? 0.14 : 0.22
    const azimuth = THREE.MathUtils.clamp(px * maxYaw, BOUNDS.minAzimuth, BOUNDS.maxAzimuth)
    const maxElevation = isTouch ? 0.08 : 0.14
    const elevationOffset = THREE.MathUtils.clamp(py * maxElevation, -0.14, 0.16)

    const t = clock.getElapsedTime()
    const idleX = reducedMotion || isAnyObjectOpen || isEntranceMode ? 0 : Math.sin(t * 0.45) * 0.012
    const idleY = reducedMotion || isAnyObjectOpen || isEntranceMode ? 0 : Math.cos(t * 0.38) * 0.008

    const desiredX = baseX + Math.sin(azimuth) * baseRadius * 0.85 + idleX
    const desiredZ = Math.cos(azimuth) * baseRadius
    const desiredY = baseY + elevationOffset + idleY

    workspacePosScratch.current.set(
      THREE.MathUtils.clamp(desiredX, -0.65, 0.85),
      THREE.MathUtils.clamp(desiredY, BOUNDS.minY, BOUNDS.maxY),
      THREE.MathUtils.clamp(desiredZ, BOUNDS.minZ, BOUNDS.maxZ),
    )

    const lookX = defaultLookAt.x + px * (isTouch ? 0.04 : 0.09)
    const lookY = defaultLookAt.y + py * (isTouch ? 0.03 : 0.07) + s * 0.06
    const lookZ = defaultLookAt.z - s * 0.08
    workspaceLookScratch.current.set(lookX, lookY, lookZ)

    // 2. Select Goal Coordinates based on active object or stage
    const entranceT = entranceTRef.current
    const isMobileLayout = isMobile || isPortrait

    if (entranceT < 1) {
      // Transitioning through the door
      const smoothEntranceT = entranceT * entranceT * (3 - 2 * entranceT)
      const startPos = isMobileLayout ? ENTRANCE_CAMERA_MOBILE_POS : ENTRANCE_CAMERA_DESKTOP_POS
      const startLook = ENTRANCE_LOOK_AT

      goalPosRef.current.lerpVectors(startPos, workspacePosScratch.current, smoothEntranceT)
      goalLookRef.current.lerpVectors(startLook, workspaceLookScratch.current, smoothEntranceT)
      goalUpRef.current.set(0, 1, 0)
    } else if (activeObject === 'about-me-notebook') {
      goalPosRef.current.copy(isMobileLayout ? NOTEBOOK_CAMERA_MOBILE_POS : NOTEBOOK_CAMERA_DESKTOP_POS)
      goalLookRef.current.copy(NOTEBOOK_LOOK_AT)
      goalUpRef.current.copy(NOTEBOOK_UP)
    } else if (activeObject === 'contact-smartphone') {
      goalPosRef.current.copy(isMobileLayout ? SMARTPHONE_CAMERA_MOBILE_POS : SMARTPHONE_CAMERA_DESKTOP_POS)
      goalLookRef.current.copy(SMARTPHONE_LOOK_AT)
      goalUpRef.current.copy(SMARTPHONE_UP)
    } else if (activeObject === 'music-player') {
      goalPosRef.current.copy(isMobileLayout ? MUSIC_PLAYER_CAMERA_MOBILE_POS : MUSIC_PLAYER_CAMERA_DESKTOP_POS)
      goalLookRef.current.copy(MUSIC_PLAYER_LOOK_AT)
      goalUpRef.current.copy(MUSIC_PLAYER_UP)
    } else if (activeObject === 'wall-art') {
      goalPosRef.current.copy(isMobileLayout ? WALL_ART_CAMERA_MOBILE_POS : WALL_ART_CAMERA_DESKTOP_POS)
      goalLookRef.current.copy(WALL_ART_LOOK_AT)
      goalUpRef.current.copy(WALL_ART_UP)
    } else if (activeObject === 'bike-showroom') {
      goalPosRef.current.copy(
        isMobileLayout ? BIKE_SHOWROOM_CAMERA_MOBILE_POS : BIKE_SHOWROOM_CAMERA_DESKTOP_POS,
      )
      goalLookRef.current.copy(BIKE_SHOWROOM_LOOK_AT)
      goalUpRef.current.copy(BIKE_SHOWROOM_UP)
    } else if (activeObject === 'wall-note') {
      goalPosRef.current.copy(isMobileLayout ? WALL_NOTE_CAMERA_MOBILE_POS : WALL_NOTE_CAMERA_DESKTOP_POS)
      goalLookRef.current.copy(WALL_NOTE_LOOK_AT)
      goalUpRef.current.copy(WALL_NOTE_UP)
    } else if (activeObject === 'bookshelf') {
      if (activeBook !== null) {
        goalPosRef.current.copy(isMobileLayout ? BOOK_OPEN_CAMERA_MOBILE_POS : BOOK_OPEN_CAMERA_DESKTOP_POS)
        goalLookRef.current.copy(BOOK_OPEN_LOOK_AT)
        goalUpRef.current.copy(BOOK_OPEN_UP)
      } else {
        goalPosRef.current.copy(isMobileLayout ? BOOKSHELF_CAMERA_MOBILE_POS : BOOKSHELF_CAMERA_DESKTOP_POS)
        goalLookRef.current.copy(BOOKSHELF_LOOK_AT)
        goalUpRef.current.copy(BOOKSHELF_UP)
      }
    } else {
      // Normal Workspace overview
      goalPosRef.current.copy(workspacePosScratch.current)
      goalLookRef.current.copy(workspaceLookScratch.current)
      goalUpRef.current.set(0, 1, 0)
    }

    // 3. Ultra-Smooth Cinematic Critically Damped Flight (damp3)
    // Smoothing factor: 4.5 gives a lush, weighted, cinematic camera glide with zero harsh snapping
    const cameraFlightRate = 4.2

    currentPosRef.current.x = THREE.MathUtils.damp(currentPosRef.current.x, goalPosRef.current.x, cameraFlightRate, dt)
    currentPosRef.current.y = THREE.MathUtils.damp(currentPosRef.current.y, goalPosRef.current.y, cameraFlightRate, dt)
    currentPosRef.current.z = THREE.MathUtils.damp(currentPosRef.current.z, goalPosRef.current.z, cameraFlightRate, dt)

    currentLookAtRef.current.x = THREE.MathUtils.damp(currentLookAtRef.current.x, goalLookRef.current.x, cameraFlightRate, dt)
    currentLookAtRef.current.y = THREE.MathUtils.damp(currentLookAtRef.current.y, goalLookRef.current.y, cameraFlightRate, dt)
    currentLookAtRef.current.z = THREE.MathUtils.damp(currentLookAtRef.current.z, goalLookRef.current.z, cameraFlightRate, dt)

    currentUpRef.current.x = THREE.MathUtils.damp(currentUpRef.current.x, goalUpRef.current.x, cameraFlightRate, dt)
    currentUpRef.current.y = THREE.MathUtils.damp(currentUpRef.current.y, goalUpRef.current.y, cameraFlightRate, dt)
    currentUpRef.current.z = THREE.MathUtils.damp(currentUpRef.current.z, goalUpRef.current.z, cameraFlightRate, dt)
    currentUpRef.current.normalize()

    // Apply to Three.js camera
    cameraRef.current.position.copy(currentPosRef.current)
    cameraRef.current.up.copy(currentUpRef.current)
    cameraRef.current.lookAt(currentLookAtRef.current)

    // Update acoustic 3D spatial audio listener
    if (lastAudioUpdatePos.current.distanceToSquared(currentPosRef.current) > 0.0004) {
      lastAudioUpdatePos.current.copy(currentPosRef.current)
      updateAudioListener(
        currentPosRef.current.x,
        currentPosRef.current.y,
        currentPosRef.current.z,
      )
    }
  })

  const initialCamPos =
    stage === 'WORKSPACE'
      ? defaultPos
      : isMobile
      ? ENTRANCE_CAMERA_MOBILE_POS
      : ENTRANCE_CAMERA_DESKTOP_POS

  return (
    <PerspectiveCamera
      ref={cameraRef}
      makeDefault
      position={[initialCamPos.x, initialCamPos.y, initialCamPos.z]}
      fov={dynamicFov}
      near={0.1}
      far={30}
    />
  )
}
