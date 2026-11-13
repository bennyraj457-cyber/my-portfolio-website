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
  pixelStep = 5, // Tiny discrete pixel square size
  interactive = true,
}) {
  const canvasRef = useRef(null)
  const particlesRef = useRef([])
  const rafId = useRef(null)
  const mouseRef = useRef({ x: -1000, y: -1000, radius: 45 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    let width = 0
    let height = 0
    const img = new Image()
    img.src = portraitImg

    const updateSize = () => {
      const parent = canvas.parentElement || document.body
      width = canvas.width = parent.clientWidth || window.innerWidth
      height = canvas.height = parent.clientHeight || window.innerHeight
      if (img.complete && img.naturalWidth) {
        sampleImagePixels()
      }
    }

    const sampleImagePixels = () => {
      // Calculate responsive bounding box for portrait
      // Center or subtle offset to allow headline to sit cleanly
      const isMobile = width < 768
      const targetHeight = Math.min(height * 0.85, isMobile ? 380 : 640)
      const aspect = img.naturalWidth / img.naturalHeight
      const targetWidth = targetHeight * aspect

      const posX = (width - targetWidth) / 2
      const posY = (height - targetHeight) / 2 + (isMobile ? 10 : 0)

      // Offscreen canvas for sampling
      const offCanvas = document.createElement('canvas')
      offCanvas.width = targetWidth
      offCanvas.height = targetHeight
      const offCtx = offCanvas.getContext('2d')

      // Draw downscaled image for pixel extraction
      offCtx.drawImage(img, 0, 0, targetWidth, targetHeight)
      const imgData = offCtx.getImageData(0, 0, targetWidth, targetHeight).data

      const particles = []
      const step = pixelStep

      for (let y = 0; y < targetHeight; y += step) {
        for (let x = 0; x < targetWidth; x += step) {
          const index = (Math.floor(y) * Math.floor(targetWidth) + Math.floor(x)) * 4
          const r = imgData[index]
          const g = imgData[index + 1]
          const b = imgData[index + 2]
          const a = imgData[index + 3]

          if (a > 50) {
            // Check if this pixel is blue background vs Benny's face/hair/shirt
            // Original background is bright cyan/blue (b > 160 && b > r + 30)
            const isBlueBg = b > 140 && b > r + 30 && b > g

            // If it's blue background, make it translucent dither yellow dots
            // If it's Benny (face, hair, shirt), render rich high-contrast tones
            let color
            let opacity
            const brightness = (r * 0.299 + g * 0.587 + b * 0.114) / 255

            if (isBlueBg) {
              // Subtle perimeter background halo in brand gold (#ffd700)
              if ((Math.floor(x / step) + Math.floor(y / step)) % 2 === 0 && brightness > 0.4) {
                color = '#ffd700'
                opacity = 0.18
              } else {
                continue
              }
            } else {
              // Subject pixels: rich duotone / editorial tint
              if (brightness < 0.22) {
                // Dark hair & beard: deep charcoal
                color = '#181818'
                opacity = 0.82
              } else if (brightness < 0.5) {
                // Midtones & shirt: warm slate / gold shadow
                color = '#2d2d2d'
                opacity = 0.72
              } else if (brightness < 0.78) {
                // Skin highlights: warm amber gold
                color = '#d4af37'
                opacity = 0.68
              } else {
                // Highlights
                color = '#ffd700'
                opacity = 0.55
              }
            }

            const originX = posX + x
            const originY = posY + y

            particles.push({
              originX,
              originY,
              x: originX + (Math.random() - 0.5) * 16,
              y: originY + (Math.random() - 0.5) * 16,
              vx: 0,
              vy: 0,
              size: step - 1,
              color,
              opacity,
              alpha: 0,
              delay: Math.random() * 800,
              startTime: performance.now(),
            })
          }
        }
      }

      particlesRef.current = particles
    }

    img.onload = () => {
      sampleImagePixels()
    }

    if (img.complete) {
      updateSize()
    }

    window.addEventListener('resize', updateSize)

    const handleMouseMove = (e) => {
      if (!interactive) return
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

    // Render loop
    const render = () => {
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
          p.alpha = Math.min(p.opacity, p.alpha + 0.025)
        }

        // Spring physics
        const dx = p.originX - p.x
        const dy = p.originY - p.y
        p.vx += dx * 0.06
        p.vy += dy * 0.06
        p.vx *= 0.82
        p.vy *= 0.82

        // Mouse interaction: subtle push
        if (interactive) {
          const dxMouse = p.x - mouse.x
          const dyMouse = p.y - mouse.y
          const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse)

          if (distMouse < mouse.radius) {
            const force = (1 - distMouse / mouse.radius) * 3
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
