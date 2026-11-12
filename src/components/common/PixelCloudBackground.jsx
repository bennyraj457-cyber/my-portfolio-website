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
  const pixelMorphEntities = useRef([])
  const rafId = useRef(null)

  const bgDriftOffsetRef = useRef(0)
  const fgDriftOffsetRef = useRef(0)
  const timeRef = useRef(0)
  const islandSpawnTimer = useRef(0)
  const morphEntityTimer = useRef(0)

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
      initMorphEntities()
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

    // 5x7 Pixel Font & Geometry Shapes Bitmaps
    const pixelShapesAndGlyphs = [
      // Shape: Diamond (Rhombus)
      {
        name: 'Diamond',
        width: 9,
        height: 9,
        grid: [
          '000010000',
          '000111000',
          '001111100',
          '011111110',
          '111111111',
          '011111110',
          '001111100',
          '000111000',
          '000010000',
        ],
      },
      // Shape: 4-Point Sparkle Star
      {
        name: 'Star',
        width: 9,
        height: 9,
        grid: [
          '000010000',
          '000111000',
          '001111100',
          '111111111',
          '001111100',
          '000111000',
          '000010000',
        ],
      },
      // Shape: Directional Arrow Right
      {
        name: 'Arrow',
        width: 11,
        height: 7,
        grid: [
          '00000010000',
          '00000001000',
          '00000000100',
          '11111111111',
          '00000000100',
          '00000001000',
          '00000010000',
        ],
      },
      // Word: "CREATIVE"
      {
        name: 'Word-CREATIVE',
        text: 'CREATIVE',
      },
      // Word: "CODE"
      {
        name: 'Word-CODE',
        text: 'CODE',
      },
      // Word: "BENNY"
      {
        name: 'Word-BENNY',
        text: 'BENNY',
      },
      // Word: "CRAFT"
      {
        name: 'Word-CRAFT',
        text: 'CRAFT',
      },
      // Word: "DESIGN"
      {
        name: 'Word-DESIGN',
        text: 'DESIGN',
      },
    ]

    // Convert short text strings into sharp micro-pixel coordinates using offscreen canvas
    const sampleTextToPixels = (str) => {
      const offCanvas = document.createElement('canvas')
      offCanvas.width = 300
      offCanvas.height = 50
      const offCtx = offCanvas.getContext('2d')
      offCtx.font = '900 16px "Geist", monospace, sans-serif'
      offCtx.fillStyle = '#000000'
      offCtx.textBaseline = 'top'
      offCtx.fillText(str, 2, 2)

      const textMetrics = offCtx.measureText(str)
      const w = Math.min(280, Math.ceil(textMetrics.width) + 4)
      const h = 24
      const imgData = offCtx.getImageData(0, 0, w, h).data

      const points = []
      const step = 2 // 2px step
      for (let y = 0; y < h; y += step) {
        for (let x = 0; x < w; x += step) {
          const idx = (y * w + x) * 4 + 3
          if (imgData[idx] > 80) {
            points.push({ ox: x * 1.8, oy: y * 1.8 })
          }
        }
      }
      return { points, totalWidth: w * 1.8, totalHeight: h * 1.8 }
    }

    // Convert bitmap grid definition into relative pixel points
    const sampleShapeToPixels = (shapeDef) => {
      const points = []
      const pStep = 4 // 4px step per block for crisp visibility
      for (let r = 0; r < shapeDef.grid.length; r++) {
        const row = shapeDef.grid[r]
        for (let c = 0; c < row.length; c++) {
          if (row[c] === '1') {
            points.push({ ox: c * pStep, oy: r * pStep })
          }
        }
      }
      return {
        points,
        totalWidth: shapeDef.width * pStep,
        totalHeight: shapeDef.height * pStep,
      }
    }

    // Create a new Shape or Pixel-Text assembly
    const createMorphEntity = (spawnNearScreen = false) => {
      const def = pixelShapesAndGlyphs[Math.floor(Math.random() * pixelShapesAndGlyphs.length)]
      const isWord = Boolean(def.text)
      const sampled = isWord ? sampleTextToPixels(def.text) : sampleShapeToPixels(def)

      const pSize = 3 // 3x3 pixel dot
      const particlesList = sampled.points.map((pt) => {
        const scatterAngle = Math.random() * Math.PI * 2
        const scatterDist = 30 + Math.random() * 50
        return {
          targetOx: pt.ox,
          targetOy: pt.oy,
          curOx: pt.ox + Math.cos(scatterAngle) * scatterDist,
          curOy: pt.oy + Math.sin(scatterAngle) * scatterDist,
          // High-contrast gold & charcoal-black pixels for maximum visibility on white background!
          color: Math.random() > 0.35 ? '#000000' : '#d4af37',
        }
      })

      // Spawn in open perimeter regions
      const spawnZones = [
        { xMin: 0.1, xMax: 0.35, yMin: 0.1, yMax: 0.25 },  // Top-left
        { xMin: 0.65, xMax: 0.85, yMin: 0.1, yMax: 0.25 }, // Top-right
        { xMin: 0.08, xMax: 0.3, yMin: 0.72, yMax: 0.85 }, // Bottom-left
        { xMin: 0.7, xMax: 0.9, yMin: 0.72, yMax: 0.85 },  // Bottom-right
      ]
      const zone = spawnZones[Math.floor(Math.random() * spawnZones.length)]

      let spawnX = spawnNearScreen
        ? width * zone.xMin + Math.random() * (width * (zone.xMax - zone.xMin))
        : width + 20
      let spawnY = height * zone.yMin + Math.random() * (height * (zone.yMax - zone.yMin))

      return {
        x: spawnX,
        y: spawnY,
        vx: -(0.3 + Math.random() * 0.25), // Drifts gently to left
        vy: (Math.random() - 0.5) * 0.08,
        particles: particlesList,
        pixelSize: pSize,
        totalWidth: sampled.totalWidth,
        totalHeight: sampled.totalHeight,
        progress: spawnNearScreen ? 1.0 : 0.0,
        stage: spawnNearScreen ? 'stable' : 'gathering',
        alpha: spawnNearScreen ? 0.95 : 0.0,
        age: 0,
        maxStableAge: 400 + Math.random() * 250, // Long stable display time (~8-10 seconds)
      }
    }

    const initMorphEntities = () => {
      const list = []
      // 4 concurrent clearly visible entities
      for (let i = 0; i < 4; i++) {
        list.push(createMorphEntity(true))
      }
      pixelMorphEntities.current = list
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

          let mouseRepel = 0
          if (interactive) {
            const mx = midX - mousePos.current.x
            const my = midY - mousePos.current.y
            const mDist = Math.sqrt(mx * mx + my * my)
            if (mDist < 180) {
              mouseRepel = (1 - mDist / 180) * 0.28
            }
          }

          const bgDriftX = midX + bgDrift
          const bgWave =
            Math.sin(bgDriftX * 0.0028 + time * 0.3) * 0.35 +
            Math.cos(midY * 0.003 - time * 0.25) * 0.35 +
            Math.sin((bgDriftX + midY) * 0.0018 + time * 0.15) * 0.2

          const bgVal = dist - bgWave + mouseRepel - contentRepulsion

          const fgDriftX = midX + fgDrift
          const fgWave =
            Math.sin(fgDriftX * 0.0035 + time * 0.45) * 0.35 +
            Math.cos(midY * 0.0038 - time * 0.35) * 0.35 +
            Math.sin((fgDriftX + midY) * 0.0022 + time * 0.25) * 0.2

          const fgVal = dist - fgWave + mouseRepel - contentRepulsion

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

      // 4. Render Morphing Shapes & Pixel Text Assemblies (Tiny pixels forming geometric shapes & clear words)
      morphEntityTimer.current++
      if (morphEntityTimer.current % 180 === 0 && pixelMorphEntities.current.length < 5) {
        pixelMorphEntities.current.push(createMorphEntity(false))
      }

      const morphList = pixelMorphEntities.current
      for (let i = morphList.length - 1; i >= 0; i--) {
        const ent = morphList[i]
        ent.x += ent.vx
        ent.y += ent.vy
        ent.age++

        // State Machine: gathering -> stable -> dissolving
        if (ent.stage === 'gathering') {
          ent.progress += 0.025
          ent.alpha = Math.min(1.0, ent.alpha + 0.04)
          if (ent.progress >= 1.0) {
            ent.progress = 1.0
            ent.stage = 'stable'
          }
        } else if (ent.stage === 'stable') {
          ent.alpha = 1.0
          if (ent.age >= ent.maxStableAge) {
            ent.stage = 'dissolving'
          }
        } else if (ent.stage === 'dissolving') {
          ent.alpha -= 0.015
          ent.progress += 0.015
        }

        // Proximity detection to hero content (repel / dissolve before touching headline text)
        let minObsDist = Infinity
        for (let j = 0; j < obstacles.length; j++) {
          const obs = obstacles[j]
          const dx = Math.max(obs.rawLeft - ent.x, 0, ent.x - (obs.rawRight + ent.totalWidth))
          const dy = Math.max(obs.rawTop - ent.y, 0, ent.y - (obs.rawBottom + ent.totalHeight))
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < minObsDist) minObsDist = dist
        }

        if (minObsDist < 45) {
          ent.stage = 'dissolving'
          ent.alpha -= 0.05
        }

        // Cleanup when faded or drifted off screen
        if (ent.alpha <= 0 || ent.x < -200) {
          morphList.splice(i, 1)
          continue
        }

        ctx.globalAlpha = Math.max(0, ent.alpha)

        // Interpolate individual pixel positions
        const t = ent.progress
        const easeOutBack = (val) => {
          const c1 = 1.70158
          const c3 = c1 + 1
          return 1 + c3 * Math.pow(val - 1, 3) + c1 * Math.pow(val - 1, 2)
        }
        const curEased = ent.stage === 'gathering' ? Math.min(1, easeOutBack(Math.min(1, t))) : 1.0

        for (let k = 0; k < ent.particles.length; k++) {
          const pt = ent.particles[k]
          let px, py

          if (ent.stage === 'gathering') {
            px = ent.x + pt.curOx + (pt.targetOx - pt.curOx) * curEased
            py = ent.y + pt.curOy + (pt.targetOy - pt.curOy) * curEased
          } else if (ent.stage === 'stable') {
            px = ent.x + pt.targetOx
            py = ent.y + pt.targetOy
          } else {
            // Dissolving: scatter drift away
            const scatterOut = (t - 1.0) * 55
            px = ent.x + pt.targetOx + Math.cos(k * 1.5) * scatterOut
            py = ent.y + pt.targetOy + Math.sin(k * 1.5) * scatterOut
          }

          ctx.fillStyle = pt.color
          const snapX = Math.round(px)
          const snapY = Math.round(py)
          ctx.fillRect(snapX, snapY, ent.pixelSize, ent.pixelSize)
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
