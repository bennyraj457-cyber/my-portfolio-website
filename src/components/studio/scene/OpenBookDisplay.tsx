import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import { SKILLS_DATA, type BookSkillsContent } from '@/data/skillsContent'
import type { SkillBookId } from './SkillBookCollection'
import { BOOK_SHELF_LOCAL_SLOTS } from './InteractiveBookshelf'

/**
 * Creates high-resolution procedural front cover texture for the book.
 */
function createFrontCoverTexture(content: BookSkillsContent): THREE.CanvasTexture {
  const width = 512
  const height = 700
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')!

  // Vibrant cover color background
  ctx.fillStyle = content.coverColor
  ctx.fillRect(0, 0, width, height)

  // Subtle linen texture
  ctx.fillStyle = 'rgba(255, 255, 255, 0.08)'
  for (let y = 0; y < height; y += 4) {
    ctx.fillRect(0, y, width, 1.5)
  }

  // Saddle stitching
  ctx.strokeStyle = '#ffffff'
  ctx.lineWidth = 2
  ctx.setLineDash([8, 6])
  ctx.strokeRect(18, 18, width - 36, height - 36)
  ctx.setLineDash([])

  // Header volume badge
  ctx.fillStyle = '#ffffff'
  ctx.font = '700 18px "JetBrains Mono", monospace'
  ctx.textAlign = 'center'
  ctx.fillText(`VOLUME ${content.volume}`, width / 2, 80)

  // Center debossed title plate
  const plateY = height * 0.38
  ctx.fillStyle = 'rgba(0, 0, 0, 0.25)'
  ctx.fillRect(40, plateY, width - 80, 140)
  ctx.strokeStyle = '#ffffff'
  ctx.lineWidth = 1.5
  ctx.strokeRect(40, plateY, width - 80, 140)

  ctx.fillStyle = '#ffffff'
  ctx.font = '800 46px "Space Grotesk", sans-serif'
  ctx.fillText(content.title.toUpperCase(), width / 2, plateY + 68)

  ctx.font = '600 14px "JetBrains Mono", monospace'
  ctx.fillStyle = '#f5d000'
  ctx.fillText(content.subtitle, width / 2, plateY + 105)

  // Monogram bottom
  ctx.beginPath()
  ctx.arc(width / 2, height - 90, 32, 0, Math.PI * 2)
  ctx.fillStyle = '#ffffff'
  ctx.fill()

  ctx.fillStyle = content.coverColor
  ctx.font = '800 28px "JetBrains Mono", monospace'
  ctx.fillText(content.id[0].toUpperCase(), width / 2, height - 80)

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 4
  texture.needsUpdate = true
  return texture
}

/**
 * Creates procedural left inside page texture (768x1050)
 */
function createLeftInsidePageTexture(content: BookSkillsContent): THREE.CanvasTexture {
  const width = 1024
  const height = 1400
  const scale = 0.75
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(width * scale)
  canvas.height = Math.round(height * scale)
  const ctx = canvas.getContext('2d')!
  ctx.scale(scale, scale)

  // Warm archival paper
  ctx.fillStyle = '#faf8f2'
  ctx.fillRect(0, 0, width, height)

  // Subtle ruled lines
  ctx.strokeStyle = 'rgba(27, 28, 25, 0.06)'
  ctx.lineWidth = 1
  for (let y = 140; y < height - 110; y += 44) {
    ctx.beginPath()
    ctx.moveTo(84, y)
    ctx.lineTo(width - 84, y)
    ctx.stroke()
  }

  // Spine shadow along the right edge
  const spineGrad = ctx.createLinearGradient(width - 90, 0, width, 0)
  spineGrad.addColorStop(0, 'rgba(27, 28, 25, 0)')
  spineGrad.addColorStop(0.7, 'rgba(27, 28, 25, 0.08)')
  spineGrad.addColorStop(1, 'rgba(27, 28, 25, 0.22)')
  ctx.fillStyle = spineGrad
  ctx.fillRect(width - 90, 0, 90, height)

  // Margin Border
  ctx.strokeStyle = '#eae3d2'
  ctx.lineWidth = 2
  ctx.strokeRect(60, 50, width - 120, height - 100)

  // Header badge
  ctx.fillStyle = content.coverColor
  ctx.fillRect(80, 90, 180, 42)
  ctx.fillStyle = '#ffffff'
  ctx.font = '700 18px "JetBrains Mono", monospace'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(`VOLUME ${content.volume}`, 170, 111)

  ctx.fillStyle = '#7a705e'
  ctx.font = '600 16px "JetBrains Mono", monospace'
  ctx.textAlign = 'left'
  ctx.fillText('FIELD SPECIFICATION', 280, 111)

  // Technology Title
  ctx.fillStyle = '#181917'
  ctx.font = '800 68px "Space Grotesk", sans-serif'
  ctx.fillText(content.title.toUpperCase(), 80, 240)

  // Subtitle
  ctx.fillStyle = content.coverColor
  ctx.font = '700 22px "JetBrains Mono", monospace'
  ctx.fillText(content.subtitle, 80, 290)

  // Overview card
  ctx.fillStyle = '#f2ece0'
  ctx.fillRect(80, 360, width - 160, 180)
  ctx.strokeStyle = '#ded5c0'
  ctx.lineWidth = 1.5
  ctx.strokeRect(80, 360, width - 160, 180)

  ctx.fillStyle = '#655b48'
  ctx.font = '700 16px "JetBrains Mono", monospace'
  ctx.fillText('CORE COMPETENCY FOCUS', 110, 405)

  ctx.fillStyle = '#262420'
  ctx.font = '500 24px "Space Grotesk", sans-serif'
  ctx.fillText(content.headline, 110, 460)

  // Emblem Seal
  ctx.fillStyle = '#eae2ce'
  ctx.beginPath()
  ctx.arc(170, 780, 70, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = content.coverColor
  ctx.lineWidth = 4
  ctx.stroke()

  ctx.fillStyle = content.coverColor
  ctx.font = '800 52px "JetBrains Mono", monospace'
  ctx.textAlign = 'center'
  ctx.fillText(content.id[0].toUpperCase(), 170, 798)

  ctx.textAlign = 'left'
  ctx.fillStyle = '#181917'
  ctx.font = '700 26px "Space Grotesk", sans-serif'
  ctx.fillText('VERIFIED ARCHITECTURE', 270, 765)
  ctx.fillStyle = '#7a705e'
  ctx.font = '600 18px "JetBrains Mono", monospace'
  ctx.fillText('PROD-TESTED IMPLEMENTATION', 270, 800)

  // Footer
  ctx.fillStyle = '#9e9482'
  ctx.font = '600 16px "JetBrains Mono", monospace'
  ctx.fillText(`P. 0${content.volume}A`, 80, height - 70)

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 4
  texture.generateMipmaps = false
  texture.minFilter = THREE.LinearFilter
  texture.needsUpdate = true
  return texture
}

/**
 * Creates procedural right inside page texture (768x1050)
 */
function createRightInsidePageTexture(content: BookSkillsContent): THREE.CanvasTexture {
  const width = 1024
  const height = 1400
  const scale = 0.75
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(width * scale)
  canvas.height = Math.round(height * scale)
  const ctx = canvas.getContext('2d')!
  ctx.scale(scale, scale)

  // Warm archival paper
  ctx.fillStyle = '#faf8f2'
  ctx.fillRect(0, 0, width, height)

  // Spine shadow along the left edge
  const spineGrad = ctx.createLinearGradient(0, 0, 90, 0)
  spineGrad.addColorStop(0, 'rgba(27, 28, 25, 0.22)')
  spineGrad.addColorStop(0.3, 'rgba(27, 28, 25, 0.08)')
  spineGrad.addColorStop(1, 'rgba(27, 28, 25, 0)')
  ctx.fillStyle = spineGrad
  ctx.fillRect(0, 0, 90, height)

  // Margin Border
  ctx.strokeStyle = '#eae3d2'
  ctx.lineWidth = 2
  ctx.strokeRect(60, 50, width - 120, height - 100)

  // Section Header
  ctx.fillStyle = '#7a705e'
  ctx.font = '700 18px "JetBrains Mono", monospace'
  ctx.fillText('AREAS OF EXPERTISE & MASTERY', 80, 110)

  ctx.strokeStyle = '#e2dac6'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(80, 140)
  ctx.lineTo(width - 80, 140)
  ctx.stroke()

  // Skills Rows
  const startY = 190
  const rowSpacing = 200

  content.skills.forEach((skill, idx) => {
    const y = startY + idx * rowSpacing

    // Background card
    ctx.fillStyle = '#f4ede1'
    ctx.fillRect(80, y, width - 160, 160)
    ctx.strokeStyle = '#ded4bf'
    ctx.lineWidth = 1.5
    ctx.strokeRect(80, y, width - 160, 160)

    // Tag badge
    ctx.fillStyle = content.coverColor
    ctx.fillRect(110, y + 25, 110, 36)
    ctx.fillStyle = '#ffffff'
    ctx.font = '700 16px "JetBrains Mono", monospace'
    ctx.textAlign = 'center'
    ctx.fillText(skill.tag, 165, y + 48)

    // Skill Name
    ctx.textAlign = 'left'
    ctx.fillStyle = '#181917'
    ctx.font = '700 28px "Space Grotesk", sans-serif'
    ctx.fillText(skill.name, 240, y + 50)

    // Description
    ctx.fillStyle = '#5c5240'
    ctx.font = '400 20px "Space Grotesk", sans-serif'
    ctx.fillText(skill.detail, 110, y + 110)
  })

  // Footer
  ctx.textAlign = 'right'
  ctx.fillStyle = '#9e9482'
  ctx.font = '600 16px "JetBrains Mono", monospace'
  ctx.fillText(`P. 0${content.volume}B`, width - 80, height - 70)

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 4
  texture.generateMipmaps = false
  texture.minFilter = THREE.LinearFilter
  texture.needsUpdate = true
  return texture
}

function createPageEdgesTexture(): THREE.CanvasTexture {
  const width = 128
  const height = 64
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')!

  ctx.fillStyle = '#f4efe2'
  ctx.fillRect(0, 0, width, height)

  for (let y = 0; y < height; y += 2) {
    ctx.fillStyle = y % 4 === 0 ? 'rgba(180, 170, 148, 0.35)' : 'rgba(255, 253, 247, 0.5)'
    ctx.fillRect(0, y, width, 1)
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.needsUpdate = true
  return texture
}

export interface OpenBookDisplayProps {
  bookId: SkillBookId | null
  isOpen: boolean
  onClose?: () => void
}

/**
 * 3D Open Book Spread using the exact same hinged hardcover opening mechanics
 * and physics as the About Me Notebook.
 * Lazy-generates its high-res page textures only when a book is actually opened!
 */
export function OpenBookDisplay({ bookId, isOpen }: OpenBookDisplayProps) {
  // Retain the last active bookId during close animation so closing in-and-out animates seamlessly
  const currentBookIdRef = useRef<SkillBookId | null>(null)
  if (bookId) {
    currentBookIdRef.current = bookId
  }
  const displayBookId = bookId || currentBookIdRef.current

  const groupRef = useRef<THREE.Group>(null)
  const frontCoverPivotRef = useRef<THREE.Group>(null)
  const openProgressRef = useRef(0)

  const content = displayBookId ? SKILLS_DATA[displayBookId] : null
  const hasActivated = content !== null

  const coverTexture = useMemo(() => (content ? createFrontCoverTexture(content) : null), [content])
  const leftPageTexture = useMemo(() => (content ? createLeftInsidePageTexture(content) : null), [content])
  const rightPageTexture = useMemo(() => (content ? createRightInsidePageTexture(content) : null), [content])
  const pageEdgeTexture = useMemo(() => (hasActivated ? createPageEdgesTexture() : null), [hasActivated])

  // Find original shelf position & leaning rotation of this specific book
  const slotSpec = (displayBookId && BOOK_SHELF_LOCAL_SLOTS[displayBookId]) || BOOK_SHELF_LOCAL_SLOTS['react']
  const initialPos = slotSpec.pos
  const initialRot = slotSpec.rot

  const targetPos = useMemo(() => new THREE.Vector3(-0.12, 0.068, 0.275), [])

  // Dimensions of the book
  const width = 0.18
  const length = 0.24

  useFrame((_, delta) => {
    if (!content) return
    const openTarget = isOpen ? 1 : 0
    if (Math.abs(openProgressRef.current - openTarget) < 0.001) {
      if (!isOpen && groupRef.current) {
        groupRef.current.visible = false
      }
      return
    }

    const dt = Math.min(delta, 0.1)
    const openSpeed = isOpen ? 3.2 : 3.8
    const openFactor = 1 - Math.exp(-openSpeed * dt)
    openProgressRef.current = THREE.MathUtils.lerp(
      openProgressRef.current,
      openTarget,
      openFactor,
    )

    const rawT = THREE.MathUtils.clamp(openProgressRef.current, 0, 1)

    // When closing, hide once fully back on the shelf so the shelf book cleanly takes over
    if (!isOpen && rawT < 0.01) {
      if (groupRef.current) groupRef.current.visible = false
      return
    }

    if (groupRef.current) {
      groupRef.current.visible = true
    }

    const flightT = THREE.MathUtils.clamp(rawT / 0.52, 0, 1)
    const smoothFlight = flightT * flightT * (3 - 2 * flightT)

    const coverT = THREE.MathUtils.clamp((rawT - 0.28) / 0.72, 0, 1)
    const smoothCover = coverT * coverT * (3 - 2 * coverT)

    if (groupRef.current) {
      const currentX = THREE.MathUtils.lerp(initialPos[0], targetPos.x, smoothFlight)
      const currentY = THREE.MathUtils.lerp(initialPos[1], targetPos.y, smoothFlight)
      const currentZ = THREE.MathUtils.lerp(initialPos[2], targetPos.z, smoothFlight)
      groupRef.current.position.set(currentX, currentY, currentZ)

      const currentRotX = THREE.MathUtils.lerp(-Math.PI / 2, 1.32, smoothFlight)
      const currentRotY = THREE.MathUtils.lerp(0, 0, smoothFlight)
      const currentRotZ = THREE.MathUtils.lerp(Math.PI / 2 + initialRot[2], 0, smoothFlight)
      groupRef.current.rotation.set(currentRotX, currentRotY, currentRotZ)
    }

    if (frontCoverPivotRef.current) {
      frontCoverPivotRef.current.rotation.z = smoothCover * (Math.PI * 0.982)
    }
  })

  if (!content) return null

  return (
    <group ref={groupRef} name="OpenSkillBook" visible={false}>
      {/* 1. Bottom Hardcover Board (Right side when open) */}
      <RoundedBox
        args={[width, 0.0032, length]}
        position={[0, 0.0016, 0]}
        radius={0.0015}
        smoothness={2}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color={content.coverColor} roughness={0.5} metalness={0.08} />
      </RoundedBox>

      {/* 2. Right Page Block */}
      <mesh position={[0.0025, 0.0102, 0]} castShadow receiveShadow>
        <boxGeometry args={[width - 0.009, 0.014, length - 0.008]} />
        <meshStandardMaterial
          map={pageEdgeTexture}
          color="#f4efe2"
          roughness={0.82}
          metalness={0.02}
        />
      </mesh>

      {/* 2b. Right Page Surface (Skills List) */}
      <mesh
        position={[0.0025, 0.0174, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[width - 0.011, length - 0.01]} />
        <meshStandardMaterial
          map={rightPageTexture}
          roughness={0.78}
          metalness={0.02}
        />
      </mesh>

      {/* 3. Center Rounded Book Spine Binding */}
      <RoundedBox
        args={[0.009, 0.021, length]}
        position={[-width / 2 + 0.0035, 0.0105, 0]}
        radius={0.004}
        smoothness={3}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color={content.coverColor} roughness={0.45} metalness={0.1} />
      </RoundedBox>

      {/* 4. Hinged Front Hardcover + Left Inside Page Spread (Hinged at left spine edge) */}
      <group
        ref={frontCoverPivotRef}
        position={[-width / 2 + 0.002, 0.0185, 0]}
      >
        {/* Top Cover Board */}
        <RoundedBox
          args={[width, 0.0034, length]}
          position={[width / 2 - 0.002, 0.0008, 0]}
          radius={0.0015}
          smoothness={2}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial
            map={coverTexture}
            roughness={0.5}
            metalness={0.08}
          />
        </RoundedBox>

        {/* Left Inside Page Block */}
        <mesh
          position={[width / 2 - 0.001, -0.0028, 0]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[width - 0.01, 0.0035, length - 0.008]} />
          <meshStandardMaterial
            map={pageEdgeTexture}
            color="#f4efe2"
            roughness={0.82}
            metalness={0.02}
          />
        </mesh>

        {/* Left Inside Page Printed Surface (Rotated so it faces camera when open) */}
        <mesh
          position={[width / 2 - 0.001, -0.0047, 0]}
          rotation={[Math.PI / 2, 0, Math.PI]}
          receiveShadow
        >
          <planeGeometry args={[width - 0.011, length - 0.01]} />
          <meshStandardMaterial
            map={leftPageTexture}
            roughness={0.78}
            metalness={0.02}
          />
        </mesh>
      </group>
    </group>
  )
}
