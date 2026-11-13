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
  macroSize = 4,
  interactive = true,
  contentRepelDistance = 90,
  driftSpeed = 0.45,
  initialIntro = true,
  textMask = null,
}) {
  const canvasRef = useRef(null)
  const textCanvasRef = useRef(null)
  const textMaskDataRef = useRef(null)
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

  // Initial Full Yellow Reveal Animation State
  const introStartTimeRef = useRef(null)
  const introGridRef = useRef([])

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
      generateTextMask()
      initSparkles()
      initDriftingIslands()
      initIntroGrid()
    }

    const generateTextMask = () => {
      if (!textMask) {
        textMaskDataRef.current = null
        return
      }

      const tCanvas = document.createElement('canvas')
      tCanvas.width = width
      tCanvas.height = height
      const tCtx = tCanvas.getContext('2d')
      if (!tCtx) return

      tCtx.clearRect(0, 0, width, height)

      // Calculate fluid typography scale - bold and prominent
      const fontSizeHeadline = Math.max(48, Math.min(width * 0.088, 110))
      const fontSizeBio = Math.max(16, Math.min(width * 0.024, 22))
      const centerY = height * 0.40

      tCtx.textAlign = 'center'
      tCtx.textBaseline = 'middle'
      tCtx.fillStyle = '#000000'

      // Render Headline Line 1 & Line 2 in TRJN DaVinci italic serif with bold stroke for maximum clarity
      tCtx.font = `italic 700 ${fontSizeHeadline}px 'TRJN DaVinci', serif`
      const line1Y = centerY - fontSizeHeadline * 0.65
      const line2Y = centerY + fontSizeHeadline * 0.45
      tCtx.fillText(textMask.line1 || 'Designer who', width / 2, line1Y)
      tCtx.fillText(textMask.line2 || 'ships with Code', width / 2, line2Y)

      // Render Bio lines in Geist Medium
      tCtx.font = `500 ${fontSizeBio}px 'Geist', sans-serif`
      const bioY = line2Y + fontSizeHeadline * 0.92
      const bioText = textMask.bio || ''
      
      // Multi-line word wrap for bio
      const maxBioWidth = Math.min(width * 0.75, 620)
      const words = bioText.split(' ')
      let currentLine = ''
      let lineCount = 0
      const lineHeight = fontSizeBio * 1.55

      for (let n = 0; n < words.length; n++) {
        const testLine = currentLine + words[n] + ' '
        const metrics = tCtx.measureText(testLine)
        if (metrics.width > maxBioWidth && n > 0) {
          tCtx.fillText(currentLine.trim(), width / 2, bioY + lineCount * lineHeight)
          currentLine = words[n] + ' '
          lineCount++
        } else {
          currentLine = testLine
        }
      }
      if (currentLine.trim()) {
        tCtx.fillText(currentLine.trim(), width / 2, bioY + lineCount * lineHeight)
      }

      try {
        const imgData = tCtx.getImageData(0, 0, width, height)
        textMaskDataRef.current = imgData.data
      } catch (err) {
        textMaskDataRef.current = null
      }
    }

    const initIntroGrid = () => {
      if (!initialIntro) return
      const cols = Math.ceil(width / macroSize)
      const rows = Math.ceil(height / macroSize)
      const cx = width / 2
      const cy = height * 0.48
      const rx = Math.min(width * 0.55, 680)
      const ry = Math.min(height * 0.38, 320)

      const grid = []
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const midX = c * macroSize + macroSize / 2
          const midY = r * macroSize + macroSize / 2

          // Normalized elliptical distance from center hero clearing
          const dx = (midX - cx) / rx
          const dy = (midY - cy) / ry
          const dist = Math.sqrt(dx * dx + dy * dy)

          // Center pixels dissolve first, perimeter cloud pixels remain or blend
          const isRevealArea = dist < 1.35
          const randomJitter = Math.random() * 0.35

          grid.push({
            r,
            c,
            isRevealArea,
            // Whole screen starts 100% solid yellow.
            // Center reveal pixels start fading after 450ms. Outer perimeter pixels hold solid or blend into clouds.
            delay: isRevealArea ? 450 + dist * 950 + randomJitter * 400 : 999999,
            duration: 600 + Math.random() * 300,
          })
        }
      }
      introGridRef.current = grid
      introStartTimeRef.current = performance.now()
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
      const maskData = textMaskDataRef.current

      // 1. Render Layered Parallax Cloud Grid
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const px = c * macroSize
          const py = r * macroSize
          const midX = Math.floor(px + macroSize / 2)
          const midY = Math.floor(py + macroSize / 2)

          // Negative space letter punch-out: if center of pixel falls inside a letter glyph, keep it pure blank white
          if (maskData && midX >= 0 && midX < width && midY >= 0 && midY < height) {
            const pixelIndex = (midY * width + midX) * 4
            const alpha = maskData[pixelIndex + 3]
            if (alpha > 40) {
              // Letter shape area: blank white, created by background
              continue
            }
          }

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

          // If textMask is active, surround letters with rich yellow pixel field so the white letters emerge distinctly
          if (textMask) {
            // Check proximity to letters
            if (maskData && midX >= 0 && midX < width && midY >= 0 && midY < height) {
              // Check if pixel lies within letter bounding box or halo zone (radius 24px)
              const radius = 24
              let nearLetter = false

              // Fast stepped radius sampling
              for (let dy = -radius; dy <= radius; dy += 6) {
                for (let dx = -radius; dx <= radius; dx += 6) {
                  const checkX = midX + dx
                  const checkY = midY + dy
                  if (checkX >= 0 && checkX < width && checkY >= 0 && checkY < height) {
                    const idx = (checkY * width + checkX) * 4
                    if (maskData[idx + 3] > 40) {
                      nearLetter = true
                      break
                    }
                  }
                }
                if (nearLetter) break
              }

              if (nearLetter) {
                // Dense solid brand gold surrounding the letter edges with micro dither falloff
                const checker = (c + r) % 2 === 0
                ctx.fillStyle = checker ? tones.primary : patternPrimary_Light1
                ctx.fillRect(px, py, macroSize, macroSize)
              }
            }
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

      // 4. Render & Update Cursor Dust / Dither Wake Particles
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

      // 5. Initial Full Solid Yellow Screen Reveal (Full Screen Solid Yellow -> Smooth Center Dissolve)
      if (initialIntro && introStartTimeRef.current) {
        const elapsed = performance.now() - introStartTimeRef.current
        const grid = introGridRef.current
        let hasRemainingIntroPixels = false
        let revealTotal = 0
        let revealDissolved = 0

        for (let i = 0; i < grid.length; i++) {
          const item = grid[i]
          const px = item.c * macroSize
          const py = item.r * macroSize

          if (item.isRevealArea) {
            revealTotal++
            if (elapsed < item.delay) {
              // Still solid yellow in reveal zone
              ctx.fillStyle = tones.primary
              ctx.fillRect(px, py, macroSize, macroSize)
              hasRemainingIntroPixels = true
            } else if (elapsed < item.delay + item.duration) {
              // Dissolving pixel transition with halftone dither patterns
              const progress = (elapsed - item.delay) / item.duration
              hasRemainingIntroPixels = true

              if (progress < 0.22) {
                ctx.fillStyle = tones.primary
              } else if (progress < 0.45) {
                ctx.fillStyle = patternPrimary_Light1
              } else if (progress < 0.68) {
                ctx.fillStyle = patternLight1_Light2
              } else if (progress < 0.88) {
                ctx.fillStyle = patternLight2_Light3
              } else {
                ctx.fillStyle = patternLight3_White
              }
              ctx.fillRect(px, py, macroSize, macroSize)
            } else {
              revealDissolved++
            }
          } else {
            // Non-reveal outer perimeter pixels start 100% solid yellow, then smoothly blend into the underlying ambient clouds
            if (elapsed < 600) {
              ctx.fillStyle = tones.primary
              ctx.fillRect(px, py, macroSize, macroSize)
              hasRemainingIntroPixels = true
            } else if (elapsed < 1400) {
              const alphaBlend = 1.0 - (elapsed - 600) / 800
              ctx.fillStyle = tones.primary
              ctx.globalAlpha = alphaBlend
              ctx.fillRect(px, py, macroSize, macroSize)
              ctx.globalAlpha = 1.0
              hasRemainingIntroPixels = true
            }
          }
        }

        // Notify window ONLY after center pixels have completed dissolving (>85%)
        // so hero text content appears cleanly afterward
        const dissolveRatio = revealTotal > 0 ? revealDissolved / revealTotal : 1
        if (dissolveRatio > 0.85 && !window.__introHeroRevealed) {
          window.__introHeroRevealed = true
          window.dispatchEvent(new CustomEvent('introHeroRevealed'))
        }

        // Clean up intro state when clearing is complete
        if (!hasRemainingIntroPixels && elapsed > 2800) {
          introStartTimeRef.current = null
          introGridRef.current = []
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
      className={`absolute inset-0 pointer-events-none z-0 w-full h-full ${className}`}
      aria-hidden="true"
    />
  )
}
