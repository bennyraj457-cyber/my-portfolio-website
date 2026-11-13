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
  const entranceStartTimeRef = useRef(null)
  const cellDelaysRef = useRef(new Map())
  const glyphsRef = useRef([])
  const ripplesRef = useRef([])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    let width = 0
    let height = 0

    const updateSize = () => {
      const parent = canvas.parentElement || document.body
      width = canvas.width = parent.clientWidth || window.innerWidth
      height = canvas.height = parent.clientHeight || window.innerHeight
      initSparkles()
      initDriftingIslands()
      initCellDelays()
      initGlyphs()
    }

    // 5x5 Micro-Pixel Glyphs: Cursor Arrow (↖), Code Brackets ({}), Crosshair (✛), Star (✦)
    const GLYPH_PATTERNS = [
      // Cursor ↖
      {
        name: 'cursor',
        size: 5,
        matrix: [
          [1, 1, 1, 1, 0],
          [1, 1, 0, 0, 0],
          [1, 0, 1, 0, 0],
          [1, 0, 0, 1, 0],
          [0, 0, 0, 0, 1],
        ],
      },
      // Code Brackets { }
      {
        name: 'code',
        size: 5,
        matrix: [
          [0, 1, 0, 1, 0],
          [1, 0, 0, 0, 1],
          [0, 1, 0, 1, 0],
          [1, 0, 0, 0, 1],
          [0, 1, 0, 1, 0],
        ],
      },
      // Crosshair ✛
      {
        name: 'crosshair',
        size: 5,
        matrix: [
          [0, 0, 1, 0, 0],
          [0, 0, 1, 0, 0],
          [1, 1, 1, 1, 1],
          [0, 0, 1, 0, 0],
          [0, 0, 1, 0, 0],
        ],
      },
      // Star ✦
      {
        name: 'star',
        size: 5,
        matrix: [
          [0, 0, 1, 0, 0],
          [0, 1, 1, 1, 0],
          [1, 1, 1, 1, 1],
          [0, 1, 1, 1, 0],
          [0, 0, 1, 0, 0],
        ],
      },
    ]

    const initGlyphs = () => {
      const list = []
      const glyphCount = 8 // 8 organic glyph artifacts across the canvas
      for (let i = 0; i < glyphCount; i++) {
        const pattern = GLYPH_PATTERNS[i % GLYPH_PATTERNS.length]
        // Anchor relative angle and radius around the perimeter cloud ring
        const relAngle = (i / glyphCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.4
        const relDist = 0.72 + Math.random() * 0.35 // Placed within dense cloud zone
        list.push({
          pattern,
          relAngle,
          relDist,
          dotSize: 3, // Crisp 3px micro-pixels
          phase: Math.random() * Math.PI * 2,
          speed: 0.02 + Math.random() * 0.015,
        })
      }
      glyphsRef.current = list
    }

    const initCellDelays = () => {
      const cols = Math.ceil(width / macroSize)
      const rows = Math.ceil(height / macroSize)
      const cx = width / 2
      const cy = height * 0.48
      const rx = Math.min(width * 0.55, 680)
      const ry = Math.min(height * 0.38, 320)
      const map = new Map()

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const midX = c * macroSize + macroSize / 2
          const midY = r * macroSize + macroSize / 2

          // Distance from center clearing
          const dx = (midX - cx) / rx
          const dy = (midY - cy) / ry
          const dist = Math.sqrt(dx * dx + dy * dy)

          // Discrete organic hash for individual pixel delay
          // Perimeter pixels start appearing from 350ms to 2400ms in an organic, dithered crystallization
          const hash = Math.sin(c * 12.9898 + r * 78.233) * 43758.5453
          const jitter = (hash - Math.floor(hash)) // 0 to 1

          // Deepest outer clouds emerge first, sweeping inward towards the clearing perimeter
          const radialFactor = Math.max(0, 2.2 - dist) / 2.2
          const delay = 350 + radialFactor * 1200 + jitter * 700

          map.set(`${r},${c}`, {
            delay,
            duration: 380 + jitter * 200,
          })
        }
      }
      cellDelaysRef.current = map
    }

    const initSparkles = () => {
      const list = []
      const count = 35
      for (let i = 0; i < count; i++) {
        list.push({
          relAngle: Math.random() * Math.PI * 2,
          relDist: 0.65 + Math.random() * 0.45,
          size: Math.random() > 0.5 ? 4 : 2,
          phase: Math.random() * Math.PI * 2,
          speed: 0.03 + Math.random() * 0.04,
        })
      }
      sparkles.current = list
    }

    // Initialize initial drifting micro-pixel islands
    const createIsland = (spawnAtEdge = true) => {
      // 2x2 or 3x3 pixel grid structure for each cluster
      const sizeType = Math.random() > 0.4 ? 3 : 2
      const pixelSize = 3 // 3px discrete pixels per dot
      const cluster = []

      // Generate random organic mini island shape
      for (let ox = 0; ox < sizeType; ox++) {
        for (let oy = 0; oy < sizeType; oy++) {
          if (Math.random() > 0.25) {
            cluster.push({
              dx: ox * pixelSize,
              dy: oy * pixelSize,
              color: Math.random() > 0.5 ? '#ffd700' : '#ffe766',
            })
          }
        }
      }

      const spawnX = spawnAtEdge ? width + 20 : Math.random() * width
      const spawnY = height * 0.15 + Math.random() * (height * 0.7)

      return {
        x: spawnX,
        y: spawnY,
        vx: -(0.5 + Math.random() * 0.4), // Drifts right to left
        vy: (Math.random() - 0.5) * 0.15, // Subtle vertical float
        cluster,
        pixelSize,
        opacity: 0.85,
        alpha: 0.0, // Fades in smoothly
        fadeIn: true,
      }
    }

    const initDriftingIslands = () => {
      const list = []
      const count = 12 // Concurrent floating micro-islands
      for (let i = 0; i < count; i++) {
        const isl = createIsland(false)
        isl.alpha = 0.4 + Math.random() * 0.4
        list.push(isl)
      }
      driftingIslands.current = list
    }

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

    const spawnRipple = (clientX, clientY) => {
      const canvasRect = canvas.getBoundingClientRect()
      const x = clientX - canvasRect.left
      const y = clientY - canvasRect.top

      if (x < 0 || x > width || y < 0 || y > height) return

      // Spawn ripple ring waves
      ripplesRef.current.push({
        x,
        y,
        radius: 4,
        maxRadius: 160 + Math.random() * 40,
        speed: 3.5,
        alpha: 0.95,
        decay: 0.016,
      })

      // Spawn burst of micro-pixel spark dots in circular bloom
      const sparkCount = 18
      for (let i = 0; i < sparkCount; i++) {
        const angle = (i / sparkCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.2
        const burstSpeed = 1.8 + Math.random() * 2.4
        particles.current.push({
          x,
          y,
          vx: Math.cos(angle) * burstSpeed - driftSpeed * 0.45,
          vy: Math.sin(angle) * burstSpeed,
          size: Math.random() > 0.4 ? 4 : 2,
          alpha: 1.0,
          color: Math.random() > 0.4 ? '#ffd700' : '#ffe766',
          life: 1.0,
          decay: 0.02 + Math.random() * 0.012,
        })
      }
    }

    let isPointerDown = false
    const handlePointerDown = (e) => {
      if (!interactive) return
      // Only trigger if click/tap is directly on canvas or section background, not on interactive links/buttons
      if (e.target.closest('a, button, input, textarea, [data-cursor="link"]')) return
      isPointerDown = true
      spawnRipple(e.clientX, e.clientY)
    }

    const handlePointerUp = () => {
      isPointerDown = false
    }

    const handlePointerMove = (e) => {
      if (!interactive || !isPointerDown) return
      if (Math.random() > 0.4) {
        spawnRipple(e.clientX, e.clientY)
      }
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('scroll', handleScroll, { passive: true })
    if (interactive) {
      window.addEventListener('mousemove', handleMouseMove, { passive: true })
      window.addEventListener('pointerdown', handlePointerDown)
      window.addEventListener('pointerup', handlePointerUp)
      window.addEventListener('pointermove', handlePointerMove, { passive: true })
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
      if (!entranceStartTimeRef.current) {
        entranceStartTimeRef.current = performance.now()
      }
      const elapsedEntrance = performance.now() - entranceStartTimeRef.current

      // First start with clean blank white screen (400ms delay), then pixels slowly emerge over 1800ms
      const delay = 400
      let globalAuroraAlpha = 0
      if (elapsedEntrance > delay) {
        const progress = Math.min(1, (elapsedEntrance - delay) / 1800)
        // Gentle ease-out sine-cubic curve for slow, luxurious reveal
        globalAuroraAlpha = 1 - Math.pow(1 - progress, 2.5)
      }

      // Smooth continuous right-to-left wind drift for natural clouds
      bgDriftOffsetRef.current -= driftSpeed * 0.45
      fgDriftOffsetRef.current -= driftSpeed * 0.85
      timeRef.current += 0.007

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

      // 1. Render Layered Parallax Cloud Grid with Organic Pixel-by-Pixel Crystallization
      const cellDelays = cellDelaysRef.current
      const isIntroActive = elapsedEntrance < 2800

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const px = c * macroSize
          const py = r * macroSize
          const midX = px + macroSize / 2
          const midY = py + macroSize / 2

          // Pixel-by-pixel individual appearance check
          let pixelAlpha = 1.0
          if (isIntroActive) {
            const timing = cellDelays?.get(`${r},${c}`)
            if (timing) {
              if (elapsedEntrance < timing.delay) {
                // Not manifested yet: remains blank white
                continue
              }
              const p = Math.min(1, (elapsedEntrance - timing.delay) / timing.duration)
              pixelAlpha = 1 - Math.pow(1 - p, 2)
            }
          }

          ctx.globalAlpha = pixelAlpha

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

          // Background cloud layer: puffy wave harmonics drifting left
          const bgDriftX = midX - bgDrift
          const bgWave =
            Math.sin(bgDriftX * 0.0025 + time * 0.4) * 0.42 +
            Math.cos(midY * 0.0032 + bgDriftX * 0.001 - time * 0.3) * 0.38 +
            Math.sin((bgDriftX * 0.0018 + midY * 0.0025) + time * 0.2) * 0.25

          const bgVal = dist - bgWave - contentRepulsion

          // Foreground cloud layer: faster micro-texture drifting left
          const fgDriftX = midX - fgDrift
          const fgWave =
            Math.sin(fgDriftX * 0.0035 + time * 0.55) * 0.4 +
            Math.cos(midY * 0.0042 + fgDriftX * 0.0015 - time * 0.4) * 0.38 +
            Math.sin((fgDriftX * 0.0024 + midY * 0.003) + time * 0.3) * 0.22

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
      if (globalAuroraAlpha > 0.1) {
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
              ctx.globalAlpha = brightness * 0.85 * globalAuroraAlpha
              ctx.fillRect(snapX, snapY, sp.size, sp.size)
            }
          }
        }
      }
      ctx.globalAlpha = 1.0

      // 3. Render Drifting Micro-Pixel "Islands" (Floating & Dissolving before Headline)
      if (globalAuroraAlpha > 0.2) {
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
          ctx.globalAlpha = Math.max(0, isl.alpha * globalAuroraAlpha)
          for (let k = 0; k < isl.cluster.length; k++) {
            const dot = isl.cluster[k]
            ctx.fillStyle = dot.color
            const snapX = Math.floor((isl.x + dot.dx) / 2) * 2
            const snapY = Math.floor((isl.y + dot.dy) / 2) * 2
            ctx.fillRect(snapX, snapY, isl.pixelSize, isl.pixelSize)
          }
        }

        // 3b. Pixel Constellation Lines (Very faint 1px hairline connectors between adjacent floating islands)
        ctx.strokeStyle = '#ffd700'
        ctx.lineWidth = 1
        const maxLinkDist = 110 // Max distance to form a constellation link

        for (let a = 0; a < islands.length; a++) {
          const islA = islands[a]
          for (let b = a + 1; b < islands.length; b++) {
            const islB = islands[b]
            const dx = islA.x - islB.x
            const dy = islA.y - islB.y
            const dist = Math.sqrt(dx * dx + dy * dy)

            if (dist < maxLinkDist) {
              // Smooth momentary fade based on proximity and island alpha
              const proximity = 1 - dist / maxLinkDist
              const lineAlpha = proximity * 0.28 * Math.min(islA.alpha, islB.alpha) * globalAuroraAlpha

              if (lineAlpha > 0.02) {
                ctx.globalAlpha = lineAlpha
                ctx.beginPath()
                // Snap points to crisp 1px canvas grid
                ctx.moveTo(Math.floor(islA.x) + 0.5, Math.floor(islA.y) + 0.5)
                ctx.lineTo(Math.floor(islB.x) + 0.5, Math.floor(islB.y) + 0.5)
                ctx.stroke()
              }
            }
          }
        }
      }
      ctx.globalAlpha = 1.0

      // 4. Render Embedded Micro-Pixel Glyphs & Icons (↖, {}, ✛, ✦)
      if (globalAuroraAlpha > 0.25) {
        const glyphs = glyphsRef.current
        for (let i = 0; i < glyphs.length; i++) {
          const g = glyphs[i]
          g.phase += g.speed

          // Gentle luminosity breathe (between 0.35 and 0.85)
          const breathe = 0.55 + Math.sin(g.phase) * 0.3

          // Parallax position anchored into cloud drift
          const gx = cx + Math.cos(g.relAngle) * (rx * g.relDist) - (fgDrift % width) * 0.4
          const gy = cy + Math.sin(g.relAngle) * (ry * g.relDist)

          let insideText = false
          for (let j = 0; j < obstacles.length; j++) {
            const obs = obstacles[j]
            if (gx >= obs.left && gx <= obs.right && gy >= obs.top && gy <= obs.bottom) {
              insideText = true
              break
            }
          }

          if (!insideText && gx >= -20 && gx <= width + 20 && gy >= -20 && gy <= height + 20) {
            ctx.globalAlpha = breathe * globalAuroraAlpha
            const matrix = g.pattern.matrix
            const dotSize = g.dotSize

            for (let row = 0; row < matrix.length; row++) {
              for (let col = 0; col < matrix[row].length; col++) {
                if (matrix[row][col] === 1) {
                  const px = Math.floor(gx + (col - 2) * dotSize)
                  const py = Math.floor(gy + (row - 2) * dotSize)
                  ctx.fillStyle = breathe > 0.65 ? '#ffffff' : '#ffd700'
                  ctx.fillRect(px, py, dotSize, dotSize)
                }
              }
            }
          }
        }
      }
      ctx.globalAlpha = 1.0

      // 5. Render & Update Interactive Ripple Waves
      const ripples = ripplesRef.current
      for (let i = ripples.length - 1; i >= 0; i--) {
        const rip = ripples[i]
        rip.radius += rip.speed
        rip.alpha -= rip.decay

        if (rip.alpha <= 0 || rip.radius > rip.maxRadius) {
          ripples.splice(i, 1)
          continue
        }

        ctx.globalAlpha = Math.max(0, rip.alpha * 0.45)
        ctx.strokeStyle = '#ffd700'
        ctx.lineWidth = 1.5
        ctx.setLineDash([4, 4]) // Dithered dashed pixel ring
        ctx.beginPath()
        ctx.arc(rip.x, rip.y, rip.radius, 0, Math.PI * 2)
        ctx.stroke()
        ctx.setLineDash([]) // Reset dash
      }
      ctx.globalAlpha = 1.0

      // 6. Render & Update Cursor Dust / Dither Wake Particles
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
        window.removeEventListener('pointerdown', handlePointerDown)
        window.removeEventListener('pointerup', handlePointerUp)
        window.removeEventListener('pointermove', handlePointerMove)
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
