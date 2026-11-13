import React, { useEffect, useRef } from 'react'

/**
 * AboutPixelBackground
 *
 * Renders an interactive white pixel mosaic background for the About section:
 * - White & subtle warm cream/silver tones (#ffffff, #fafafa, #f4f4f5, #fffdf0)
 * - Seamless edge-to-edge flush pixels (zero gaps)
 * - Rasterizes the "ABOUT ME" title and bio text DIRECTLY into the pixel canvas matrix
 * - Letters appear letter-by-letter as deep ink pixels (#0a0a0a) with brand gold (#ffd700) accents
 * - Responsive to desktop mouse hover and mobile boat navigation ('boatmove') with spring repulsion physics
 */
export default function AboutPixelBackground({
  className = '',
  pixelSize = 6,
  opacity = 0.98,
}) {
  const canvasRef = useRef(null)
  const particlesRef = useRef([])
  const rafId = useRef(null)
  const mouseRef = useRef({ x: -1000, y: -1000, radius: 50 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    let width = 0
    let height = 0

    const setupParticles = () => {
      const parent = canvas.parentElement || document.body
      width = canvas.width = parent.clientWidth || window.innerWidth
      height = canvas.height = parent.clientHeight || window.innerHeight

      const isMobileScreen = width < 640
      const blockSize = isMobileScreen ? 4 : Math.max(5, pixelSize)
      const cols = Math.ceil(width / blockSize)
      const rows = Math.ceil(height / blockSize)

      // Offscreen canvas to measure and rasterize the About typography
      const textCanvas = document.createElement('canvas')
      textCanvas.width = cols
      textCanvas.height = rows
      const textCtx = textCanvas.getContext('2d')

      // Responsive font sizing
      const titleFontSize = isMobileScreen
        ? Math.max(14, Math.min(cols * 0.12, 18))
        : Math.max(18, Math.min(cols * 0.05, 32))

      const bodyFontSize = isMobileScreen
        ? Math.max(8, Math.min(cols * 0.048, 10))
        : Math.max(10, Math.min(cols * 0.024, 15))

      const titleFontStr = isMobileScreen
        ? `900 ${titleFontSize}px "Geist", system-ui, sans-serif`
        : `italic 700 ${titleFontSize}px "TRJN DaVinci", "TRJN DaVinci Text", serif`

      const bodyFontStr = `600 ${bodyFontSize}px "Geist", system-ui, sans-serif`

      const textCenterX = cols * 0.5
      const startY = rows * 0.22

      // Content blocks
      const titleText = isMobileScreen ? 'ABOUT BENNY' : 'About Benny'
      
      const bodyLines = isMobileScreen
        ? [
            'DESIGNER & ENGINEER',
            'CRAFTING INTENTIONAL INTERFACES',
            'BRIDGING FORM AND PRODUCTION CODE',
            'BASED IN THIRUVATTAR',
          ]
        : [
            'Designer & creative engineer crafting intentional digital interfaces.',
            'Bridging human-centered aesthetics with high-performance production code.',
            'Obsessed with tactile micro-interactions, typography, and joyful web physics.',
          ]

      // Map coordinate key -> letter reveal timing
      const textPixelMap = new Map()
      let globalIdx = 0
      const baseDelay = 600

      // 1. Draw Title
      textCtx.font = titleFontStr
      textCtx.textBaseline = 'middle'
      const titleWidth = textCtx.measureText(titleText).width
      let curX = textCenterX - titleWidth / 2
      const titleY = startY

      for (let ch = 0; ch < titleText.length; ch++) {
        const char = titleText[ch]
        const cWidth = textCtx.measureText(char).width

        if (char.trim() !== '') {
          textCtx.clearRect(0, 0, cols, rows)
          textCtx.fillText(char, curX, titleY)

          const x1 = Math.max(0, Math.floor(curX - 2))
          const x2 = Math.min(cols, Math.ceil(curX + cWidth + 2))
          const y1 = Math.max(0, Math.floor(titleY - titleFontSize * 0.75))
          const y2 = Math.min(rows, Math.ceil(titleY + titleFontSize * 0.75))

          const cData = textCtx.getImageData(0, 0, cols, rows).data
          const charDelay = baseDelay + globalIdx * 75

          for (let y = y1; y < y2; y++) {
            for (let x = x1; x < x2; x++) {
              const idx = (y * cols + x) * 4
              if (cData[idx + 3] > 30) {
                textPixelMap.set(`${y},${x}`, {
                  delay: charDelay + Math.random() * 50,
                  isTitle: true,
                })
              }
            }
          }
          globalIdx++
        } else {
          globalIdx += 0.4
        }
        curX += cWidth
      }

      // 2. Draw Body Lines
      textCtx.font = bodyFontStr
      const lineSpacing = bodyFontSize * 1.6
      let currentLineY = titleY + titleFontSize * 1.4 + lineSpacing

      bodyLines.forEach((line) => {
        const lineWidth = textCtx.measureText(line).width
        let lineX = textCenterX - lineWidth / 2

        for (let ch = 0; ch < line.length; ch++) {
          const char = line[ch]
          const cWidth = textCtx.measureText(char).width

          if (char.trim() !== '') {
            textCtx.clearRect(0, 0, cols, rows)
            textCtx.fillText(char, lineX, currentLineY)

            const x1 = Math.max(0, Math.floor(lineX - 1))
            const x2 = Math.min(cols, Math.ceil(lineX + cWidth + 1))
            const y1 = Math.max(0, Math.floor(currentLineY - bodyFontSize * 0.7))
            const y2 = Math.min(rows, Math.ceil(currentLineY + bodyFontSize * 0.7))

            const cData = textCtx.getImageData(0, 0, cols, rows).data
            const charDelay = baseDelay + globalIdx * 25

            for (let y = y1; y < y2; y++) {
              for (let x = x1; x < x2; x++) {
                const idx = (y * cols + x) * 4
                if (cData[idx + 3] > 30) {
                  textPixelMap.set(`${y},${x}`, {
                    delay: charDelay + Math.random() * 40,
                    isTitle: false,
                  })
                }
              }
            }
            globalIdx++
          } else {
            globalIdx += 0.2
          }
          lineX += cWidth
        }
        currentLineY += lineSpacing
      })

      // Generate White Mosaic Particles with zero gap
      const newParticles = []
      const now = performance.now()
      const cx = cols / 2
      const cy = rows * 0.4

      // White pixel palette with subtle ambient tones
      const whitePalette = [
        { r: 255, g: 255, b: 255, hex: '#ffffff' },
        { r: 250, g: 250, b: 250, hex: '#fafafa' },
        { r: 245, g: 245, b: 247, hex: '#f5f5f7' },
        { r: 255, g: 252, b: 235, hex: '#fffceb' }, // Soft warm ivory accent
      ]

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const key = `${r},${c}`
          const textInfo = textPixelMap.get(key)
          const isTextPixel = textInfo !== undefined

          const originX = c * blockSize
          const originY = r * blockSize

          // Random white hue variation
          const baseColor = whitePalette[Math.floor(Math.random() * whitePalette.length)]

          // Ink text colors: deep black ink (#0d0d0d) or gold highlight
          const textR = 13
          const textG = 13
          const textB = 13

          const dx = (c - cx) / (cols / 2)
          const dy = (r - cy) / (rows / 2)
          const dist = Math.sqrt(dx * dx + dy * dy)
          const initialDelay = 80 + dist * 450 + Math.random() * 160

          newParticles.push({
            originX,
            originY,
            x: originX,
            y: originY + (Math.random() - 0.5) * 5,
            vx: 0,
            vy: 0,
            size: blockSize + 0.1, // Full flush coverage
            initR: baseColor.r,
            initG: baseColor.g,
            initB: baseColor.b,
            textR,
            textG,
            textB,
            isTextPixel,
            isTitle: textInfo?.isTitle || false,
            textRevealDelay: textInfo?.delay || 0,
            initialDelay,
            startTime: now,
            fadeInDuration: 260 + Math.random() * 100,
            textShiftDuration: 300 + Math.random() * 80,
          })
        }
      }

      particlesRef.current = newParticles
    }

    setupParticles()

    // 60-120 FPS animation loop
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

        if (elapsed < p.initialDelay) continue

        const rawAppear = Math.min(1, (elapsed - p.initialDelay) / p.fadeInDuration)
        const appearProgress = 1 - Math.pow(1 - rawAppear, 3)

        // Mouse / boat displacement
        if (mouseActive) {
          const dxM = p.x - mouse.x
          const dyM = p.y - mouse.y
          const distSq = dxM * dxM + dyM * dyM

          if (distSq < mouseRadiusSq && distSq > 0.01) {
            const dist = Math.sqrt(distSq)
            const force = (1 - dist / mouseRadius) * 4.2
            p.vx += (dxM / dist) * force
            p.vy += (dyM / dist) * force
          }
        }

        // Spring return
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

        // Color determination: initial white canvas -> smooth shift to ink letters
        let currentR = p.initR
        let currentG = p.initG
        let currentB = p.initB

        if (p.isTextPixel && elapsed > p.textRevealDelay) {
          const rawTextShift = Math.min(1, (elapsed - p.textRevealDelay) / p.textShiftDuration)
          const textShiftProgress = 1 - Math.pow(1 - rawTextShift, 3)

          currentR = Math.round(p.initR + (p.textR - p.initR) * textShiftProgress)
          currentG = Math.round(p.initG + (p.textG - p.initG) * textShiftProgress)
          currentB = Math.round(p.initB + (p.textB - p.initB) * textShiftProgress)
        }

        ctx.fillStyle = `rgb(${currentR},${currentG},${currentB})`
        ctx.fillRect(Math.floor(p.x), Math.floor(p.y), Math.ceil(p.size), Math.ceil(p.size))
      }

      ctx.globalAlpha = 1.0

      // Ambient top & bottom transition vignette
      const vGrad = ctx.createLinearGradient(0, 0, 0, height)
      vGrad.addColorStop(0, 'rgba(0, 119, 182, 0.22)') // soft sea horizon blend at top
      vGrad.addColorStop(0.12, 'rgba(255, 255, 255, 0)')
      vGrad.addColorStop(0.88, 'rgba(255, 255, 255, 0)')
      vGrad.addColorStop(1, 'rgba(0, 119, 182, 0.25)') // blend into sea at bottom

      ctx.fillStyle = vGrad
      ctx.fillRect(0, 0, width, height)

      rafId.current = requestAnimationFrame(render)
    }

    render()

    const handleResize = () => setupParticles()
    window.addEventListener('resize', handleResize)

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
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('boatmove', handleBoatMove)
      window.removeEventListener('mouseleave', handleMouseLeave)
      if (rafId.current) cancelAnimationFrame(rafId.current)
    }
  }, [pixelSize, opacity])

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none z-0 w-full h-full ${className}`}
      aria-label="About Benny - Designer & creative engineer"
    />
  )
}
