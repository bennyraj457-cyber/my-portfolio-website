import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import { useWorkspaceFocus } from '@/context/WorkspaceFocusContext'

export type SkillBookId =
  | 'html'
  | 'css'
  | 'react'
  | 'figma'
  | 'adobe-illustrator'

export interface SkillBookSpec {
  id: SkillBookId
  /** Exact technology name printed on the spine and cover */
  title: string
  /** Volume number badge on spine and cover */
  volume: string
  /** Minimal editorial subtitle on the front cover */
  subtitle: string
  /** Book depth into shelf (Z) in meters */
  depth: number
  /** Book thickness / spine width (X) in meters */
  thickness: number
  /** Book height (Y) in meters */
  height: number
  /** Distinctive subject brand/cover color */
  coverColor: string
  /** Highlight accent color for badges, graphics, ribbon */
  accentColor: string
  /** Text color on the spine */
  spineTextColor: string
  /** Local position within the shelf collection group */
  position: [number, number, number]
  /** Tilt rotation around Z-axis (for natural leaning book shelf appearance) */
  rotation: [number, number, number]
}

export const SKILL_BOOKS: SkillBookSpec[] = [
  {
    id: 'html',
    title: 'HTML',
    volume: '01',
    subtitle: 'SEMANTIC DOCUMENT ARCHITECTURE',
    depth: 0.125,
    thickness: 0.024,
    height: 0.178,
    coverColor: '#e44d26', // Iconic HTML5 Burnt Orange
    accentColor: '#ffffff',
    spineTextColor: '#ffffff',
    position: [-0.19, 0.09, 0],
    rotation: [0, 0, 0],
  },
  {
    id: 'css',
    title: 'CSS',
    volume: '02',
    subtitle: 'GRID LAYOUT, TYPOGRAPHY & MOTION',
    depth: 0.128,
    thickness: 0.025,
    height: 0.185,
    coverColor: '#264de4', // Iconic CSS3 Royal Blue
    accentColor: '#ffffff',
    spineTextColor: '#ffffff',
    position: [-0.162, 0.094, 0],
    rotation: [0, 0, 0],
  },
  {
    id: 'react',
    title: 'REACT',
    volume: '03',
    subtitle: 'DECLARATIVE UI & STATE ARCHITECTURE',
    depth: 0.122,
    thickness: 0.024,
    height: 0.175,
    coverColor: '#00d8ff', // React Cyan / Electric Turquoise
    accentColor: '#181917',
    spineTextColor: '#10171d',
    position: [-0.134, 0.089, 0],
    rotation: [0, 0, 0],
  },
  {
    id: 'figma',
    title: 'FIGMA',
    volume: '04',
    subtitle: 'INTERFACE DESIGN & COMPONENT SYSTEMS',
    depth: 0.126,
    thickness: 0.024,
    height: 0.182,
    coverColor: '#a259ff', // Figma Signature Violet / Purple
    accentColor: '#ffffff',
    spineTextColor: '#ffffff',
    position: [-0.106, 0.092, 0],
    rotation: [0, 0, 0],
  },
  {
    id: 'adobe-illustrator',
    title: 'ILLUSTRATOR',
    volume: '05',
    subtitle: 'VECTOR PRECISION & BEZIER SYSTEMS',
    depth: 0.124,
    thickness: 0.026,
    height: 0.176,
    coverColor: '#ff9a00', // Adobe Illustrator Amber / Golden Orange
    accentColor: '#181917',
    spineTextColor: '#1a1000',
    position: [-0.076, 0.088, 0],
    rotation: [0, 0, -0.06], // Natural slight shelf lean
  },
]

/**
 * Generates high-DPI vertical spine texture (`256×1024`) displaying the technology name,
 * volume number, and subject-specific branding.
 */
function createBookSpineTexture(spec: SkillBookSpec): THREE.CanvasTexture {
  const width = 256
  const height = 1024
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')!

  // 1. Rich vibrant subject-specific cover color background
  ctx.fillStyle = spec.coverColor
  ctx.fillRect(0, 0, width, height)

  // Subtle linen / bookcloth weave
  ctx.fillStyle = 'rgba(255, 255, 255, 0.07)'
  for (let y = 0; y < height; y += 4) {
    ctx.fillRect(0, y, width, 1.5)
  }

  // 2. Top & Bottom subtle binding headbands
  ctx.fillStyle = spec.accentColor
  ctx.fillRect(0, 0, width, 24)
  ctx.fillRect(0, height - 24, width, 24)

  // 3. Top Volume Number Badge
  ctx.fillStyle = spec.accentColor
  ctx.fillRect(40, 56, width - 80, 72)

  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.font = '700 44px "JetBrains Mono", monospace'
  ctx.fillStyle = spec.spineTextColor
  ctx.fillText(spec.volume, width / 2, 92)

  // 4. Vertical Technology Title rotated 90 degrees along the spine
  ctx.save()
  ctx.translate(width / 2, height / 2 + 30)
  ctx.rotate(-Math.PI / 2)

  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  const titleSize = spec.id === 'adobe-illustrator' ? 62 : 72
  ctx.font = `700 ${titleSize}px "Space Grotesk", "Inter", sans-serif`
  ctx.fillStyle = spec.spineTextColor
  ctx.fillText(spec.title, 0, 0)

  ctx.restore()

  // 5. Bottom Monogram / Emblem
  ctx.fillStyle = spec.accentColor
  ctx.beginPath()
  ctx.arc(width / 2, height - 90, 28, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = spec.coverColor
  ctx.font = '700 24px "JetBrains Mono", monospace'
  ctx.fillText(spec.id[0].toUpperCase(), width / 2, height - 89)

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 8
  texture.needsUpdate = true
  return texture
}

/**
 * Shared cream page-edge texture with fine horizontal paper sheet lines.
 */
function createBookPageEdgesTexture(): THREE.CanvasTexture {
  const width = 256
  const height = 128
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')!

  ctx.fillStyle = '#f4eee1'
  ctx.fillRect(0, 0, width, height)

  for (let y = 0; y < height; y += 2) {
    ctx.fillStyle =
      y % 4 === 0 ? 'rgba(175, 165, 142, 0.35)' : 'rgba(255, 253, 247, 0.55)'
    ctx.fillRect(0, y, width, 1)
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.needsUpdate = true
  return texture
}

export interface SkillBookProps {
  spec: SkillBookSpec
  pageEdgeTexture: THREE.CanvasTexture
  onSelect?: (id: SkillBookId) => void
}

/**
 * Individual upright 3D Hardcover Skill Book on the wall shelf.
 * Facing +Z so its spine is clearly legible from the camera.
 */
export function SkillBook({ spec, pageEdgeTexture, onSelect }: SkillBookProps) {
  const { activeObject } = useWorkspaceFocus()
  const [isHovered, setIsHovered] = useState(false)

  const bookGroupRef = useRef<THREE.Group>(null)
  const spineMaterialRef = useRef<THREE.MeshStandardMaterial>(null)
  const hoverProgressRef = useRef(0)

  const spineTexture = useMemo(() => createBookSpineTexture(spec), [spec])

  useEffect(() => {
    return () => {
      spineTexture.dispose()
      document.body.style.cursor = 'auto'
    }
  }, [spineTexture])

  const handlePointerOver = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation()
      if (activeObject !== null) return
      setIsHovered(true)
      document.body.style.cursor = 'pointer'
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
      onSelect?.(spec.id)
    },
    [onSelect, spec.id],
  )

  const { thickness, height, depth, coverColor, position, rotation } = spec

  // Smoothly animate individual book sliding forward slightly from the shelf on hover
  useFrame((_, delta) => {
    const target = isHovered && activeObject === null ? 1 : 0
    if (target === 0 && hoverProgressRef.current < 0.001) return
    const factor = 1 - Math.exp(-12 * Math.min(delta, 0.1))
    hoverProgressRef.current += (target - hoverProgressRef.current) * factor
    const p = hoverProgressRef.current

    if (bookGroupRef.current) {
      // Pull forward +Z by 22mm from the shelf on hover and lift slightly
      bookGroupRef.current.position.set(
        position[0],
        position[1] + p * 0.006,
        position[2] + p * 0.022,
      )
    }

    if (spineMaterialRef.current) {
      spineMaterialRef.current.emissiveIntensity = p * 0.35
    }
  })

  return (
    <group
      ref={bookGroupRef}
      name={`InteractiveObject_SkillBook_${spec.id}`}
      userData={{
        interactiveId: `skill-book-${spec.id}`,
        skillId: spec.id,
        section: 'skills',
        label: spec.title,
      }}
      position={position}
      rotation={rotation}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onClick={handleClick}
    >
      {/* Subtle Electric-Yellow Hover Outline Ring */}
      <RoundedBox
        args={[thickness + 0.006, height + 0.006, depth + 0.006]}
        position={[0, 0, 0]}
        radius={0.003}
        smoothness={2}
      >
        <meshBasicMaterial
          color="#f5d000"
          transparent
          opacity={isHovered ? 0.65 : 0}
          depthWrite={false}
        />
      </RoundedBox>

      {/* Main Solid Hardcover Body (Cover Color) */}
      <RoundedBox
        args={[thickness, height, depth]}
        position={[0, 0, 0]}
        radius={0.002}
        smoothness={2}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          color={coverColor}
          roughness={0.48}
          metalness={0.08}
        />
      </RoundedBox>

      {/* Recessed Paper Block (Top, Bottom & Rear edges) */}
      <mesh position={[0, 0, -0.002]} castShadow receiveShadow>
        <boxGeometry args={[thickness - 0.004, height - 0.006, depth - 0.006]} />
        <meshStandardMaterial
          map={pageEdgeTexture}
          color="#f4eee1"
          roughness={0.82}
          metalness={0.02}
        />
      </mesh>

      {/* Printed High-Contrast Spine Facing the Camera (+Z) */}
      <mesh position={[0, 0, depth / 2 + 0.0006]}>
        <planeGeometry args={[thickness - 0.001, height - 0.002]} />
        <meshStandardMaterial
          ref={spineMaterialRef}
          map={spineTexture}
          roughness={0.42}
          metalness={0.08}
          emissive="#f5d000"
          emissiveIntensity={0}
        />
      </mesh>
    </group>
  )
}

export interface SkillBookCollectionProps {
  /** Base position of the skill books */
  position?: [number, number, number]
  /** Optional callback when a specific skill book is clicked */
  onSelectBook?: (id: SkillBookId) => void
}

/**
 * Renders the 5 separate colorful hardcover skill books on the wall shelf.
 */
export function SkillBookCollection({
  position = [0, 0, 0],
  onSelectBook,
}: SkillBookCollectionProps) {
  const sharedPageEdgeTexture = useMemo(() => createBookPageEdgesTexture(), [])

  useEffect(() => {
    return () => {
      sharedPageEdgeTexture.dispose()
    }
  }, [sharedPageEdgeTexture])

  return (
    <group name="SkillBookCollection" position={position}>
      {SKILL_BOOKS.map((spec) => (
        <SkillBook
          key={spec.id}
          spec={spec}
          pageEdgeTexture={sharedPageEdgeTexture}
          onSelect={onSelectBook}
        />
      ))}
    </group>
  )
}
