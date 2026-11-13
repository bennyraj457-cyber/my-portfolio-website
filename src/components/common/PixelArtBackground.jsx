import React, { useEffect, useRef } from 'react'
import heroPixelArtSrc from '../../assets/pixel-art-hero.jpg'

/**
 * PixelArtBackground
 *
 * Renders the iconic scene (creator typing on a CRT computer in an open field)
 * reimagined through your portfolio's dithered color palette (#ffd700, white, charcoal/black):
 * - Samples the scene into discrete macro-pixels matching the pixel aesthetic
 * - Maps the image tones cleanly to our brand colors:
 *     - Sky / bright areas -> Clean white space (#ffffff) with fine dither dots (#fffadc)
 *     - Field & grass -> Subtle yellow dither gradients (#ffd700, #ffe766, #fff3b0)
 *     - Creator in suit & CRT computer shadows -> Deep contrast black/charcoal (#1a1a1a)
 *     - Glowing CRT monitor screen & chair accents -> Golden highlight (#ffd700)
 * - Keeps central text readability clear with dynamic soft clearing
 * - Subtle ambient CRT monitor pulse
 */
export default function PixelArtBackground({
  className = '',
  pixelSize = 8, // Crisp retro pixel block size
  interactive = true,
  standAlone = false,
}) {
  const canvasRef = useRef(null)
  const imageRef = useRef(null)
  const rafId = useRef(null)
  const mouseRef = useRef({ x: -1000, y: -1000, radius: 45 })

  useEffect(() => {
    const img = new Image()
    img.src = heroPixelArtSrc
    img.onload = () => {
      imageRef.current = img
      initAndRender()
    }

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    let width = 0
    let height = 0
    let sampledPixels = []

    const initAndRender = () => {
      if (!imageRef.current) return
      const parent = canvas.parentElement || document.body
      width = canvas.width = parent.clientWidth || window.innerWidth
      height = canvas.height = parent.clientHeight || window.innerHeight

      // 1. Offscreen canvas for aspect-ratio covering and pixel sampling
      const offCanvas = document.createElement('canvas')
      const cols = Math.ceil(width / pixelSize)
      const rows = Math.ceil(height / pixelSize)
      offCanvas.width = cols
      offCanvas.height = rows
      const offCtx = offCanvas.getContext('2d')

      // Cover-fit image calculation
      const img = imageRef.current
      const imgRatio = img.width / img.height
      const canvasRatio = cols / rows

      let drawW, drawH, drawX, drawY
      if (canvasRatio > imgRatio) {
        drawW = cols
        drawH = cols / imgRatio
        drawX = 0
        drawY = (rows - drawH) / 2
      } else {
        drawH = rows
        drawW = rows * imgRatio
        drawX = (cols - drawW) / 2
        drawY = 0
      }

      offCtx.drawImage(img, drawX, drawY, drawW, drawH)
      const imgData = offCtx.getImageData(0, 0, cols, rows).data

      // 2. Map sampled pixels to our brand palette (#ffd700, whites, dark charcoals)
      sampledPixels = []
      const cx = cols / 2
      const cy = rows * 0.42

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const idx = (r * cols + c) * 4
          const red = imgData[idx]
          const green = imgData[idx + 1]
          const blue = imgData[idx + 2]
          const alpha = imgData[idx + 3]

          if (alpha < 30) continue

          // Perceived luminance (0 to 255)
          const lum = 0.299 * red + 0.587 * green + 0.114 * blue

          // Color detection in original image:
          const isSky = blue > red * 1.15 && blue > 100 && lum > 80
          const isGrass = green > red && green > blue * 0.9 && lum > 60
          const isDeepDark = lum < 55
          const isMonitor = c > cols * 0.55 && c < cols * 0.85 && r > rows * 0.45 && r < rows * 0.75 && blue > 140

          // Center headline buffer (only if used as full background, disabled when standAlone right column)
          let textAvoidFactor = 1.0
          if (!standAlone) {
            const dx = (c - cx) / (cols * 0.42)
            const dy = (r - cy) / (rows * 0.35)
            const distCenter = Math.sqrt(dx * dx + dy * dy)
            textAvoidFactor = distCenter < 1.0 ? distCenter * 0.4 : 1.0
          }

          // Map color to our design system
          let color = null
          let dotAlpha = textAvoidFactor

          if (isMonitor) {
            // CRT monitor glows in brand yellow
            color = '#ffd700'
            dotAlpha = 0.95
          } else if (isDeepDark) {
            // Suit, desk shadow, chair structure
            color = '#111111'
            dotAlpha = standAlone ? 0.95 : Math.min(0.85, 0.2 + textAvoidFactor * 0.65)
          } else if (isSky) {
            // Sky represented by white negative space with soft dither
            const dither = (c * 11 + r * 17) % (standAlone ? 9 : 19) === 0
            if (dither && lum > 140) {
              color = '#ffe766'
              dotAlpha = standAlone ? 0.4 : 0.25 * textAvoidFactor
            } else {
              color = null // Clear white space
            }
          } else if (isGrass) {
            // Rolling hill & grass field mapped to rich brand yellows and halftone dither
            if (lum < 95) {
              color = '#caa700' // Darker field shading
              dotAlpha = standAlone ? 0.85 : 0.65 * textAvoidFactor
            } else if (lum < 140) {
              color = '#ffd700' // Primary gold
              dotAlpha = standAlone ? 0.8 : 0.55 * textAvoidFactor
            } else {
              color = (c + r) % 2 === 0 ? '#ffe766' : '#fff3b0' // Soft pale yellow
              dotAlpha = standAlone ? 0.65 : 0.45 * textAvoidFactor
            }
          } else {
            // Intermediate tones / chair woodwork / CRT beige casing
            if (lum < 110) {
              color = '#222222'
              dotAlpha = standAlone ? 0.9 : 0.7
            } else if (lum < 170) {
              color = '#ffd700'
              dotAlpha = standAlone ? 0.85 : 0.6
            } else {
              color = '#ffe766'
              dotAlpha = standAlone ? 0.5 : 0.3
            }
          }

          if (color && dotAlpha > 0.05) {
            sampledPixels.push({
              x: c * pixelSize,
              y: r * pixelSize,
              size: pixelSize - 1, // 1px clean grid separation
              color,
              baseAlpha: dotAlpha,
              isMonitor,
            })
          }
        }
      }
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height)
      const now = performance.now()
      const mouse = mouseRef.current

      // Monitor gentle pulse
      const monitorPulse = 0.85 + Math.sin(now * 0.005) * 0.15

      for (let i = 0; i < sampledPixels.length; i++) {
        const p = sampledPixels[i]

        let alpha = p.baseAlpha
        if (p.isMonitor) {
          alpha = monitorPulse
        }

        // Subtle interactive hover disperse on mouse proximity
        const dx = (p.x + p.size / 2) - mouse.x
        const dy = (p.y + p.size / 2) - mouse.y
        const dist = Math.sqrt(dx * dx + dy * dy)

        let offsetX = 0
        let offsetY = 0

        if (dist < mouse.radius) {
          const force = (1 - dist / mouse.radius) * 8
          offsetX = (dx / dist) * force
          offsetY = (dy / dist) * force
          alpha = Math.min(1.0, alpha + 0.3)
        }

        ctx.globalAlpha = alpha
        ctx.fillStyle = p.color
        ctx.fillRect(
          Math.floor(p.x + offsetX),
          Math.floor(p.y + offsetY),
          p.size,
          p.size
        )
      }
      ctx.globalAlpha = 1.0

      rafId.current = requestAnimationFrame(render)
    }

    render()

    const handleResize = () => {
      initAndRender()
    }

    const handleMouseMove = (e) => {
      if (!interactive) return
      const rect = canvas.getBoundingClientRect()
      mouseRef.current.x = e.clientX - rect.left
      mouseRef.current.y = e.clientY - rect.top
    }

    const handleMouseLeave = () => {
      mouseRef.current.x = -1000
      mouseRef.current.y = -1000
    }

    window.addEventListener('resize', handleResize)
    if (interactive) {
      window.addEventListener('mousemove', handleMouseMove, { passive: true })
      window.addEventListener('mouseleave', handleMouseLeave)
    }

    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current)
      window.removeEventListener('resize', handleResize)
      if (interactive) {
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseleave', handleMouseLeave)
      }
    }
  }, [pixelSize, interactive, standAlone])

  return (
    <canvas
      ref={canvasRef}
      className={`block w-full h-full pointer-events-auto ${className}`}
      aria-hidden="true"
    />
  )
}

