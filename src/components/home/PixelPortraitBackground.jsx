import React, { useEffect, useRef } from 'react'
import portraitImg from '../../assets/images/benny-portrait.jpg'

/**
 * PixelPortraitBackground
 *
 * Renders the user's portrait rendered entirely out of tiny discrete micro-pixels:
 * - Samples Benny's portrait into fine discrete pixels (halftone gold dither / monochrome tint / full color).
 * - Floats organically in the background behind the hero content without obstructing readability.
 * - Interactive: mouse hover creates delicate magnetic sand displacement and snapping return.
 */
export default function PixelPortraitBackground({
  className = '',
  pixelStep = 4, // Crisp 4px micro-pixels
  interactive = true,
}) {
  const canvasRef = useRef(null)
  const particlesRef = useRef([])
  const rafId = useRef(null)
  const mouseRef = useRef({ x: -1000, y: -1000, radius: 60 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    let width = 0
    let height = 0
    let isDisposed = false

    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.src = portraitImg

    const sampleImagePixels = () => {
      if (!canvas || !img.naturalWidth || !img.naturalHeight) return
      const parent = canvas.parentElement || document.body
      width = canvas.width = parent.clientWidth || window.innerWidth || 1200
      height = canvas.height = parent.clientHeight || window.innerHeight || 800

      // Calculate responsive dimensions for portrait
      // Give it prominent editorial presence
      const isMobile = width < 768
      const maxH = isMobile ? Math.min(height * 0.75, 460) : Math.min(height * 0.88, 680)
      const aspect = img.naturalWidth / img.naturalHeight
      const targetHeight = maxH
      const targetWidth = targetHeight * aspect

      const posX = (width - targetWidth) / 2
      const posY = (height - targetHeight) / 2

      // Offscreen canvas for fast sampling
      const offCanvas = document.createElement('canvas')
      offCanvas.width = targetWidth
      offCanvas.height = targetHeight
      const offCtx = offCanvas.getContext('2d')

      offCtx.drawImage(img, 0, 0, targetWidth, targetHeight)
      let imgData
      try {
        imgData = offCtx.getImageData(0, 0, targetWidth, targetHeight).data
      } catch (e) {
        console.error('Failed to get imageData for portrait', e)
        return
      }

      const particles = []
      const step = pixelStep

      for (let y = 0; y < targetHeight; y += step) {
        for (let x = 0; x < targetWidth; x += step) {
          const index = (Math.floor(y) * Math.floor(targetWidth) + Math.floor(x)) * 4
          const r = imgData[index]
          const g = imgData[index + 1]
          const b = imgData[index + 2]
          const a = imgData[index + 3]

          if (a > 30) {
            // Keep genuine original colors enhanced for digital pixel art
            const isBlueBg = b > 130 && b > r + 25 && b > g

            let color
            let opacity

            if (isBlueBg) {
              // Subtle background ambient cyan / gold micro dither
              if ((Math.floor(x / step) + Math.floor(y / step)) % 3 === 0) {
                color = '#00a8e8' // original portrait bright background cyan
                opacity = 0.22
              } else {
                continue
              }
            } else {
              // Subject colors: full vibrant pixel art directly from photo
              color = `rgb(${r},${g},${b})`
              opacity = 0.95
            }

            const originX = posX + x
            const originY = posY + y

            particles.push({
              originX,
              originY,
              x: originX + (Math.random() - 0.5) * 20,
              y: originY + (Math.random() - 0.5) * 20,
              vx: 0,
              vy: 0,
              size: step - 0.6,
              color,
              opacity,
              alpha: 0,
              delay: Math.random() * 600,
              startTime: performance.now(),
            })
          }
        }
      }

      particlesRef.current = particles
    }

    const updateSize = () => {
      sampleImagePixels()
    }

    img.onload = () => {
      if (!isDisposed) sampleImagePixels()
    }

    if (img.complete && img.naturalWidth) {
      sampleImagePixels()
    }

    window.addEventListener('resize', updateSize)

    const handleMouseMove = (e) => {
      if (!interactive || !canvas) return
      const canvasRect = canvas.getBoundingClientRect()
      mouseRef.current.x = e.clientX - canvasRect.left
      mouseRef.current.y = e.clientY - canvasRect.top
    }

    const handleMouseLeave = () => {
      mouseRef.current.x = -1000
      mouseRef.current.y = -1000
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    window.addEventListener('mouseleave', handleMouseLeave)

    // Physics render loop
    const render = () => {
      if (isDisposed) return
      ctx.clearRect(0, 0, width, height)
      const now = performance.now()
      const particles = particlesRef.current
      const mouse = mouseRef.current

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]
        const elapsed = now - p.startTime

        if (elapsed < p.delay) continue

        // Smooth fade-in
        if (p.alpha < p.opacity) {
          p.alpha = Math.min(p.opacity, p.alpha + 0.04)
        }

        // Spring physics to home coordinate
        const dx = p.originX - p.x
        const dy = p.originY - p.y
        p.vx += dx * 0.06
        p.vy += dy * 0.06
        p.vx *= 0.82
        p.vy *= 0.82

        // Interactive mouse dispersion
        if (interactive) {
          const dxMouse = p.x - mouse.x
          const dyMouse = p.y - mouse.y
          const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse)

          if (distMouse < mouse.radius) {
            const force = (1 - distMouse / mouse.radius) * 4
            p.vx += (dxMouse / distMouse) * force
            p.vy += (dyMouse / distMouse) * force
          }
        }

        p.x += p.vx
        p.y += p.vy

        ctx.globalAlpha = p.alpha
        ctx.fillStyle = p.color
        ctx.fillRect(Math.floor(p.x), Math.floor(p.y), p.size, p.size)
      }

      ctx.globalAlpha = 1.0
      rafId.current = requestAnimationFrame(render)
    }

    render()

    return () => {
      isDisposed = true
      window.removeEventListener('resize', updateSize)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseleave', handleMouseLeave)
      if (rafId.current) cancelAnimationFrame(rafId.current)
    }
  }, [pixelStep, interactive])

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none z-0 w-full h-full ${className}`}
      aria-hidden="true"
    />
  )
}

