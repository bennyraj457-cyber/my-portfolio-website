import React, { useEffect, useRef } from 'react'

/**
 * WhitePixelBackground
 *
 * Interactive white/ivory/cream pixel mosaic canvas:
 * - Solid flush pixels with zero gap
 * - Interactive spring displacement when hovered by mouse or steered with boat cursor
 */
export default function WhitePixelBackground({
  className = '',
  pixelSize = 6,
  opacity = 1.0,
}) {
  const canvasRef = useRef(null)
  const particlesRef = useRef([])
  const rafId = useRef(null)
  const mouseRef = useRef({ x: -1000, y: -1000, radius: 55 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    let width = 0
    let height = 0

    const setup = () => {
      const parent = canvas.parentElement || document.body
      width = canvas.width = parent.clientWidth || window.innerWidth
      height = canvas.height = parent.clientHeight || window.innerHeight

      const isMobile = width < 640
      const blockSize = isMobile ? 4 : Math.max(5, pixelSize)
      const cols = Math.ceil(width / blockSize)
      const rows = Math.ceil(height / blockSize)

      const particles = []
      const now = performance.now()
      const cx = cols / 2
      const cy = rows / 2

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const originX = c * blockSize
          const originY = r * blockSize
          const color = '#ffffff' // Pure solid white pixel only

          const dx = (c - cx) / (cols / 2)
          const dy = (r - cy) / (rows / 2)
          const dist = Math.sqrt(dx * dx + dy * dy)
          const delay = 60 + dist * 350 + Math.random() * 120

          particles.push({
            originX,
            originY,
            x: originX,
            y: originY + (Math.random() - 0.5) * 4,
            vx: 0,
            vy: 0,
            size: blockSize + 0.1,
            color,
            delay,
            startTime: now,
            fadeInDuration: 250 + Math.random() * 100,
          })
        }
      }

      particlesRef.current = particles
    }

    setup()

    const render = () => {
      const now = performance.now()
      const particles = particlesRef.current
      const mouse = mouseRef.current
      const mouseActive = mouse.x > -500
      const radiusSq = mouse.radius * mouse.radius

      ctx.clearRect(0, 0, width, height)
      ctx.globalAlpha = opacity

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]
        const elapsed = now - p.startTime
        if (elapsed < p.delay) continue

        if (mouseActive) {
          const dxM = p.x - mouse.x
          const dyM = p.y - mouse.y
          const distSq = dxM * dxM + dyM * dyM

          if (distSq < radiusSq && distSq > 0.01) {
            const dist = Math.sqrt(distSq)
            const force = (1 - dist / mouse.radius) * 4.5
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

        ctx.fillStyle = p.color
        ctx.fillRect(Math.floor(p.x), Math.floor(p.y), Math.ceil(p.size), Math.ceil(p.size))
      }

      rafId.current = requestAnimationFrame(render)
    }

    render()

    const handleResize = () => setup()
    window.addEventListener('resize', handleResize)

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
      window.removeEventListener('resize', handleResize)
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

