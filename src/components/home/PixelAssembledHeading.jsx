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
  // Micro-precision hover break radius (12px) for tiny pin-point displacement
  const mouseRef = useRef({ x: -1000, y: -1000, radius: 12 })

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

    // 1. Offscreen measurement & sampling of headline text letter by letter
    const offCanvas = document.createElement('canvas')
    offCanvas.width = width
    offCanvas.height = height
    const offCtx = offCanvas.getContext('2d')

    offCtx.fillStyle = '#000000'
    const fontStr = `italic 400 ${fontSize}px "TRJN DaVinci", "TRJN DaVinci Text", serif`
    offCtx.font = fontStr
    offCtx.textBaseline = 'middle'

    const lineSpacing = fontSize * 1.08
    const startY = height / 2 - lineSpacing * 0.48
    const lines = [
      { text: line1, y: startY },
      { text: line2, y: startY + lineSpacing },
    ]

    const newParticles = []
    const step = pixelSize // Sample grid density
    let globalCharIndex = 0

    // Measure and sample character by character for crisp letter-by-letter pixel cascade
    lines.forEach((lineObj) => {
      const fullText = lineObj.text
      const fullWidth = offCtx.measureText(fullText).width
      let currentX = (width - fullWidth) / 2

      for (let c = 0; c < fullText.length; c++) {
        const char = fullText[c]
        const charWidth = offCtx.measureText(char).width

        if (char.trim() !== '') {
          // Clear offscreen canvas and draw only this single character
          offCtx.clearRect(0, 0, width, height)
          offCtx.fillText(char, currentX, lineObj.y)

          // Sample pixels for this specific character
          // Add margin around character bounding box
          const boxX1 = Math.max(0, Math.floor(currentX - 2))
          const boxX2 = Math.min(width, Math.ceil(currentX + charWidth + 8))
          const boxY1 = Math.max(0, Math.floor(lineObj.y - fontSize * 0.7))
          const boxY2 = Math.min(height, Math.ceil(lineObj.y + fontSize * 0.7))

          const charData = offCtx.getImageData(0, 0, width, height).data

          // Letter appearance timing: each letter starts 110ms after previous letter
          const letterBaseDelay = 180 + globalCharIndex * 110

          for (let y = boxY1; y < boxY2; y += step) {
            for (let x = boxX1; x < boxX2; x += step) {
              const idx = (y * width + x) * 4
              const alpha = charData[idx + 3]

              if (alpha > 120) {
                // Micro-pixel jitter within this character's reveal
                const pixelJitter = Math.random() * 80
                newParticles.push({
                  originX: x,
                  originY: y,
                  x,
                  y,
                  vx: 0,
                  vy: 0,
                  size: step - 0.4,
                  alpha: 0,
                  delay: letterBaseDelay + pixelJitter,
                  startTime: performance.now(),
                  fadeInDuration: 240 + Math.random() * 140,
                })
              }
            }
          }
          globalCharIndex++
        } else {
          // Space character: small pause
          globalCharIndex += 0.5
        }

        currentX += charWidth
      }
    })

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

        // Pixel has not appeared yet in sequence
        if (elapsed < p.delay) {
          continue
        }

        // Smooth gradual fade-in for each individual pixel (0 to 1)
        const appearProgress = Math.min(1, (elapsed - p.delay) / p.fadeInDuration)
        p.alpha = appearProgress

        // Spring physics towards target origin
        const spring = 0.08
        const friction = 0.82

        // Mouse repulsion
        const dxMouse = p.x - mouse.x
        const dyMouse = p.y - mouse.y
        const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse)

        if (distMouse < mouse.radius) {
          // Delicate repulsion force within micro 12px circle
          const force = (1 - distMouse / mouse.radius) * 2.5
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

        // Color transition: starts as brand gold (#ffd700), smoothly settles into deep editorial black (#000000)
        ctx.globalAlpha = p.alpha
        if (appearProgress < 0.35) {
          ctx.fillStyle = '#ffd700'
        } else if (appearProgress < 0.7) {
          ctx.fillStyle = '#666666'
        } else {
          ctx.fillStyle = '#000000'
        }

        ctx.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size)
      }

      ctx.globalAlpha = 1.0

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

