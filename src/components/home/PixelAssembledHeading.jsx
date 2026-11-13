import React, { useEffect, useRef, useState } from 'react'

/**
 * PixelAssembledHeading
 *
 * Renders the headline text via thousands of crisp discrete micro-pixels:
 * - When the page loads, pixel squares sample the editorial headline font offscreen.
 * - During intro assembly, the pixels start dispersed/scattered in gold (#ffd700),
 *   then smoothly fly in and lock into their exact positions, resolving into crisp black text (#000000).
 * - Interactive: Hovering or waving the mouse over the headline causes the pixels to playfully
 *   displace and re-assemble naturally like magnetic sand.
 */
export default function PixelAssembledHeading({
  line1 = 'Designer who',
  line2 = 'ships with vision',
  pixelSize = 3,
  className = '',
}) {
  const canvasRef = useRef(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const particlesRef = useRef([])
  const rafId = useRef(null)
  // Reduced hover break radius from 60px to 26px for tight, refined fingertip dispersion
  const mouseRef = useRef({ x: -1000, y: -1000, radius: 26 })

  useEffect(() => {
    const updateCanvasDimensions = () => {
      const containerWidth = Math.min(window.innerWidth - 32, 920)
      // Estimate height based on fluid scaling
      const fontSize = Math.max(36, Math.min(window.innerWidth * 0.072, 82))
      const estimatedHeight = fontSize * 2.3
      setDimensions({ width: containerWidth, height: estimatedHeight, fontSize })
    }

    updateCanvasDimensions()
    window.addEventListener('resize', updateCanvasDimensions)
    return () => window.removeEventListener('resize', updateCanvasDimensions)
  }, [])

  useEffect(() => {
    if (!dimensions.width || !dimensions.height) return
    const canvas = canvasRef.current
    if (!canvas) return

    const dpr = window.devicePixelRatio || 1
    const { width, height, fontSize } = dimensions
    canvas.width = width * dpr
    canvas.height = height * dpr
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`

    const ctx = canvas.getContext('2d')
    ctx.scale(dpr, dpr)

    // 1. Offscreen measurement & sampling of headline text
    const offCanvas = document.createElement('canvas')
    offCanvas.width = width
    offCanvas.height = height
    const offCtx = offCanvas.getContext('2d')

    offCtx.fillStyle = '#000000'
    offCtx.font = `italic 400 ${fontSize}px "TRJN DaVinci", "TRJN DaVinci Text", serif`
    offCtx.textAlign = 'center'
    offCtx.textBaseline = 'middle'

    // Draw lines
    const lineSpacing = fontSize * 1.08
    const startY = height / 2 - lineSpacing * 0.48
    offCtx.fillText(line1, width / 2, startY)
    offCtx.fillText(line2, width / 2, startY + lineSpacing)

    // 2. Sample pixel coordinates
    const imgData = offCtx.getImageData(0, 0, width, height)
    const data = imgData.data
    const newParticles = []
    const step = pixelSize // Sample grid density

    for (let y = 0; y < height; y += step) {
      for (let x = 0; x < width; x += step) {
        const index = (y * width + x) * 4
        const alpha = data[index + 3]

        if (alpha > 120) {
          // Point belongs to the text glyph!
          // Start dispersed in yellow cloud space
          const angle = Math.random() * Math.PI * 2
          const scatterDist = 60 + Math.random() * 220
          const startX = x + Math.cos(angle) * scatterDist
          const startY = y + Math.sin(angle) * scatterDist

          newParticles.push({
            originX: x,
            originY: y,
            x: startX,
            y: startY,
            vx: 0,
            vy: 0,
            size: step - 0.5,
            // Delay per pixel so they assemble like a wave from center outward
            delay: Math.abs(x - width / 2) * 1.5 + Math.random() * 300,
            startTime: performance.now(),
            assembled: false,
          })
        }
      }
    }

    particlesRef.current = newParticles

    // 3. Render and physics animation loop
    const render = () => {
      ctx.clearRect(0, 0, width, height)
      const now = performance.now()
      const particles = particlesRef.current
      const mouse = mouseRef.current

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]
        const elapsed = now - p.startTime

        if (elapsed < p.delay) {
          // Pixel still hovering in initial yellow cloud scatter
          continue
        }

        // Spring physics towards target origin
        const spring = 0.08
        const friction = 0.82

        // Mouse repulsion
        const dxMouse = p.x - mouse.x
        const dyMouse = p.y - mouse.y
        const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse)

        if (distMouse < mouse.radius) {
          // Delicate repulsion force within tight 26px circle
          const force = (1 - distMouse / mouse.radius) * 4.5
          p.vx += (dxMouse / distMouse) * force
          p.vy += (dyMouse / distMouse) * force
        }

        // Home spring force
        const dx = p.originX - p.x
        const dy = p.originY - p.y

        p.vx += dx * spring
        p.vy += dy * spring

        p.vx *= friction
        p.vy *= friction

        p.x += p.vx
        p.y += p.vy

        // Color transition: yellow during flight, snapping to solid black upon assembly
        const distFromHome = Math.sqrt(dx * dx + dy * dy)
        if (distFromHome > 12) {
          ctx.fillStyle = '#ffd700'
        } else if (distFromHome > 3) {
          ctx.fillStyle = '#444444'
        } else {
          ctx.fillStyle = '#000000'
        }

        ctx.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size)
      }

      rafId.current = requestAnimationFrame(render)
    }

    render()

    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current)
    }
  }, [dimensions, line1, line2, pixelSize])

  // Track mouse coordinates over the headline
  const handleMouseMove = (e) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    mouseRef.current.x = e.clientX - rect.left
    mouseRef.current.y = e.clientY - rect.top
  }

  const handleMouseLeave = () => {
    mouseRef.current.x = -1000
    mouseRef.current.y = -1000
  }

  return (
    <div
      className={`relative inline-block mx-auto cursor-default ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <canvas
        ref={canvasRef}
        className="block mx-auto pointer-events-auto"
        aria-label={`${line1} ${line2}`}
      />
      {/* Hidden accessible heading for screen readers & SEO */}
      <h1 className="sr-only">
        {line1} {line2}
      </h1>
    </div>
  )
}

