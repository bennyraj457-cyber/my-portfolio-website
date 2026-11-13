import React, { useEffect, useRef } from 'react'

/**
 * PixelCloudBackground
 *
 * Distinct Halftone Crosshatch Dither Texture:
 * - Mounted specifically inside the Hero section (covers 100% full screen width & height)
 * - Multi-Layer Parallax Drift (Depth Effect): Background (0.3x) & Foreground (0.65x)
 * - Generous central clearing with dynamic repulsion away from hero headline and text
 * - Cursor Dust / Dither Wake: Spawns 2x2 and 4x4 micro-dither pixel dots during mouse movement
 * - Micro-Twinkle Digital Sparkles (Ambient Life): Gentle perimeter fireflies pulsing in luminosity
 * - Drifting Micro-Pixel "Islands":
 *   Tiny 2x2 and 3x3 pixel clusters that detach from the clouds, gracefully drift across
 *   the negative space right-to-left, and dissolve smoothly before touching the headline text.
 */
export default function PixelCloudBackground({
  className = '',
  macroSize = 28,
  interactive = true,
  contentRepelDistance = 90,
  driftSpeed = 0.45,
}) {
  const canvasRef = useRef(null)
  const mousePos = useRef({ x: -1000, y: -1000 })
  const prevMousePos = useRef({ x: -1000, y: -1000 })
  const contentObstacles = useRef([])
  const particles = useRef([])
  const sparkles = useRef([])
  const driftingIslands = useRef([])
  const rafId = useRef(null)

  const bgDriftOffsetRef = useRef(0)
  const fgDriftOffsetRef = useRef(0)
  const timeRef = useRef(0)
  const islandSpawnTimer = useRef(0)

  // Floating Word Formation State
  const wordState = useRef({
    words: ['BENNY', 'CREATE', 'DESIGN'],
    currentIndex: 0,
    timer: 0,
    cycleDuration: 360, // ~6 seconds per cycle at 60fps
    dots: [],
    pixelSize: 4,
    dotSpacing: 6,
  })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    let width = 0
    let height = 0

    const sampleWordPixels = (word) => {
      const safeWidth = Math.max(width || 0, window.innerWidth || 1200)
      const safeHeight = Math.max(height || 0, window.innerHeight || 800)
      if (safeWidth <= 0 || safeHeight <= 0) return []

      const offCanvas = document.createElement('canvas')
      const offCtx = offCanvas.getContext('2d')
      const fontSize = Math.max(28, Math.min(safeWidth * 0.08, 64))
      offCanvas.width = safeWidth
      offCanvas.height = Math.max(1, Math.round(fontSize * 2))

      offCtx.font = `bold ${fontSize}px "Geist", -apple-system, sans-serif`
      offCtx.fillStyle = '#ffffff'
      offCtx.textAlign = 'center'
      offCtx.textBaseline = 'middle'
      offCtx.fillText(word, safeWidth / 2, offCanvas.height / 2)

      const imgData = offCtx.getImageData(0, 0, offCanvas.width, offCanvas.height).data
      const step = 6 // Discrete step distance between pixel points
      const points = []

      // Choose vertical positioning above or below hero text in open negative space
      const anchorY = safeHeight > 650 ? safeHeight * 0.16 : safeHeight * 0.12

      for (let y = 0; y < offCanvas.height; y += step) {
        for (let x = 0; x < offCanvas.width; x += step) {
          const idx = (y * offCanvas.width + x) * 4
          if (imgData[idx + 3] > 120) {
            points.push({
              targetX: x,
              targetY: anchorY + (y - offCanvas.height / 2),
              // Initial spawn scatter position
              x: x + (Math.random() - 0.5) * 80,
              y: anchorY + (y - offCanvas.height / 2) + (Math.random() - 0.5) * 50,
              size: Math.random() > 0.4 ? 4 : 2,
              color: Math.random() > 0.4 ? '#ffd700' : '#ffe766',
              scatterVx: (Math.random() - 0.5) * 1.5 - 0.4,
              scatterVy: (Math.random() - 0.5) * 1.2,
              seed: Math.random() * Math.PI * 2,
            })
          }
        }
      }
      return points
    }

    const updateSize = () => {
      const parent = canvas.parentElement || document.body
      width = canvas.width = parent.clientWidth || window.innerWidth || 1200
      height = canvas.height = parent.clientHeight || window.innerHeight || 800
      initSparkles()
      initDriftingIslands()
      wordState.current.dots = sampleWordPixels(wordState.current.words[wordState.current.currentIndex])
    }

    updateSize()

    const updateObstacles = () => {
      const canvasRect = canvas.getBoundingClientRect()
      const elements = document.querySelectorAll(
        '#hero h1, #hero p, #hero button, #hero a, #hero [data-cursor]'
      )
      const rects = []

      elements.forEach((el) => {
        const r = el.getBoundingClientRect()
        const top = r.top - canvasRect.top
        const left = r.left - canvasRect.left
        const bottom = r.bottom - canvasRect.top
        const right = r.right - canvasRect.left

        if (r.width > 0 && r.height > 0) {
          rects.push({
            left: left - contentRepelDistance,
            top: top - contentRepelDistance,
            right: right + contentRepelDistance,
            bottom: bottom + contentRepelDistance,
            cx: left + r.width / 2,
            cy: top + r.height / 2,
            halfW: r.width / 2 + contentRepelDistance,
            halfH: r.height / 2 + contentRepelDistance,
            rawLeft: left,
            rawRight: right,
            rawTop: top,
            rawBottom: bottom,
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
      const canvasRect = canvas.getBoundingClientRect()
      const curX = e.clientX - canvasRect.left
      const curY = e.clientY - canvasRect.top

      const dx = curX - prevMousePos.current.x
      const dy = curY - prevMousePos.current.y
      const speed = Math.sqrt(dx * dx + dy * dy)

      if (speed > 2 && curX >= 0 && curX <= width && curY >= 0 && curY <= height) {
        const count = Math.min(6, Math.floor(speed / 8) + 1)
        for (let i = 0; i < count; i++) {
          const size = Math.random() > 0.5 ? 4 : 2
          const angle = Math.random() * Math.PI * 2
          const scatter = Math.random() * 16

          particles.current.push({
            x: curX + Math.cos(angle) * scatter,
            y: curY + Math.sin(angle) * scatter,
            vx: (Math.random() - 0.5) * 0.8 - driftSpeed * 0.65,
            vy: (Math.random() - 0.5) * 0.8,
            size,
            alpha: 0.9,
            color: Math.random() > 0.4 ? '#ffd700' : '#ffe766',
            life: 1.0,
            decay: 0.02 + Math.random() * 0.015,
          })
        }
      }

      prevMousePos.current.x = curX
      prevMousePos.current.y = curY
      mousePos.current.x = curX
      mousePos.current.y = curY
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('scroll', handleScroll, { passive: true })
    if (interactive) {
      window.addEventListener('mousemove', handleMouseMove, { passive: true })
    }

    window.__isOverPixelBackground = (clientX, clientY) => {
      if (!canvas) return false
      const canvasRect = canvas.getBoundingClientRect()
      if (
        clientX < canvasRect.left ||
        clientX > canvasRect.right ||
        clientY < canvasRect.top ||
        clientY > canvasRect.bottom
      ) {
        return false
      }

      const x = clientX - canvasRect.left
      const y = clientY - canvasRect.top

      const obstacles = contentObstacles.current
      for (let i = 0; i < obstacles.length; i++) {
        const obs = obstacles[i]
        if (x >= obs.left && x <= obs.right && y >= obs.top && y <= obs.bottom) {
          return false
        }
      }

      const cx = width / 2
      const cy = height * 0.48
      const rx = Math.min(width * 0.55, 680)
      const ry = Math.min(height * 0.38, 320)

      const dx = (x - cx) / rx
      const dy = (y - cy) / ry
      const dist = Math.sqrt(dx * dx + dy * dy)
      const driftX = x + fgDriftOffsetRef.current
      const t = timeRef.current

      const wave =
        Math.sin(driftX * 0.003 + t * 0.4) * 0.35 +
        Math.cos(y * 0.0035 - t * 0.3) * 0.35 +
        Math.sin((driftX + y) * 0.002 + t * 0.2) * 0.2

      return dist - wave > 0.8
    }

    const obstacleInterval = setInterval(updateObstacles, 600)

    const tones = {
      primary: '#ffd700',
      light1: '#ffe766',
      light2: '#fff299',
      light3: '#fffadc',
      white: '#ffffff',
    }

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
      bgDriftOffsetRef.current += driftSpeed * 0.3
      fgDriftOffsetRef.current += driftSpeed * 0.65
      timeRef.current += 0.004

      const bgDrift = bgDriftOffsetRef.current
      const fgDrift = fgDriftOffsetRef.current
      const time = timeRef.current

      ctx.clearRect(0, 0, width, height)

      const cx = width / 2
      const cy = height * 0.48

      const rx = Math.min(width * 0.55, 680)
      const ry = Math.min(height * 0.38, 320)

      const cols = Math.ceil(width / macroSize)
      const rows = Math.ceil(height / macroSize)
      const obstacles = contentObstacles.current

      // 1. Render Layered Parallax Cloud Grid
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const px = c * macroSize
          const py = r * macroSize
          const midX = px + macroSize / 2
          const midY = py + macroSize / 2

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

          const bgDriftX = midX + bgDrift
          const bgWave =
            Math.sin(bgDriftX * 0.0028 + time * 0.3) * 0.35 +
            Math.cos(midY * 0.003 - time * 0.25) * 0.35 +
            Math.sin((bgDriftX + midY) * 0.0018 + time * 0.15) * 0.2

          const bgVal = dist - bgWave - contentRepulsion

          const fgDriftX = midX + fgDrift
          const fgWave =
            Math.sin(fgDriftX * 0.0035 + time * 0.45) * 0.35 +
            Math.cos(midY * 0.0038 - time * 0.35) * 0.35 +
            Math.sin((fgDriftX + midY) * 0.0022 + time * 0.25) * 0.2

          const fgVal = dist - fgWave - contentRepulsion

          if (bgVal > 1.70) {
            ctx.fillStyle = tones.primary
            ctx.fillRect(px, py, macroSize, macroSize)
          } else if (bgVal > 1.48) {
            ctx.fillStyle = patternPrimary_Light1
            ctx.fillRect(px, py, macroSize, macroSize)
          } else if (bgVal > 1.32) {
            const checker = (c + r) % 2 === 0
            ctx.fillStyle = checker ? tones.light1 : patternPrimary_Light1
            ctx.fillRect(px, py, macroSize, macroSize)
          }

          if (fgVal > 1.10 && fgVal <= 1.32) {
            ctx.fillStyle = patternLight1_Light2
            ctx.fillRect(px, py, macroSize, macroSize)
          } else if (fgVal > 0.98 && fgVal <= 1.10) {
            ctx.fillStyle = tones.light2
            ctx.fillRect(px, py, macroSize, macroSize)
          } else if (fgVal > 0.82 && fgVal <= 0.98) {
            ctx.fillStyle = patternLight2_Light3
            ctx.fillRect(px, py, macroSize, macroSize)
          } else if (fgVal > 0.68 && fgVal <= 0.82) {
            ctx.fillStyle = patternLight3_White
            ctx.fillRect(px, py, macroSize, macroSize)
          } else if (fgVal > 0.58 && fgVal <= 0.68) {
            const sprinkle = (c * 7 + r * 13) % 4 === 0
            if (sprinkle) {
              ctx.fillStyle = patternSparseWhite
              ctx.fillRect(px, py, macroSize, macroSize)
            }
          }

          const isTranslucentPatch = (c * 11 + r * 7) % 23 === 0
          if (isTranslucentPatch && fgVal > 0.72 && fgVal < 1.45) {
            ctx.fillStyle = 'rgba(255, 238, 120, 0.4)'
            ctx.fillRect(px, py, macroSize, macroSize)
          }
        }
      }

      // 2. Render Micro-Twinkle Digital Sparkles (Ambient Life)
      const spList = sparkles.current
      for (let i = 0; i < spList.length; i++) {
        const sp = spList[i]
        sp.phase += sp.speed
        const brightness = (Math.sin(sp.phase) + 1) / 2
        if (brightness > 0.05) {
          const curAngle = sp.relAngle
          const sx = cx + Math.cos(curAngle) * (rx * sp.relDist) - (fgDrift % width) * 0.3
          const sy = cy + Math.sin(curAngle) * (ry * sp.relDist)

          let insideText = false
          for (let j = 0; j < obstacles.length; j++) {
            const obs = obstacles[j]
            if (sx >= obs.left && sx <= obs.right && sy >= obs.top && sy <= obs.bottom) {
              insideText = true
              break
            }
          }

          if (!insideText && sx >= 0 && sx <= width && sy >= 0 && sy <= height) {
            const snapX = Math.floor(sx / 2) * 2
            const snapY = Math.floor(sy / 2) * 2
            ctx.fillStyle = brightness > 0.5 ? '#fffadc' : '#ffd700'
            ctx.globalAlpha = brightness * 0.85
            ctx.fillRect(snapX, snapY, sp.size, sp.size)
          }
        }
      }
      ctx.globalAlpha = 1.0

      // 3. Render Drifting Micro-Pixel "Islands" (Floating & Dissolving before Headline)
      islandSpawnTimer.current++
      if (islandSpawnTimer.current % 140 === 0 && driftingIslands.current.length < 16) {
        driftingIslands.current.push(createIsland(true))
      }

      const islands = driftingIslands.current
      for (let i = islands.length - 1; i >= 0; i--) {
        const isl = islands[i]
        isl.x += isl.vx
        isl.y += isl.vy

        // Smooth fade-in on entry
        if (isl.fadeIn) {
          isl.alpha += 0.02
          if (isl.alpha >= isl.opacity) {
            isl.alpha = isl.opacity
            isl.fadeIn = false
          }
        }

        // Proximity detection to headline text: dissolve before touching
        let minObstacleDist = Infinity
        for (let j = 0; j < obstacles.length; j++) {
          const obs = obstacles[j]
          const dx = Math.max(obs.rawLeft - isl.x, 0, isl.x - obs.rawRight)
          const dy = Math.max(obs.rawTop - isl.y, 0, isl.y - obs.rawBottom)
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < minObstacleDist) minObstacleDist = dist
        }

        // Dissolve smoothly if approaching within 70px of text
        if (minObstacleDist < 70) {
          isl.alpha -= 0.04
        }

        // Remove if dissolved or scrolled off left side
        if (isl.alpha <= 0 || isl.x < -40) {
          islands.splice(i, 1)
          continue
        }

        // Render discrete pixel dots in the island cluster
        ctx.globalAlpha = Math.max(0, isl.alpha)
        for (let k = 0; k < isl.cluster.length; k++) {
          const dot = isl.cluster[k]
          ctx.fillStyle = dot.color
          const snapX = Math.floor((isl.x + dot.dx) / 2) * 2
          const snapY = Math.floor((isl.y + dot.dy) / 2) * 2
          ctx.fillRect(snapX, snapY, isl.pixelSize, isl.pixelSize)
        }
      }
      ctx.globalAlpha = 1.0

      // 4. Render & Animate Rotating Pixel Words ("BENNY" / "CREATE" / "DESIGN")
      const ws = wordState.current
      ws.timer++
      const cycleProgress = (ws.timer % ws.cycleDuration) / ws.cycleDuration

      // Phase transitions:
      // 0.00 -> 0.20: Assemble (Micro-pixels converge smoothly from scatter into letter shapes)
      // 0.20 -> 0.75: Fully Formed (Micro-twinkle jitter and slow lateral drift)
      // 0.75 -> 0.95: Dissolve / Scatter (Particles drift apart into the digital ether)
      // 0.95 -> 1.00: Switch to next word
      let wordAlpha = 0
      let convergence = 0
      let isDispersing = false

      if (cycleProgress < 0.2) {
        // Assemble phase
        const p = cycleProgress / 0.2
        wordAlpha = p
        convergence = p
      } else if (cycleProgress < 0.75) {
        // Formed & holding
        wordAlpha = 1.0
        convergence = 1.0
      } else if (cycleProgress < 0.95) {
        // Disperse / dissolve phase
        const p = (cycleProgress - 0.75) / 0.2
        wordAlpha = 1.0 - p
        convergence = 1.0
        isDispersing = true
      } else {
        // Transition to next word
        if (ws.timer % ws.cycleDuration === ws.cycleDuration - 1) {
          ws.currentIndex = (ws.currentIndex + 1) % ws.words.length
          ws.dots = sampleWordPixels(ws.words[ws.currentIndex])
        }
      }

      if (wordAlpha > 0.02 && ws.dots.length > 0) {
        ctx.globalAlpha = Math.min(0.85, wordAlpha * 0.85)
        for (let i = 0; i < ws.dots.length; i++) {
          const d = ws.dots[i]

          if (isDispersing) {
            d.x += d.scatterVx * 1.6
            d.y += d.scatterVy * 1.6
          } else {
            // Smooth lerp to target position
            d.x += (d.targetX - d.x) * (0.08 * convergence + 0.02)
            d.y += (d.targetY - d.y) * (0.08 * convergence + 0.02)
          }

          // Gentle ambient float jitter
          const jitterX = Math.sin(time * 2 + d.seed) * 0.8
          const jitterY = Math.cos(time * 2.2 + d.seed) * 0.8

          const snapX = Math.floor((d.x + jitterX) / 2) * 2
          const snapY = Math.floor((d.y + jitterY) / 2) * 2

          ctx.fillStyle = d.color
          ctx.fillRect(snapX, snapY, d.size, d.size)
        }
      }
      ctx.globalAlpha = 1.0

      // 5. Render & Update Cursor Dust / Dither Wake Particles
      const pList = particles.current
      for (let i = pList.length - 1; i >= 0; i--) {
        const p = pList[i]
        p.life -= p.decay
        if (p.life <= 0) {
          pList.splice(i, 1)
          continue
        }

        p.x += p.vx
        p.y += p.vy

        ctx.fillStyle = p.color
        ctx.globalAlpha = p.life * p.alpha
        const snapX = Math.floor(p.x / 2) * 2
        const snapY = Math.floor(p.y / 2) * 2
        ctx.fillRect(snapX, snapY, p.size, p.size)
      }
      ctx.globalAlpha = 1.0

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
      className={`absolute inset-0 pointer-events-none z-0 w-full h-full ${className}`}
      aria-hidden="true"
    />
  )
}
