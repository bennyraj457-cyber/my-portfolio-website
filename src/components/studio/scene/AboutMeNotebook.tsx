import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import { ABOUT_ME_CONTENT, type AboutMeContentConfig } from '@/data/aboutMeContent'
import { useWorkspaceFocus } from '@/context/WorkspaceFocusContext'
import { InteractiveObjectBeacon } from './InteractiveObjectBeacon'

export interface AboutMeNotebookProps {
  /** Local or world position of the notebook on the desk */
  position?: [number, number, number]
  /** Rotation of the notebook on the desk */
  rotation?: [number, number, number]
  /** Optional custom content override (defaults to ABOUT_ME_CONTENT) */
  content?: AboutMeContentConfig
}

/**
 * Helper to wrap multi-line editorial text onto a 2D canvas context.
 */
function drawWrappedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
): number {
  const words = text.split(' ')
  let line = ''
  let currentY = y

  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + ' '
    const metrics = ctx.measureText(testLine)
    if (metrics.width > maxWidth && i > 0) {
      ctx.fillText(line.trim(), x, currentY)
      line = words[i] + ' '
      currentY += lineHeight
    } else {
      line = testLine
    }
  }
  if (line.trim()) {
    ctx.fillText(line.trim(), x, currentY)
    currentY += lineHeight
  }
  return currentY
}

/**
 * Generates a high-resolution cover texture with fine leather/linen grain,
 * perimeter saddle-stitching, and a debossed/printed "ABOUT ME" inscription.
 */
function createNotebookCoverTexture(content: AboutMeContentConfig): THREE.CanvasTexture {
  const width = 512
  const height = 700
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')!

  // 1. Deep matte obsidian hardcover base (#181917)
  ctx.fillStyle = '#181917'
  ctx.fillRect(0, 0, width, height)

  // 2. Subtle organic bookcloth / fine pebble grain texture
  ctx.fillStyle = 'rgba(255, 255, 255, 0.018)'
  for (let y = 0; y < height; y += 6) {
    for (let x = 0; x < width; x += 6) {
      const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453
      if (n - Math.floor(n) > 0.55) {
        ctx.fillRect(x, y, 2, 2)
      }
    }
  }

  // 3. Spine groove crease along the left edge
  const grooveGrad = ctx.createLinearGradient(34, 0, 52, 0)
  grooveGrad.addColorStop(0, 'rgba(0, 0, 0, 0.65)')
  grooveGrad.addColorStop(0.5, 'rgba(0, 0, 0, 0.85)')
  grooveGrad.addColorStop(1, 'rgba(255, 255, 255, 0.05)')
  ctx.fillStyle = grooveGrad
  ctx.fillRect(34, 0, 18, height)

  // 4. Subtle perimeter saddle-stitching around the cover border
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.14)'
  ctx.lineWidth = 1.6
  ctx.setLineDash([7, 5])
  ctx.strokeRect(20, 20, width - 40, height - 40)
  ctx.setLineDash([])

  // 5. Debossed frame plate in the upper-center cover
  const plateX = 96
  const plateY = 175
  const plateW = width - 192
  const plateH = 128

  ctx.fillStyle = '#131412'
  ctx.fillRect(plateX, plateY, plateW, plateH)
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)'
  ctx.lineWidth = 1.2
  ctx.strokeRect(plateX, plateY, plateW, plateH)

  // Subtle Aureolin accent rule inside the debossed plate
  ctx.fillStyle = '#f5d000'
  ctx.fillRect(width / 2 - 28, plateY + 28, 56, 2.5)

  // 6. Embossed / foil-printed "ABOUT ME" typography
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  ctx.font = '700 34px "Space Grotesk", "Inter", sans-serif'
  ctx.fillStyle = 'rgba(0, 0, 0, 0.85)'
  ctx.fillText(content.coverTitle, width / 2 + 1, plateY + 68 + 1.5)

  ctx.fillStyle = '#f2efe6'
  ctx.fillText(content.coverTitle, width / 2, plateY + 68)

  ctx.font = '500 13px "JetBrains Mono", monospace'
  ctx.fillStyle = 'rgba(245, 208, 0, 0.78)'
  ctx.fillText(content.coverSubtitle, width / 2, plateY + 100)

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 4
  texture.needsUpdate = true
  return texture
}

/**
 * Generates the LEFT inside page texture of the opened notebook.
 * Displays the personal greeting, role title, and editorial bio quote.
 */
function createLeftInsidePageTexture(content: AboutMeContentConfig): THREE.CanvasTexture {
  const width = 1024
  const height = 1400
  const scale = 0.75
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(width * scale)
  canvas.height = Math.round(height * scale)
  const ctx = canvas.getContext('2d')!
  ctx.scale(scale, scale)

  // 1. Warm archival paper base (#faf7f0)
  ctx.fillStyle = '#faf7f0'
  ctx.fillRect(0, 0, width, height)

  // 2. Subtle dot-grid / ruled architectural notebook lines
  ctx.strokeStyle = 'rgba(27, 28, 25, 0.055)'
  ctx.lineWidth = 1
  for (let y = 140; y < height - 110; y += 44) {
    ctx.beginPath()
    ctx.moveTo(84, y)
    ctx.lineTo(width - 84, y)
    ctx.stroke()
  }

  // 3. Subtle spine shadow along the right edge
  const spineGrad = ctx.createLinearGradient(width - 75, 0, width, 0)
  spineGrad.addColorStop(0, 'rgba(27, 28, 25, 0)')
  spineGrad.addColorStop(0.7, 'rgba(27, 28, 25, 0.08)')
  spineGrad.addColorStop(1, 'rgba(27, 28, 25, 0.22)')
  ctx.fillStyle = spineGrad
  ctx.fillRect(width - 75, 0, 75, height)

  // 4. Top archival header metadata & electric-yellow tab bar
  ctx.fillStyle = '#f5d000'
  ctx.fillRect(88, 92, 86, 10)

  ctx.textAlign = 'left'
  ctx.textBaseline = 'alphabetic'
  ctx.font = '600 22px "JetBrains Mono", monospace'
  ctx.fillStyle = '#6b6a65'
  ctx.fillText('NOTEBOOK // ARCHIVE ENTRY 01', 88, 152)

  // 5. Main Greeting: "HELLO, I'M [YOUR NAME]"
  ctx.font = '700 58px "Space Grotesk", "Inter", sans-serif'
  ctx.fillStyle = '#181917'
  const afterGreetingY = drawWrappedText(
    ctx,
    content.greeting,
    88,
    265,
    width - 180,
    72,
  )

  // 6. Role Badge / Subtitle: "UI/UX DESIGNER & FRONTEND DEVELOPER"
  const roleBoxY = afterGreetingY + 12
  ctx.fillStyle = '#181917'
  ctx.fillRect(88, roleBoxY, width - 184, 62)

  // Electric yellow left accent bar on the role badge
  ctx.fillStyle = '#f5d000'
  ctx.fillRect(88, roleBoxY, 12, 62)

  ctx.font = '700 28px "Space Grotesk", "Inter", sans-serif'
  ctx.fillStyle = '#fbf9f3'
  ctx.fillText(content.role, 118, roleBoxY + 40)

  // 7. Editorial Bio Quote with Electric-Yellow vertical quote bar
  const quoteStartY = roleBoxY + 148
  ctx.fillStyle = '#f5d000'
  ctx.fillRect(88, quoteStartY - 38, 8, 275)

  ctx.font = '500 35px "Plus Jakarta Sans", "Inter", sans-serif'
  ctx.fillStyle = '#262724'
  drawWrappedText(
    ctx,
    content.quote,
    122,
    quoteStartY,
    width - 220,
    54,
  )

  // 8. Minimalist notebook corner registration marks & footer
  ctx.strokeStyle = 'rgba(24, 25, 23, 0.16)'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(88, height - 125)
  ctx.lineTo(width - 96, height - 125)
  ctx.stroke()

  ctx.font = '600 22px "JetBrains Mono", monospace'
  ctx.fillStyle = '#5a5955'
  ctx.fillText(content.leftPageFooter, 88, height - 80)

  // Small electric-yellow square emblem
  ctx.fillStyle = '#f5d000'
  ctx.fillRect(width - 118, height - 98, 22, 22)
  ctx.strokeStyle = '#181917'
  ctx.lineWidth = 2
  ctx.strokeRect(width - 118, height - 98, 22, 22)

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 4
  texture.generateMipmaps = false
  texture.minFilter = THREE.LinearFilter
  texture.needsUpdate = true
  return texture
}

/**
 * Generates the RIGHT inside page texture of the opened notebook.
 * Displays the "WHAT I DO" section with physical checklist cards & yellow highlights.
 */
function createRightInsidePageTexture(content: AboutMeContentConfig): THREE.CanvasTexture {
  const width = 1024
  const height = 1400
  const scale = 0.75
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(width * scale)
  canvas.height = Math.round(height * scale)
  const ctx = canvas.getContext('2d')!
  ctx.scale(scale, scale)

  // 1. Warm archival paper base (#faf7f0)
  ctx.fillStyle = '#faf7f0'
  ctx.fillRect(0, 0, width, height)

  // 2. Subtle architectural dot grid on right page
  ctx.fillStyle = 'rgba(27, 28, 25, 0.11)'
  for (let y = 140; y < height - 120; y += 40) {
    for (let x = 96; x < width - 88; x += 40) {
      ctx.fillRect(x, y, 2.5, 2.5)
    }
  }

  // 3. Subtle spine crease shadow along the left edge (center binding)
  const spineGrad = ctx.createLinearGradient(0, 0, 75, 0)
  spineGrad.addColorStop(0, 'rgba(27, 28, 25, 0.24)')
  spineGrad.addColorStop(0.35, 'rgba(27, 28, 25, 0.08)')
  spineGrad.addColorStop(1, 'rgba(27, 28, 25, 0)')
  ctx.fillStyle = spineGrad
  ctx.fillRect(0, 0, 75, height)

  // 4. Section Header: "WHAT I DO"
  ctx.fillStyle = '#f5d000'
  ctx.fillRect(96, 92, 86, 10)

  ctx.textAlign = 'left'
  ctx.textBaseline = 'alphabetic'
  ctx.font = '600 22px "JetBrains Mono", monospace'
  ctx.fillStyle = '#6b6a65'
  ctx.fillText('CAPABILITIES & FOCUS AREAS', 96, 152)

  ctx.font = '700 56px "Space Grotesk", "Inter", sans-serif'
  ctx.fillStyle = '#181917'
  ctx.fillText(content.whatIDoTitle, 96, 245)

  // Underline bar beneath WHAT I DO
  ctx.fillStyle = '#181917'
  ctx.fillRect(96, 272, width - 184, 4)
  ctx.fillStyle = '#f5d000'
  ctx.fillRect(96, 272, 160, 4)

  // 5. Render each "WHAT I DO" item as a crisp editorial notebook entry
  let itemY = 345
  const cardHeight = 165
  const cardGap = 34

  content.whatIDoItems.forEach((item, index) => {
    const numLabel = `0${index + 1}`

    // Subtle card fill & dark ink border
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(96, itemY, width - 184, cardHeight)

    ctx.strokeStyle = '#181917'
    ctx.lineWidth = 3
    ctx.strokeRect(96, itemY, width - 184, cardHeight)

    // Electric-yellow index badge on the left of each item
    ctx.fillStyle = '#f5d000'
    ctx.fillRect(96, itemY, 96, cardHeight)

    ctx.strokeStyle = '#181917'
    ctx.lineWidth = 3
    ctx.strokeRect(96, itemY, 96, cardHeight)

    // Index number ("01", "02", ...)
    ctx.textAlign = 'center'
    ctx.font = '700 36px "JetBrains Mono", monospace'
    ctx.fillStyle = '#181917'
    ctx.fillText(numLabel, 96 + 48, itemY + 96)

    // Item title ("UI/UX Design", etc.)
    ctx.textAlign = 'left'
    ctx.font = '700 42px "Space Grotesk", "Inter", sans-serif'
    ctx.fillStyle = '#181917'
    ctx.fillText(item, 226, itemY + 98)

    // Subtle corner architectural tick
    ctx.fillStyle = '#181917'
    ctx.fillRect(width - 118, itemY + 22, 12, 12)

    itemY += cardHeight + cardGap
  })

  // 6. Bottom Footer & Page Number
  ctx.strokeStyle = 'rgba(24, 25, 23, 0.16)'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(96, height - 125)
  ctx.lineTo(width - 88, height - 125)
  ctx.stroke()

  ctx.textAlign = 'left'
  ctx.font = '600 22px "JetBrains Mono", monospace'
  ctx.fillStyle = '#5a5955'
  ctx.fillText(content.rightPageFooter, 96, height - 80)

  ctx.textAlign = 'right'
  ctx.fillStyle = '#181917'
  ctx.fillText('AUREOLIN BOTANICA', width - 88, height - 80)

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 4
  texture.generateMipmaps = false
  texture.minFilter = THREE.LinearFilter
  texture.needsUpdate = true
  return texture
}

/**
 * Generates a fine horizontal paper-stack texture for the cream page block edges.
 */
function createPageEdgesTexture(): THREE.CanvasTexture {
  const width = 128
  const height = 64
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')!

  ctx.fillStyle = '#f4EFE2'
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

export function AboutMeNotebook({
  position = [-0.68, 0.759, 0.12],
  rotation = [0, 0.22, 0],
  content = ABOUT_ME_CONTENT,
}: AboutMeNotebookProps) {
  const { activeObject, isNotebookOpen, isAnyObjectOpen, openNotebook } = useWorkspaceFocus()
  const [isHovered, setIsHovered] = useState(false)

  // Lazy-generate inside page textures only after the notebook is first opened
  const [hasOpenedOnce, setHasOpenedOnce] = useState(false)
  useEffect(() => {
    if (isNotebookOpen && !hasOpenedOnce) {
      setHasOpenedOnce(true)
    }
  }, [isNotebookOpen, hasOpenedOnce])

  const prefersReducedMotion = useMemo(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    [],
  )

  const groupRef = useRef<THREE.Group>(null)
  const frontCoverPivotRef = useRef<THREE.Group>(null)
  const glowRingMaterialRef = useRef<THREE.MeshBasicMaterial>(null)
  const bandMaterialRef = useRef<THREE.MeshStandardMaterial>(null)
  const coverMaterialRef = useRef<THREE.MeshStandardMaterial>(null)

  const hoverProgressRef = useRef(0)
  const openProgressRef = useRef(0)

  const coverTexture = useMemo(() => createNotebookCoverTexture(content), [content])
  const leftPageTexture = useMemo(
    () => (hasOpenedOnce ? createLeftInsidePageTexture(content) : null),
    [content, hasOpenedOnce],
  )
  const rightPageTexture = useMemo(
    () => (hasOpenedOnce ? createRightInsidePageTexture(content) : null),
    [content, hasOpenedOnce],
  )
  const pageEdgeTexture = useMemo(() => createPageEdgesTexture(), [])

  // Clean up procedural GPU textures and cursor state on unmount
  useEffect(() => {
    return () => {
      coverTexture.dispose()
      leftPageTexture?.dispose()
      rightPageTexture?.dispose()
      pageEdgeTexture.dispose()
      document.body.style.cursor = 'auto'
    }
  }, [coverTexture, leftPageTexture, rightPageTexture, pageEdgeTexture])

  const handlePointerOver = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation()
      if (activeObject !== null) {
        document.body.style.cursor = 'default'
        return
      }
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
      if (activeObject === null) {
        setIsHovered(false)
        document.body.style.cursor = 'auto'
        openNotebook()
      }
    },
    [activeObject, openNotebook],
  )

  // Physical notebook dimensions (approx A5 hardcover: 17.5cm × 23.5cm × 2.1cm)
  const width = 0.175
  const length = 0.235

  // Smoothly animate hover highlight, notebook rotation alignment, and hardcover opening
  useFrame((_, delta) => {
    const hoverTarget = isHovered && !isNotebookOpen ? 1 : 0
    const openTarget = isNotebookOpen ? 1 : 0

    // Early-exit when both hover and open transitions have converged
    if (
      Math.abs(hoverProgressRef.current - hoverTarget) < 0.001 &&
      Math.abs(openProgressRef.current - openTarget) < 0.001
    ) {
      return
    }

    const dt = Math.min(delta, 0.1)

    // 1. Hover interpolation (suppressed when already open)
    const hoverFactor = 1 - Math.exp(-10 * dt)
    hoverProgressRef.current += (hoverTarget - hoverProgressRef.current) * hoverFactor
    const hp = hoverProgressRef.current

    // 2. Notebook cover opening interpolation
    const openSpeed = prefersReducedMotion ? 16 : isNotebookOpen ? 3.2 : 4.8
    const openFactor = 1 - Math.exp(-openSpeed * dt)
    openProgressRef.current = THREE.MathUtils.lerp(
      openProgressRef.current,
      openTarget,
      openFactor,
    )

    // Delay cover swing slightly on open so the camera begins approaching first
    const rawOpen = THREE.MathUtils.clamp(
      isNotebookOpen
        ? (openProgressRef.current - 0.12) / 0.88
        : openProgressRef.current,
      0,
      1,
    )
    const smoothOpen = rawOpen * rawOpen * (3 - 2 * rawOpen)

    if (groupRef.current) {
      groupRef.current.position.y = position[1] + hp * 0.0018
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        rotation[1],
        0,
        smoothOpen,
      )
    }

    if (frontCoverPivotRef.current) {
      frontCoverPivotRef.current.rotation.z = smoothOpen * (Math.PI * 0.982)
    }

    if (glowRingMaterialRef.current) {
      glowRingMaterialRef.current.opacity = hp * 0.65
    }

    if (bandMaterialRef.current) {
      bandMaterialRef.current.emissiveIntensity = 0.08 + hp * 0.55
    }

    if (coverMaterialRef.current) {
      coverMaterialRef.current.emissiveIntensity = hp * 0.12
    }
  })

  return (
    <group
      ref={groupRef}
      name="InteractiveObject_AboutMeNotebook"
      userData={{
        interactiveId: 'about-me-notebook',
        section: 'about-me',
        label: 'ABOUT ME',
      }}
      position={position}
      rotation={rotation}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onClick={handleClick}
    >
      {/* Subtle Aureolin Hover Outline / Rim Highlight on the Desk Surface */}
      <mesh position={[0, 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]} raycast={() => null}>
        <ringGeometry args={[0.132, 0.146, 36]} />
        <meshBasicMaterial
          ref={glowRingMaterialRef}
          color="#f5d000"
          transparent
          opacity={0}
          depthWrite={false}
        />
      </mesh>

      {/* Hover Perimeter Frame Highlight closely hugging the closed notebook footprint */}
      <RoundedBox
        args={[width + 0.009, 0.002, length + 0.009]}
        position={[0, 0.0015, 0]}
        radius={0.005}
        smoothness={2}
        raycast={() => null}
      >
        <meshBasicMaterial
          color="#f5d000"
          transparent
          opacity={isHovered && !isNotebookOpen ? 0.55 : 0}
          depthWrite={false}
        />
      </RoundedBox>

      {/* Floating Interactive Beacon Indicator */}
      <InteractiveObjectBeacon
        position={[0, 0.05, 0]}
        isHovered={isHovered}
        isOpen={isNotebookOpen}
        isAnyObjectOpen={isAnyObjectOpen}
        distanceFactor={2.2}
      />

      {/* 1. Bottom Black Hardcover Board */}
      <RoundedBox
        args={[width, 0.0032, length]}
        position={[0, 0.0016, 0]}
        radius={0.0015}
        smoothness={2}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color="#181917" roughness={0.62} metalness={0.08} />
      </RoundedBox>

      {/* 2. Cream Archival Right Page Block (Recessed slightly inside the covers) */}
      <mesh position={[0.0025, 0.0102, 0]} castShadow receiveShadow>
        <boxGeometry args={[width - 0.009, 0.014, length - 0.008]} />
        <meshStandardMaterial
          map={pageEdgeTexture}
          color="#f4efe2"
          roughness={0.82}
          metalness={0.02}
        />
      </mesh>

      {/* 2b. Right Inside Page Surface ("WHAT I DO" list) resting on top of the right page block */}
      <mesh
        position={[0.0025, 0.0174, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[width - 0.011, length - 0.01]} />
        <meshStandardMaterial
          map={rightPageTexture}
          color={rightPageTexture ? '#ffffff' : '#faf7f0'}
          roughness={0.78}
          metalness={0.02}
        />
      </mesh>

      {/* 3. Rounded Book Spine Binding (Left Hinge Edge) */}
      <RoundedBox
        args={[0.009, 0.021, length]}
        position={[-width / 2 + 0.0035, 0.0105, 0]}
        radius={0.004}
        smoothness={2}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color="#141513" roughness={0.55} metalness={0.1} />
      </RoundedBox>

      {/* 4. Hinged Front Hardcover + Left Inside Page Spread */}
      <group
        ref={frontCoverPivotRef}
        position={[-width / 2 + 0.002, 0.0185, 0]}
      >
        {/* Top Black Hardcover Board */}
        <RoundedBox
          args={[width, 0.0034, length]}
          position={[width / 2 - 0.002, 0.0008, 0]}
          radius={0.0015}
          smoothness={2}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial
            ref={coverMaterialRef}
            map={coverTexture}
            roughness={0.58}
            metalness={0.08}
            emissive="#f5d000"
            emissiveIntensity={0}
          />
        </RoundedBox>

        {/* Left Inside Page Stack attached to the inner side of the front cover */}
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

        {/* Left Inside Page Printed Surface ("HELLO, I'M [YOUR NAME]" & Bio) */}
        <mesh
          position={[width / 2 - 0.001, -0.0047, 0]}
          rotation={[Math.PI / 2, 0, Math.PI]}
          receiveShadow
        >
          <planeGeometry args={[width - 0.011, length - 0.01]} />
          <meshStandardMaterial
            map={leftPageTexture}
            color={leftPageTexture ? '#ffffff' : '#faf7f0'}
            roughness={0.78}
            metalness={0.02}
          />
        </mesh>
      </group>

      {/* 5. Signature Electric-Yellow (#f5d000) Woven Elastic Closure Strap */}
      <RoundedBox
        args={[0.011, isNotebookOpen ? 0.0155 : 0.0222, length + 0.002]}
        position={[width * 0.28, isNotebookOpen ? 0.008 : 0.0106, 0]}
        radius={0.002}
        smoothness={2}
        castShadow
      >
        <meshStandardMaterial
          ref={bandMaterialRef}
          color="#f5d000"
          roughness={0.48}
          metalness={0.05}
          emissive="#f5d000"
          emissiveIntensity={0.08}
        />
      </RoundedBox>

      {/* 6. Electric-Yellow Ribbon Bookmark Tail peeking from the bottom center spine */}
      <mesh
        position={[-width / 2 + 0.008, 0.0035, length / 2 + 0.014]}
        rotation={[0.06, 0.14, 0]}
        castShadow
        raycast={() => null}
      >
        <boxGeometry args={[0.014, 0.0015, 0.032]} />
        <meshStandardMaterial
          color="#f5d000"
          roughness={0.5}
          emissive="#f5d000"
          emissiveIntensity={0.06}
        />
      </mesh>

      {/* 7. Realistic Machined Black & Brushed Gold Pen Beside the Notebook */}
      <group position={[width / 2 + 0.028, 0.0065, 0.008]} rotation={[0, -0.08, 0]} raycast={() => null}>
        {/* Main Matte Obsidian Barrel */}
        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.0052, 0.0048, 0.142, 16]} />
          <meshStandardMaterial color="#1f201d" roughness={0.28} metalness={0.78} />
        </mesh>

        {/* Tapered Nose Cone (Front) */}
        <mesh position={[0, 0, 0.079]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.0048, 0.0012, 0.016, 12]} />
          <meshStandardMaterial color="#dcdad4" roughness={0.22} metalness={0.88} />
        </mesh>

        {/* Precision Aureolin Gold Accent Ring near Cap */}
        <mesh position={[0, 0, -0.022]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.0055, 0.0055, 0.004, 16]} />
          <meshStandardMaterial
            color="#f5d000"
            roughness={0.25}
            metalness={0.85}
            emissive="#f5d000"
            emissiveIntensity={isHovered ? 0.35 : 0.05}
          />
        </mesh>

        {/* Brushed Metal Pocket Clip */}
        <mesh position={[0, 0.0058, -0.042]} castShadow>
          <boxGeometry args={[0.0026, 0.0022, 0.038]} />
          <meshStandardMaterial color="#dcdad4" roughness={0.25} metalness={0.88} />
        </mesh>
      </group>
    </group>
  )
}
