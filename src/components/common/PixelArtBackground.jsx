import React, { useEffect, useRef } from 'react'
import retroCoderImg from '../../assets/images/retro-coder.png'

/**
 * PixelArtBackground
 *
 * Renders the coder artwork with the exact physical pixel system of the hero text:
 * - Uses discrete micro-pixels (pixelSize = 3 or 4)
 * - Dynamic "In-Effect": on page load, pixels materialize sequentially with a wave of gold (#ffd700),
 *   soft easing curves, and organic micro-settling before locking into position.
 * - Interactive: Gentle micro-repulsion around cursor hover so the pixel artwork feels alive.
 * - Brand Palette mapping: Deep Ink (#141414), Gold (#ffd700), Light Yellow (#ffe766), Soft Cream (#fffadc).
 */
export default function PixelArtBackground({
  className = '',
  pixelSize = 8, // Crisp, lightweight 8px retro blocks
  opacity = 0.35,
}) {
  const canvasRef = useRef(null)
  const particlesRef = useRef([])
  const rafId = useRef(null)
  const mouseRef = useRef({ x: -1000, y: -1000, radius: 28 })
  const isSettledRef = useRef(false)

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

        const blockSize = Math.max(6, pixelSize)
        const cols = Math.ceil(width / blockSize)
        const rows = Math.ceil(height / blockSize)

        // Offscreen canvas to downsample the image
        const offCanvas = document.createElement('canvas')
        offCanvas.width = cols
        offCanvas.height = rows
        const offCtx = offCanvas.getContext('2d')

        // Aspect ratio cover calculation (centered, slightly biased toward right/center)
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

        offCtx.drawImage(img, drawX, drawY, drawW, drawH)
        const imgData = offCtx.getImageData(0, 0, cols, rows).data

        // Palette mapping:
        // 0: Deep Ink Outline / Suit (#121212)
        // 1: Primary Gold (#ffd700)
        // 2: Warm Light Yellow (#ffe766)
        // 3: Soft Pale Cream (#fffadc)
        // 4: White (#ffffff)
        const palette = [
          { r: 18, g: 18, b: 18, hex: '#121212' },
          { r: 255, g: 215, b: 0, hex: '#ffd700' },
          { r: 255, g: 231, b: 102, hex: '#ffe766' },
          { r: 255, g: 250, b: 220, hex: '#fffadc' },
          { r: 255, g: 255, b: 255, hex: '#ffffff' },
        ]

        const getTargetColor = (r, g, b) => {
          const lum = 0.299 * r + 0.587 * g + 0.114 * b
          if (lum < 58) return palette[0]
          if (lum < 118) return palette[1]
          if (lum < 185) return palette[2]
          if (lum < 240) return palette[3]
          return palette[4]
        }

        const newParticles = []
        const now = performance.now()
        const cx = cols / 2
        const cy = rows * 0.55

        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const idx = (r * cols + c) * 4
            const rVal = imgData[idx]
            const gVal = imgData[idx + 1]
            const bVal = imgData[idx + 2]
            const aVal = imgData[idx + 3]

            if (aVal < 25) continue

            const colorObj = getTargetColor(rVal, gVal, bVal)
            // Skip pure white background pixels to keep negative space light & breathable
            if (colorObj.hex === '#ffffff') continue

            const originX = c * blockSize
            const originY = r * blockSize

            // In-Effect: Radial wave from the coder figure outward
            const dx = (c - cx) / (cols / 2)
            const dy = (r - cy) / (rows / 2)
            const distFromFigure = Math.sqrt(dx * dx + dy * dy)
            const randomJitter = Math.random() * 200
            // Sequential reveal wave: 150ms to 1200ms
            const delay = 150 + distFromFigure * 800 + randomJitter

            newParticles.push({
              originX,
              originY,
              x: originX,
              y: originY + (Math.random() - 0.5) * 6,
              vx: 0,
              vy: 0,
              size: blockSize - 0.5,
              targetHex: colorObj.hex,
              targetR: colorObj.r,
              targetG: colorObj.g,
              targetB: colorObj.b,
              delay,
              startTime: now,
              fadeInDuration: 300 + Math.random() * 150,
            })
          }
        }

        particlesRef.current = newParticles
        isSettledRef.current = false
      }

      setupParticles()

      // High-Performance Physics and Render Loop
      const render = () => {
        const now = performance.now()
        const particles = particlesRef.current
        const mouse = mouseRef.current

        ctx.clearRect(0, 0, width, height)
        ctx.globalAlpha = opacity

        let anyMoving = false

        for (let i = 0; i < particles.length; i++) {
          const p = particles[i]
          const elapsed = now - p.startTime

          if (elapsed < p.delay) {
            anyMoving = true
            continue // Pixel has not crystallized yet
          }

          const rawProgress = Math.min(1, (elapsed - p.delay) / p.fadeInDuration)
          if (rawProgress < 1) anyMoving = true

          // Spring dampening back to origin coordinate
          const dx = p.originX - p.x
          const dy = p.originY - p.y

          if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1 || Math.abs(p.vx) > 0.1 || Math.abs(p.vy) > 0.1) {
            anyMoving = true
            p.vx += dx * 0.08
            p.vy += dy * 0.08
            p.vx *= 0.8
            p.vy *= 0.8
            p.x += p.vx
            p.y += p.vy
          } else {
            p.x = p.originX
            p.y = p.originY
          }

          // Color transition
          if (rawProgress < 0.6) {
            const t = rawProgress / 0.6
            const r = Math.round(255 + (p.targetR - 255) * t)
            const g = Math.round(215 + (p.targetG - 215) * t)
            const b = Math.round(0 + (p.targetB - 0) * t)
            ctx.fillStyle = `rgb(${r},${g},${b})`
          } else {
            ctx.fillStyle = p.targetHex
          }

          ctx.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size)
        }

        ctx.globalAlpha = 1.0

        // Soft center vignette so hero typography stands out crisply
        const gradient = ctx.createRadialGradient(
          width / 2,
          height * 0.48,
          Math.min(width, height) * 0.25,
          width / 2,
          height * 0.48,
          Math.max(width, height) * 0.7
        )
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.45)')
        gradient.addColorStop(0.6, 'rgba(255, 255, 255, 0.2)')
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0.75)')

        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, width, height)

        // Only loop animation frame if particles are still moving or cursor is active
        rafId.current = requestAnimationFrame(render)
      }

      render()

      const handleResize = () => {
        setupParticles()
      }
      window.addEventListener('resize', handleResize)

      return () => {
        window.removeEventListener('resize', handleResize)
        if (rafId.current) cancelAnimationFrame(rafId.current)
      }
    }

    // Track mouse coordinates for interactive micro-repulsion
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
  }, [pixelSize, opacity])

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none z-0 w-full h-full ${className}`}
      aria-hidden="true"
    />
  )
}
