import { Suspense, useMemo, useRef, useState, useCallback, useEffect } from 'react'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { RoundedBox, useGLTF, useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { useStudioLighting } from '@/context/StudioLightingContext'
import { useWorkspaceFocus } from '@/context/WorkspaceFocusContext'
import { entranceAudio } from '@/utils/entranceAudio'
import { InteractiveObjectBeacon } from './InteractiveObjectBeacon'

const BIKE_MODEL_PATH = '/models/honda_cb_750_f_super_sport_1970.glb'
const OUTDOOR_VIEW_TEXTURE = '/textures/mountain-lake-view.jpg'

/**
 * Loads and renders the 1970 Honda CB750 F Super Sport GLB model
 * inside the left side of the room on a sleek architectural showroom plinth.
 * Uses a single lightweight 12-triangle bounding box proxy for instant CPU raycasting!
 */
function HondaBikeModel({
  onHover,
  onClick,
}: {
  onHover: (hovered: boolean) => void
  onClick: (e: ThreeEvent<MouseEvent>) => void
}) {
  const { scene } = useGLTF(BIKE_MODEL_PATH)
  const clonedScene = useMemo(() => scene.clone(true), [scene])

  useEffect(() => {
    clonedScene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh
        // Disable expensive 36k-triangle shadow casting & CPU raycasting on individual sub-meshes
        mesh.castShadow = false
        mesh.receiveShadow = false
        mesh.raycast = () => null
        if (mesh.material) {
          const mat = mesh.material as THREE.MeshStandardMaterial
          mat.envMapIntensity = 1.25
        }
      }
    })
  }, [clonedScene])

  const handlePointerOver = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation()
      onHover(true)
      document.body.style.cursor = 'pointer'
    },
    [onHover],
  )

  const handlePointerOut = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation()
      onHover(false)
      document.body.style.cursor = 'auto'
    },
    [onHover],
  )

  return (
    <group
      position={[0, 0.024, 0]}
      rotation={[0, 0.42, 0]}
      scale={[0.88, 0.88, 0.88]}
    >
      {/* Visual 36k-triangle model with raycast disabled */}
      <primitive object={clonedScene} />

      {/* Ultra-fast 12-triangle invisible hit-box proxy for hover & click */}
      <mesh
        position={[0, 0.58, 0]}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onClick={onClick}
      >
        <boxGeometry args={[0.85, 1.15, 2.05]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} colorWrite={false} />
      </mesh>
    </group>
  )
}

useGLTF.preload(BIKE_MODEL_PATH)

/**
 * Outdoor panoramic mountain-lake backdrop loaded inside its own Suspense boundary
 */
function OutdoorMountainBackdrop({
  skyBackdropMatRef,
}: {
  skyBackdropMatRef: React.RefObject<THREE.MeshBasicMaterial | null>
}) {
  const outdoorTexture = useTexture(OUTDOOR_VIEW_TEXTURE)
  useMemo(() => {
    outdoorTexture.colorSpace = THREE.SRGBColorSpace
    outdoorTexture.minFilter = THREE.LinearFilter
    outdoorTexture.magFilter = THREE.LinearFilter
    outdoorTexture.generateMipmaps = false
    outdoorTexture.needsUpdate = true
  }, [outdoorTexture])

  return (
    <mesh position={[-2.05, 1.65, 0]} rotation={[0, Math.PI / 2, 0]} raycast={() => null}>
      <planeGeometry args={[6.8, 4.4]} />
      <meshBasicMaterial
        ref={skyBackdropMatRef}
        map={outdoorTexture}
        color="#ffffff"
        fog={false}
        toneMapped={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}

/**
 * Left Side Room Extension:
 * 1. Places the 1970 Honda CB 750 F Super Sport inside the left side of the room
 * 2. Builds the straight left architectural wall with a massive floor-to-ceiling Glass Patio Door
 * 3. Allows opening and closing the glass door interactively (via 3D click or HUD pill)
 * 4. Streams warm daytime sunlight beams & floor light patches through the glass door during Day Mode
 */
export function LeftGlassDoorAndBike() {
  const { isNightMode } = useStudioLighting()
  const {
    activeObject,
    isBikeShowroomOpen,
    isAnyObjectOpen,
    openBikeShowroom,
  } = useWorkspaceFocus()

  const [isDoorOpen, setIsDoorOpen] = useState(false)
  const [isDoorHovered, setIsDoorHovered] = useState(false)
  const [isBikeHovered, setIsBikeHovered] = useState(false)

  // Animation refs
  const doorSlideRef = useRef(0) // 0 = closed, 1 = open
  const slidingLeafGroupRef = useRef<THREE.Group>(null)
  const handleGlowRef = useRef<THREE.MeshBasicMaterial>(null)
  const sunDirLightRef = useRef<THREE.DirectionalLight>(null)
  const sunBounceLightRef = useRef<THREE.PointLight>(null)
  const bikeSpotLightRef = useRef<THREE.SpotLight>(null)
  const sunTargetObj = useMemo(() => {
    const obj = new THREE.Object3D()
    obj.position.set(-0.35, 0.35, -0.35)
    return obj
  }, [])
  const sunFloorPatchMatRef = useRef<THREE.ShaderMaterial>(null)
  const sunBeamMat1Ref = useRef<THREE.ShaderMaterial>(null)
  const sunBeamMat2Ref = useRef<THREE.ShaderMaterial>(null)
  const skyBackdropMatRef = useRef<THREE.MeshBasicMaterial>(null)

  // Pre-allocated color objects (zero per-frame GC allocations)
  const nightSunColor = useMemo(() => new THREE.Color('#4a6b9c'), [])
  const daySunColor = useMemo(() => new THREE.Color('#ffbc75'), [])
  const nightSkyColor = useMemo(() => new THREE.Color('#1b263b'), [])
  const daySkyColor = useMemo(() => new THREE.Color('#ffffff'), [])

  const toggleGlassDoor = useCallback(
    (e?: ThreeEvent<MouseEvent> | React.MouseEvent) => {
      if (e) e.stopPropagation()
      setIsDoorOpen((prev) => {
        const next = !prev
        entranceAudio.playGlassDoorSlide(next)
        return next
      })
    },
    [],
  )

  const handleBikeClick = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation()
      if (!isBikeShowroomOpen) {
        openBikeShowroom()
      } else {
        toggleGlassDoor()
      }
    },
    [isBikeShowroomOpen, openBikeShowroom, toggleGlassDoor],
  )

  const handleDoorClick = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation()
      toggleGlassDoor()
      if (activeObject === null) {
        openBikeShowroom()
      }
    },
    [activeObject, openBikeShowroom, toggleGlassDoor],
  )

  const onDoorPointerOver = useCallback((e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    setIsDoorHovered(true)
    document.body.style.cursor = 'pointer'
  }, [])

  const onDoorPointerOut = useCallback((e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    setIsDoorHovered(false)
    document.body.style.cursor = 'auto'
  }, [])

  // Custom shader for warm light-orange sunlight patch on the studio floor coming through the left glass door
  const sunPatchUniforms = useMemo(
    () => ({
      uOpacity: { value: 0.34 },
      uOpenFactor: { value: 0.0 },
      uColor: { value: new THREE.Color('#ffb86c') },
    }),
    [],
  )

  // Custom shader for soft edge-feathered light-orange volumetric sunbeams (zero visible plane borders)
  const sunBeamUniforms1 = useMemo(
    () => ({
      uOpacity: { value: 0.12 },
      uColor: { value: new THREE.Color('#ffbe78') },
    }),
    [],
  )
  const sunBeamUniforms2 = useMemo(
    () => ({
      uOpacity: { value: 0.1 },
      uColor: { value: new THREE.Color('#ffbe78') },
    }),
    [],
  )

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.1)
    const t = state.clock.getElapsedTime()

    // 1. Smoothly slide the movable glass door leaf along Z axis (opens by sliding back 1.32m)
    const targetSlide = isDoorOpen ? 1 : 0
    if (Math.abs(doorSlideRef.current - targetSlide) > 0.0005) {
      doorSlideRef.current = THREE.MathUtils.damp(doorSlideRef.current, targetSlide, 3.8, dt)
      if (slidingLeafGroupRef.current) {
        slidingLeafGroupRef.current.position.z = 0.68 - doorSlideRef.current * 1.32
        slidingLeafGroupRef.current.position.x = -doorSlideRef.current * 0.045
      }
    }

    // 2. Pulse handle indicator
    if (handleGlowRef.current) {
      const pulse = 0.45 + 0.4 * Math.sin(t * 4.0)
      handleGlowRef.current.opacity = isDoorHovered ? 0.95 : pulse
    }

    // 3. Strong Daytime Sunlight streaming through the left glass door into the entire room
    const daySunBase = isNightMode ? 0.08 : 3.25
    const openBoost = isNightMode ? 0.04 : doorSlideRef.current * 1.15
    const targetSunIntensity = daySunBase + openBoost

    if (sunDirLightRef.current) {
      if (Math.abs(sunDirLightRef.current.intensity - targetSunIntensity) > 0.002) {
        sunDirLightRef.current.intensity = THREE.MathUtils.damp(
          sunDirLightRef.current.intensity,
          targetSunIntensity,
          4.0,
          dt,
        )
        sunDirLightRef.current.color.lerp(
          isNightMode ? nightSunColor : daySunColor,
          dt * 4,
        )
      }
    }

    // Warm sunlight bounce fill inside the room from the sunlit floor (daytime only)
    if (sunBounceLightRef.current) {
      const targetBounce = isNightMode ? 0.0 : 1.55 + doorSlideRef.current * 0.6
      if (Math.abs(sunBounceLightRef.current.intensity - targetBounce) > 0.002) {
        sunBounceLightRef.current.intensity = THREE.MathUtils.damp(
          sunBounceLightRef.current.intensity,
          targetBounce,
          4.0,
          dt,
        )
      }
    }

    // Overhead bike spotlight is switched OFF in daytime and ON in night mode
    if (bikeSpotLightRef.current) {
      const targetBikeSpot = isNightMode ? 2.2 : 0.0
      if (Math.abs(bikeSpotLightRef.current.intensity - targetBikeSpot) > 0.002) {
        bikeSpotLightRef.current.intensity = THREE.MathUtils.damp(
          bikeSpotLightRef.current.intensity,
          targetBikeSpot,
          4.0,
          dt,
        )
      }
    }

    // 4. Volumetric sunlight beams & floor patch visibility (daytime only, with feather-soft edges)
    const targetPatchOpacity = isNightMode ? 0.0 : 0.34 + doorSlideRef.current * 0.16
    if (sunFloorPatchMatRef.current) {
      if (Math.abs(sunFloorPatchMatRef.current.uniforms.uOpacity.value - targetPatchOpacity) > 0.001) {
        sunFloorPatchMatRef.current.uniforms.uOpacity.value = THREE.MathUtils.damp(
          sunFloorPatchMatRef.current.uniforms.uOpacity.value,
          targetPatchOpacity,
          4.0,
          dt,
        )
        sunFloorPatchMatRef.current.uniforms.uOpenFactor.value = doorSlideRef.current
      }
    }

    const targetBeamOpacity = isNightMode ? 0.0 : 0.115 + doorSlideRef.current * 0.055
    if (sunBeamMat1Ref.current) {
      if (Math.abs(sunBeamMat1Ref.current.uniforms.uOpacity.value - targetBeamOpacity) > 0.001) {
        sunBeamMat1Ref.current.uniforms.uOpacity.value = THREE.MathUtils.damp(
          sunBeamMat1Ref.current.uniforms.uOpacity.value,
          targetBeamOpacity,
          4.0,
          dt,
        )
      }
    }
    if (sunBeamMat2Ref.current) {
      const targetBeam2 = targetBeamOpacity * 0.85
      if (Math.abs(sunBeamMat2Ref.current.uniforms.uOpacity.value - targetBeam2) > 0.001) {
        sunBeamMat2Ref.current.uniforms.uOpacity.value = THREE.MathUtils.damp(
          sunBeamMat2Ref.current.uniforms.uOpacity.value,
          targetBeam2,
          4.0,
          dt,
        )
      }
    }

    if (skyBackdropMatRef.current) {
      skyBackdropMatRef.current.color.lerp(
        isNightMode ? nightSkyColor : daySkyColor,
        dt * 4,
      )
    }
  })

  // Left Wall X coordinate
  const wallX = -3.1
  // Glass door total opening: Z from -1.25 to +1.55 (width = 2.8m), Y from 0.0 to 2.85m
  const doorCenterZ = 0.15
  const doorOpeningWidth = 2.8
  const doorOpeningHeight = 2.85
  const leafWidth = doorOpeningWidth / 2 + 0.04

  return (
    <group name="LeftGlassDoorAndBike">
      {/* ===================================================================
          1. DAYTIME SUNLIGHT STREAMING THROUGH THE LEFT GLASS DOOR
         =================================================================== */}
      <primitive object={sunTargetObj} />
      <directionalLight
        ref={sunDirLightRef}
        position={[-7.2, 3.6, 0.45]}
        target={sunTargetObj}
        intensity={3.25}
        color="#ffbc75"
        castShadow
        shadow-mapSize={[512, 512]}
        shadow-bias={-0.0005}
        shadow-camera-near={1}
        shadow-camera-far={14}
        shadow-camera-left={-3.5}
        shadow-camera-right={3.5}
        shadow-camera-top={3.2}
        shadow-camera-bottom={-2.0}
      />

      {/* Natural Warm Window Sunlight Bounce Fill Inside the Left/Center Room (Daytime Only) */}
      <pointLight
        ref={sunBounceLightRef}
        position={[-2.1, 1.35, 0.15]}
        intensity={1.55}
        distance={6.5}
        decay={1.6}
        color="#ffb566"
      />

      {/* Sunlit Warm Window Light Projection on Floor (ultra-soft feathered edges so no border is visible) */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[-1.25, 0.006, 0.12]}
        receiveShadow
        raycast={() => null}
      >
        <planeGeometry args={[4.2, 3.4]} />
        <shaderMaterial
          ref={sunFloorPatchMatRef}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          uniforms={sunPatchUniforms}
          vertexShader={`
            varying vec2 vUv;
            void main() {
              vUv = uv;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `}
          fragmentShader={`
            uniform float uOpacity;
            uniform float uOpenFactor;
            uniform vec3 uColor;
            varying vec2 vUv;
            void main() {
              float fadeLeft = smoothstep(0.0, 0.18, vUv.x);
              float fadeRight = pow(smoothstep(1.0, 0.12, vUv.x), 1.8);
              float fadeZ = smoothstep(0.0, 0.28, vUv.y) * smoothstep(1.0, 0.72, vUv.y);
              float centerMullion = smoothstep(0.01, 0.08, abs(vUv.y - 0.5));
              float mullionMask = mix(centerMullion, 1.0, 0.45 + uOpenFactor * 0.45);
              float alpha = fadeLeft * fadeRight * fadeZ * mullionMask * uOpacity;
              gl_FragColor = vec4(uColor, alpha);
            }
          `}
        />
      </mesh>

      {/* Soft Edge-Feathered Volumetric Daytime Sunbeams (zero hard rectangular borders) */}
      <group position={[wallX + 0.12, 1.55, 0.15]} rotation={[0, 0, -0.44]}>
        <mesh position={[1.1, -0.1, -0.35]} raycast={() => null}>
          <planeGeometry args={[3.4, 2.2]} />
          <shaderMaterial
            ref={sunBeamMat1Ref}
            transparent
            depthWrite={false}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
            uniforms={sunBeamUniforms1}
            vertexShader={`
              varying vec2 vUv;
              void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
              }
            `}
            fragmentShader={`
              uniform float uOpacity;
              uniform vec3 uColor;
              varying vec2 vUv;
              void main() {
                float alongBeam = smoothstep(0.0, 0.18, vUv.x) * pow(smoothstep(1.0, 0.05, vUv.x), 1.6);
                float distY = abs(vUv.y - 0.5) * 2.0;
                float acrossBeam = pow(max(0.0, 1.0 - distY * distY), 2.4);
                gl_FragColor = vec4(uColor, alongBeam * acrossBeam * uOpacity);
              }
            `}
          />
        </mesh>
        <mesh position={[1.1, -0.1, 0.35]} rotation={[0.18, 0, 0]} raycast={() => null}>
          <planeGeometry args={[3.4, 2.2]} />
          <shaderMaterial
            ref={sunBeamMat2Ref}
            transparent
            depthWrite={false}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
            uniforms={sunBeamUniforms2}
            vertexShader={`
              varying vec2 vUv;
              void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
              }
            `}
            fragmentShader={`
              uniform float uOpacity;
              uniform vec3 uColor;
              varying vec2 vUv;
              void main() {
                float alongBeam = smoothstep(0.0, 0.18, vUv.x) * pow(smoothstep(1.0, 0.05, vUv.x), 1.6);
                float distY = abs(vUv.y - 0.5) * 2.0;
                float acrossBeam = pow(max(0.0, 1.0 - distY * distY), 2.4);
                gl_FragColor = vec4(uColor, alongBeam * acrossBeam * uOpacity);
              }
            `}
          />
        </mesh>
      </group>

      {/* ===================================================================
          2. LEFT STRAIGHT WALL & FLOOR-TO-CEILING BIG GLASS PATIO DOOR
             Wall sits along X = -3.1, running from Z = -1.45 (Back Wall) to Z = +3.65 (Front Wall)
         =================================================================== */}
      <group position={[wallX, 0, 0]}>
        {/* A. Solid Architectural Wall Sections Framing the Glass Door Opening */}
        {/* Top Header Wall above Glass Door (Y: 2.85 to 4.5, Z: -1.45 to 3.65) */}
        <mesh position={[0, 3.675, 1.1]} receiveShadow raycast={() => null}>
          <boxGeometry args={[0.14, 1.65, 5.15]} />
          <meshStandardMaterial color="#f0eee8" roughness={0.88} metalness={0.02} />
        </mesh>

        {/* Rear Wall Pillar between Back Wall (-1.45) and Glass Door (-1.25) */}
        <mesh position={[0, 1.425, -1.35]} receiveShadow raycast={() => null}>
          <boxGeometry args={[0.14, 2.85, 0.22]} />
          <meshStandardMaterial color="#f0eee8" roughness={0.88} metalness={0.02} />
        </mesh>

        {/* Front Wall Section from Glass Door (+1.55) to Front Entrance Wall (+3.65) */}
        <mesh position={[0, 1.425, 2.6]} receiveShadow raycast={() => null}>
          <boxGeometry args={[0.14, 2.85, 2.1]} />
          <meshStandardMaterial color="#f0eee8" roughness={0.88} metalness={0.02} />
        </mesh>

        {/* Interior Architectural Skirting / Baseboard along Front Left Wall */}
        <mesh position={[0.075, 0.06, 2.6]} receiveShadow raycast={() => null}>
          <boxGeometry args={[0.025, 0.12, 2.1]} />
          <meshStandardMaterial color="#fbf9f3" roughness={0.6} />
        </mesh>

        {/* B. Outdoor Sunlit Terrace & Mountain Scenery Outside the Glass Door (X < -3.1) */}
        <group position={[-0.08, 0, doorCenterZ]}>
          {/* Outdoor Wooden / Stone Sun Deck Terrace Floor */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-0.95, 0.002, 0]} receiveShadow raycast={() => null}>
            <planeGeometry args={[2.0, 4.4]} />
            <meshStandardMaterial color="#c8b496" roughness={0.82} metalness={0.04} />
          </mesh>

          {/* Minimalist Outdoor Glass & Matte Black Balcony Railing */}
          <mesh position={[-1.65, 0.52, 0]} raycast={() => null}>
            <boxGeometry args={[0.02, 1.0, 3.8]} />
            <meshBasicMaterial
              color="#dceef5"
              transparent
              opacity={0.22}
              depthWrite={false}
            />
          </mesh>
          <mesh position={[-1.65, 1.03, 0]} raycast={() => null}>
            <boxGeometry args={[0.04, 0.035, 3.8]} />
            <meshStandardMaterial color="#222320" roughness={0.4} metalness={0.7} />
          </mesh>

          {/* Panoramic Outdoor Mountain-Lake Scenery Backdrop */}
          <Suspense fallback={null}>
            <OutdoorMountainBackdrop skyBackdropMatRef={skyBackdropMatRef} />
          </Suspense>
        </group>

        {/* C. Heavy Anodized Matte Charcoal Aluminum Outer Door Frame */}
        <group position={[0, 0, doorCenterZ]}>
          {/* Top Frame Track */}
          <mesh position={[0, doorOpeningHeight - 0.03, 0]} receiveShadow raycast={() => null}>
            <boxGeometry args={[0.16, 0.06, doorOpeningWidth + 0.08]} />
            <meshStandardMaterial color="#222320" roughness={0.38} metalness={0.65} />
          </mesh>
          {/* Bottom Floor Threshold Track */}
          <mesh position={[0, 0.015, 0]} receiveShadow raycast={() => null}>
            <boxGeometry args={[0.16, 0.03, doorOpeningWidth + 0.08]} />
            <meshStandardMaterial color="#2c2d29" roughness={0.45} metalness={0.7} />
          </mesh>
          {/* Rear Vertical Jamb */}
          <mesh position={[0, doorOpeningHeight / 2, -doorOpeningWidth / 2 - 0.02]} raycast={() => null}>
            <boxGeometry args={[0.16, doorOpeningHeight, 0.06]} />
            <meshStandardMaterial color="#222320" roughness={0.38} metalness={0.65} />
          </mesh>
          {/* Front Vertical Jamb */}
          <mesh position={[0, doorOpeningHeight / 2, doorOpeningWidth / 2 + 0.02]} raycast={() => null}>
            <boxGeometry args={[0.16, doorOpeningHeight, 0.06]} />
            <meshStandardMaterial color="#222320" roughness={0.38} metalness={0.65} />
          </mesh>

          {/* -----------------------------------------------------------------
              PANEL 1: Rear Fixed Floor-to-Ceiling Glass Panel (Z: -0.68)
             ----------------------------------------------------------------- */}
          <group position={[-0.025, doorOpeningHeight / 2, -0.68]}>
            {/* Aluminum Perimeter Stile & Rail */}
            <mesh position={[0, doorOpeningHeight / 2 - 0.045, 0]} raycast={() => null}>
              <boxGeometry args={[0.045, 0.05, leafWidth]} />
              <meshStandardMaterial color="#262724" roughness={0.35} metalness={0.6} />
            </mesh>
            <mesh position={[0, -doorOpeningHeight / 2 + 0.045, 0]} raycast={() => null}>
              <boxGeometry args={[0.045, 0.05, leafWidth]} />
              <meshStandardMaterial color="#262724" roughness={0.35} metalness={0.6} />
            </mesh>
            <mesh position={[0, 0, -leafWidth / 2 + 0.025]} raycast={() => null}>
              <boxGeometry args={[0.045, doorOpeningHeight - 0.08, 0.05]} />
              <meshStandardMaterial color="#262724" roughness={0.35} metalness={0.6} />
            </mesh>
            <mesh position={[0, 0, leafWidth / 2 - 0.025]} raycast={() => null}>
              <boxGeometry args={[0.045, doorOpeningHeight - 0.08, 0.05]} />
              <meshStandardMaterial color="#262724" roughness={0.35} metalness={0.6} />
            </mesh>

            {/* Fixed Tempered Architectural Glass Pane */}
            <mesh rotation={[0, Math.PI / 2, 0]} raycast={() => null}>
              <planeGeometry args={[leafWidth - 0.08, doorOpeningHeight - 0.1]} />
              <meshStandardMaterial
                color="#e8f5f8"
                transparent
                opacity={0.18}
                roughness={0.05}
                metalness={0.1}
                side={THREE.DoubleSide}
                depthWrite={false}
              />
            </mesh>
          </group>

          {/* -----------------------------------------------------------------
              PANEL 2: Interactive Sliding Glass Door Panel (Z: +0.68 when closed)
              Click anywhere on the door or handle to slide Open / Closed!
             ----------------------------------------------------------------- */}
          <group
            ref={slidingLeafGroupRef}
            position={[0.025, doorOpeningHeight / 2, 0.68]}
            onPointerOver={onDoorPointerOver}
            onPointerOut={onDoorPointerOut}
            onClick={handleDoorClick}
          >
            {/* Sliding Door Aluminum Frame Stile & Rail */}
            {/* Top Rail */}
            <mesh position={[0, doorOpeningHeight / 2 - 0.045, 0]} raycast={() => null}>
              <boxGeometry args={[0.05, 0.055, leafWidth]} />
              <meshStandardMaterial
                color={isDoorHovered ? '#353732' : '#262724'}
                roughness={0.32}
                metalness={0.68}
              />
            </mesh>
            {/* Bottom Rail */}
            <mesh position={[0, -doorOpeningHeight / 2 + 0.045, 0]} raycast={() => null}>
              <boxGeometry args={[0.05, 0.055, leafWidth]} />
              <meshStandardMaterial
                color={isDoorHovered ? '#353732' : '#262724'}
                roughness={0.32}
                metalness={0.68}
              />
            </mesh>
            {/* Left (Rear) Vertical Stile */}
            <mesh position={[0, 0, -leafWidth / 2 + 0.028]} raycast={() => null}>
              <boxGeometry args={[0.05, doorOpeningHeight - 0.08, 0.055]} />
              <meshStandardMaterial
                color={isDoorHovered ? '#353732' : '#262724'}
                roughness={0.32}
                metalness={0.68}
              />
            </mesh>
            {/* Right (Front Latch) Vertical Stile */}
            <mesh position={[0, 0, leafWidth / 2 - 0.028]} raycast={() => null}>
              <boxGeometry args={[0.05, doorOpeningHeight - 0.08, 0.055]} />
              <meshStandardMaterial
                color={isDoorHovered ? '#353732' : '#262724'}
                roughness={0.32}
                metalness={0.68}
              />
            </mesh>

            {/* Crystal-Clear Tempered Glass Pane (acts as single hit plane for sliding door) */}
            <mesh rotation={[0, Math.PI / 2, 0]}>
              <planeGeometry args={[leafWidth - 0.09, doorOpeningHeight - 0.1]} />
              <meshStandardMaterial
                color="#eef8fa"
                transparent
                opacity={isDoorHovered ? 0.24 : 0.17}
                roughness={0.05}
                metalness={0.1}
                side={THREE.DoubleSide}
                depthWrite={false}
              />
            </mesh>

            {/* Subtle Diagonal Sun Reflection Glint on the Sliding Glass */}
            <mesh
              position={[0.028, 0.2, 0.1]}
              rotation={[0.45, Math.PI / 2, 0]}
              raycast={() => null}
            >
              <planeGeometry args={[0.07, 1.1]} />
              <meshBasicMaterial
                color="#ffffff"
                transparent
                opacity={0.22}
                depthWrite={false}
              />
            </mesh>

            {/* Modern Brushed Stainless & Electric Yellow Vertical Pull Handle */}
            <group position={[0.042, -0.15, leafWidth / 2 - 0.09]} raycast={() => null}>
              {/* Top & Bottom Standoffs */}
              <mesh position={[0, 0.16, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.008, 0.008, 0.032, 12]} />
                <meshStandardMaterial color="#d4d7db" metalness={0.9} roughness={0.2} />
              </mesh>
              <mesh position={[0, -0.16, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.008, 0.008, 0.032, 12]} />
                <meshStandardMaterial color="#d4d7db" metalness={0.9} roughness={0.2} />
              </mesh>

              {/* Vertical Bar Handle */}
              <RoundedBox
                args={[0.018, 0.42, 0.022]}
                position={[0.018, 0, 0]}
                radius={0.005}
                smoothness={2}
              >
                <meshStandardMaterial color="#e0e3e7" metalness={0.92} roughness={0.18} />
              </RoundedBox>

              {/* Pulsing Electric-Yellow Interactive Accent Strip on Handle */}
              <mesh position={[0.028, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
                <planeGeometry args={[0.012, 0.24]} />
                <meshBasicMaterial
                  ref={handleGlowRef}
                  color="#f5d000"
                  transparent
                  opacity={0.85}
                />
              </mesh>
            </group>
          </group>
        </group>
      </group>

      {/* ===================================================================
          3. 1970 HONDA CB 750 F SUPER SPORT SHOWCASE (Inside Room Left Side)
             Positioned at X = -2.05, Z = -0.15, resting on a custom low-profile
             architectural showroom plinth right beside the sunlit glass door.
         =================================================================== */}
      <group position={[-2.05, 0, -0.15]}>
        {/* Architectural Showroom Floor Plinth / Mat under the Bike */}
        <RoundedBox
          args={[1.35, 0.024, 2.25]}
          position={[0, 0.012, 0]}
          rotation={[0, 0.42, 0]}
          radius={0.008}
          smoothness={2}
          receiveShadow
        >
          <meshStandardMaterial
            color="#262724"
            roughness={0.65}
            metalness={0.2}
          />
        </RoundedBox>

        {/* Soft Baked Contact Shadow Oval directly under the Bike Tires & Engine */}
        <mesh
          rotation={[-Math.PI / 2, 0, 0.42]}
          position={[0, 0.0255, 0]}
          raycast={() => null}
        >
          <planeGeometry args={[0.68, 1.85]} />
          <meshBasicMaterial color="#0b0c0a" transparent opacity={0.45} depthWrite={false} />
        </mesh>

        {/* Subtle Brushed Brass / Warm Gold Inlay Trim around Bike Plinth */}
        <mesh
          rotation={[-Math.PI / 2, 0, 0.42]}
          position={[0, 0.025, 0]}
          receiveShadow
          raycast={() => null}
        >
          <ringGeometry args={[0.58, 0.60, 4]} />
          <meshBasicMaterial color="#f5d000" transparent opacity={0.45} />
        </mesh>

        {/* Overhead Museum Track Spotlight Dedicated to the Bike (OFF in Daytime, ON in Night Mode) */}
        <spotLight
          ref={bikeSpotLightRef}
          position={[0.2, 2.65, 0.2]}
          angle={0.65}
          penumbra={0.85}
          intensity={isNightMode ? 2.2 : 0.0}
          color="#ffd89b"
          distance={4.5}
          decay={2}
        />

        {/* The 1970 Honda CB 750 F Super Sport GLB Model */}
        <Suspense fallback={null}>
          <HondaBikeModel onHover={setIsBikeHovered} onClick={handleBikeClick} />
        </Suspense>

        {/* Interactive Beacon Floating Above the Bike */}
        <InteractiveObjectBeacon
          position={[0, 1.18, 0]}
          isHovered={isBikeHovered || isDoorHovered}
          isOpen={isBikeShowroomOpen}
          isAnyObjectOpen={isAnyObjectOpen}
          distanceFactor={2.8}
        />
      </group>
    </group>
  )
}
