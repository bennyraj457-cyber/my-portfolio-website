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

        // 1. Draw base retro coder illustration
        offCtx.drawImage(img, drawX, drawY, drawW, drawH)

        // 2. Draw Hero Headline and Bio DIRECTLY INTO THE PIXEL CANVAS (in the open sky area)
        // Responsive font sizing based on grid columns
        const textFontSize = Math.max(14, Math.min(cols * 0.055, 34))
        const bioFontSize = Math.max(7, Math.min(cols * 0.022, 13))

        const textCenterX = cols * 0.5
        const textCenterY = Math.max(textFontSize * 2.2, rows * 0.28)

        offCtx.textAlign = 'center'
        offCtx.textBaseline = 'middle'

        // Render Headline Line 1 & Line 2
        offCtx.font = `italic 700 ${textFontSize}px "TRJN DaVinci", "TRJN DaVinci Text", serif`
        offCtx.fillStyle = '#080808'
        offCtx.fillText(headlineLine1 || 'Designer who', textCenterX, textCenterY - textFontSize * 0.65)
        offCtx.fillText(headlineLine2 || 'ships with Code', textCenterX, textCenterY + textFontSize * 0.65)

        // Render Paragraph Bio directly beneath
        if (bio) {
          offCtx.font = `normal 400 ${bioFontSize}px "Geist", system-ui, sans-serif`
          offCtx.fillStyle = '#222222'
          const bioLines = bio.length > 55 ? [bio.slice(0, 50) + '...', bio.slice(50)] : [bio]
          offCtx.fillText(bioLines[0], textCenterX, textCenterY + textFontSize * 1.55)
        }

        const imgData = offCtx.getImageData(0, 0, cols, rows).data

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
            const rVal = imgData[idx]
            const gVal = imgData[idx + 1]
            const bVal = imgData[idx + 2]
            const aVal = imgData[idx + 3]

            if (aVal < 20) continue

            const colorObj = getTargetColor(rVal, gVal, bVal)
            // Leave pure white space clean
            if (colorObj.hex === '#ffffff') continue

            const originX = c * blockSize
            const originY = r * blockSize

            // In-Effect: Cascading reveal wave
            const dx = (c - cx) / (cols / 2)
            const dy = (r - cy) / (rows / 2)
            const dist = Math.sqrt(dx * dx + dy * dy)
            const randomJitter = Math.random() * 220
            const delay = 120 + dist * 700 + randomJitter

            newParticles.push({
              originX,
              originY,
              x: originX,
              y: originY + (Math.random() - 0.5) * 6,
              vx: 0,
              vy: 0,
              size: blockSize - 0.4,
              targetHex: colorObj.hex,
              targetR: colorObj.r,
              targetG: colorObj.g,
              targetB: colorObj.b,
              delay,
              startTime: now,
              fadeInDuration: 280 + Math.random() * 150,
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

          if (elapsed < p.delay) {
            continue
          }

          const rawProgress = Math.min(1, (elapsed - p.delay) / p.fadeInDuration)

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

          // Color transition: Starts in gold (#ffd700), transitions into target palette color
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
