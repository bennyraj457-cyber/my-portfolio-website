import React, { useEffect, useRef } from 'react'

/**
 * PixelCloudBackground
 *
 * Distinct Halftone Crosshatch Dither Texture matching reference:
 * - Macro pixel steps with high density of 50% diagonal micro-checkerboard dithering
 * - Generous central clearing and strong content-repulsion buffer giving plenty of breathing room
 * - Soft pastel light yellow shades (#ffd700, #ffe766, #fff299, #fffadc) fading gracefully into pure white (#ffffff)
 * - Solid color regions pushed far to the outer screen edges, emphasizing the textured dithered bands
 */
export default function PixelCloudBackground({
  className = '',
  macroSize = 28,
  interactive = true,
  contentRepelDistance = 110, // Expanded breathing room buffer
  driftSpeed = 0.45,
}) {
  const canvasRef = useRef(null)
  const mousePos = useRef({ x: -1000, y: -1000 })
  const contentObstacles = useRef([])
  const rafId = useRef(null)
  const driftOffsetRef = useRef(0)
  const timeRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    let width = 0
    let height = 0

    const updateSize = () => {
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
    }

    const updateObstacles = () => {
      const elements = document.querySelectorAll(
        'h1, h2, h3, h4, h5, h6, p, button, a, nav, [data-cursor], .nav-link, section'
      )
      const rects = []
      const vw = window.innerWidth
      const vh = window.innerHeight

      elements.forEach((el) => {
        if (el.tagName.toLowerCase() === 'section' && el.clientHeight > vh * 0.7) {
          return
        }

        const r = el.getBoundingClientRect()
        if (
          r.width > 0 &&
          r.height > 0 &&
          r.bottom > 0 &&
          r.top < vh &&
          r.right > 0 &&
          r.left < vw
        ) {
          rects.push({
            left: r.left - contentRepelDistance,
            top: r.top - contentRepelDistance,
            right: r.right + contentRepelDistance,
            bottom: r.bottom + contentRepelDistance,
            cx: r.left + r.width / 2,
            cy: r.top + r.height / 2,
            halfW: r.width / 2 + contentRepelDistance,
            halfH: r.height / 2 + contentRepelDistance,
          })
        }
      })
      contentObstacles.current = rects
    }

    updateSize()
    updateObstacles()

    const handleResize = () => {
      updateSize()
      updateObstacles()
    }

    const handleScroll = () => {
      updateObstacles()
    }

    const handleMouseMove = (e) => {
      if (!interactive) return
      mousePos.current.x = e.clientX
      mousePos.current.y = e.clientY
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('scroll', handleScroll, { passive: true })
    if (interactive) {
      window.addEventListener('mousemove', handleMouseMove, { passive: true })
    }

    // Instant O(1) mathematical check for the cursor to adapt color
    window.__isOverPixelBackground = (x, y) => {
      if (x < 0 || y < 0 || x >= width || y >= height) return false

      const obstacles = contentObstacles.current
      for (let i = 0; i < obstacles.length; i++) {
        const obs = obstacles[i]
        if (x >= obs.left && x <= obs.right && y >= obs.top && y <= obs.bottom) {
          return false
        }
      }

      const cx = width / 2
      const cy = height * 0.44
      const rx = Math.min(width * 0.58, 700)
      const ry = Math.min(height * 0.42, 360)

      const dx = (x - cx) / rx
      const dy = (y - cy) / ry
      const dist = Math.sqrt(dx * dx + dy * dy)
      const driftX = x + driftOffsetRef.current
      const t = timeRef.current

      const wave =
        Math.sin(driftX * 0.003 + t * 0.4) * 0.35 +
        Math.cos(y * 0.0035 - t * 0.3) * 0.35 +
        Math.sin((driftX + y) * 0.002 + t * 0.2) * 0.2

      return dist - wave > 0.8
    }

    const obstacleInterval = setInterval(updateObstacles, 600)

    // Palette with only primary brand color and light shades
    const tones = {
      primary: '#ffd700',
      light1: '#ffe766',
      light2: '#fff299',
      light3: '#fffadc',
      white: '#ffffff',
    }

    // Pre-render pattern canvas tiles for distinct 50% micro-dot checkerboard dithering
    const createDitherPattern = (fgColor, bgColor) => {
      const pCanvas = document.createElement('canvas')
      pCanvas.width = 4
      pCanvas.height = 4
      const pCtx = pCanvas.getContext('2d')

      pCtx.fillStyle = bgColor
      pCtx.fillRect(0, 0, 4, 4)

      pCtx.fillStyle = fgColor
      pCtx.fillRect(0, 0, 2, 2)
      pCtx.fillRect(2, 2, 2, 2)

      return ctx.createPattern(pCanvas, 'repeat')
    }

    const patternPrimary_Light1 = createDitherPattern(tones.primary, tones.light1)
    const patternLight1_Light2 = createDitherPattern(tones.light1, tones.light2)
    const patternLight2_Light3 = createDitherPattern(tones.light2, tones.light3)
    const patternLight3_White = createDitherPattern(tones.light3, '#ffffff')
    const patternSparseWhite = createDitherPattern('rgba(255, 230, 80, 0.4)', '#ffffff')

    const render = () => {
      driftOffsetRef.current += driftSpeed
      timeRef.current += 0.004

      const drift = driftOffsetRef.current
      const time = timeRef.current

      ctx.clearRect(0, 0, width, height)

      const cx = width / 2
      const cy = height * 0.44

      // Expanded base clearing radius (leaves maximum breathing room in the middle)
      const rx = Math.min(width * 0.58, 700)
      const ry = Math.min(height * 0.42, 360)

      const cols = Math.ceil(width / macroSize)
      const rows = Math.ceil(height / macroSize)
      const obstacles = contentObstacles.current

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const px = c * macroSize
          const py = r * macroSize
          const midX = px + macroSize / 2
          const midY = py + macroSize / 2

          // Active repulsion around content
          let contentRepulsion = 0
          for (let i = 0; i < obstacles.length; i++) {
            const obs = obstacles[i]
            if (
              midX >= obs.left &&
              midX <= obs.right &&
              midY >= obs.top &&
              midY <= obs.bottom
            ) {
              const dx = Math.abs(midX - obs.cx) / obs.halfW
              const dy = Math.abs(midY - obs.cy) / obs.halfH
              const boxDist = Math.max(dx, dy)
              if (boxDist < 1.0) {
                const force = (1.0 - boxDist) * 3.5
                contentRepulsion = Math.max(contentRepulsion, force)
              }
            }
          }

          const dx = (midX - cx) / rx
          const dy = (midY - cy) / ry
          const dist = Math.sqrt(dx * dx + dy * dy)

          const driftX = midX + drift
          const wave =
            Math.sin(driftX * 0.003 + time * 0.4) * 0.35 +
            Math.cos(midY * 0.0035 - time * 0.3) * 0.35 +
            Math.sin((driftX + midY) * 0.002 + time * 0.2) * 0.2

          let mouseRepel = 0
          if (interactive) {
            const mx = midX - mousePos.current.x
            const my = midY - mousePos.current.y
            const mDist = Math.sqrt(mx * mx + my * my)
            if (mDist < 180) {
              mouseRepel = (1 - mDist / 180) * 0.28
            }
          }

          // Compute threshold with extra content clearance
          const val = dist - wave + mouseRepel - contentRepulsion

          // Heavily texture-oriented bands with generous dithering:
          // 1. Solid Primary (#ffd700) pushed only to the outermost screen perimeter
          if (val > 1.70) {
            ctx.fillStyle = tones.primary
            ctx.fillRect(px, py, macroSize, macroSize)
          }
          // 2. Wide Dither Band: Primary (#ffd700) over Light 1 (#ffe766)
          else if (val > 1.45) {
            ctx.fillStyle = patternPrimary_Light1
            ctx.fillRect(px, py, macroSize, macroSize)
          }
          // 3. Light 1 (#ffe766) with semi-transparent stepping
          else if (val > 1.30) {
            const checker = (c + r) % 2 === 0
            ctx.fillStyle = checker ? tones.light1 : patternPrimary_Light1
            ctx.fillRect(px, py, macroSize, macroSize)
          }
          // 4. Wide Dither Band: Light 1 over Light 2 (#fff299)
          else if (val > 1.10) {
            ctx.fillStyle = patternLight1_Light2
            ctx.fillRect(px, py, macroSize, macroSize)
          }
          // 5. Solid Light 2 (#fff299)
          else if (val > 0.98) {
            ctx.fillStyle = tones.light2
            ctx.fillRect(px, py, macroSize, macroSize)
          }
          // 6. Wide Dither Band: Light 2 over Light 3 (#fffadc)
          else if (val > 0.82) {
            ctx.fillStyle = patternLight2_Light3
            ctx.fillRect(px, py, macroSize, macroSize)
          }
          // 7. Wide Dither Band into Pure White
          else if (val > 0.68) {
            ctx.fillStyle = patternLight3_White
            ctx.fillRect(px, py, macroSize, macroSize)
          }
          // 8. Faint outer perimeter micro-sparkle dither
          else if (val > 0.58) {
            const sprinkle = (c * 7 + r * 13) % 4 === 0
            if (sprinkle) {
              ctx.fillStyle = patternSparseWhite
              ctx.fillRect(px, py, macroSize, macroSize)
            }
          }

          // Translucent overlapping rectangular patches (matching reference)
          const isTranslucentPatch = (c * 11 + r * 7) % 23 === 0
          if (isTranslucentPatch && val > 0.72 && val < 1.45) {
            ctx.fillStyle = 'rgba(255, 238, 120, 0.4)'
            ctx.fillRect(px, py, macroSize, macroSize)
          }
        }
      }

      rafId.current = requestAnimationFrame(render)
    }

    render()

    return () => {
      delete window.__isOverPixelBackground
      clearInterval(obstacleInterval)
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('scroll', handleScroll)
      if (interactive) {
        window.removeEventListener('mousemove', handleMouseMove)
      }
      if (rafId.current) cancelAnimationFrame(rafId.current)
    }
  }, [macroSize, interactive, contentRepelDistance, driftSpeed])

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none z-0 w-full h-full ${className}`}
      aria-hidden="true"
    />
  )
}
