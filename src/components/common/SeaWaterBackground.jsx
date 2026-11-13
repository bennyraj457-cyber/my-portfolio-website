import React, { useEffect, useRef } from 'react'

/**
 * SeaWaterBackground
 *
 * Dynamic animated sea water background:
 * - Fluid caustics & organic layered sine/cosine ocean waves
 * - Luminous sea tones (#005b82, #0077a8, #00a8cc, #48cae4, #caf0f8, deep ocean #023e8a)
 * - Interactive: Reacts to mouse pointer or boat cursor coordinates with propagating water ripple swells
 * - High-performance 60-120 FPS HTML5 canvas with zero external libraries
 */
export default function SeaWaterBackground({ className = '' }) {
  const canvasRef = useRef(null)
  const rafId = useRef(null)
  const mouseRef = useRef({ x: -1000, y: -1000, isMoving: false })
  const ripplesRef = useRef([])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    let width = 0
    let height = 0

    const resize = () => {
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    let time = 0

    // Water swell grid particles for interactive water deformation
    const cols = 28
    const rows = 18

    const render = () => {
      // Check if user is currently inside the 3D studio section
      // If the 3D studio is in view, pause water canvas rendering to avoid showing water underneath or wasting GPU
      const studioEl = document.getElementById('studio-workspace')
      if (studioEl) {
        const rect = studioEl.getBoundingClientRect()
        // If the 3D studio covers the viewport, skip rendering water
        if (rect.top <= 0 && rect.bottom >= window.innerHeight) {
          ctx.clearRect(0, 0, width, height)
          rafId.current = requestAnimationFrame(render)
          return
        }
      }

      time += 0.018

      // 1. Deep Ocean Base Gradient
      const baseGrad = ctx.createLinearGradient(0, 0, width * 0.4, height)
      baseGrad.addColorStop(0, '#0077b6') // Cerulean Sea Blue
      baseGrad.addColorStop(0.35, '#0096c7') // Vibrant Tropical Azure
      baseGrad.addColorStop(0.7, '#0077b6') // Mid Ocean Blue
      baseGrad.addColorStop(1, '#023e8a') // Deep Royal Trench
      ctx.fillStyle = baseGrad
      ctx.fillRect(0, 0, width, height)

      // 2. Underwater Caustics & Sunbeam Refractions (Voronoi/Cellular Sim)
      const cellW = width / cols
      const cellH = height / rows

      ctx.save()
      ctx.globalCompositeOperation = 'screen'

      for (let r = 0; r <= rows; r++) {
        for (let c = 0; c <= cols; c++) {
          const baseX = c * cellW
          const baseY = r * cellH

          // Multilayer wave offset
          const wave1 = Math.sin(c * 0.45 + time * 1.2) * 12
          const wave2 = Math.cos(r * 0.55 - time * 0.9) * 10
          const wave3 = Math.sin((c + r) * 0.35 + time * 0.7) * 8

          // Proximity to boat/mouse ripples
          let rippleShiftX = 0
          let rippleShiftY = 0
          for (let i = 0; i < ripplesRef.current.length; i++) {
            const rip = ripplesRef.current[i]
            const dx = baseX - rip.x
            const dy = baseY - rip.y
            const dist = Math.sqrt(dx * dx + dy * dy)
            const ringDist = Math.abs(dist - rip.radius)
            if (ringDist < 60) {
              const force = (1 - ringDist / 60) * rip.strength * 16
              rippleShiftX += (dx / (dist || 1)) * force
              rippleShiftY += (dy / (dist || 1)) * force
            }
          }

          const posX = baseX + wave1 + wave3 + rippleShiftX
          const posY = baseY + wave2 + wave3 + rippleShiftY

          // Sunlit caustic node glow
          const causticIntensity = (Math.sin(c * 0.6 + r * 0.7 + time * 1.5) + 1) * 0.5
          if (causticIntensity > 0.35) {
            const rad = (causticIntensity * cellW * 0.65)
            const causticGrad = ctx.createRadialGradient(posX, posY, 0, posX, posY, rad)
            causticGrad.addColorStop(0, `rgba(202, 240, 248, ${(causticIntensity * 0.28).toFixed(3)})`)
            causticGrad.addColorStop(0.5, `rgba(72, 202, 228, ${(causticIntensity * 0.14).toFixed(3)})`)
            causticGrad.addColorStop(1, 'rgba(0, 180, 216, 0)')

            ctx.fillStyle = causticGrad
            ctx.beginPath()
            ctx.arc(posX, posY, rad, 0, Math.PI * 2)
            ctx.fill()
          }
        }
      }
      ctx.restore()

      // 3. Gentle Ocean Surface Swell Lines (Drifting Shimmer)
      ctx.save()
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)'
      ctx.lineWidth = 1.4

      for (let w = 0; w < 6; w++) {
        const yBase = (height / 7) * (w + 1)
        const waveSpeed = 0.8 + w * 0.2
        const freq = 0.005 + w * 0.002
        const amp = 14 + w * 4

        ctx.beginPath()
        for (let x = 0; x <= width; x += 16) {
          const y = yBase + Math.sin(x * freq + time * waveSpeed) * amp + Math.cos(x * freq * 0.5 - time * 0.6) * (amp * 0.5)
          if (x === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        ctx.stroke()
      }
      ctx.restore()

      // 4. Update and Draw Propagating Water Swells from boat/pointer
      for (let i = ripplesRef.current.length - 1; i >= 0; i--) {
        const rip = ripplesRef.current[i]
        rip.radius += 3.2
        rip.strength -= 0.016

        if (rip.strength <= 0) {
          ripplesRef.current.splice(i, 1)
          continue
        }

        ctx.save()
        ctx.strokeStyle = `rgba(224, 251, 252, ${(rip.strength * 0.4).toFixed(3)})`
        ctx.lineWidth = 2.2
        ctx.beginPath()
        ctx.arc(rip.x, rip.y, rip.radius, 0, Math.PI * 2)
        ctx.stroke()

        // Inner secondary ripple
        if (rip.radius > 20) {
          ctx.strokeStyle = `rgba(144, 224, 239, ${(rip.strength * 0.25).toFixed(3)})`
          ctx.lineWidth = 1.2
          ctx.beginPath()
          ctx.arc(rip.x, rip.y, rip.radius * 0.65, 0, Math.PI * 2)
          ctx.stroke()
        }
        ctx.restore()
      }

      rafId.current = requestAnimationFrame(render)
    }

    render()

    // Trigger ripple swells from mouse movement
    let lastRippleTime = 0
    const handleMove = (x, y) => {
      const now = performance.now()
      if (now - lastRippleTime > 120) {
        lastRippleTime = now
        ripplesRef.current.push({
          x,
          y,
          radius: 8,
          strength: 0.9,
        })
        if (ripplesRef.current.length > 25) {
          ripplesRef.current.shift()
        }
      }
    }

    const onMouseMove = (e) => handleMove(e.clientX, e.clientY)
    const onBoatMove = (e) => {
      if (e.detail) handleMove(e.detail.clientX, e.detail.clientY)
    }

    window.addEventListener('mousemove', onMouseMove, { passive: true })
    window.addEventListener('boatmove', onBoatMove, { passive: true })

    return () => {
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('boatmove', onBoatMove)
      if (rafId.current) cancelAnimationFrame(rafId.current)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none z-0 w-full h-full ${className}`}
      aria-hidden="true"
    />
  )
}

