import React, { useEffect, useRef, useState, useCallback } from 'react'

/**
 * BoatCursor
 *
 * Paper / Sail Boat Cursor:
 * - Replaces the capsule cursor with a sleek geometric origami boat.
 * - Dynamic Sailing Physics:
 *   - The boat smoothly steers and rotates into the direction of motion (bearing angle).
 *   - Tilts/heels organically with acceleration and velocity.
 *   - Generates a subtle trailing water wake / ripple particles behind the stern when sailing.
 * - Magnetic Hover Reaction:
 *   - When hovering over clickable links or buttons, the boat tilts perkily and displays a soft golden sail glow.
 */
export default function BoatCursor({
  enabled = true,
  className = '',
}) {
  const containerRef = useRef(null)
  const boatRef = useRef(null)
  const wakeCanvasRef = useRef(null)

  const [isVisible, setIsVisible] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const mousePos = useRef({ x: -200, y: -200 })
  const currentPos = useRef({ x: -200, y: -200 })
  const velocity = useRef({ x: 0, y: 0 })
  const currentAngle = useRef(0)
  const wakeParticles = useRef([])
  const rafId = useRef(null)

  const isEligibleDevice = useCallback(() => {
    if (typeof window === 'undefined') return false
    const hasFinePointer = window.matchMedia('(pointer: fine) and (hover: hover)').matches
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    return hasFinePointer && !prefersReducedMotion
  }, [])

  useEffect(() => {
    if (!enabled || !isEligibleDevice()) return

    const canvas = wakeCanvasRef.current
    const ctx = canvas ? canvas.getContext('2d') : null

    const updateCanvasSize = () => {
      if (canvas) {
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight
      }
    }
    updateCanvasSize()

    const handleMouseMove = (e) => {
      mousePos.current.x = e.clientX
      mousePos.current.y = e.clientY

      if (!isVisible) setIsVisible(true)

      // Check if hovering over clickable targets
      const target = e.target
      const isInteractive = target && target.closest('a, button, [role="button"], [data-cursor="link"], input, textarea')
      setIsHovered(!!isInteractive)
    }

    const handleMouseLeave = () => {
      setIsVisible(false)
    }

    const handleMouseEnter = () => {
      setIsVisible(true)
    }

    const animate = () => {
      const ease = 0.16
      const dx = mousePos.current.x - currentPos.current.x
      const dy = mousePos.current.y - currentPos.current.y

      velocity.current.x = dx * ease
      velocity.current.y = dy * ease

      currentPos.current.x += velocity.current.x
      currentPos.current.y += velocity.current.y

      const speed = Math.sqrt(velocity.current.x * velocity.current.x + velocity.current.y * velocity.current.y)

      // Calculate boat heading / steering direction
      if (speed > 0.8) {
        // Point boat bow towards direction of travel
        const targetAngle = Math.atan2(velocity.current.y, velocity.current.x) * (180 / Math.PI) + 90
        
        // Smooth angle interpolation
        let angleDiff = targetAngle - currentAngle.current
        while (angleDiff < -180) angleDiff += 360
        while (angleDiff > 180) angleDiff -= 360
        currentAngle.current += angleDiff * 0.18

        // Spawn gentle wake ripples behind the boat stern
        if (Math.random() > 0.45 && speed > 2.0) {
          const sternDistance = 14
          const sternRad = (currentAngle.current - 90) * (Math.PI / 180)
          wakeParticles.current.push({
            x: currentPos.current.x - Math.cos(sternRad) * sternDistance,
            y: currentPos.current.y - Math.sin(sternRad) * sternDistance,
            size: 2,
            maxSize: 10 + Math.random() * 6,
            alpha: 0.55,
            decay: 0.025,
            vx: -velocity.current.x * 0.15 + (Math.random() - 0.5) * 0.4,
            vy: -velocity.current.y * 0.15 + (Math.random() - 0.5) * 0.4,
          })
        }
      }

      // Update Boat Container transform
      if (containerRef.current) {
        const x = Math.round(currentPos.current.x)
        const y = Math.round(currentPos.current.y)
        containerRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`
      }

      // Update Boat Body rotation and heel (tilt)
      if (boatRef.current) {
        const heel = Math.max(-12, Math.min(12, velocity.current.x * 0.8))
        boatRef.current.style.transform = `rotate(${currentAngle.current}deg) skewX(${heel}deg)`
      }

      // Render Trailing Water Wake on Canvas
      if (ctx && canvas) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        const wp = wakeParticles.current

        for (let i = wp.length - 1; i >= 0; i--) {
          const p = wp[i]
          p.x += p.vx
          p.y += p.vy
          p.size += 0.35
          p.alpha -= p.decay

          if (p.alpha <= 0) {
            wp.splice(i, 1)
            continue
          }

          ctx.strokeStyle = '#ffd700'
          ctx.lineWidth = 1
          ctx.globalAlpha = p.alpha * 0.65
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
          ctx.stroke()
        }
        ctx.globalAlpha = 1.0
      }

      rafId.current = requestAnimationFrame(animate)
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    window.addEventListener('resize', updateCanvasSize)
    document.addEventListener('mouseleave', handleMouseLeave)
    document.addEventListener('mouseenter', handleMouseEnter)

    document.body.style.cursor = 'none'
    rafId.current = requestAnimationFrame(animate)

    return () => {
      document.body.style.cursor = 'auto'
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('resize', updateCanvasSize)
      document.removeEventListener('mouseleave', handleMouseLeave)
      document.removeEventListener('mouseenter', handleMouseEnter)
      if (rafId.current) cancelAnimationFrame(rafId.current)
    }
  }, [enabled, isEligibleDevice, isVisible])

  if (!enabled || !isEligibleDevice()) return null

  return (
    <>
      {/* Background Water Wake Ripple Canvas */}
      <canvas
        ref={wakeCanvasRef}
        className="fixed inset-0 pointer-events-none z-40 w-full h-full"
        aria-hidden="true"
      />

      {/* Floating Animated Boat Cursor */}
      <div
        ref={containerRef}
        className={`fixed top-0 left-0 pointer-events-none z-50 transition-opacity duration-300 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        } ${className}`}
        style={{
          transform: 'translate3d(-200px, -200px, 0)',
          willChange: 'transform',
        }}
        aria-hidden="true"
      >
        <div
          ref={boatRef}
          className={`relative -left-3.5 -top-3.5 transition-transform duration-75 ease-out select-none ${
            isHovered ? 'scale-115' : 'scale-100'
          }`}
        >
          {/* Geometric Origami Sailboat SVG */}
          <svg
            width="28"
            height="28"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.25)]"
          >
            {/* Main Tall Sail (Yellow Brand Gold #ffd700 with subtle gradient) */}
            <path
              d="M16 4 L16 20 L25 20 Z"
              fill={isHovered ? '#ffe766' : '#ffd700'}
              stroke="#111111"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />

            {/* Small Front Jib Sail (Cream White #fffadc) */}
            <path
              d="M14 8 L14 20 L7 20 Z"
              fill="#fffadc"
              stroke="#111111"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />

            {/* Mast */}
            <line
              x1="15"
              y1="3"
              x2="15"
              y2="21"
              stroke="#111111"
              strokeWidth="1.5"
              strokeLinecap="round"
            />

            {/* Boat Hull / Cockpit (Deep Charcoal #161616 with crisp yellow waterline trim) */}
            <path
              d="M5 21 L27 21 L23 27 L9 27 Z"
              fill="#181818"
              stroke="#111111"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />

            {/* Hull Waterline Accent Line */}
            <line
              x1="8"
              y1="23.5"
              x2="24"
              y2="23.5"
              stroke="#ffd700"
              strokeWidth="1"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>
    </>
  )
}
