import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import { useWorkspaceFocus } from '@/context/WorkspaceFocusContext'
import { InteractiveObjectBeacon } from './InteractiveObjectBeacon'
import {
  CONTACT_CONTENT,
  type ContactChannelId,
  type ContactContentConfig,
} from '@/data/contactContent'

export interface ContactSmartphoneProps {
  /** Local position of the smartphone on the desk */
  position?: [number, number, number]
  /** Rotation of the smartphone on the desk */
  rotation?: [number, number, number]
  /** Optional custom contact content override (defaults to CONTACT_CONTENT) */
  content?: ContactContentConfig
}

type InteractiveScreenTargetId = ContactChannelId | 'cta' | null

interface ScreenHotspotRect {
  id: Exclude<InteractiveScreenTargetId, null>
  x: number
  y: number
  w: number
  h: number
  href: string
}

const LOGICAL_SCREEN_W = 1024
const LOGICAL_SCREEN_H = 2160
const SCREEN_RENDER_SCALE = 0.5 // 512x1080 physical canvas (4x faster redraw & VRAM upload)

/**
 * Helper to draw a rounded rectangle path on a 2D canvas context.
 */
function roundRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

/**
 * Helper to wrap multi-line text centered or left-aligned on a 2D canvas context.
 */
function drawWrappedScreenText(
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
    if (ctx.measureText(testLine).width > maxWidth && i > 0) {
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
 * Draws the vector icon for each Contact channel (Email, LinkedIn, GitHub, WhatsApp)
 * inside a 56x56 icon badge centered at (cx, cy).
 */
function drawChannelIcon(
  ctx: CanvasRenderingContext2D,
  id: ContactChannelId,
  cx: number,
  cy: number,
  isActive: boolean,
) {
  ctx.save()
  ctx.strokeStyle = isActive ? '#181917' : '#f5d000'
  ctx.fillStyle = isActive ? '#181917' : '#f5d000'
  ctx.lineWidth = 3.2
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  if (id === 'email') {
    const w = 32
    const h = 22
    roundRectPath(ctx, cx - w / 2, cy - h / 2, w, h, 4)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(cx - w / 2 + 2, cy - h / 2 + 2)
    ctx.lineTo(cx, cy + 2)
    ctx.lineTo(cx + w / 2 - 2, cy - h / 2 + 2)
    ctx.stroke()
  } else if (id === 'linkedin') {
    ctx.font = '700 28px "Space Grotesk", "Inter", sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('in', cx, cy + 1)
  } else if (id === 'github') {
    ctx.font = '700 23px "JetBrains Mono", monospace'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('</>', cx, cy + 1)
  } else if (id === 'whatsapp') {
    ctx.beginPath()
    ctx.arc(cx, cy - 1, 14, 0.25 * Math.PI, 2.05 * Math.PI)
    ctx.lineTo(cx - 14, cy + 14)
    ctx.closePath()
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(cx, cy - 1, 4, 0, Math.PI * 2)
    ctx.fill()
  }

  ctx.restore()
}

/**
 * Renders the complete animated smartphone screen (Lock Screen <-> Unlocked Contact OS)
 * in 1024x2160 logical coordinates onto a 512x1080 physical canvas.
 */
function renderSmartphoneScreen(
  ctx: CanvasRenderingContext2D,
  content: ContactContentConfig,
  unlockProgress: number,
  hoveredTarget: InteractiveScreenTargetId,
  pressedTarget: InteractiveScreenTargetId,
): ScreenHotspotRect[] {
  const width = LOGICAL_SCREEN_W
  const height = LOGICAL_SCREEN_H
  const p = THREE.MathUtils.clamp(unlockProgress, 0, 1)
  const smoothP = p * p * (3 - 2 * p)

  ctx.save()
  ctx.scale(SCREEN_RENDER_SCALE, SCREEN_RENDER_SCALE)

  // 1. Base OLED Obsidian Screen Background
  const bgGrad = ctx.createLinearGradient(0, 0, 0, height)
  bgGrad.addColorStop(0, '#0a0b0a')
  bgGrad.addColorStop(0.5, '#121311')
  bgGrad.addColorStop(1, '#080908')
  ctx.fillStyle = bgGrad
  ctx.fillRect(0, 0, width, height)

  // Subtle radial warm-gold ambient glow
  const ambientGlow = ctx.createRadialGradient(
    width * 0.5,
    height * (0.48 - smoothP * 0.18),
    30,
    width * 0.5,
    height * (0.48 - smoothP * 0.18),
    680,
  )
  ambientGlow.addColorStop(0, 'rgba(245, 208, 0, 0.12)')
  ambientGlow.addColorStop(0.6, 'rgba(245, 208, 0, 0.03)')
  ambientGlow.addColorStop(1, 'rgba(0, 0, 0, 0)')
  ctx.fillStyle = ambientGlow
  ctx.fillRect(0, 0, width, height)

  // ---------------------------------------------------------------------------
  // LAYER A: LOCK SCREEN (Fades & slides upward as unlockProgress -> 1)
  // ---------------------------------------------------------------------------
  if (smoothP < 0.99) {
    const lockAlpha = 1 - smoothP
    const lockOffsetY = -smoothP * 260

    ctx.save()
    ctx.globalAlpha = lockAlpha
    ctx.translate(0, lockOffsetY)

    // Lock Screen Date & Large Clock
    ctx.textAlign = 'center'
    ctx.textBaseline = 'alphabetic'
    ctx.font = '600 36px "JetBrains Mono", "Inter", monospace'
    ctx.fillStyle = 'rgba(220, 218, 212, 0.75)'
    ctx.fillText('DIRECT CHANNEL // ONLINE', width / 2, 276)

    ctx.font = '700 212px "Space Grotesk", "Inter", sans-serif'
    ctx.fillStyle = '#fbf9f3'
    ctx.fillText('09:41', width / 2, 492)

    // Center Lock-Screen Notification Card: "LET'S CONNECT"
    const cardX = 72
    const cardY = 720
    const cardW = width - 144
    const cardH = 520

    ctx.fillStyle = 'rgba(28, 30, 27, 0.92)'
    roundRectPath(ctx, cardX, cardY, cardW, cardH, 56)
    ctx.fill()

    ctx.strokeStyle = 'rgba(245, 208, 0, 0.45)'
    ctx.lineWidth = 5
    roundRectPath(ctx, cardX, cardY, cardW, cardH, 56)
    ctx.stroke()

    // Electric-yellow header pill inside card
    ctx.fillStyle = '#f5d000'
    roundRectPath(ctx, cardX + 56, cardY + 56, 276, 56, 28)
    ctx.fill()

    ctx.textAlign = 'center'
    ctx.font = '700 28px "JetBrains Mono", monospace'
    ctx.fillStyle = '#181917'
    ctx.fillText('CONTACT ME', cardX + 56 + 138, cardY + 94)

    // Pulse dot on top right of card
    ctx.fillStyle = '#f5d000'
    ctx.beginPath()
    ctx.arc(cardX + cardW - 72, cardY + 84, 12, 0, Math.PI * 2)
    ctx.fill()

    // Main Lock Screen Message: "LET'S CONNECT"
    ctx.font = '700 88px "Space Grotesk", "Inter", sans-serif'
    ctx.fillStyle = '#fbf9f3'
    ctx.fillText(content.headline, width / 2, cardY + 264)

    // Electric-yellow underline rule
    ctx.fillStyle = '#f5d000'
    roundRectPath(ctx, width / 2 - 108, cardY + 308, 216, 10, 5)
    ctx.fill()

    ctx.font = '500 40px "Plus Jakarta Sans", "Inter", sans-serif'
    ctx.fillStyle = '#dcdad4'
    ctx.fillText('Tap to open contact channels', width / 2, cardY + 404)

    // Secondary Quick-Action Pills Below Card
    const pillRowY = 1330
    ctx.fillStyle = 'rgba(255, 255, 255, 0.04)'
    roundRectPath(ctx, 72, pillRowY, (cardW - 32) / 2, 136, 36)
    ctx.fill()
    roundRectPath(ctx, 72 + (cardW + 32) / 2, pillRowY, (cardW - 32) / 2, 136, 36)
    ctx.fill()

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'
    ctx.lineWidth = 3
    roundRectPath(ctx, 72, pillRowY, (cardW - 32) / 2, 136, 36)
    ctx.stroke()
    roundRectPath(ctx, 72 + (cardW + 32) / 2, pillRowY, (cardW - 32) / 2, 136, 36)
    ctx.stroke()

    ctx.font = '600 36px "JetBrains Mono", monospace'
    ctx.fillStyle = '#dcdad4'
    ctx.fillText('EMAIL', 72 + (cardW - 32) / 4, pillRowY + 82)
    ctx.fillText('SOCIALS', 72 + (cardW + 32) / 2 + (cardW - 32) / 4, pillRowY + 82)

    ctx.restore()
  }

  // ---------------------------------------------------------------------------
  // LAYER B: UNLOCKED CONTACT OS INTERFACE
  // ---------------------------------------------------------------------------
  const hotspots: ScreenHotspotRect[] = []
  const padX = 64
  const cardW = width - padX * 2

  const listStartY = 670
  const rowH = 216
  const rowGap = 30

  content.channels.forEach((channel, idx) => {
    const rowY = listStartY + idx * (rowH + rowGap)
    hotspots.push({
      id: channel.id,
      x: padX,
      y: rowY,
      w: cardW,
      h: rowH,
      href: channel.href,
    })
  })

  const ctaY = listStartY + content.channels.length * (rowH + rowGap) + 38
  const ctaH = 176
  hotspots.push({
    id: 'cta',
    x: padX,
    y: ctaY,
    w: cardW,
    h: ctaH,
    href: content.ctaHref,
  })

  if (smoothP > 0.01) {
    const appAlpha = smoothP
    const appOffsetY = (1 - smoothP) * 180

    ctx.save()
    ctx.globalAlpha = appAlpha
    ctx.translate(0, appOffsetY)

    // 1. OS App Top Pill ("CONTACT // DIRECT")
    ctx.fillStyle = 'rgba(245, 208, 0, 0.14)'
    roundRectPath(ctx, padX, 168, 340, 54, 27)
    ctx.fill()
    ctx.strokeStyle = 'rgba(245, 208, 0, 0.55)'
    ctx.lineWidth = 2.5
    roundRectPath(ctx, padX, 168, 340, 54, 27)
    ctx.stroke()

    // Status online dot inside pill
    ctx.fillStyle = '#f5d000'
    ctx.beginPath()
    ctx.arc(padX + 34, 195, 9, 0, Math.PI * 2)
    ctx.fill()

    ctx.textAlign = 'left'
    ctx.textBaseline = 'alphabetic'
    ctx.font = '700 24px "JetBrains Mono", monospace'
    ctx.fillStyle = '#f5d000'
    ctx.fillText('AVAILABLE FOR WORK', padX + 58, 204)

    // 2. Main Header: "LET'S CONNECT"
    ctx.font = '700 84px "Space Grotesk", "Inter", sans-serif'
    ctx.fillStyle = '#fbf9f3'
    ctx.fillText(content.headline, padX, 326)

    // Electric-yellow accent rule
    ctx.fillStyle = '#f5d000'
    roundRectPath(ctx, padX, 352, 168, 10, 5)
    ctx.fill()
    ctx.fillStyle = 'rgba(255, 255, 255, 0.14)'
    roundRectPath(ctx, padX + 184, 355, cardW - 184, 4, 2)
    ctx.fill()

    // 3. Intro Message Quote
    ctx.font = '500 38px "Plus Jakarta Sans", "Inter", sans-serif'
    ctx.fillStyle = '#dcdad4'
    drawWrappedScreenText(
      ctx,
      content.message,
      padX,
      432,
      cardW,
      54,
    )

    // Section sub-label above channels
    ctx.font = '700 24px "JetBrains Mono", monospace'
    ctx.fillStyle = '#8e8d87'
    ctx.fillText('SELECT A CHANNEL TO CONNECT', padX, 636)

    // 4. Interactive Contact Option Cards (Email, LinkedIn, GitHub, WhatsApp)
    content.channels.forEach((channel, idx) => {
      const rowY = listStartY + idx * (rowH + rowGap)
      const isRowHovered = hoveredTarget === channel.id
      const isRowPressed = pressedTarget === channel.id

      ctx.save()
      if (isRowPressed) {
        ctx.translate(width / 2, rowY + rowH / 2)
        ctx.scale(0.98, 0.98)
        ctx.translate(-width / 2, -(rowY + rowH / 2))
      }

      // Card background
      ctx.fillStyle = isRowHovered
        ? 'rgba(38, 40, 35, 0.98)'
        : 'rgba(24, 26, 23, 0.95)'
      roundRectPath(ctx, padX, rowY, cardW, rowH, 38)
      ctx.fill()

      // Card border
      ctx.strokeStyle = isRowHovered
        ? '#f5d000'
        : 'rgba(255, 255, 255, 0.14)'
      ctx.lineWidth = isRowHovered ? 5 : 3
      roundRectPath(ctx, padX, rowY, cardW, rowH, 38)
      ctx.stroke()

      // Left Icon Badge
      const badgeSize = 116
      const badgeX = padX + 34
      const badgeY = rowY + (rowH - badgeSize) / 2

      ctx.fillStyle = isRowHovered ? '#f5d000' : 'rgba(245, 208, 0, 0.12)'
      roundRectPath(ctx, badgeX, badgeY, badgeSize, badgeSize, 28)
      ctx.fill()

      ctx.strokeStyle = isRowHovered
        ? '#f5d000'
        : 'rgba(245, 208, 0, 0.45)'
      ctx.lineWidth = 2.5
      roundRectPath(ctx, badgeX, badgeY, badgeSize, badgeSize, 28)
      ctx.stroke()

      drawChannelIcon(
        ctx,
        channel.id,
        badgeX + badgeSize / 2,
        badgeY + badgeSize / 2,
        isRowHovered,
      )

      // Channel Label
      const textX = badgeX + badgeSize + 36
      ctx.textAlign = 'left'
      ctx.textBaseline = 'alphabetic'
      ctx.font = '700 42px "Space Grotesk", "Inter", sans-serif'
      ctx.fillStyle = '#fbf9f3'
      ctx.fillText(channel.label, textX, rowY + 92)

      // Configured Channel Value
      ctx.font = '500 31px "JetBrains Mono", monospace'
      ctx.fillStyle = isRowHovered ? '#f5d000' : '#b8b6af'
      ctx.fillText(channel.value, textX, rowY + 150)

      // Right External Arrow Indicator Circle
      const arrowCx = padX + cardW - 68
      const arrowCy = rowY + rowH / 2
      ctx.fillStyle = isRowHovered ? '#f5d000' : 'rgba(255, 255, 255, 0.06)'
      ctx.beginPath()
      ctx.arc(arrowCx, arrowCy, 32, 0, Math.PI * 2)
      ctx.fill()

      // Diagonal External Link Arrow `↗`
      ctx.strokeStyle = isRowHovered ? '#181917' : '#fbf9f3'
      ctx.lineWidth = 4
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.beginPath()
      ctx.moveTo(arrowCx - 9, arrowCy + 9)
      ctx.lineTo(arrowCx + 9, arrowCy - 9)
      ctx.moveTo(arrowCx - 4, arrowCy - 9)
      ctx.lineTo(arrowCx + 9, arrowCy - 9)
      ctx.lineTo(arrowCx + 9, arrowCy + 4)
      ctx.stroke()

      ctx.restore()
    })

    // 5. Prominent Primary CTA Button: "Get in Touch"
    const isCtaHovered = hoveredTarget === 'cta'
    const isCtaPressed = pressedTarget === 'cta'

    ctx.save()
    if (isCtaPressed) {
      ctx.translate(width / 2, ctaY + ctaH / 2)
      ctx.scale(0.98, 0.98)
      ctx.translate(-width / 2, -(ctaY + ctaH / 2))
    }

    ctx.fillStyle = isCtaHovered ? '#ffe01a' : '#f5d000'
    roundRectPath(ctx, padX, ctaY, cardW, ctaH, 44)
    ctx.fill()

    ctx.strokeStyle = '#fbf9f3'
    ctx.lineWidth = isCtaHovered ? 5 : 0
    if (isCtaHovered) {
      roundRectPath(ctx, padX, ctaY, cardW, ctaH, 44)
      ctx.stroke()
    }

    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.font = '700 46px "Space Grotesk", "Inter", sans-serif'
    ctx.fillStyle = '#181917'
    ctx.fillText(content.ctaLabel.toUpperCase() + '  →', width / 2, ctaY + ctaH / 2 + 2)

    ctx.restore()
    ctx.restore()
  }

  // ---------------------------------------------------------------------------
  // LAYER C: PERSISTENT OS HARDWARE CHROME
  // ---------------------------------------------------------------------------
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.09)'
  ctx.lineWidth = 8
  roundRectPath(ctx, 16, 16, width - 32, height - 32, 118)
  ctx.stroke()

  if (smoothP > 0.15) {
    ctx.save()
    ctx.globalAlpha = smoothP
    ctx.textAlign = 'left'
    ctx.textBaseline = 'alphabetic'
    ctx.font = '700 32px "Space Grotesk", "Inter", sans-serif'
    ctx.fillStyle = '#fbf9f3'
    ctx.fillText('09:41', 76, 98)
    ctx.restore()
  }

  // Dynamic Island Pill Cutout
  const pillW = 296
  const pillH = 74
  const pillX = (width - pillW) / 2
  const pillY = 52
  ctx.fillStyle = '#030303'
  roundRectPath(ctx, pillX, pillY, pillW, pillH, 37)
  ctx.fill()

  ctx.fillStyle = '#151821'
  ctx.beginPath()
  ctx.arc(pillX + pillW - 48, pillY + pillH / 2, 14, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = 'rgba(90, 140, 255, 0.48)'
  ctx.beginPath()
  ctx.arc(pillX + pillW - 52, pillY + pillH / 2 - 4, 5, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = '#f5d000'
  ctx.beginPath()
  ctx.arc(pillX + 48, pillY + pillH / 2, 8, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = 'rgba(251, 249, 243, 0.8)'
  ctx.fillRect(width - 192, 86, 8, 16)
  ctx.fillRect(width - 178, 80, 8, 22)
  ctx.fillRect(width - 164, 74, 8, 28)
  ctx.strokeStyle = 'rgba(251, 249, 243, 0.8)'
  ctx.lineWidth = 4
  roundRectPath(ctx, width - 136, 74, 56, 28, 6)
  ctx.stroke()
  ctx.fillStyle = '#f5d000'
  ctx.fillRect(width - 130, 80, 40, 16)

  const sheenGrad = ctx.createLinearGradient(0, 0, width, height * 0.65)
  sheenGrad.addColorStop(0, 'rgba(255, 255, 255, 0.045)')
  sheenGrad.addColorStop(0.35, 'rgba(255, 255, 255, 0.012)')
  sheenGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0)')
  ctx.fillStyle = sheenGrad
  ctx.fillRect(0, 0, width, height)

  ctx.fillStyle = 'rgba(251, 249, 243, 0.7)'
  roundRectPath(ctx, (width - 328) / 2, height - 52, 328, 14, 7)
  ctx.fill()

  ctx.restore()
  return hotspots
}

function triggerContactAction(href: string) {
  if (typeof window === 'undefined' || !href) return

  if (href.startsWith('mailto:')) {
    window.location.href = href
  } else {
    window.open(href, '_blank', 'noopener,noreferrer')
  }
}

export function ContactSmartphone({
  position = [0.56, 0.759, 0.23],
  rotation = [0, -0.26, 0],
  content = CONTACT_CONTENT,
}: ContactSmartphoneProps) {
  const { activeObject, isSmartphoneOpen, isAnyObjectOpen, openSmartphone } = useWorkspaceFocus()
  const [isHovered, setIsHovered] = useState(false)

  const prefersReducedMotion = useMemo(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    [],
  )

  const groupRef = useRef<THREE.Group>(null)
  const glowRingMaterialRef = useRef<THREE.MeshBasicMaterial>(null)
  const screenMaterialRef = useRef<THREE.MeshStandardMaterial>(null)
  const accentMaterialRef = useRef<THREE.MeshStandardMaterial>(null)

  const hoverProgressRef = useRef(0)
  const unlockProgressRef = useRef(0)

  const hoveredScreenTargetRef = useRef<InteractiveScreenTargetId>(null)
  const pressedScreenTargetRef = useRef<InteractiveScreenTargetId>(null)
  const hotspotsRef = useRef<ScreenHotspotRect[]>([])
  const needsScreenRedrawRef = useRef<boolean>(true)
  const pressTimeoutRef = useRef<number | null>(null)

  // Create the 512x1080 screen canvas and texture once (75% less pixel fill cost than 1024x2160)
  const { screenCtx, screenTexture } = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(LOGICAL_SCREEN_W * SCREEN_RENDER_SCALE)
    canvas.height = Math.round(LOGICAL_SCREEN_H * SCREEN_RENDER_SCALE)
    const ctx = canvas.getContext('2d')!
    const texture = new THREE.CanvasTexture(canvas)
    texture.colorSpace = THREE.SRGBColorSpace
    texture.anisotropy = 4
    texture.generateMipmaps = false
    texture.minFilter = THREE.LinearFilter
    return { screenCtx: ctx, screenTexture: texture }
  }, [])

  // Perform initial lock-screen draw and clean up resources on unmount
  useEffect(() => {
    hotspotsRef.current = renderSmartphoneScreen(
      screenCtx,
      content,
      unlockProgressRef.current,
      hoveredScreenTargetRef.current,
      pressedScreenTargetRef.current,
    )
    screenTexture.needsUpdate = true

    return () => {
      if (pressTimeoutRef.current !== null) {
        window.clearTimeout(pressTimeoutRef.current)
      }
      screenTexture.dispose()
      document.body.style.cursor = 'auto'
    }
  }, [content, screenCtx, screenTexture])

  const getHotspotFromUV = useCallback((uv?: THREE.Vector2): ScreenHotspotRect | null => {
    if (!uv) return null
    const cx = uv.x * LOGICAL_SCREEN_W
    const cy = (1 - uv.y) * LOGICAL_SCREEN_H
    for (const spot of hotspotsRef.current) {
      if (
        cx >= spot.x &&
        cx <= spot.x + spot.w &&
        cy >= spot.y &&
        cy <= spot.y + spot.h
      ) {
        return spot
      }
    }
    return null
  }, [])

  const handleGroupPointerOver = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation()
      if (activeObject !== null && !isSmartphoneOpen) return
      if (!isSmartphoneOpen) {
        setIsHovered(true)
        document.body.style.cursor = 'pointer'
      }
    },
    [activeObject, isSmartphoneOpen],
  )

  const handleGroupPointerOut = useCallback((e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    setIsHovered(false)
    if (hoveredScreenTargetRef.current !== null) {
      hoveredScreenTargetRef.current = null
      needsScreenRedrawRef.current = true
    }
    document.body.style.cursor = 'auto'
  }, [])

  const handleScreenPointerMove = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      if (!isSmartphoneOpen) return
      e.stopPropagation()
      const hit = getHotspotFromUV(e.uv)
      const nextId = hit ? hit.id : null
      if (hoveredScreenTargetRef.current !== nextId) {
        hoveredScreenTargetRef.current = nextId
        needsScreenRedrawRef.current = true
      }
      document.body.style.cursor = nextId ? 'pointer' : 'default'
    },
    [getHotspotFromUV, isSmartphoneOpen],
  )

  const handleScreenPointerDown = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      if (!isSmartphoneOpen) return
      e.stopPropagation()
      const hit = getHotspotFromUV(e.uv)
      if (hit) {
        pressedScreenTargetRef.current = hit.id
        needsScreenRedrawRef.current = true
      }
    },
    [getHotspotFromUV, isSmartphoneOpen],
  )

  const handleScreenPointerUp = useCallback(() => {
    if (pressedScreenTargetRef.current !== null) {
      pressedScreenTargetRef.current = null
      needsScreenRedrawRef.current = true
    }
  }, [])

  const handleClick = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation()

      if (!isSmartphoneOpen) {
        if (activeObject === null) {
          setIsHovered(false)
          document.body.style.cursor = 'auto'
          openSmartphone()
        }
        return
      }

      if (unlockProgressRef.current > 0.6) {
        const hit = getHotspotFromUV(e.uv)
        if (hit) {
          pressedScreenTargetRef.current = hit.id
          needsScreenRedrawRef.current = true
          if (pressTimeoutRef.current !== null) {
            window.clearTimeout(pressTimeoutRef.current)
          }
          pressTimeoutRef.current = window.setTimeout(() => {
            pressedScreenTargetRef.current = null
            needsScreenRedrawRef.current = true
          }, 180)

          triggerContactAction(hit.href)
        }
      }
    },
    [activeObject, getHotspotFromUV, isSmartphoneOpen, openSmartphone],
  )

  // Realistic flagship smartphone dimensions (approx 7.6cm × 15.8cm × 0.82cm)
  const width = 0.076
  const length = 0.158
  const thickness = 0.0082

  // Smoothly animate hover highlight, phone rotation alignment, and Lock Screen -> Contact OS transition
  useFrame((_, delta) => {
    const hoverTarget = isHovered && activeObject === null ? 1 : 0
    const unlockTarget = isSmartphoneOpen ? 1 : 0

    // Early-exit when idle and no screen redraw is queued
    if (
      !needsScreenRedrawRef.current &&
      Math.abs(hoverProgressRef.current - hoverTarget) < 0.001 &&
      Math.abs(unlockProgressRef.current - unlockTarget) < 0.001
    ) {
      return
    }

    const dt = Math.min(delta, 0.1)

    // 1. Desk hover interpolation
    const hoverFactor = 1 - Math.exp(-10 * dt)
    hoverProgressRef.current += (hoverTarget - hoverProgressRef.current) * hoverFactor
    const hp = hoverProgressRef.current

    // 2. Smartphone screen unlock & straightening interpolation
    const unlockSpeed = prefersReducedMotion ? 16 : isSmartphoneOpen ? 3.4 : 5.0
    const unlockFactor = 1 - Math.exp(-unlockSpeed * dt)
    const prevUnlock = unlockProgressRef.current
    unlockProgressRef.current = THREE.MathUtils.lerp(
      unlockProgressRef.current,
      unlockTarget,
      unlockFactor,
    )

    if (Math.abs(unlockProgressRef.current - prevUnlock) > 0.008) {
      needsScreenRedrawRef.current = true
    }

    const rawUnlock = THREE.MathUtils.clamp(
      isSmartphoneOpen
        ? (unlockProgressRef.current - 0.15) / 0.85
        : unlockProgressRef.current,
      0,
      1,
    )
    const smoothUnlock = rawUnlock * rawUnlock * (3 - 2 * rawUnlock)

    if (groupRef.current) {
      groupRef.current.position.y = position[1] + hp * 0.0016
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        rotation[1],
        0,
        smoothUnlock,
      )
    }

    if (glowRingMaterialRef.current) {
      glowRingMaterialRef.current.opacity = hp * 0.65
    }

    if (screenMaterialRef.current) {
      screenMaterialRef.current.emissiveIntensity = THREE.MathUtils.lerp(
        0.55 + hp * 0.3,
        0.92,
        smoothUnlock,
      )
    }

    if (accentMaterialRef.current) {
      accentMaterialRef.current.emissiveIntensity = 0.25 + hp * 0.65
    }

    // Redraw the 512x1080 CanvasTexture only when unlock transition or button hover/tap state changes
    if (needsScreenRedrawRef.current) {
      needsScreenRedrawRef.current = false
      hotspotsRef.current = renderSmartphoneScreen(
        screenCtx,
        content,
        smoothUnlock,
        hoveredScreenTargetRef.current,
        pressedScreenTargetRef.current,
      )
      screenTexture.needsUpdate = true
    }
  })

  return (
    <group
      ref={groupRef}
      name="InteractiveObject_ContactSmartphone"
      userData={{
        interactiveId: 'contact-smartphone',
        section: 'contact',
        label: "LET'S CONNECT",
      }}
      position={position}
      rotation={rotation}
      onPointerOver={handleGroupPointerOver}
      onPointerOut={handleGroupPointerOut}
      onClick={handleClick}
    >
      {/* Subtle Aureolin (#f5d000) Hover Halo Ring on the Desk Surface */}
      <mesh position={[0, 0.0008, 0]} rotation={[-Math.PI / 2, 0, 0]} raycast={() => null}>
        <ringGeometry args={[0.088, 0.098, 36]} />
        <meshBasicMaterial
          ref={glowRingMaterialRef}
          color="#f5d000"
          transparent
          opacity={0}
          depthWrite={false}
        />
      </mesh>

      {/* Subtle Hover Perimeter Frame closely hugging the smartphone footprint */}
      <RoundedBox
        args={[width + 0.007, 0.0018, length + 0.007]}
        position={[0, 0.0012, 0]}
        radius={0.009}
        smoothness={2}
        raycast={() => null}
      >
        <meshBasicMaterial
          color="#f5d000"
          transparent
          opacity={isHovered && activeObject === null ? 0.6 : 0}
          depthWrite={false}
        />
      </RoundedBox>

      {/* Floating Interactive Beacon Indicator */}
      <InteractiveObjectBeacon
        position={[0, 0.05, 0]}
        isHovered={isHovered}
        isOpen={isSmartphoneOpen}
        isAnyObjectOpen={isAnyObjectOpen}
        distanceFactor={2.2}
      />

      {/* 1. Rear Camera Bump Pad */}
      <RoundedBox
        args={[0.026, 0.0016, 0.028]}
        position={[-width * 0.22, 0.0008, -length * 0.32]}
        radius={0.003}
        smoothness={2}
        castShadow
        raycast={() => null}
      >
        <meshStandardMaterial color="#181917" roughness={0.3} metalness={0.85} />
      </RoundedBox>

      {/* 2. Brushed Dark Titanium Metallic Outer Frame */}
      <RoundedBox
        args={[width, thickness, length]}
        position={[0, thickness / 2 + 0.0006, 0]}
        radius={0.0038}
        smoothness={2}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          color="#262825"
          roughness={0.26}
          metalness={0.88}
        />
      </RoundedBox>

      {/* 3. Slim Obsidian Inner Bezel Insert */}
      <RoundedBox
        args={[width - 0.0022, thickness + 0.0004, length - 0.0022]}
        position={[0, thickness / 2 + 0.0007, 0]}
        radius={0.0032}
        smoothness={2}
        raycast={() => null}
      >
        <meshStandardMaterial
          color="#0d0e0c"
          roughness={0.18}
          metalness={0.4}
        />
      </RoundedBox>

      {/* 4. Illuminated Interactive OLED Glass Screen (Lock Screen <-> Contact OS) */}
      <mesh
        position={[0, thickness + 0.001, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        onPointerMove={handleScreenPointerMove}
        onPointerDown={handleScreenPointerDown}
        onPointerUp={handleScreenPointerUp}
      >
        <planeGeometry args={[width - 0.005, length - 0.005]} />
        <meshStandardMaterial
          ref={screenMaterialRef}
          map={screenTexture}
          emissiveMap={screenTexture}
          emissive="#ffffff"
          emissiveIntensity={0.55}
          roughness={0.12}
          metalness={0.15}
        />
      </mesh>

      {/* 5. Physical Metallic Side Buttons */}
      <RoundedBox
        args={[0.0018, 0.0026, 0.018]}
        position={[width / 2 + 0.0006, thickness / 2 + 0.0006, -0.022]}
        radius={0.0006}
        smoothness={2}
        raycast={() => null}
      >
        <meshStandardMaterial
          ref={accentMaterialRef}
          color="#f5d000"
          roughness={0.25}
          metalness={0.75}
          emissive="#f5d000"
          emissiveIntensity={0.25}
        />
      </RoundedBox>

      <RoundedBox
        args={[0.0016, 0.0024, 0.014]}
        position={[-width / 2 - 0.0005, thickness / 2 + 0.0006, -0.032]}
        radius={0.0005}
        smoothness={2}
        raycast={() => null}
      >
        <meshStandardMaterial color="#383a36" roughness={0.28} metalness={0.88} />
      </RoundedBox>

      <RoundedBox
        args={[0.0016, 0.0024, 0.014]}
        position={[-width / 2 - 0.0005, thickness / 2 + 0.0006, -0.012]}
        radius={0.0005}
        smoothness={2}
        raycast={() => null}
      >
        <meshStandardMaterial color="#383a36" roughness={0.28} metalness={0.88} />
      </RoundedBox>

      <mesh position={[0, thickness / 2 + 0.0006, length / 2 + 0.0002]} raycast={() => null}>
        <boxGeometry args={[0.01, 0.0022, 0.001]} />
        <meshStandardMaterial color="#090908" roughness={0.5} metalness={0.6} />
      </mesh>
    </group>
  )
}
