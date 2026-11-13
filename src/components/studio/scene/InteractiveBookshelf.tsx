import { useMemo, useRef, useState, useCallback, useEffect } from 'react'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import { useWorkspaceFocus } from '@/context/WorkspaceFocusContext'
import {
  SKILL_BOOKS,
  type SkillBookId,
  type SkillBookSpec,
} from './SkillBookCollection'
import { OpenBookDisplay } from './OpenBookDisplay'
import { InteractiveObjectBeacon } from './InteractiveObjectBeacon'

// Local shelf slot coordinate helper for each book
export const BOOK_SHELF_LOCAL_SLOTS: Record<
  SkillBookId,
  { pos: [number, number, number]; rot: [number, number, number]; size: [number, number, number] }
> = {
  html: { pos: [-0.19, 0.09, 0], rot: [0, 0, 0], size: [0.024, 0.178, 0.125] },
  css: { pos: [-0.162, 0.094, 0], rot: [0, 0, 0], size: [0.025, 0.185, 0.128] },
  react: { pos: [-0.134, 0.089, 0], rot: [0, 0, 0], size: [0.024, 0.175, 0.122] },
  figma: { pos: [-0.106, 0.092, 0], rot: [0, 0, 0], size: [0.024, 0.182, 0.126] },
  'adobe-illustrator': { pos: [-0.076, 0.088, 0], rot: [0, 0, -0.06], size: [0.026, 0.176, 0.124] },
}
function createBookSpineTexture(spec: SkillBookSpec): THREE.CanvasTexture {
  const width = 256
  const height = 1024
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')!

  // 1. Cover color
  ctx.fillStyle = spec.coverColor
  ctx.fillRect(0, 0, width, height)

  // Subtle linen weave
  ctx.fillStyle = 'rgba(255, 255, 255, 0.07)'
  for (let y = 0; y < height; y += 4) {
    ctx.fillRect(0, y, width, 1.5)
  }

  // 2. Headbands
  ctx.fillStyle = spec.accentColor
  ctx.fillRect(0, 0, width, 24)
  ctx.fillRect(0, height - 24, width, 24)

  // 3. Volume Badge
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

  // 5. Bottom Monogram
  ctx.fillStyle = spec.accentColor
  ctx.beginPath()
  ctx.arc(width / 2, height - 90, 28, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = spec.coverColor
  ctx.font = '700 24px "JetBrains Mono", monospace'
  ctx.fillText(spec.id[0].toUpperCase(), width / 2, height - 89)

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 4
  texture.needsUpdate = true
  return texture
}

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

interface InteractiveBookProps {
  spec: SkillBookSpec
  pageEdgeTexture: THREE.CanvasTexture
  isShelfFocused: boolean
  isSelected: boolean
  isAnyBookSelected: boolean
  onSelect: (id: SkillBookId) => void
}

function InteractiveBook({
  spec,
  pageEdgeTexture,
  isShelfFocused,
  isSelected,
  isAnyBookSelected,
  onSelect,
}: InteractiveBookProps) {
  const [isHovered, setIsHovered] = useState(false)
  const groupRef = useRef<THREE.Group>(null)
  const spineMatRef = useRef<THREE.MeshStandardMaterial>(null)
  const coverMatRef = useRef<THREE.MeshStandardMaterial>(null)
  const hoverProgressRef = useRef(0)

  const spineTexture = useMemo(() => createBookSpineTexture(spec), [spec])

  useEffect(() => {
    return () => {
      spineTexture.dispose()
    }
  }, [spineTexture])

  const handlePointerOver = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation()
      setIsHovered(true)
      document.body.style.cursor = 'pointer'
    },
    [],
  )

  const handlePointerOut = useCallback((e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    setIsHovered(false)
    document.body.style.cursor = 'auto'
  }, [])

  const handleClick = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation()
      onSelect(spec.id)
    },
    [onSelect, spec.id],
  )

  const { thickness, height, depth, coverColor, position, rotation } = spec

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.1)

    // Hover animation
    const targetHover = isHovered && (!isAnyBookSelected || isSelected) ? 1 : 0
    hoverProgressRef.current += (targetHover - hoverProgressRef.current) * (1 - Math.exp(-12 * dt))
    const hp = hoverProgressRef.current

    if (groupRef.current) {
      // Base shelf position + hover pull
      groupRef.current.position.set(
        position[0],
        position[1] + hp * 0.008,
        position[2] + hp * 0.024,
      )
      groupRef.current.rotation.set(rotation[0], rotation[1], rotation[2])

      // When this book is the selected active book, hide the stationary book
      groupRef.current.visible = !isSelected
    }

    // Material dimming when a book is opened
    const isDimmed = isAnyBookSelected && !isSelected
    if (coverMatRef.current) {
      coverMatRef.current.opacity = isDimmed ? 0.35 : 1
      coverMatRef.current.transparent = isDimmed
    }
    if (spineMatRef.current) {
      spineMatRef.current.opacity = isDimmed ? 0.35 : 1
      spineMatRef.current.transparent = isDimmed
      spineMatRef.current.emissiveIntensity = isHovered && isShelfFocused ? 0.35 : 0
    }
  })

  return (
    <group
      ref={groupRef}
      name={`SkillBook_${spec.id}`}
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
          opacity={isHovered ? 0.75 : 0}
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
          ref={coverMatRef}
          color={coverColor}
          roughness={0.48}
          metalness={0.08}
        />
      </RoundedBox>

      {/* Recessed Paper Block */}
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
          ref={spineMatRef}
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

/**
 * Interactive Bookshelf on Wall Shelf with Stage 1 (Shelf Zoom) and Stage 2 (Individual Book Open).
 */
export function InteractiveBookshelf() {
  const {
    activeObject,
    activeBook,
    isBookshelfOpen,
    isAnyObjectOpen,
    openBookshelf,
    openBook,
    closeBook,
  } = useWorkspaceFocus()

  const [isShelfHovered, setIsShelfHovered] = useState(false)
  const shelfHighlightRef = useRef<THREE.MeshBasicMaterial>(null)
  const shelfGroupRef = useRef<THREE.Group>(null)
  const hoverAnimRef = useRef(0)

  const sharedPageEdgeTexture = useMemo(() => createBookPageEdgesTexture(), [])

  useEffect(() => {
    return () => {
      sharedPageEdgeTexture.dispose()
      document.body.style.cursor = 'auto'
    }
  }, [sharedPageEdgeTexture])

  const handleShelfPointerOver = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation()
      if (activeObject === null) {
        setIsShelfHovered(true)
        document.body.style.cursor = 'pointer'
      }
    },
    [activeObject],
  )

  const handleShelfPointerOut = useCallback((e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    setIsShelfHovered(false)
    document.body.style.cursor = 'auto'
  }, [])

  const handleShelfClick = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation()
      if (!isBookshelfOpen) {
        // Stage 1: Transition camera to bookshelf view
        openBookshelf()
      }
    },
    [isBookshelfOpen, openBookshelf],
  )

  const handleBookSelect = useCallback(
    (id: SkillBookId) => {
      if (!isBookshelfOpen) {
        // If clicked from workspace view, zoom into bookshelf and open book
        openBook(id)
      } else {
        // Stage 2: Open selected book
        openBook(id)
      }
    },
    [isBookshelfOpen, openBook],
  )

  // Animation for shelf hover in Stage 1
  useFrame((_, delta) => {
    const target = isShelfHovered && !isBookshelfOpen ? 1 : 0
    if (target === 0 && hoverAnimRef.current < 0.001) return
    const dt = Math.min(delta, 0.1)
    hoverAnimRef.current += (target - hoverAnimRef.current) * (1 - Math.exp(-10 * dt))
    const ha = hoverAnimRef.current

    if (shelfHighlightRef.current) {
      shelfHighlightRef.current.opacity = ha * 0.7
    }

    if (shelfGroupRef.current && !isBookshelfOpen) {
      // Subtle interactive hover tilt
      shelfGroupRef.current.position.y = 1.75 + ha * 0.005
    }
  })

  return (
    <group
      ref={shelfGroupRef}
      name="InteractiveBookshelf"
      position={[-0.78, 1.75, -1.3]}
    >
      {/* Floating Wooden Wall Shelf Plank (Clickable to enter Stage 1 Bookshelf View) */}
      <RoundedBox
        args={[0.68, 0.024, 0.16]}
        radius={0.005}
        smoothness={2}
        castShadow
        receiveShadow
        onPointerOver={handleShelfPointerOver}
        onPointerOut={handleShelfPointerOut}
        onClick={handleShelfClick}
      >
        <meshStandardMaterial color="#fbf9f3" roughness={0.5} metalness={0.05} />
      </RoundedBox>

      {/* Electric-Yellow Bookshelf Highlight Glow on Hover */}
      <mesh position={[0, 0.09, 0]} raycast={() => null}>
        <boxGeometry args={[0.70, 0.22, 0.18]} />
        <meshBasicMaterial
          ref={shelfHighlightRef}
          color="#f5d000"
          transparent
          opacity={0}
          wireframe
        />
      </mesh>

      {/* Five Distinct Hardcover Skill Books */}
      <group position={[0, 0.012, 0.005]}>
        {SKILL_BOOKS.map((spec) => (
          <InteractiveBook
            key={spec.id}
            spec={spec}
            pageEdgeTexture={sharedPageEdgeTexture}
            isShelfFocused={isBookshelfOpen}
            isSelected={activeBook === spec.id}
            isAnyBookSelected={activeBook !== null}
            onSelect={handleBookSelect}
          />
        ))}
      </group>

      {/* Floating Interactive Beacon Indicator */}
      <InteractiveObjectBeacon
        position={[-0.12, 0.22, 0.08]}
        isHovered={isShelfHovered}
        isOpen={isBookshelfOpen}
        isAnyObjectOpen={isAnyObjectOpen}
        distanceFactor={2.5}
      />

      {/* Small Sculptural Ceramic Vessel on Shelf */}
      <mesh position={[0.2, 0.055, 0]} castShadow>
        <cylinderGeometry args={[0.032, 0.04, 0.09, 20]} />
        <meshStandardMaterial color="#fbf9f3" roughness={0.35} />
      </mesh>

      {/* Stage 2 Open Book Display spread when a book is active or animating */}
      <group position={[0, 0.012, 0.005]}>
        <OpenBookDisplay
          bookId={activeBook}
          isOpen={activeBook !== null}
          onClose={closeBook}
        />
      </group>
    </group>
  )
}
