import React, { useEffect, useRef } from 'react'
import thoughtsImg from '../../assets/images/thoughts-head-profile.png'

/**
 * AboutPixelArtBackground
 *
 * Renders the thoughts/mind profile artwork as an interactive pixel-art canvas:
 * - Solid flush pixels with zero gap
 * - Palette tuned to high-contrast monochrome & ink-on-paper with subtle golden accents (#0a0a0a, #2a2a2a, #737373, #d4d4d8, #ffffff)
 * - Spring physics: pixels displace when hovered by mouse or steered with the boat cursor
 */
export default function AboutPixelArtBackground({
  className = '',
  pixelSize = 6,
  opacity = 1.0,
}) {
  const canvasRef = useRef(null)
  const particlesRef = useRef([])
  const rafId = useRef(null)
  const mouseRef = useRef({ x: -1000, y: -1000, radius: 45 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.src = thoughtsImg

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
        const blockSize = isMobileScreen ? 4 : Math.max(5, pixelSize)
        const cols = Math.ceil(width / blockSize)
        const rows = Math.ceil(height / blockSize)

        const offCanvas = document.createElement('canvas')
        offCanvas.width = cols
        offCanvas.height = rows
        const offCtx = offCanvas.getContext('2d')

        // Responsive image fit calculation:
        // Use 'contain' with max bounds so the thoughts profile is fully visible
        // and centered without clipping off the top or bottom edges
        const imgRatio = img.width / img.height
        const targetRatio = width / height

        let drawW, drawH, drawX, drawY
        // Contain with slight padding factor (0.92) for elegant framing
        const scale = Math.min((cols * 0.92) / img.width, (rows * 0.92) / img.height)
        drawW = img.width * scale
        drawH = img.height * scale
        drawX = (cols - drawW) / 2
        drawY = (rows - drawH) / 2

        offCtx.drawImage(img, drawX, drawY, drawW, drawH)
        const bgImgData = offCtx.getImageData(0, 0, cols, rows).data

        // High-contrast ink & graphite palette
        const palette = [
          { r: 10, g: 10, b: 10, hex: '#0a0a0a' },
          { r: 42, g: 42, b: 42, hex: '#2a2a2a' },
          { r: 115, g: 115, b: 115, hex: '#737373' },
          { r: 212, g: 212, b: 216, hex: '#d4d4d8' },
          { r: 255, g: 255, b: 255, hex: '#ffffff' },
        ]

        const getTargetColor = (r, g, b) => {
          const lum = 0.299 * r + 0.587 * g + 0.114 * b
          if (lum < 45) return palette[0]
          if (lum < 100) return palette[1]
          if (lum < 170) return palette[2]
          if (lum < 235) return palette[3]
          return palette[4]
        }

        const newParticles = []

        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const idx = (r * cols + c) * 4
            const rVal = bgImgData[idx]
            const gVal = bgImgData[idx + 1]
            const bVal = bgImgData[idx + 2]
            const aVal = bgImgData[idx + 3]

            if (aVal < 20) continue

            const bgDefault = getTargetColor(rVal, gVal, bVal)
            // Skip pure background white so it blends seamlessly
            if (bgDefault.hex === '#ffffff') continue

            const originX = c * blockSize
            const originY = r * blockSize

            newParticles.push({
              originX,
              originY,
              x: originX,
              y: originY,
              vx: 0,
              vy: 0,
              size: blockSize + 0.1,
              hex: bgDefault.hex,
            })
          }
        }

        particlesRef.current = newParticles
      }

      setupParticles()

      const render = () => {
        const particles = particlesRef.current
        const mouse = mouseRef.current
        const mouseActive = mouse.x > -500
        const mouseRadius = mouse.radius
        const mouseRadiusSq = mouseRadius * mouseRadius

        ctx.clearRect(0, 0, width, height)
        ctx.globalAlpha = opacity

        for (let i = 0; i < particles.length; i++) {
          const p = particles[i]

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

          ctx.fillStyle = p.hex
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
  }, [pixelSize, opacity])

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none z-0 w-full h-full ${className}`}
      aria-hidden="true"
    />
  )
}

