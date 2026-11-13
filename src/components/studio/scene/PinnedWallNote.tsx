import { useMemo, useState, useCallback, useRef, useEffect } from 'react'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'
import { useWorkspaceFocus } from '@/context/WorkspaceFocusContext'
import { InteractiveObjectBeacon } from './InteractiveObjectBeacon'

/**
 * Creates sharp paper texture for a realistic architectural pinned memo note.
 */
function createPinnedNoteTexture(): THREE.CanvasTexture {
  const width = 1024
  const height = 1024
  const scale = 0.5 // 512x512 physical texture (4x fewer pixels)
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(width * scale)
  canvas.height = Math.round(height * scale)
  const ctx = canvas.getContext('2d')!
  ctx.scale(scale, scale)

  // 1. Warm cream stationery paper background (#faf7eb)
  ctx.fillStyle = '#faf7eb'
  ctx.fillRect(0, 0, width, height)

  // 2. Paper edge gradient & subtle vignette
  const edgeGrad = ctx.createLinearGradient(0, 0, width, height)
  edgeGrad.addColorStop(0, 'rgba(238, 230, 210, 0.55)')
  edgeGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0)')
  edgeGrad.addColorStop(1, 'rgba(220, 205, 180, 0.65)')
  ctx.fillStyle = edgeGrad
  ctx.fillRect(0, 0, width, height)

  // 3. Realistic paper fibers
  ctx.fillStyle = 'rgba(60, 48, 25, 0.035)'
  for (let i = 0; i < 150; i++) {
    const rx = Math.random() * width
    const ry = Math.random() * height
    ctx.fillRect(rx, ry, Math.random() * 5 + 1, 1.5)
  }

  // 4. Double architectural borders
  ctx.strokeStyle = '#d5c7a5'
  ctx.lineWidth = 4
  ctx.strokeRect(36, 36, width - 72, height - 72)

  ctx.strokeStyle = '#ebe0c8'
  ctx.lineWidth = 2
  ctx.strokeRect(48, 48, width - 96, height - 96)

  // 5. Caution / Hazard diagonal warning stripes across the top
  const stripeW = 28
  ctx.save()
  ctx.beginPath()
  ctx.rect(58, 62, width - 116, 42)
  ctx.clip()
  for (let x = -40; x < width + 80; x += stripeW * 2) {
    ctx.fillStyle = '#f5d000'
    ctx.beginPath()
    ctx.moveTo(x, 62)
    ctx.lineTo(x + stripeW, 62)
    ctx.lineTo(x + stripeW - 24, 104)
    ctx.lineTo(x - 24, 104)
    ctx.fill()

    ctx.fillStyle = '#181917'
    ctx.beginPath()
    ctx.moveTo(x + stripeW, 62)
    ctx.lineTo(x + stripeW * 2, 62)
    ctx.lineTo(x + stripeW * 2 - 24, 104)
    ctx.lineTo(x - 24, 104)
    ctx.fill()
  }
  ctx.restore()

  // 6. Header Badge: • NOTICE •
  ctx.fillStyle = '#e44d26'
  const badgeW = 340
  const badgeH = 50
  const badgeX = (width - badgeW) / 2
  const badgeY = 142
  ctx.beginPath()
  ctx.roundRect ? ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 8) : ctx.rect(badgeX, badgeY, badgeW, badgeH)
  ctx.fill()

  ctx.fillStyle = '#ffffff'
  ctx.font = '800 23px "JetBrains Mono", monospace'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('• NOTICE // IN PROGRESS •', width / 2, badgeY + badgeH / 2 + 1)

  // 7. High-Contrast Main Headline: ROOM UNDER CONSTRUCTION
  ctx.fillStyle = '#111111'
  ctx.font = '900 66px "Space Grotesk", sans-serif'
  ctx.fillText('ROOM UNDER', width / 2, 290)
  ctx.fillText('CONSTRUCTION', width / 2, 368)

  // 8. Geometric Accent Divider Line with Dot
  ctx.strokeStyle = '#f5d000'
  ctx.lineWidth = 6
  ctx.beginPath()
  ctx.moveTo(width / 2 - 120, 442)
  ctx.lineTo(width / 2 + 120, 442)
  ctx.stroke()

  ctx.fillStyle = '#181917'
  ctx.beginPath()
  ctx.arc(width / 2, 442, 9, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = '#f5d000'
  ctx.beginPath()
  ctx.arc(width / 2, 442, 5, 0, Math.PI * 2)
  ctx.fill()

  // 9. Secondary High-Contrast Message
  ctx.fillStyle = '#181917'
  ctx.font = '800 36px "JetBrains Mono", monospace'
  ctx.fillText('STAY TUNED.', width / 2, 550)

  ctx.fillStyle = '#3a3832'
  ctx.font = '700 32px "Space Grotesk", sans-serif'
  ctx.fillText('SOMETHING EXCITING IS', width / 2, 630)
  ctx.fillText('TAKING SHAPE.', width / 2, 680)

  // 10. Archival Footer Divider and Metadata
  ctx.strokeStyle = '#dcd2bd'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(76, 800)
  ctx.lineTo(width - 76, 800)
  ctx.stroke()

  ctx.fillStyle = '#7a705c'
  ctx.font = '700 23px "JetBrains Mono", monospace'
  ctx.fillText('WORKSPACE EXPANSION PHASE', width / 2, 856)

  ctx.font = '600 19px "JetBrains Mono", monospace'
  ctx.fillStyle = '#9e937d'
  ctx.fillText('BUILD 2026 • WORK IN PROGRESS', width / 2, 896)

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.minFilter = THREE.LinearFilter
  texture.magFilter = THREE.LinearFilter
  texture.generateMipmaps = false
  texture.anisotropy = 4
  texture.needsUpdate = true
  return texture
}

export interface PinnedWallNoteProps {
  /** World position of the note on the wall */
  position?: [number, number, number]
  /** Rotation of the note */
  rotation?: [number, number, number]
}

export function PinnedWallNote({
  position = [0.78, 1.84, -1.37],
  rotation = [0, 0, 0.045],
}: PinnedWallNoteProps) {
  const { activeObject, isWallNoteOpen, isAnyObjectOpen, openWallNote } = useWorkspaceFocus()
  const [isHovered, setIsHovered] = useState(false)
  const hoverAnimRef = useRef(0)
  const highlightMatRef = useRef<THREE.MeshBasicMaterial>(null)

  const noteTexture = useMemo(() => createPinnedNoteTexture(), [])

  const noteW = 0.25
  const noteH = 0.25

  useEffect(() => {
    return () => {
      document.body.style.cursor = 'auto'
    }
  }, [])

  const handlePointerOver = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation()
      if (activeObject === null) {
        setIsHovered(true)
        document.body.style.cursor = 'pointer'
      }
    },
    [activeObject],
  )

  const handlePointerOut = useCallback((e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    setIsHovered(false)
    document.body.style.cursor = 'auto'
  }, [])

  const handleClick = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation()
      if (!isWallNoteOpen) {
        openWallNote()
        document.body.style.cursor = 'auto'
      }
    },
    [isWallNoteOpen, openWallNote],
  )

  useFrame((_, delta) => {
    const target = isHovered && !isWallNoteOpen ? 1 : 0
    if (Math.abs(hoverAnimRef.current - target) < 0.001) return
    const dt = Math.min(delta, 0.1)
    hoverAnimRef.current += (target - hoverAnimRef.current) * (1 - Math.exp(-12 * dt))
    if (highlightMatRef.current) {
      highlightMatRef.current.opacity = hoverAnimRef.current * 0.75
    }
  })

  return (
    <group
      name="PinnedWallNote"
      position={position}
      rotation={rotation}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onClick={handleClick}
    >
      {/* 1. Soft Contact Drop Shadow on the wall behind the paper */}
      <mesh position={[0.006, -0.007, -0.002]} raycast={() => null}>
        <planeGeometry args={[noteW + 0.018, noteH + 0.018]} />
        <meshBasicMaterial color="#141311" transparent opacity={0.32} />
      </mesh>

      {/* 2. Paper Backing Cardstock for physical 3D depth */}
      <mesh position={[0, 0, -0.0005]} receiveShadow raycast={() => null}>
        <boxGeometry args={[noteW, noteH, 0.001]} />
        <meshStandardMaterial color="#f0ece0" roughness={0.9} metalness={0.05} />
      </mesh>

      {/* 3. Dedicated Front Printed Note Face (Single hit target for note) */}
      <mesh position={[0, 0, 0.0006]}>
        <planeGeometry args={[noteW, noteH]} />
        <meshBasicMaterial
          map={noteTexture}
          toneMapped={false}
          side={THREE.FrontSide}
        />
      </mesh>

      {/* 4. Electric-Yellow Hover Outline Ring */}
      <mesh position={[0, 0, 0.001]} raycast={() => null}>
        <planeGeometry args={[noteW + 0.008, noteH + 0.008]} />
        <meshBasicMaterial
          ref={highlightMatRef}
          color="#f5d000"
          transparent
          opacity={0}
          wireframe
        />
      </mesh>

      {/* 5. Slightly Lifted Bottom Right Corner */}
      <mesh position={[noteW * 0.4, -noteH * 0.4, 0.002]} rotation={[-0.05, 0.08, -0.03]} raycast={() => null}>
        <planeGeometry args={[0.048, 0.048]} />
        <meshBasicMaterial
          color="#f4eee0"
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* 6. Realistic Push Pin at Top Center */}
      <group position={[0, noteH * 0.44, 0.003]} rotation={[Math.PI / 2, 0, 0]} raycast={() => null}>
        <mesh position={[0, 0, -0.008]}>
          <cylinderGeometry args={[0.0012, 0.0012, 0.018, 8]} />
          <meshStandardMaterial color="#d4d4d4" metalness={0.95} roughness={0.15} />
        </mesh>

        <mesh position={[0, 0, 0.002]}>
          <cylinderGeometry args={[0.007, 0.007, 0.0035, 12]} />
          <meshStandardMaterial
            color="#f5d000"
            metalness={0.2}
            roughness={0.3}
          />
        </mesh>

        <mesh position={[0, 0, 0.009]}>
          <cylinderGeometry args={[0.005, 0.007, 0.011, 12]} />
          <meshStandardMaterial
            color="#f5d000"
            metalness={0.15}
            roughness={0.25}
          />
        </mesh>

        <mesh position={[0, 0, 0.015]}>
          <sphereGeometry args={[0.006, 12, 8]} />
          <meshStandardMaterial
            color="#f5d000"
            metalness={0.15}
            roughness={0.25}
          />
        </mesh>
      </group>

      {/* Floating Interactive Beacon Indicator */}
      <InteractiveObjectBeacon
        position={[0, noteH * 0.54, 0.04]}
        isHovered={isHovered}
        isOpen={isWallNoteOpen}
        isAnyObjectOpen={isAnyObjectOpen}
        distanceFactor={2.5}
      />
    </group>
  )
}
