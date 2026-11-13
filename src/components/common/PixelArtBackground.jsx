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

          // Color detection & tonal categorization
          const isSky = blue > red * 1.12 && blue > 85 && lum > 75
          const isGrass = green > red * 0.95 && green > blue * 0.85 && lum > 45
          const isDeepDark = lum < 40 // Sharp silhouettes: hair, suit, chair frame, keyboard shadow
          const isSuitMid = lum >= 40 && lum < 70 && red < 80 && green < 80 && blue < 95
          
          // CRT Monitor Screen highlight & casing
          const isMonitorScreen = c > cols * 0.58 && c < cols * 0.82 && r > rows * 0.44 && r < rows * 0.68 && blue > 130
          const isDeskOrChair = red > blue && red > green && lum > 50 && lum < 150

          let color = null
          let dotAlpha = 0.9

          if (isMonitorScreen) {
            // Glowing CRT Screen
            color = '#ffd700'
            dotAlpha = 0.98
          } else if (isDeepDark) {
            // Pitch black silhouettes & line ink
            color = '#050505'
            dotAlpha = 1.0
          } else if (isSuitMid) {
            // Deep charcoal folds in the suit & shadows
            color = '#1f1f1f'
            dotAlpha = 0.95
          } else if (isDeskOrChair) {
            // Warm amber & wooden tones of desk and chair
            if (lum < 90) {
              color = '#8b6f00' // Dark timber
            } else if (lum < 130) {
              color = '#b89400' // Medium wood
            } else {
              color = '#ffd700' // Wood highlights
            }
            dotAlpha = 0.9
          } else if (isSky) {
            // Sky: dynamic dithered gradient from light golden sky to pale white
            const skyHeightRatio = r / (rows * 0.55) // 0 at top to 1 at horizon
            const ditherLevel = (c * 7 + r * 13) % 17

            if (skyHeightRatio < 0.35) {
              // Upper sky - fine subtle dither
              if (ditherLevel === 0) {
                color = '#fff6b8'
                dotAlpha = 0.35
              } else {
                color = null // Clean white
              }
            } else if (skyHeightRatio < 0.7) {
              // Mid sky
              if (ditherLevel < 3) {
                color = '#ffe766'
                dotAlpha = 0.45
              } else {
                color = null
              }
            } else {
              // Horizon glow
              if (ditherLevel < 6) {
                color = '#ffd700'
                dotAlpha = 0.55
              } else {
                color = '#fffadc'
                dotAlpha = 0.4
              }
            }
          } else if (isGrass) {
            // Multi-shade textured grass hill with dappled highlights
            if (lum < 70) {
              color = '#5a4900' // Deep grass shadow
              dotAlpha = 0.92
            } else if (lum < 95) {
              color = '#876e00' // Mid-dark grass
              dotAlpha = 0.88
            } else if (lum < 125) {
              color = '#caa700' // Olive-gold grass
              dotAlpha = 0.85
            } else if (lum < 155) {
              color = '#ffd700' // Primary gold sunlit grass
              dotAlpha = 0.82
            } else if (lum < 185) {
              color = '#ffe766' // Bright yellow blades
              dotAlpha = 0.78
            } else {
              // White/cream flower sparkles in the meadow
              color = '#ffffff'
              dotAlpha = 0.95
            }
          } else {
            // CRT monitor casing (beige / warm grey plastic)
            if (lum < 100) {
              color = '#333333'
              dotAlpha = 0.85
            } else if (lum < 160) {
              color = '#d4af37'
              dotAlpha = 0.85
            } else {
              color = '#fffadc'
              dotAlpha = 0.9
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

