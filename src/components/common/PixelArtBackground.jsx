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

        // Responsive block size:
        // On mobile screens (width < 640px), keep discrete blocks at 4px.
        const isMobileScreen = width < 640
        const isPortrait = height > width
        const blockSize = isMobileScreen ? 4 : Math.max(5, pixelSize)
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
        // For mobile portrait screens: ensure font is sized so lines fit comfortably within grid columns
        let textFontSize
        let fontStr
        let textCenterY
        let lineGap

        if (isMobileScreen) {
          // Mobile layout: Crisp high-contrast sans-serif font ("Geist", 900 weight)
          textFontSize = Math.max(15, Math.min(cols * 0.16, 18))
          textCenterY = Math.max(textFontSize * 2.8, rows * 0.18)
          lineGap = textFontSize * 1.35
          fontStr = `900 ${textFontSize}px "Geist", system-ui, -apple-system, sans-serif`
        } else {
          // Desktop / Tablet layout: Elegant serif display font
          const baseRatio = isPortrait ? cols * 0.07 : cols * 0.045
          textFontSize = Math.max(16, Math.min(baseRatio, 36))
          textCenterY = isPortrait
            ? Math.max(textFontSize * 2.5, rows * 0.22)
            : Math.max(textFontSize * 2.0, rows * 0.26)
          lineGap = textFontSize * 1.3
          fontStr = `italic 700 ${textFontSize}px "TRJN DaVinci", "TRJN DaVinci Text", serif`
        }

        const textCenterX = cols * 0.5
        textCtx.font = fontStr
        textCtx.textBaseline = 'middle'

        // Define the two alternating phrase states:
        // State 0: "Designer who ships with Code" (or mobile 3-line split)
        // State 1: "Coder who ships with Designer"
        const state0Lines = isMobileScreen
          ? [
              { text: 'DESIGNER', y: textCenterY - lineGap },
              { text: 'WHO SHIPS', y: textCenterY },
              { text: 'WITH CODE', y: textCenterY + lineGap },
            ]
          : [
              { text: 'Designer who', y: textCenterY - lineGap * 0.5 },
              { text: 'ships with Code', y: textCenterY + lineGap * 0.5 },
            ]

        const state1Lines = isMobileScreen
          ? [
              { text: 'CODER', y: textCenterY - lineGap },
              { text: 'WHO SHIPS', y: textCenterY },
              { text: 'WITH DESIGNER', y: textCenterY + lineGap },
            ]
          : [
              { text: 'Coder who', y: textCenterY - lineGap * 0.5 },
              { text: 'ships with Designer', y: textCenterY + lineGap * 0.5 },
            ]

        // Helper to rasterize lines and get a Map of pixel coordinate keys with letter index
        const rasterizeLinesToMap = (lineSet) => {
          const pixelMap = new Map()
          let globalLetterIdx = 0

          lineSet.forEach((lineObj) => {
            const fullLine = lineObj.text
            const fullWidth = textCtx.measureText(fullLine).width
            let curX = textCenterX - fullWidth / 2

            for (let ch = 0; ch < fullLine.length; ch++) {
              const char = fullLine[ch]
              const charWidth = textCtx.measureText(char).width

              if (char.trim() !== '') {
                textCtx.clearRect(0, 0, cols, rows)
                textCtx.fillText(char, curX, lineObj.y)

                const x1 = Math.max(0, Math.floor(curX - 2))
                const x2 = Math.min(cols, Math.ceil(curX + charWidth + 2))
                const y1 = Math.max(0, Math.floor(lineObj.y - textFontSize * 0.7))
                const y2 = Math.min(rows, Math.ceil(lineObj.y + textFontSize * 0.7))

                const cData = textCtx.getImageData(0, 0, cols, rows).data

                for (let y = y1; y < y2; y++) {
                  for (let x = x1; x < x2; x++) {
                    const idx = (y * cols + x) * 4
                    if (cData[idx + 3] > 30) {
                      pixelMap.set(`${y},${x}`, globalLetterIdx)
                    }
                  }
                }
                globalLetterIdx++
              } else {
                globalLetterIdx += 0.35
              }

              curX += charWidth
            }
          })

          return pixelMap
        }

        const mapState0 = rasterizeLinesToMap(state0Lines)
        const mapState1 = rasterizeLinesToMap(state1Lines)

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

            // Check membership in State 0 and State 1
            const coordKey = `${r},${c}`
            const letterIdx0 = mapState0.get(coordKey)
            const letterIdx1 = mapState1.get(coordKey)
            const isState0 = letterIdx0 !== undefined
            const isState1 = letterIdx1 !== undefined
            const isTextPixel = isState0 || isState1

            // If it's outside the artwork and has no text, skip
            if (aVal < 20 && !isTextPixel) continue

            // Initial color from background image (what shows when image pixels first appear)
            const bgDefault = aVal >= 20 ? getTargetColor(rVal, gVal, bVal) : palette[3]
            // Skip pure white pixels
            if (bgDefault.hex === '#ffffff' && !isTextPixel) continue

            // Ink text color
            const inkColor = palette[0]

            const originX = c * blockSize
            const originY = r * blockSize

            // Image pixel arrival delay (waves in first: 100ms - 900ms)
            const dx = (c - cx) / (cols / 2)
            const dy = (r - cy) / (rows / 2)
            const dist = Math.sqrt(dx * dx + dy * dy)
            const initialDelay = 100 + dist * 600 + Math.random() * 180

            newParticles.push({
              originX,
              originY,
              x: originX,
              y: originY + (Math.random() - 0.5) * 6,
              vx: 0,
              vy: 0,
              size: blockSize - 0.4,
              // Background image pixel colors
              initHex: bgDefault.hex,
              initR: bgDefault.r,
              initG: bgDefault.g,
              initB: bgDefault.b,
              // Text color (deep ink #0a0a0a)
              inkR: inkColor.r,
              inkG: inkColor.g,
              inkB: inkColor.b,
              isState0,
              isState1,
              letterIdx0: letterIdx0 ?? -1,
              letterIdx1: letterIdx1 ?? -1,
              isTextPixel,
              initialDelay,
              startTime: now,
              fadeInDuration: 280 + Math.random() * 120,
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

          // 2. Continuous Dynamic Phrase Morphing:
          // The title smoothly alternates continuously between:
          // Phase 0: "Designer who ships with Code"
          // Phase 1: "Coder who ships with Designer"
          // Timing:
          // - Initial image settlement: 1100ms
          // - Full phrase cycle: 6500ms
          //   - 0ms -> 2200ms: Phrase 0 held / revealed
          //   - 2200ms -> 3250ms: Smooth letter-by-letter dissolution of changed words & morphing into Phrase 1
          //   - 3250ms -> 5450ms: Phrase 1 held
          //   - 5450ms -> 6500ms: Smooth letter-by-letter morphing back to Phrase 0
          let currentR = p.initR
          let currentG = p.initG
          let currentB = p.initB
          let currentHex = p.initHex

          const initialIntroDone = elapsed > 1100

          if (p.isTextPixel && initialIntroDone) {
            const cycleDuration = 6500
            const cycleTime = (elapsed - 1100) % cycleDuration
            const halfCycle = cycleDuration / 2 // 3250ms
            const transitionWindow = 1050 // duration of the smooth word morph

            let targetTextWeight = 0 // 0 = fully background image color, 1 = fully text ink color

            if (cycleTime < halfCycle) {
              // First half of cycle (Phrase 0 is primary)
              if (p.isState0) {
                if (cycleTime < halfCycle - transitionWindow) {
                  // Fully visible
                  targetTextWeight = 1
                } else {
                  // Morphing out letter by letter
                  const tOut = (cycleTime - (halfCycle - transitionWindow)) / transitionWindow
                  const letterDelayFactor = Math.max(0, Math.min(1, tOut * 1.6 - (p.letterIdx0 * 0.04)))
                  targetTextWeight = 1 - letterDelayFactor
                }
              }
              if (p.isState1) {
                if (cycleTime >= halfCycle - transitionWindow) {
                  // Morphing in letter by letter
                  const tIn = (cycleTime - (halfCycle - transitionWindow)) / transitionWindow
                  const letterDelayFactor = Math.max(0, Math.min(1, tIn * 1.6 - (p.letterIdx1 * 0.04)))
                  targetTextWeight = Math.max(targetTextWeight, letterDelayFactor)
                }
              }
            } else {
              // Second half of cycle (Phrase 1 is primary)
              const secondTime = cycleTime - halfCycle
              if (p.isState1) {
                if (secondTime < halfCycle - transitionWindow) {
                  targetTextWeight = 1
                } else {
                  const tOut = (secondTime - (halfCycle - transitionWindow)) / transitionWindow
                  const letterDelayFactor = Math.max(0, Math.min(1, tOut * 1.6 - (p.letterIdx1 * 0.04)))
                  targetTextWeight = 1 - letterDelayFactor
                }
              }
              if (p.isState0) {
                if (secondTime >= halfCycle - transitionWindow) {
                  const tIn = (secondTime - (halfCycle - transitionWindow)) / transitionWindow
                  const letterDelayFactor = Math.max(0, Math.min(1, tIn * 1.6 - (p.letterIdx0 * 0.04)))
                  targetTextWeight = Math.max(targetTextWeight, letterDelayFactor)
                }
              }
            }

            // Smooth cubic ease for color blending
            const easeWeight = targetTextWeight * targetTextWeight * (3 - 2 * targetTextWeight)

            currentR = Math.round(p.initR + (p.inkR - p.initR) * easeWeight)
            currentG = Math.round(p.initG + (p.inkG - p.initG) * easeWeight)
            currentB = Math.round(p.initB + (p.inkB - p.initB) * easeWeight)
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

    const handleBoatMove = (e) => {
      const rect = canvas.getBoundingClientRect()
      if (e.detail) {
        mouseRef.current.x = e.detail.clientX - rect.left
        mouseRef.current.y = e.detail.clientY - rect.top
      }
    }

    const handleMouseLeave = () => {
      mouseRef.current.x = -1000
      mouseRef.current.y = -1000
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    window.addEventListener('boatmove', handleBoatMove, { passive: true })
    window.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      isCancelled = true
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('boatmove', handleBoatMove)
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
