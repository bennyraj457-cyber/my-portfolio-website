import { useMemo, useRef, useState, useCallback, useEffect } from 'react'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { RoundedBox, Html } from '@react-three/drei'
import * as THREE from 'three'
import { useMusicPlayer } from '@/hooks/useMusicPlayer'
import { useWorkspaceFocus } from '@/context/WorkspaceFocusContext'
import { InteractiveObjectBeacon } from './InteractiveObjectBeacon'
import { MusicAtmosphere } from './MusicAtmosphere'

/**
 * Procedural dial display texture renderer matching the reference image's
 * warm amber backlit vintage radio dial with track title, artist, progress and frequency marks.
 * Renders into an existing 2D canvas context to avoid re-allocating textures and GPU uploads.
 */
function renderDialToCanvas(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  trackTitle: string,
  artist: string,
  currentTime: number,
  duration: number,
  isPlaying: boolean,
) {
  // Warm golden amber backlit dial plate background
  const bg = ctx.createLinearGradient(0, 0, 0, height)
  bg.addColorStop(0, '#cda358')
  bg.addColorStop(0.5, '#e4bc6e')
  bg.addColorStop(1, '#ad853b')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, width, height)

  // Inner inset border
  ctx.strokeStyle = '#5a3d16'
  ctx.lineWidth = 4
  ctx.strokeRect(16, 16, width - 32, height - 32)

  // Top FM Frequency scale
  ctx.fillStyle = '#3a250a'
  ctx.font = '600 24px "JetBrains Mono", monospace'
  ctx.textAlign = 'center'
  ctx.fillText('FM  •  87.5   90   92   95   98   101  104  108  MHz', width / 2, 60)

  // AM scale
  ctx.font = '500 20px "JetBrains Mono", monospace'
  ctx.fillText('AM  •  530   600   700   900   1100  1400  1600  kHz', width / 2, 95)

  // Center divider rule
  ctx.strokeStyle = 'rgba(58, 37, 10, 0.4)'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(40, 120)
  ctx.lineTo(width - 40, 120)
  ctx.stroke()

  // Track Display Area
  ctx.font = '700 42px "Space Grotesk", sans-serif'
  ctx.fillStyle = '#241403'
  ctx.fillText(trackTitle.toUpperCase(), width / 2, 175)

  ctx.font = '600 26px "JetBrains Mono", monospace'
  ctx.fillStyle = '#4f320e'
  ctx.fillText(artist, width / 2, 220)

  // Progress Bar
  const barX = 140
  const barY = 270
  const barW = width - 280
  const barH = 12
  const progress = duration > 0 ? currentTime / duration : 0

  // Track bar background
  ctx.fillStyle = 'rgba(58, 37, 10, 0.3)'
  ctx.fillRect(barX, barY, barW, barH)

  // Active progress fill
  ctx.fillStyle = '#241403'
  ctx.fillRect(barX, barY, barW * progress, barH)

  // Red needle indicator (classic analog radio dial needle)
  const needleX = barX + barW * progress
  ctx.fillStyle = '#d32f2f'
  ctx.fillRect(needleX - 2, 38, 4, 255)

  // Time stamps
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60)
    const s = Math.floor(secs % 60)
    return `${m}:${s < 10 ? '0' : ''}${s}`
  }
  ctx.font = '600 22px "JetBrains Mono", monospace'
  ctx.fillStyle = '#3a250a'
  ctx.textAlign = 'left'
  ctx.fillText(formatTime(currentTime), barX, 320)
  ctx.textAlign = 'right'
  ctx.fillText(formatTime(duration), barX + barW, 320)

  // Status indicator
  ctx.textAlign = 'center'
  ctx.fillStyle = isPlaying ? '#2e7d32' : '#757575'
  ctx.fillText(isPlaying ? '● PLAYING [HI-FI]' : '○ PAUSED', width / 2, 320)

  // Lower selector modes
  ctx.font = '500 18px "JetBrains Mono", monospace'
  ctx.fillStyle = '#4f320e'
  ctx.fillText('AUX  •  BT  •  TF  •  MP3  •  FM  •  AM  •  SW', width / 2, 375)
}

export function MusicPlayer({
  position = [0.62, 0.759, -0.12],
  rotation = [0, -0.35, 0],
}: {
  position?: [number, number, number]
  rotation?: [number, number, number]
}) {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    togglePlay,
    nextTrack,
    prevTrack,
    seekTo,
    setVolume,
  } = useMusicPlayer()

  const { isMusicPlayerOpen, isAnyObjectOpen, openMusicPlayer } = useWorkspaceFocus()

  const [isPlayerHovered, setIsPlayerHovered] = useState(false)
  const [isNearPlayer, setIsNearPlayer] = useState(false)
  const [hoveredControl, setHoveredControl] = useState<string | null>(null)
  const [pressedControl, setPressedControl] = useState<string | null>(null)

  const groupRef = useRef<THREE.Group>(null)
  const vinylRef = useRef<THREE.Group>(null)
  const needleRef = useRef<THREE.Group>(null)
  const volumeKnobRef = useRef<THREE.Group>(null)
  const tuningKnobRef = useRef<THREE.Group>(null)
  const hoverOutlineMaterialRef = useRef<THREE.MeshBasicMaterial>(null)
  const hoverRingMaterialRef = useRef<THREE.MeshBasicMaterial>(null)
  const dialMaterialRef = useRef<THREE.MeshStandardMaterial>(null)

  const hoverProgressRef = useRef(0)

  // Persistent reusable canvas and texture to avoid memory leaks and GPU upload stutter
  const dialResources = useMemo(() => {
    const width = 1024
    const height = 420
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    const texture = new THREE.CanvasTexture(canvas)
    texture.anisotropy = 4

    if (ctx) {
      renderDialToCanvas(
        ctx,
        width,
        height,
        currentTrack.title,
        currentTrack.artist,
        currentTime,
        duration,
        isPlaying,
      )
      texture.needsUpdate = true
    }

    return { canvas, ctx, texture, width, height }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Update existing texture contents instead of creating new CanvasTextures
  const lastDialUpdateRef = useRef<number>(0)
  const dialTexture = dialResources.texture

  // Throttled redraw of dial display when track/time/state updates
  const redrawDial = useCallback(() => {
    if (!dialResources.ctx) return
    renderDialToCanvas(
      dialResources.ctx,
      dialResources.width,
      dialResources.height,
      currentTrack.title,
      currentTrack.artist,
      currentTime,
      duration,
      isPlaying,
    )
    dialResources.texture.needsUpdate = true
  }, [currentTrack.title, currentTrack.artist, currentTime, duration, isPlaying, dialResources])

  // Redraw when track or play state changes
  useEffect(() => {
    redrawDial()
  }, [currentTrack.title, currentTrack.artist, isPlaying, redrawDial])

  // Spin the vinyl record when playing, and pivot tonearm
  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.1)

    // Check camera distance to music player (position: [0.62, 0.759, -0.12])
    const camPos = state.camera.position
    const dx = camPos.x - 0.62
    const dy = camPos.y - 0.759
    const dz = camPos.z - (-0.12)
    const distSq = dx * dx + dy * dy + dz * dz
    // Camera is near when distance is within ~1.75 meters (e.g. focused view or camera panning nearby)
    const near = distSq < 3.06
    if (near !== isNearPlayer) {
      setIsNearPlayer(near)
    }

    // Update dial progress at ~4 FPS during playback (avoids 60fps canvas rasterization)
    if (isPlaying) {
      const now = performance.now()
      if (now - lastDialUpdateRef.current > 250) {
        lastDialUpdateRef.current = now
        redrawDial()
      }
    }

    // Smooth hover elevation and electric-yellow outline
    const hoverTarget = isPlayerHovered && !isMusicPlayerOpen ? 1 : 0
    const factor = 1 - Math.exp(-12 * dt)
    hoverProgressRef.current += (hoverTarget - hoverProgressRef.current) * factor
    const hp = hoverProgressRef.current

    if (groupRef.current) {
      // Subtle physical lift on hover
      groupRef.current.position.y = position[1] + hp * 0.003
    }

    if (hoverOutlineMaterialRef.current) {
      // Glows only on hover (always-blinking idle pulse removed)
      hoverOutlineMaterialRef.current.opacity = hp * 0.75
    }

    if (hoverRingMaterialRef.current) {
      hoverRingMaterialRef.current.opacity = hp * 0.65
    }

    if (dialMaterialRef.current) {
      dialMaterialRef.current.emissiveIntensity = isPlaying
        ? 0.45 + hp * 0.25
        : 0.18 + hp * 0.2
    }

    // Vinyl spinning
    if (isPlaying && vinylRef.current) {
      vinylRef.current.rotation.y -= delta * 3.2
    }

    // Tonearm motion
    if (needleRef.current) {
      const targetAngle = isPlaying ? -0.38 : -0.05
      needleRef.current.rotation.y = THREE.MathUtils.lerp(
        needleRef.current.rotation.y,
        targetAngle,
        0.1,
      )
    }

    // Rotate volume knob proportional to volume
    if (volumeKnobRef.current) {
      volumeKnobRef.current.rotation.z = (volume - 0.5) * 2.8
    }
  })

  const preventCamera = (e: ThreeEvent<MouseEvent | PointerEvent>) => {
    e.stopPropagation()
  }

  const handlePlayerClick = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation()
      if (!isMusicPlayerOpen) {
        setIsPlayerHovered(false)
        document.body.style.cursor = 'auto'
        openMusicPlayer()
      }
    },
    [isMusicPlayerOpen, openMusicPlayer],
  )

  const press = (id: string, action: () => void) => {
    setPressedControl(id)
    action()
    setTimeout(() => {
      setPressedControl(null)
    }, 150)
  }

  // Dial seek interaction: maps UV X click on the dial to track duration
  const handleDialClick = (e: ThreeEvent<MouseEvent>) => {
    preventCamera(e)
    if (!isMusicPlayerOpen) {
      openMusicPlayer()
      return
    }
    if (e.uv && duration > 0) {
      // The dial progress bar spans roughly x = 0.137 to 0.863 in UV coordinates
      const uvX = THREE.MathUtils.clamp(e.uv.x, 0.14, 0.86)
      const seekProgress = (uvX - 0.14) / (0.86 - 0.14)
      seekTo(seekProgress * duration)
    }
  }

  return (
    <group
      ref={groupRef}
      name="InteractiveObject_MusicPlayer"
      userData={{
        interactiveId: 'music-player',
        section: 'music',
        label: 'VINTAGE GRAMOPHONE & RADIO',
      }}
      position={position}
      rotation={rotation}
      scale={0.9}
      onPointerOver={(e) => {
        preventCamera(e)
        if (!isMusicPlayerOpen) {
          setIsPlayerHovered(true)
          document.body.style.cursor = 'pointer'
        }
      }}
      onPointerOut={(e) => {
        preventCamera(e)
        setIsPlayerHovered(false)
        document.body.style.cursor = 'auto'
      }}
      onClick={handlePlayerClick}
    >
      {/* Desk Surface Contact Halo */}
      <mesh position={[0, 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.13, 0.15, 36]} />
        <meshBasicMaterial
          ref={hoverRingMaterialRef}
          color="#f5d000"
          transparent
          opacity={0}
          depthWrite={false}
        />
      </mesh>

      {/* Floating Interactive Beacon Indicator */}
      <InteractiveObjectBeacon
        position={[0, 0.22, 0]}
        isHovered={isPlayerHovered}
        isOpen={isMusicPlayerOpen}
        isAnyObjectOpen={isAnyObjectOpen}
        distanceFactor={2.2}
      />

      {/* Subtle Electric-Yellow Hover Outline Shell */}
      <RoundedBox
        args={[0.274, 0.18, 0.204]}
        position={[0, 0.095, 0]}
        radius={0.035}
        smoothness={3}
      >
        <meshBasicMaterial
          ref={hoverOutlineMaterialRef}
          color="#f5d000"
          transparent
          opacity={0}
          depthWrite={false}
        />
      </RoundedBox>

      {/* 4 Little Brass Cabinet Feet */}
      {[
        [-0.105, 0.008, 0.07],
        [0.105, 0.008, 0.07],
        [-0.105, 0.008, -0.07],
        [0.105, 0.008, -0.07],
      ].map(([fx, fy, fz], idx) => (
        <mesh key={idx} position={[fx, fy, fz]} castShadow>
          <cylinderGeometry args={[0.012, 0.009, 0.016, 16]} />
          <meshStandardMaterial color="#c5984b" roughness={0.3} metalness={0.8} />
        </mesh>
      ))}

      {/* Main Curved Wood Enclosure (Dark Walnut finish) */}
      <RoundedBox
        args={[0.26, 0.165, 0.19]}
        position={[0, 0.095, 0]}
        radius={0.03}
        smoothness={4}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          color="#2e1a0f"
          roughness={0.45}
          metalness={0.08}
        />
      </RoundedBox>

      {/* Recessed Copper / Rose Gold Front Face Frame */}
      <RoundedBox
        args={[0.236, 0.144, 0.02]}
        position={[0, 0.095, 0.088]}
        radius={0.022}
        smoothness={4}
        castShadow
      >
        <meshStandardMaterial
          color="#b86940"
          roughness={0.32}
          metalness={0.78}
        />
      </RoundedBox>

      {/* Inner Black Front Grille Inset */}
      <RoundedBox
        args={[0.22, 0.13, 0.015]}
        position={[0, 0.095, 0.095]}
        radius={0.016}
        smoothness={3}
      >
        <meshStandardMaterial color="#141414" roughness={0.75} />
      </RoundedBox>

      {/* ========================================================= */}
      {/* 1. SPEAKER GRILLE & CROWN SHIELD LOGO (Upper Front)       */}
      {/* ========================================================= */}
      <group position={[0, 0.125, 0.102]}>
        {/* Vertical Speaker Louvers */}
        {[-0.085, -0.07, -0.055, -0.04, -0.025, 0.025, 0.04, 0.055, 0.07, 0.085].map(
          (lx, idx) => (
            <mesh key={idx} position={[lx, 0, 0]} castShadow>
              <boxGeometry args={[0.006, 0.055, 0.004]} />
              <meshStandardMaterial
                color="#b86940"
                roughness={0.35}
                metalness={0.75}
              />
            </mesh>
          ),
        )}

        {/* Center Vintage Shield with Crown "MUSIC" Emblem */}
        <group position={[0, 0.005, 0.003]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.018, 0.014, 0.004, 6]} />
            <meshStandardMaterial
              color="#0d0d0d"
              roughness={0.3}
              metalness={0.6}
            />
          </mesh>
          {/* Gold Crown Emblem Border */}
          <mesh position={[0, 0, 0.003]}>
            <ringGeometry args={[0.012, 0.015, 6]} />
            <meshStandardMaterial
              color="#d4af37"
              roughness={0.25}
              metalness={0.88}
            />
          </mesh>
        </group>
      </group>

      {/* ========================================================= */}
      {/* 2. BACKLIT ANALOG RADIO DIAL DISPLAY (Lower Front)        */}
      {/* ========================================================= */}
      <mesh
        position={[0, 0.062, 0.103]}
        receiveShadow
        onClick={handleDialClick}
        onPointerOver={(e) => {
          preventCamera(e)
          if (isMusicPlayerOpen) document.body.style.cursor = 'pointer'
        }}
        onPointerOut={() => {
          if (isMusicPlayerOpen) document.body.style.cursor = 'auto'
        }}
      >
        <planeGeometry args={[0.18, 0.048]} />
        <meshStandardMaterial
          ref={dialMaterialRef}
          map={dialTexture}
          emissive="#ffd580"
          emissiveIntensity={isPlaying ? 0.35 : 0.15}
          roughness={0.25}
        />
      </mesh>

      {/* ========================================================= */}
      {/* 3. PHYSICAL CONTROLS (Knobs, Buttons, Switch)             */}
      {/* ========================================================= */}
      {/* Left Volume Knob (Interactive: cycles volume) */}
      <group
        ref={volumeKnobRef}
        position={[-0.076, 0.052, 0.106]}
        onPointerOver={(e) => {
          preventCamera(e)
          setHoveredControl('volume')
          document.body.style.cursor = 'pointer'
        }}
        onPointerOut={() => {
          setHoveredControl(null)
          document.body.style.cursor = 'auto'
        }}
        onClick={(e) => {
          preventCamera(e)
          if (!isMusicPlayerOpen) {
            openMusicPlayer()
            return
          }
          const nextVol = volume >= 0.9 ? 0.3 : volume >= 0.6 ? 1.0 : 0.7
          setVolume(nextVol)
        }}
      >
        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.014, 0.014, 0.012, 24]} />
          <meshStandardMaterial
            color={hoveredControl === 'volume' ? '#f5d000' : '#c5984b'}
            roughness={0.25}
            metalness={0.85}
          />
        </mesh>
        {/* Knurled Outer Ring */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.016, 0.016, 0.003, 24]} />
          <meshStandardMaterial color="#8c6827" roughness={0.4} metalness={0.9} />
        </mesh>
      </group>

      {/* Right Tuning / Track Select Knob (Interactive: skips to next track) */}
      <group
        ref={tuningKnobRef}
        position={[0.076, 0.052, 0.106]}
        onPointerOver={(e) => {
          preventCamera(e)
          setHoveredControl('tuning')
          document.body.style.cursor = 'pointer'
        }}
        onPointerOut={() => {
          setHoveredControl(null)
          document.body.style.cursor = 'auto'
        }}
        onClick={(e) => {
          preventCamera(e)
          if (!isMusicPlayerOpen) {
            openMusicPlayer()
            return
          }
          if (tuningKnobRef.current) {
            tuningKnobRef.current.rotation.z += 0.8
          }
          nextTrack()
        }}
      >
        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.014, 0.014, 0.012, 24]} />
          <meshStandardMaterial
            color={hoveredControl === 'tuning' ? '#f5d000' : '#c5984b'}
            roughness={0.25}
            metalness={0.85}
          />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.016, 0.016, 0.003, 24]} />
          <meshStandardMaterial color="#8c6827" roughness={0.4} metalness={0.9} />
        </mesh>
      </group>

      {/* 4 Bottom Push Buttons (Prev, Play/Pause, Next, Mode) */}
      {/* Button 1: Previous Track */}
      <mesh
        position={[
          -0.038,
          0.036,
          pressedControl === 'prev' ? 0.103 : 0.105,
        ]}
        rotation={[Math.PI / 2, 0, 0]}
        castShadow
        onPointerOver={(e) => {
          preventCamera(e)
          setHoveredControl('prev')
          document.body.style.cursor = 'pointer'
        }}
        onPointerOut={() => {
          setHoveredControl(null)
          document.body.style.cursor = 'auto'
        }}
        onClick={(e) => {
          preventCamera(e)
          if (!isMusicPlayerOpen) {
            openMusicPlayer()
            return
          }
          press('prev', prevTrack)
        }}
      >
        <cylinderGeometry args={[0.005, 0.005, 0.008, 16]} />
        <meshStandardMaterial
          color={hoveredControl === 'prev' ? '#f5d000' : '#c5984b'}
          roughness={0.3}
          metalness={0.8}
        />
      </mesh>

      {/* Button 2: Play / Pause */}
      <mesh
        position={[
          -0.018,
          0.036,
          pressedControl === 'play' ? 0.103 : 0.105,
        ]}
        rotation={[Math.PI / 2, 0, 0]}
        castShadow
        onPointerOver={(e) => {
          preventCamera(e)
          setHoveredControl('play')
          document.body.style.cursor = 'pointer'
        }}
        onPointerOut={() => {
          setHoveredControl(null)
          document.body.style.cursor = 'auto'
        }}
        onClick={(e) => {
          preventCamera(e)
          if (!isMusicPlayerOpen) {
            openMusicPlayer()
            return
          }
          press('play', togglePlay)
        }}
      >
        <cylinderGeometry args={[0.005, 0.005, 0.008, 16]} />
        <meshStandardMaterial
          color={
            hoveredControl === 'play'
              ? '#f5d000'
              : isPlaying
                ? '#e5a83b'
                : '#c5984b'
          }
          roughness={0.3}
          metalness={0.8}
        />
      </mesh>

      {/* Button 3: Next Track */}
      <mesh
        position={[
          0.002,
          0.036,
          pressedControl === 'next' ? 0.103 : 0.105,
        ]}
        rotation={[Math.PI / 2, 0, 0]}
        castShadow
        onPointerOver={(e) => {
          preventCamera(e)
          setHoveredControl('next')
          document.body.style.cursor = 'pointer'
        }}
        onPointerOut={() => {
          setHoveredControl(null)
          document.body.style.cursor = 'auto'
        }}
        onClick={(e) => {
          preventCamera(e)
          if (!isMusicPlayerOpen) {
            openMusicPlayer()
            return
          }
          press('next', nextTrack)
        }}
      >
        <cylinderGeometry args={[0.005, 0.005, 0.008, 16]} />
        <meshStandardMaterial
          color={hoveredControl === 'next' ? '#f5d000' : '#c5984b'}
          roughness={0.3}
          metalness={0.8}
        />
      </mesh>

      {/* Button 4: Mode Switch */}
      <mesh
        position={[
          0.022,
          0.036,
          pressedControl === 'mode' ? 0.103 : 0.105,
        ]}
        rotation={[Math.PI / 2, 0, 0]}
        castShadow
        onPointerOver={(e) => {
          preventCamera(e)
          setHoveredControl('mode')
          document.body.style.cursor = 'pointer'
        }}
        onPointerOut={() => {
          setHoveredControl(null)
          document.body.style.cursor = 'auto'
        }}
        onClick={(e) => {
          preventCamera(e)
          if (!isMusicPlayerOpen) {
            openMusicPlayer()
            return
          }
          press('mode', togglePlay)
        }}
      >
        <cylinderGeometry args={[0.005, 0.005, 0.008, 16]} />
        <meshStandardMaterial
          color={hoveredControl === 'mode' ? '#f5d000' : '#c5984b'}
          roughness={0.3}
          metalness={0.8}
        />
      </mesh>

      {/* Slider / Toggle Switch (Right of buttons) */}
      <group position={[0.042, 0.036, 0.104]}>
        <mesh>
          <boxGeometry args={[0.016, 0.006, 0.004]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.7} />
        </mesh>
        <mesh position={[0.004, 0, 0.003]}>
          <cylinderGeometry args={[0.003, 0.003, 0.008, 12]} />
          <meshStandardMaterial color="#c5984b" roughness={0.3} metalness={0.8} />
        </mesh>
      </group>

      {/* ========================================================= */}
      {/* 4. TOP TURNTABLE & VINYL RECORD                           */}
      {/* ========================================================= */}
      <group position={[0.015, 0.18, 0.01]}>
        {/* Turntable Platter Base */}
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.068, 0.07, 0.005, 32]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.6} metalness={0.3} />
        </mesh>

        {/* Rotating Vinyl Record */}
        <group
          ref={vinylRef}
          position={[0, 0.0035, 0]}
          onPointerOver={(e) => {
            preventCamera(e)
            document.body.style.cursor = 'pointer'
          }}
          onPointerOut={() => {
            document.body.style.cursor = 'auto'
          }}
          onClick={(e) => {
            preventCamera(e)
            if (!isMusicPlayerOpen) {
              openMusicPlayer()
              return
            }
            togglePlay()
          }}
        >
          {/* Vinyl Grooved Disc */}
          <mesh castShadow receiveShadow>
            <cylinderGeometry args={[0.064, 0.064, 0.002, 36]} />
            <meshStandardMaterial
              color="#0d0d0d"
              roughness={0.2}
              metalness={0.65}
            />
          </mesh>
          {/* Center Red Vinyl Label */}
          <mesh position={[0, 0.0012, 0]}>
            <cylinderGeometry args={[0.024, 0.024, 0.001, 24]} />
            <meshStandardMaterial color="#991b1b" roughness={0.4} />
          </mesh>
          {/* Center Spindle Peg */}
          <mesh position={[0, 0.004, 0]}>
            <cylinderGeometry args={[0.003, 0.003, 0.008, 16]} />
            <meshStandardMaterial color="#c5984b" roughness={0.2} metalness={0.9} />
          </mesh>
        </group>

        {/* Gold Tonearm Pivot & Arm */}
        <group
          ref={needleRef}
          position={[0.075, 0.01, 0.025]}
          rotation={[0, isPlaying ? -0.38 : -0.05, 0]}
        >
          {/* Tonearm Base Turret */}
          <mesh position={[0, 0.004, 0]} castShadow>
            <cylinderGeometry args={[0.008, 0.01, 0.012, 16]} />
            <meshStandardMaterial color="#c5984b" roughness={0.25} metalness={0.85} />
          </mesh>
          {/* L-Shaped Golden Tonearm */}
          <mesh position={[-0.038, 0.008, -0.008]} rotation={[0, 0.15, 0]}>
            <boxGeometry args={[0.072, 0.0035, 0.0035]} />
            <meshStandardMaterial color="#c5984b" roughness={0.25} metalness={0.85} />
          </mesh>
          {/* Cartridge Head / Needle */}
          <mesh position={[-0.076, 0.004, -0.015]} castShadow>
            <boxGeometry args={[0.012, 0.006, 0.008]} />
            <meshStandardMaterial color="#262626" roughness={0.3} metalness={0.5} />
          </mesh>
        </group>
      </group>

      {/* ========================================================= */}
      {/* 5. FLOATING SYNCED LYRICS & MUSIC NOTE PARTICLES          */}
      {/* ========================================================= */}
      <MusicAtmosphere
        isPlaying={isPlaying}
        currentTime={currentTime}
        trackTitle={currentTrack.title}
        artist={currentTrack.artist}
        isMusicPlayerOpen={isMusicPlayerOpen}
      />

      {/* ========================================================= */}
      {/* 6. FLOATING MINI MUSIC CONTROLS (Floating in Air)         */}
      {/* ========================================================= */}
      {(isMusicPlayerOpen || isNearPlayer || isPlayerHovered) && (
        <Html
          position={[0.015, 0.235, 0.04]}
          center
          distanceFactor={isMusicPlayerOpen ? 0.72 : 1.15}
          zIndexRange={[50, 0]}
        >
          <div
            className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 rounded-full bg-[#24170f]/90 backdrop-blur-md border border-[#c5984b]/40 shadow-[0_4px_16px_rgba(20,10,5,0.45)] select-none pointer-events-auto transition-all duration-200 hover:border-[#f5d000] hover:scale-105 touch-manipulation"
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
          >
            {/* Ambient Gold Status Dot */}
            <span
              className={`w-1 h-1 rounded-full ${
                isPlaying ? 'bg-[#f5d000] animate-pulse shadow-[0_0_5px_#f5d000]' : 'bg-[#c5984b]/50'
              }`}
            />

            {/* Previous Track */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                prevTrack()
              }}
              className="w-4 h-4 sm:w-4.5 sm:h-4.5 flex items-center justify-center rounded-full bg-black/20 hover:bg-[#c5984b]/30 active:scale-90 text-[#fbf9f3] transition-all hover:text-[#f5d000] touch-manipulation"
              title="Previous Track"
            >
              <svg width="6" height="6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
              </svg>
            </button>

            {/* Play / Pause Primary Button (Antique Gold & Black Accent) */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                togglePlay()
              }}
              className="w-5 h-5 sm:w-5.5 sm:h-5.5 flex items-center justify-center rounded-full bg-[#f5d000] hover:bg-[#ffe043] active:scale-85 text-[#1a120b] shadow-sm transition-all touch-manipulation"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <svg width="7" height="7" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                </svg>
              ) : (
                <svg width="7" height="7" viewBox="0 0 24 24" fill="currentColor" className="translate-x-0.5">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>

            {/* Next Track */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                nextTrack()
              }}
              className="w-4 h-4 sm:w-4.5 sm:h-4.5 flex items-center justify-center rounded-full bg-black/20 hover:bg-[#c5984b]/30 active:scale-90 text-[#fbf9f3] transition-all hover:text-[#f5d000] touch-manipulation"
              title="Next Track"
            >
              <svg width="6" height="6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
              </svg>
            </button>

            {/* Volume Cycle Toggle */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                const nextVol = volume >= 0.9 ? 0.3 : volume >= 0.6 ? 1.0 : 0.7
                setVolume(nextVol)
              }}
              className="px-1 h-3.5 sm:h-4 flex items-center justify-center rounded-full bg-black/20 hover:bg-[#c5984b]/30 active:scale-90 text-[#d5c2a1] hover:text-[#f5d000] text-[7px] sm:text-[8px] font-mono transition-all touch-manipulation"
              title={`Volume: ${Math.round(volume * 100)}%`}
            >
              {Math.round(volume * 100)}%
            </button>
          </div>
        </Html>
      )}
    </group>
  )
}
