import React, { useEffect, useRef } from 'react'

/**
 * AboutPixelCanvas
 *
 * Interactive white pixel mosaic background canvas:
 * - Ambient white/ivory/silver interactive pixel tiles
 * - Reacts to cursor & boat navigation with fluid spring displacement
 */
export function AboutPixelCanvas({ className = '', pixelSize = 6 }) {
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

      const blockSize = Math.max(5, pixelSize)
      const cols = Math.ceil(width / blockSize)
      const rows = Math.ceil(height / blockSize)

      const palette = [
        '#ffffff',
        '#fafafa',
        '#f4f4f5',
        '#f8fafc',
        '#fffdf5',
      ]

      const particles = []
      const now = performance.now()

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const originX = c * blockSize
          const originY = r * blockSize
          const color = palette[(c * 3 + r * 7) % palette.length]

          particles.push({
            originX,
            originY,
            x: originX,
            y: originY,
            vx: 0,
            vy: 0,
            size: blockSize + 0.1,
            color,
            delay: Math.random() * 200,
            startTime: now,
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

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]

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

      // Soft water seam transition at top and bottom
      const gradient = ctx.createLinearGradient(0, 0, 0, height)
      gradient.addColorStop(0, 'rgba(0, 119, 182, 0.25)')
      gradient.addColorStop(0.12, 'rgba(255, 255, 255, 0)')
      gradient.addColorStop(0.88, 'rgba(255, 255, 255, 0)')
      gradient.addColorStop(1, 'rgba(0, 119, 182, 0.28)')

      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, width, height)

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
  }, [pixelSize])

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none z-0 w-full h-full ${className}`}
      aria-hidden="true"
    />
  )
}

/**
 * AboutSection
 *
 * Full-screen About section with:
 * - Interactive white pixel mosaic background canvas
 * - Crystal-clear, razor-sharp typography overlay rendered with native fonts (TRJN DaVinci & Geist)
 * - Brand gold badge, structured bio narrative, and location details
 */
export default function AboutSection() {
  return (
    <section
      id="about"
      aria-label="About Benny"
      className="relative w-full min-h-[90svh] md:min-h-screen flex items-center justify-center py-24 px-6 sm:px-12 overflow-hidden"
    >
      {/* Background Interactive White Pixel Canvas */}
      <AboutPixelCanvas pixelSize={6} />

      {/* Foreground Crystal-Clear Content Card */}
      <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center text-center space-y-6 sm:space-y-8 select-text">
        {/* Brand Tag Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/85 backdrop-blur-md border border-black/10 shadow-sm text-xs font-mono uppercase tracking-widest text-black/80">
          <span className="w-2 h-2 rounded-full bg-[#ffd700]"></span>
          About Me
        </div>

        {/* Section Title */}
        <h2 className="text-3xl sm:text-5xl md:text-6xl font-heading font-normal tracking-tight text-[#0a0a0a] leading-[1.15]">
          Bridging intentional design <br />
          <span className="italic font-bold text-[#c7a700] drop-shadow-sm">with production code.</span>
        </h2>

        {/* Crisp High-Legibility Bio Paragraphs */}
        <div className="space-y-4 text-base sm:text-lg md:text-xl text-black/80 font-sans leading-relaxed max-w-2xl font-normal">
          <p>
            I'm <strong className="text-black font-semibold">Benny</strong>, a designer and creative engineer based in Thiruvattar. I specialize in crafting thoughtful, tactile digital interfaces that unite aesthetic rigor with reliable code.
          </p>
          <p className="text-sm sm:text-base text-black/65">
            From early product vision and design systems to high-performance web applications, I care deeply about micro-interactions, responsive typography, and delivering experiences that feel alive.
          </p>
        </div>

        {/* Quick Highlights / Details Pill Row */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <span className="px-3.5 py-1.5 rounded-full bg-white/80 backdrop-blur-sm border border-black/10 text-xs font-mono text-black/80 shadow-xs">
            📍 Thiruvattar, India
          </span>
          <span className="px-3.5 py-1.5 rounded-full bg-white/80 backdrop-blur-sm border border-black/10 text-xs font-mono text-black/80 shadow-xs">
            🎨 Design Systems & UI/UX
          </span>
          <span className="px-3.5 py-1.5 rounded-full bg-white/80 backdrop-blur-sm border border-black/10 text-xs font-mono text-black/80 shadow-xs">
            ⚡ Full-Stack Code & Motion
          </span>
        </div>
      </div>
    </section>
  )
}
