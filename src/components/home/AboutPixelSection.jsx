import React, { useEffect, useRef } from 'react'
import aboutImg from '../../assets/images/about-mountain-jeep.jpg'

/**
 * AboutPixelSection
 *
 * Full-width About Me section following the seamless pixel art design:
 * - Uses the mountain & jeep illustration rasterized into solid, gapless pixels
 * - Embeds "ABOUT ME" and narrative headline directly into the expansive sky pixels
 * - Features reactive tactile mouse/boat repulsion on both desktop and mobile
 * - Reveals smoothly when scrolled into view
 */
export default function AboutPixelSection({ className = '' }) {
  const containerRef = useRef(null)
  const canvasRef = useRef(null)
  const particlesRef = useRef([])
  const rafId = useRef(null)
  const mouseRef = useRef({ x: -1000, y: -1000, radius: 50 })
  const hasTriggeredRef = useRef(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.src = aboutImg

    let isCancelled = false

    img.onload = () => {
      if (isCancelled) return

      let width = 0
      let height = 0

      const setupParticles = () => {
        const parent = canvas.parentElement || document.body
        width = canvas.width = parent.clientWidth || window.innerWidth
        height = canvas.height = parent.clientHeight || window.innerHeight

        const isMobileScreen = width < 640
        const isPortrait = height > width
        const blockSize = isMobileScreen ? 4 : 6
        const cols = Math.ceil(width / blockSize)
        const rows = Math.ceil(height / blockSize)

        // Offscreen canvas to downsample image & rasterize text
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

        // Draw background image to offscreen canvas
        offCtx.drawImage(img, drawX, drawY, drawW, drawH)
        const bgImgData = offCtx.getImageData(0, 0, cols, rows).data

        // 2. Measure & draw About Me headline in the sky
        const textCanvas = document.createElement('canvas')
        textCanvas.width = cols
        textCanvas.height = rows
        const textCtx = textCanvas.getContext('2d')

        let textFontSize
        let subFontSize
        let fontStr
        let subFontStr
        let textCenterY
        let lineGap

        if (isMobileScreen) {
          textFontSize = Math.max(14, Math.min(cols * 0.12, 18))
          subFontSize = Math.max(10, Math.min(cols * 0.075, 12))
          textCenterY = Math.max(textFontSize * 2.6, rows * 0.15)
          lineGap = textFontSize * 1.35
          fontStr = `900 ${textFontSize}px "Geist", system-ui, -apple-system, sans-serif`
          subFontStr = `700 ${subFontSize}px "Geist", system-ui, -apple-system, sans-serif`
        } else {
          const baseRatio = isPortrait ? cols * 0.06 : cols * 0.038
          textFontSize = Math.max(18, Math.min(baseRatio, 32))
          subFontSize = Math.max(12, Math.min(baseRatio * 0.65, 18))
          textCenterY = isPortrait
            ? Math.max(textFontSize * 2.4, rows * 0.18)
            : Math.max(textFontSize * 2.0, rows * 0.16)
          lineGap = textFontSize * 1.3
          fontStr = `italic 700 ${textFontSize}px "TRJN DaVinci", "TRJN DaVinci Text", serif`
          subFontStr = `500 ${subFontSize}px "Geist", system-ui, -apple-system, sans-serif`
        }

        const textCenterX = cols * 0.5

        // Narrative lines embedded in the mountain sky
        const lines = isMobileScreen
          ? [
              { text: 'ABOUT ME', y: textCenterY - lineGap, isTitle: true },
              { text: 'EXPLORING BEYOND', y: textCenterY, isTitle: true },
              { text: 'THE PIXELS', y: textCenterY + lineGap, isTitle: true },
            ]
          : [
              { text: 'About Benny', y: textCenterY - lineGap * 0.6, isTitle: true },
              { text: 'Exploring interfaces, code & mountains', y: textCenterY + lineGap * 0.6, isTitle: false },
            ]

        const textPixelTimings = new Map()
        let globalLetterIdx = 0
        const baseStartDelay = 400

        lines.forEach((lineObj) => {
          textCtx.font = lineObj.isTitle ? fontStr : subFontStr
          textCtx.textBaseline = 'middle'

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
              const letterDelay = baseStartDelay + globalLetterIdx * 75

              for (let y = y1; y < y2; y++) {
                for (let x = x1; x < x2; x++) {
                  const idx = (y * cols + x) * 4
                  if (cData[idx + 3] > 30) {
                    textPixelTimings.set(`${y},${x}`, letterDelay + Math.random() * 50)
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

        // Mountain Sky & Nature Palette
        // 0: Deep Ink / Charcoal (#0a0a0a)
        // 1: Primary Warm Gold (#ffd700)
        // 2: Sunset Coral / Jeep Orange (#e76f51)
        // 3: Pine Mountain Moss (#2a9d8f)
        // 4: Alpine Mist Sky (#e9f5f9)
        // 5: Peak Snow (#ffffff)
        const palette = [
          { r: 10, g: 10, b: 10, hex: '#0a0a0a' },
          { r: 255, g: 215, b: 0, hex: '#ffd700' },
          { r: 231, g: 111, b: 81, hex: '#e76f51' },
          { r: 42, g: 157, b: 143, hex: '#2a9d8f' },
          { r: 220, g: 240, b: 245, hex: '#e9f5f9' },
          { r: 255, g: 255, b: 255, hex: '#ffffff' },
        ]

        const getTargetColor = (r, g, b) => {
          // Color-quantize using nearest RGB distance in palette
          let minDist = Infinity
          let chosen = palette[4]
          for (let p of palette) {
            const dr = r - p.r
            const dg = g - p.g
            const db = b - p.b
            const d = dr * dr + dg * dg + db * db
            if (d < minDist) {
              minDist = d
              chosen = p
            }
          }
          return chosen
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

            const letterTiming = textPixelTimings.get(`${r},${c}`)
            const isTextPixel = letterTiming !== undefined

            if (aVal < 20 && !isTextPixel) continue

            // Determine base color from image
            const bgDefault = aVal >= 20 ? getTargetColor(rVal, gVal, bVal) : palette[4]

            // Ink color for text
            const targetColor = isTextPixel ? palette[0] : bgDefault

            const originX = c * blockSize
            const originY = r * blockSize

            const dx = (c - cx) / (cols / 2)
            const dy = (r - cy) / (rows / 2)
            const dist = Math.sqrt(dx * dx + dy * dy)
            const initialDelay = 100 + dist * 500 + Math.random() * 150

            newParticles.push({
              originX,
              originY,
              x: originX,
              y: originY + (Math.random() - 0.5) * 6,
              vx: 0,
              vy: 0,
              size: blockSize + 0.1, // Flush solid coverage without gap
              initHex: bgDefault.hex,
              initR: bgDefault.r,
              initG: bgDefault.g,
              initB: bgDefault.b,
              targetHex: targetColor.hex,
              targetR: targetColor.r,
              targetG: targetColor.g,
              targetB: targetColor.b,
              isTextPixel,
              initialDelay,
              textRevealDelay: letterTiming || 0,
              startTime: now,
              fadeInDuration: 280 + Math.random() * 100,
              textShiftDuration: 320 + Math.random() * 80,
            })
          }
        }

        particlesRef.current = newParticles
      }

      setupParticles()

      const render = () => {
        const now = performance.now()
        const particles = particlesRef.current
        const mouse = mouseRef.current
        const mouseActive = mouse.x > -500
        const mouseRadius = mouse.radius
        const mouseRadiusSq = mouseRadius * mouseRadius

        ctx.clearRect(0, 0, width, height)

        for (let i = 0; i < particles.length; i++) {
          const p = particles[i]
          const elapsed = now - p.startTime

          if (elapsed < p.initialDelay) continue

          const rawAppear = Math.min(1, (elapsed - p.initialDelay) / p.fadeInDuration)
          const appearProgress = 1 - Math.pow(1 - rawAppear, 3)

          // Mouse / Boat repulsion physics
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

          // Spring dampening back to position
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

          let currentR = p.initR
          let currentG = p.initG
          let currentB = p.initB
          let currentHex = p.initHex

          // Text shift letter by letter
          if (p.isTextPixel && elapsed > p.textRevealDelay) {
            const rawTextShift = Math.min(1, (elapsed - p.textRevealDelay) / p.textShiftDuration)
            const textShiftProgress = 1 - Math.pow(1 - rawTextShift, 3)

            currentR = Math.round(p.initR + (p.targetR - p.initR) * textShiftProgress)
            currentG = Math.round(p.initG + (p.targetG - p.initG) * textShiftProgress)
            currentB = Math.round(p.initB + (p.targetB - p.initB) * textShiftProgress)
            currentHex = `rgb(${currentR},${currentG},${currentB})`
          }

          if (appearProgress < 0.6) {
            const t = appearProgress / 0.6
            const r = Math.round(255 + (currentR - 255) * t)
            const g = Math.round(215 + (currentG - 215) * t)
            const b = Math.round(0 + (currentB - 0) * t)
            ctx.fillStyle = `rgb(${r},${g},${b})`
          } else {
            ctx.fillStyle = currentHex
          }

          ctx.fillRect(Math.floor(p.x), Math.floor(p.y), Math.ceil(p.size), Math.ceil(p.size))
        }

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
  }, [])

  return (
    <section
      ref={containerRef}
      id="about"
      aria-label="About Benny"
      className={`relative w-full min-h-[90svh] md:min-h-screen flex flex-col items-center justify-center select-none overflow-hidden ${className}`}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full absolute inset-0 pointer-events-none z-0"
        aria-hidden="true"
      />

      {/* Screen-reader accessible bio text */}
      <div className="sr-only">
        <h2>About Benny</h2>
        <p>
          I am Benny, a designer and creative engineer crafting playful, precise digital experiences and tools.
        </p>
      </div>
    </section>
  )
}
