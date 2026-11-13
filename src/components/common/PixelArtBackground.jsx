import React, { useEffect, useRef } from 'react'
import meImg from '../../assets/me.jpeg_d9ce6ce2_2K.jpg'

/**
 * PixelArtBackground
 *
 * Renders the hero background artwork as a clean, high-performance pixel-art canvas:
 * - Solid flush pixels with zero gap
 * - Interactive spring displacement when hovered by mouse or steered with boat cursor
 */
export default function PixelArtBackground({
  className = '',
  pixelSize = 6,
  opacity = 0.95,
  src,
}) {
  const canvasRef = useRef(null)
  const particlesRef = useRef([])
  const rafId = useRef(null)
  const mouseRef = useRef({ x: -1000, y: -1000, radius: 45 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.src = src || meImg

    let isCancelled = false

    img.onload = () => {
      if (isCancelled) return

      let width = 0
      let height = 0

      const setupParticles = () => {
        const parent = canvas.parentElement || document.body
        width = canvas.width = parent.clientWidth || window.innerWidth
        height = canvas.height = parent.clientHeight || window.innerHeight

        const isMobileScreen = width < 640
        const blockSize = isMobileScreen ? 4 : Math.max(5, pixelSize)
        const cols = Math.ceil(width / blockSize)
        const rows = Math.ceil(height / blockSize)

        // Offscreen canvas to downsample image
        const offCanvas = document.createElement('canvas')
        offCanvas.width = cols
        offCanvas.height = rows
        const offCtx = offCanvas.getContext('2d')

        // Aspect ratio cover calculation
        const imgRatio = img.width / img.height
        const targetRatio = width / height

        let drawW, drawH, drawX, drawY
        if (targetRatio > imgRatio) {
          drawW = cols
          drawH = cols / imgRatio
          drawX = 0
          drawY = (rows - drawH) / 2
        } else {
          drawH = rows
          drawW = rows * imgRatio
          drawX = (cols - drawW) / 2
          drawY = 0
        }

        offCtx.drawImage(img, drawX, drawY, drawW, drawH)
        const bgImgData = offCtx.getImageData(0, 0, cols, rows).data

        // Calculate average luminance to adaptively threshold image features vs background
        let totalLum = 0
        let count = 0
        for (let i = 0; i < bgImgData.length; i += 4) {
          if (bgImgData[i + 3] > 20) {
            totalLum += 0.299 * bgImgData[i] + 0.587 * bgImgData[i + 1] + 0.114 * bgImgData[i + 2]
            count++
          }
        }
        const avgLum = count > 0 ? totalLum / count : 128
        // Contrast threshold: below threshold = black pixel (subject/features), above = brand yellow (background)
        const threshold = Math.min(145, Math.max(90, avgLum * 0.95))

        const BRAND_YELLOW = '#ffd700'
        const BLACK_PIXEL = '#000000'

        const newParticles = []

        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const idx = (r * cols + c) * 4
            const rVal = bgImgData[idx]
            const gVal = bgImgData[idx + 1]
            const bVal = bgImgData[idx + 2]
            const aVal = bgImgData[idx + 3]

            // If transparent, default to brand yellow
            const lum = aVal > 20 ? 0.299 * rVal + 0.587 * gVal + 0.114 * bVal : 255
            const pixelHex = lum < threshold ? BLACK_PIXEL : BRAND_YELLOW

            const originX = c * blockSize
            const originY = r * blockSize

            newParticles.push({
              originX,
              originY,
              x: originX,
              y: originY,
              vx: 0,
              vy: 0,
              size: blockSize + 0.2, // slight overlap to ensure solid, gap-free pixels
              hex: pixelHex,
            })
          }
        }

        particlesRef.current = newParticles
      }

      setupParticles()

      const render = () => {
        const particles = particlesRef.current
        const mouse = mouseRef.current
        const mouseActive = mouse.x > -500
        const mouseRadius = mouse.radius
        const mouseRadiusSq = mouseRadius * mouseRadius

        ctx.clearRect(0, 0, width, height)
        ctx.globalAlpha = opacity

        for (let i = 0; i < particles.length; i++) {
          const p = particles[i]

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

          ctx.fillStyle = p.hex
          ctx.fillRect(Math.floor(p.x), Math.floor(p.y), Math.ceil(p.size), Math.ceil(p.size))
        }

        ctx.globalAlpha = 1.0
        rafId.current = requestAnimationFrame(render)
      }

      render()

      const handleResize = () => setupParticles()
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

    const handleBoatMove = (e) => {
      const rect = canvas.getBoundingClientRect()
      if (e.detail) {
        mouseRef.current.x = e.detail.clientX - rect.left
        mouseRef.current.y = e.detail.clientY - rect.top
      }
    }

    const handleMouseLeave = () => {
      mouseRef.current.x = -1000
      mouseRef.current.y = -1000
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    window.addEventListener('boatmove', handleBoatMove, { passive: true })
    window.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      isCancelled = true
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('boatmove', handleBoatMove)
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
