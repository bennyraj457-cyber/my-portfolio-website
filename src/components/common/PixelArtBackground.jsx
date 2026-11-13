import React, { useEffect, useRef } from 'react'
import retroCoderImg from '../../assets/images/retro-coder.png'
import retroCarImg from '../../assets/images/retro-car.jpg'

/**
 * PixelArtBackground
 *
 * Renders the retro pixel art illustration with smooth pixel-by-pixel morphing:
 * - Image 1: Retro coder at computer desk on grassy hill
 * - After 3 seconds: Transition starts where each pixel transitions individually one by one
 *   into Image 2 (Retro car parked in the golden field under pixel clouds)
 * - Mapped to our signature brand palette: Deep Ink (#121212), Primary Gold (#ffd700),
 *   Warm Yellow (#ffe766), Soft Cream (#fffadc), and White.
 * - Interactive: Hover mouse animation softly ripples nearby pixels without lag.
 */
export default function PixelArtBackground({
  className = '',
  pixelSize = 8,
  opacity = 0.35,
}) {
  const canvasRef = useRef(null)
  const particlesRef = useRef([])
  const rafId = useRef(null)
  const mouseRef = useRef({ x: -1000, y: -1000, radius: 45 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    let isCancelled = false

    // Load both images concurrently
    const img1 = new Image()
    img1.crossOrigin = 'anonymous'
    img1.src = retroCoderImg

    const img2 = new Image()
    img2.crossOrigin = 'anonymous'
    img2.src = retroCarImg

    let loadedCount = 0
    const onImgLoad = () => {
      loadedCount++
      if (loadedCount === 2 && !isCancelled) {
        initExperience()
      }
    }

    img1.onload = onImgLoad
    img2.onload = onImgLoad

    let width = 0
    let height = 0

    const initExperience = () => {
      const parent = canvas.parentElement || document.body
      width = canvas.width = parent.clientWidth || window.innerWidth
      height = canvas.height = parent.clientHeight || window.innerHeight

      const blockSize = Math.max(6, pixelSize)
      const cols = Math.ceil(width / blockSize)
      const rows = Math.ceil(height / blockSize)

      // Downsample Image 1
      const off1 = document.createElement('canvas')
      off1.width = cols
      off1.height = rows
      const offCtx1 = off1.getContext('2d')

      const r1 = img1.width / img1.height
      const tr = width / height
      let w1, h1, x1, y1
      if (tr > r1) {
        w1 = cols
        h1 = cols / r1
        x1 = 0
        y1 = (rows - h1) / 2
      } else {
        h1 = rows
        w1 = rows * r1
        x1 = (cols - w1) / 2
        y1 = 0
      }
      offCtx1.drawImage(img1, x1, y1, w1, h1)
      const data1 = offCtx1.getImageData(0, 0, cols, rows).data

      // Downsample Image 2
      const off2 = document.createElement('canvas')
      off2.width = cols
      off2.height = rows
      const offCtx2 = off2.getContext('2d')

      const r2 = img2.width / img2.height
      let w2, h2, x2, y2
      if (tr > r2) {
        w2 = cols
        h2 = cols / r2
        x2 = 0
        y2 = (rows - h2) / 2
      } else {
        h2 = rows
        w2 = rows * r2
        x2 = (cols - w2) / 2
        y2 = 0
      }
      offCtx2.drawImage(img2, x2, y2, w2, h2)
      const data2 = offCtx2.getImageData(0, 0, cols, rows).data

      // Palette mapping definition
      const palette = [
        { r: 18, g: 18, b: 18, hex: '#121212' },   // Deep ink / shadows / tires / silhouette
        { r: 255, g: 215, b: 0, hex: '#ffd700' }, // Primary gold / wheat field / car highlights
        { r: 255, g: 231, b: 102, hex: '#ffe766' }, // Warm yellow / clouds / field highlights
        { r: 255, g: 250, b: 220, hex: '#fffadc' }, // Pale cream / sky / windshield
        { r: 255, g: 255, b: 255, hex: '#ffffff' }, // White
      ]

      const getTargetColor = (r, g, b) => {
        const lum = 0.299 * r + 0.587 * g + 0.114 * b
        if (lum < 60) return palette[0]
        if (lum < 125) return palette[1]
        if (lum < 185) return palette[2]
        if (lum < 240) return palette[3]
        return palette[4]
      }

      const newParticles = []
      const now = performance.now()
      const cx = cols / 2
      const cy = rows * 0.55

      // Transition start timing: 3000ms after load
      const transitionBaseStart = 3000

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const idx = (r * cols + c) * 4

          const a1 = data1[idx + 3]
          const a2 = data2[idx + 3]

          const col1 = a1 > 25 ? getTargetColor(data1[idx], data1[idx + 1], data1[idx + 2]) : palette[4]
          const col2 = a2 > 25 ? getTargetColor(data2[idx], data2[idx + 1], data2[idx + 2]) : palette[4]

          // Skip if both images have white space at this pixel
          if (col1.hex === '#ffffff' && col2.hex === '#ffffff') continue

          const originX = c * blockSize
          const originY = r * blockSize

          // Initial reveal delay
          const dx = (c - cx) / (cols / 2)
          const dy = (r - cy) / (rows / 2)
          const dist = Math.sqrt(dx * dx + dy * dy)
          const initialDelay = 150 + dist * 700 + Math.random() * 200

          // Image 2 Morph Delay: one by one transition across the grid
          // Pixels dissolve and transition outward in an organic diagonal wind wave
          const waveFactor = (c / cols) * 0.6 + (r / rows) * 0.4
          const randomJitter = Math.random() * 950
          const morphDelay = transitionBaseStart + waveFactor * 1600 + randomJitter

          newParticles.push({
            originX,
            originY,
            x: originX,
            y: originY + (Math.random() - 0.5) * 6,
            vx: 0,
            vy: 0,
            size: blockSize - 0.5,
            // Image 1 color
            col1Hex: col1.hex,
            col1R: col1.r,
            col1G: col1.g,
            col1B: col1.b,
            // Image 2 color
            col2Hex: col2.hex,
            col2R: col2.r,
            col2G: col2.g,
            col2B: col2.b,
            initialDelay,
            morphDelay,
            startTime: now,
            fadeInDuration: 300 + Math.random() * 150,
            morphDuration: 450 + Math.random() * 250,
          })
        }
      }

      particlesRef.current = newParticles

      // Render Loop
      const render = () => {
        const currentTime = performance.now()
        const particles = particlesRef.current
        const mouse = mouseRef.current
        const mouseActive = mouse.x > -500
        const mouseRadius = mouse.radius
        const mouseRadiusSq = mouseRadius * mouseRadius

        ctx.clearRect(0, 0, width, height)
        ctx.globalAlpha = opacity

        for (let i = 0; i < particles.length; i++) {
          const p = particles[i]
          const elapsed = currentTime - p.startTime

          if (elapsed < p.initialDelay) {
            continue
          }

          // Initial emergence progress
          const initialProgress = Math.min(1, (elapsed - p.initialDelay) / p.fadeInDuration)

          // Mouse ripple interaction
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

          // Spring dampening back to origin
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

          // Compute Color based on Morph Timeline
          if (elapsed < p.morphDelay) {
            // Display Image 1
            if (initialProgress < 0.6) {
              const t = initialProgress / 0.6
              const r = Math.round(255 + (p.col1R - 255) * t)
              const g = Math.round(215 + (p.col1G - 215) * t)
              const b = Math.round(0 + (p.col1B - 0) * t)
              ctx.fillStyle = `rgb(${r},${g},${b})`
            } else {
              ctx.fillStyle = p.col1Hex
            }
          } else {
            // One by one smooth pixel morph into Image 2
            const morphProgress = Math.min(1, (elapsed - p.morphDelay) / p.morphDuration)
            // Cubic ease out transition
            const easeMorph = 1 - Math.pow(1 - morphProgress, 3)

            if (morphProgress < 1) {
              // Interpolate smoothly through brand gold spark into Image 2 color
              if (morphProgress < 0.35) {
                // Brief luminous gold pulse
                ctx.fillStyle = '#ffd700'
              } else {
                const t = (morphProgress - 0.35) / 0.65
                const r = Math.round(255 + (p.col2R - 255) * t)
                const g = Math.round(215 + (p.col2G - 215) * t)
                const b = Math.round(0 + (p.col2B - 0) * t)
                ctx.fillStyle = `rgb(${r},${g},${b})`
              }
            } else {
              ctx.fillStyle = p.col2Hex
            }
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

        rafId.current = requestAnimationFrame(render)
      }

      render()

      const handleResize = () => {
        initExperience()
      }
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
  }, [pixelSize, opacity])

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none z-0 w-full h-full ${className}`}
      aria-hidden="true"
    />
  )
}
