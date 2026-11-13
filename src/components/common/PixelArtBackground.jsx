import React, { useEffect, useRef } from 'react'
import retroCoderImg from '../../assets/images/retro-coder.png'
import { personalInfo } from '../../data/personalInfo'

/**
 * PixelArtBackground
 *
 * Renders the coder artwork with the hero text ("Designer who ships with vision" & bio)
 * woven DIRECTLY into the image pixels in the open sky space:
 * - The headline and bio are burned directly into the pixel grid using our brand pixel palette.
 * - Headline renders in bold deep ink (#121212) and primary gold (#ffd700).
 * - Sequential in-effect: pixels crystallize organically outward.
 * - Interactive: Gentle tactile cursor repulsion when hovering near any pixel.
 */
export default function PixelArtBackground({
  className = '',
  pixelSize = 6, // 6px discrete pixels
  opacity = 0.95,
}) {
  const canvasRef = useRef(null)
  const particlesRef = useRef([])
  const rafId = useRef(null)
  const mouseRef = useRef({ x: -1000, y: -1000, radius: 45 })

  const { headlineLine1, headlineLine2, bio } = personalInfo

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.src = retroCoderImg

    let isCancelled = false

    img.onload = () => {
      if (isCancelled) return

      let width = 0
      let height = 0

      const setupParticles = () => {
        const parent = canvas.parentElement || document.body
        width = canvas.width = parent.clientWidth || window.innerWidth
        height = canvas.height = parent.clientHeight || window.innerHeight

        const blockSize = Math.max(5, pixelSize)
        const cols = Math.ceil(width / blockSize)
        const rows = Math.ceil(height / blockSize)

        // Offscreen canvas to downsample image & rasterize embedded headline text
        const offCanvas = document.createElement('canvas')
        offCanvas.width = cols
        offCanvas.height = rows
        const offCtx = offCanvas.getContext('2d')

        // Aspect ratio cover calculation
        const imgRatio = img.width / img.height
        const targetRatio = width / height

        let drawW, drawH, drawX, drawY
        if (targetRatio > imgRatio) {
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

        // 1. First capture the pure background image data (without text)
        offCtx.drawImage(img, drawX, drawY, drawW, drawH)
        const bgImgData = offCtx.getImageData(0, 0, cols, rows).data

        // 2. Measure & draw characters letter-by-letter to get precise letter timings
        const textCanvas = document.createElement('canvas')
        textCanvas.width = cols
        textCanvas.height = rows
        const textCtx = textCanvas.getContext('2d')

        // Responsive font sizing based on grid columns & portrait/landscape mode
        const isPortrait = height > width
        const baseRatio = isPortrait ? cols * 0.08 : cols * 0.045
        const textFontSize = Math.max(16, Math.min(baseRatio, 36))

        const textCenterX = cols * 0.5
        const textCenterY = isPortrait
          ? Math.max(textFontSize * 2.5, rows * 0.22)
          : Math.max(textFontSize * 2.0, rows * 0.26)

        const fontStr = `italic 700 ${textFontSize}px "TRJN DaVinci", "TRJN DaVinci Text", serif`
        textCtx.font = fontStr
        textCtx.textBaseline = 'middle'

        const lines = [
          { text: headlineLine1 || 'Designer who', y: textCenterY - textFontSize * 0.65 },
          { text: headlineLine2 || 'ships with Code', y: textCenterY + textFontSize * 0.65 },
        ]

        // Map pixel key -> letter reveal delay
        const textPixelTimings = new Map()
        let globalLetterIdx = 0
        const baseStartDelay = 1100 // Starts smoothly after background image settles

        lines.forEach((lineObj) => {
          const fullLine = lineObj.text
          const fullWidth = textCtx.measureText(fullLine).width
          let curX = textCenterX - fullWidth / 2

          for (let ch = 0; ch < fullLine.length; ch++) {
            const char = fullLine[ch]
            const charWidth = textCtx.measureText(char).width

            if (char.trim() !== '') {
              // Draw single character to offscreen canvas
              textCtx.clearRect(0, 0, cols, rows)
              textCtx.fillText(char, curX, lineObj.y)

              const x1 = Math.max(0, Math.floor(curX - 2))
              const x2 = Math.min(cols, Math.ceil(curX + charWidth + 2))
              const y1 = Math.max(0, Math.floor(lineObj.y - textFontSize * 0.7))
              const y2 = Math.min(rows, Math.ceil(lineObj.y + textFontSize * 0.7))

              const cData = textCtx.getImageData(0, 0, cols, rows).data
              // Letter reveal cadence: 85ms between letter starts
              const letterDelay = baseStartDelay + globalLetterIdx * 85

              for (let y = y1; y < y2; y++) {
                for (let x = x1; x < x2; x++) {
                  const idx = (y * cols + x) * 4
                  if (cData[idx + 3] > 30) {
                    // Small micro jitter within character so pixels in the letter don't look artificial
                    const jitter = Math.random() * 60
                    textPixelTimings.set(`${y},${x}`, letterDelay + jitter)
                  }
                }
              }
              globalLetterIdx++
            } else {
              globalLetterIdx += 0.4 // Small space pause
            }

            curX += charWidth
          }
        })

        // Palette mapping:
        // 0: Deep Ink / Text (#0a0a0a)
        // 1: Primary Gold (#ffd700)
        // 2: Warm Light Yellow (#ffe766)
        // 3: Soft Pale Cream (#fffadc)
        // 4: Clean White (#ffffff)
        const palette = [
          { r: 10, g: 10, b: 10, hex: '#0a0a0a' },
          { r: 255, g: 215, b: 0, hex: '#ffd700' },
          { r: 255, g: 231, b: 102, hex: '#ffe766' },
          { r: 255, g: 250, b: 220, hex: '#fffadc' },
          { r: 255, g: 255, b: 255, hex: '#ffffff' },
        ]

        const getTargetColor = (r, g, b) => {
          const lum = 0.299 * r + 0.587 * g + 0.114 * b
          if (lum < 52) return palette[0]
          if (lum < 118) return palette[1]
          if (lum < 185) return palette[2]
          if (lum < 240) return palette[3]
          return palette[4]
        }

        const newParticles = []
        const now = performance.now()
        const cx = cols / 2
        const cy = rows * 0.5

        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const idx = (r * cols + c) * 4
            const rVal = bgImgData[idx]
            const gVal = bgImgData[idx + 1]
            const bVal = bgImgData[idx + 2]
            const aVal = bgImgData[idx + 3]

            // Check if this pixel has embedded text on it from our letter-by-letter timing map
            const letterTiming = textPixelTimings.get(`${r},${c}`)
            const isTextPixel = letterTiming !== undefined

            // If it's outside the artwork and has no text, skip
            if (aVal < 20 && !isTextPixel) continue

            // Initial color from background image (what shows when image pixels first appear)
            const bgDefault = aVal >= 20 ? getTargetColor(rVal, gVal, bVal) : palette[3]
            // Skip pure white pixels
            if (bgDefault.hex === '#ffffff' && !isTextPixel) continue

            // Target text color: deep dark ink (#0a0a0a)
            const targetColor = isTextPixel ? palette[0] : bgDefault

            const originX = c * blockSize
            const originY = r * blockSize

            // Image pixel arrival delay (waves in first: 100ms - 900ms)
            const dx = (c - cx) / (cols / 2)
            const dy = (r - cy) / (rows / 2)
            const dist = Math.sqrt(dx * dx + dy * dy)
            const initialDelay = 100 + dist * 600 + Math.random() * 180

            // Text reveal delay: letter by letter
            const textRevealDelay = isTextPixel ? letterTiming : 0

            newParticles.push({
              originX,
              originY,
              x: originX,
              y: originY + (Math.random() - 0.5) * 6,
              vx: 0,
              vy: 0,
              size: blockSize - 0.4,
              // Initial image colors
              initHex: bgDefault.hex,
              initR: bgDefault.r,
              initG: bgDefault.g,
              initB: bgDefault.b,
              // Final target colors (switches to ink if text pixel)
              targetHex: targetColor.hex,
              targetR: targetColor.r,
              targetG: targetColor.g,
              targetB: targetColor.b,
              isTextPixel,
              initialDelay,
              textRevealDelay,
              startTime: now,
              fadeInDuration: 280 + Math.random() * 120,
              textShiftDuration: 320 + Math.random() * 100, // Smooth individual color shift
            })
          }
        }

        particlesRef.current = newParticles
      }

      setupParticles()

      // High-performance animation loop
      const render = () => {
        const now = performance.now()
        const particles = particlesRef.current
        const mouse = mouseRef.current
        const mouseActive = mouse.x > -500
        const mouseRadius = mouse.radius
        const mouseRadiusSq = mouseRadius * mouseRadius

        ctx.clearRect(0, 0, width, height)
        ctx.globalAlpha = opacity

        for (let i = 0; i < particles.length; i++) {
          const p = particles[i]
          const elapsed = now - p.startTime

          // 1. Initial Image Pixel Arrival Check
          if (elapsed < p.initialDelay) {
            continue
          }

          const rawAppear = Math.min(1, (elapsed - p.initialDelay) / p.fadeInDuration)
          const appearProgress = 1 - Math.pow(1 - rawAppear, 3)

          // Mouse displacement
          if (mouseActive) {
            const dxM = p.x - mouse.x
            const dyM = p.y - mouse.y
            const distSq = dxM * dxM + dyM * dyM

            if (distSq < mouseRadiusSq && distSq > 0.01) {
              const dist = Math.sqrt(distSq)
              const force = (1 - dist / mouseRadius) * 4.5
              p.vx += (dxM / dist) * force
              p.vy += (dyM / dist) * force
            }
          }

          // Spring dampening back to origin coordinate
          const dx = p.originX - p.x
          const dy = p.originY - p.y

          if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1 || Math.abs(p.vx) > 0.1 || Math.abs(p.vy) > 0.1) {
            p.vx += dx * 0.08
            p.vy += dy * 0.08
            p.vx *= 0.82
            p.vy *= 0.82
            p.x += p.vx
            p.y += p.vy
          } else {
            p.x = p.originX
            p.y = p.originY
          }

          // 2. Determine Color:
          // Phase A: Pixel emerges as the image's original color (cream/yellow/ink)
          let currentR = p.initR
          let currentG = p.initG
          let currentB = p.initB
          let currentHex = p.initHex

          // Phase B: If this pixel represents text, smoothly shift color to deep ink (#0a0a0a) to reveal the letters
          if (p.isTextPixel && elapsed > p.textRevealDelay) {
            const rawTextShift = Math.min(1, (elapsed - p.textRevealDelay) / p.textShiftDuration)
            const textShiftProgress = 1 - Math.pow(1 - rawTextShift, 3) // smooth cubic easeOut

            currentR = Math.round(p.initR + (p.targetR - p.initR) * textShiftProgress)
            currentG = Math.round(p.initG + (p.targetG - p.initG) * textShiftProgress)
            currentB = Math.round(p.initB + (p.targetB - p.initB) * textShiftProgress)
            currentHex = `rgb(${currentR},${currentG},${currentB})`
          }

          // In-Effect fade when pixel first lands
          if (appearProgress < 0.6) {
            const t = appearProgress / 0.6
            const r = Math.round(255 + (currentR - 255) * t)
            const g = Math.round(215 + (currentG - 215) * t)
            const b = Math.round(0 + (currentB - 0) * t)
            ctx.fillStyle = `rgb(${r},${g},${b})`
          } else {
            ctx.fillStyle = currentHex
          }

          ctx.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size)
        }

        ctx.globalAlpha = 1.0

        // Soft outer edge fade
        const gradient = ctx.createRadialGradient(
          width / 2,
          height * 0.5,
          Math.min(width, height) * 0.35,
          width / 2,
          height * 0.5,
          Math.max(width, height) * 0.72
        )
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0)')
        gradient.addColorStop(0.75, 'rgba(255, 255, 255, 0.25)')
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0.85)')

        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, width, height)

        rafId.current = requestAnimationFrame(render)
      }

      render()

      const handleResize = () => setupParticles()
      window.addEventListener('resize', handleResize)

      return () => {
        window.removeEventListener('resize', handleResize)
        if (rafId.current) cancelAnimationFrame(rafId.current)
      }
    }

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect()
      mouseRef.current.x = e.clientX - rect.left
      mouseRef.current.y = e.clientY - rect.top
    }

    const handleMouseLeave = () => {
      mouseRef.current.x = -1000
      mouseRef.current.y = -1000
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    window.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      isCancelled = true
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseleave', handleMouseLeave)
      if (rafId.current) cancelAnimationFrame(rafId.current)
    }
  }, [pixelSize, opacity, headlineLine1, headlineLine2, bio])

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none z-0 w-full h-full ${className}`}
      aria-label={`${headlineLine1} ${headlineLine2} - ${bio}`}
    />
  )
}
