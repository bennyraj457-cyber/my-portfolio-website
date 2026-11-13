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
      // When boat SVG points UP (Y-axis negative is 0 deg):
      // atan2(velocity.y, velocity.x) gives angle relative to +X (pointing right).
      // Adding 90 deg aligns 0 deg heading with UP (bow pointing towards motion direction).
      if (speed > 0.4) {
        const targetAngle = Math.atan2(velocity.current.y, velocity.current.x) * (180 / Math.PI) + 90
        
        // Smooth continuous angle interpolation without 360 wrap glitch
        let angleDiff = targetAngle - currentAngle.current
        while (angleDiff < -180) angleDiff += 360
        while (angleDiff > 180) angleDiff -= 360
        currentAngle.current += angleDiff * 0.22

        // Spawn gentle wake ripples behind the boat stern (opposite to travel direction)
        if (Math.random() > 0.4 && speed > 1.5) {
          const sternDistance = 16
          // Radian direction of the stern: bow is (currentAngle - 90), stern is opposite (+ 90)
          const sternRad = (currentAngle.current + 90) * (Math.PI / 180)
          wakeParticles.current.push({
            x: currentPos.current.x + Math.cos(sternRad) * sternDistance,
            y: currentPos.current.y + Math.sin(sternRad) * sternDistance,
            size: 2,
            maxSize: 12 + Math.random() * 6,
            alpha: 0.6,
            decay: 0.022,
            vx: -velocity.current.x * 0.12 + (Math.random() - 0.5) * 0.3,
            vy: -velocity.current.y * 0.12 + (Math.random() - 0.5) * 0.3,
          })
        }
      }

      // Update Boat Container transform
      if (containerRef.current) {
        const x = Math.round(currentPos.current.x)
        const y = Math.round(currentPos.current.y)
        containerRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`
      }

      // Update 3D Top-Angle Boat Perspective:
      // - rotateZ: points the bow directly into the movement direction
      // - rotateX: top-down isometric tilt angle (slanted 35-45 deg from top)
      // - dynamic banking roll (rotateY) into sharp turns
      if (boatRef.current) {
        // Dynamic lateral banking roll when turning
        const turnRoll = Math.max(-20, Math.min(20, (velocity.current.x * Math.cos(currentAngle.current * Math.PI / 180) + velocity.current.y * Math.sin(currentAngle.current * Math.PI / 180)) * 1.5))
        
        boatRef.current.style.transform = `perspective(800px) rotate(${currentAngle.current}deg) rotateX(32deg) rotateY(${turnRoll}deg)`
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
          className={`relative -left-5 -top-5 transition-transform duration-75 ease-out select-none ${
            isHovered ? 'scale-115' : 'scale-100'
          }`}
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* 3D Top-Angle / Isometric Boat SVG */}
          {/* Bow points UP (towards Y=0), stern is at bottom (Y=40) */}
          <svg
            width="40"
            height="40"
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="filter drop-shadow-[0_10px_16px_rgba(0,0,0,0.35)]"
          >
            {/* Water Shadow underneath hull */}
            <ellipse
              cx="20"
              cy="23"
              rx="9"
              ry="16"
              fill="rgba(0, 0, 0, 0.22)"
              className="filter blur-[2px]"
            />

            {/* Hull Outer Boundary / Waterline Deck Shape */}
            {/* Port (Left) Hull Surface - Deep Charcoal with ambient shade */}
            <path
              d="M20 4 C16 11, 10 20, 11 34 C15 36, 19 36, 20 36 Z"
              fill="#181818"
              stroke="#0a0a0a"
              strokeWidth="0.8"
            />

            {/* Starboard (Right) Hull Surface - Medium Charcoal catching light */}
            <path
              d="M20 4 C24 11, 30 20, 29 34 C25 36, 21 36, 20 36 Z"
              fill="#2c2c2c"
              stroke="#0a0a0a"
              strokeWidth="0.8"
            />

            {/* Inner Deck Cockpit / Recessed Floor */}
            <path
              d="M20 8 C17 14, 13 21, 14 31 C17 33, 23 33, 26 31 C27 21, 23 14, 20 8 Z"
              fill="#0d0d0d"
              stroke="#1f1f1f"
              strokeWidth="0.6"
            />

            {/* Wooden Teak Deck Grate / Accents */}
            <line x1="17" y1="24" x2="23" y2="24" stroke="#ffd700" strokeWidth="0.9" strokeOpacity="0.8" />
            <line x1="16" y1="27" x2="24" y2="27" stroke="#ffd700" strokeWidth="0.9" strokeOpacity="0.8" />
            <line x1="16.5" y1="30" x2="23.5" y2="30" stroke="#ffd700" strokeWidth="0.9" strokeOpacity="0.8" />

            {/* Center Keel / Spine Line */}
            <line
              x1="20"
              y1="4"
              x2="20"
              y2="36"
              stroke="#ffd700"
              strokeWidth="1"
              strokeLinecap="round"
            />

            {/* Triangular Mainsail (Billowing 3D sail from mast to stern) */}
            {/* Left Sail Facet - Brand Gold #ffd700 */}
            <path
              d="M20 12 L12 26 L20 23 Z"
              fill={isHovered ? '#fff3a8' : '#ffd700'}
              stroke="#c7a700"
              strokeWidth="0.8"
              strokeLinejoin="round"
            />

            {/* Right Sail Facet - Shaded Gold #d4af37 */}
            <path
              d="M20 12 L28 26 L20 23 Z"
              fill={isHovered ? '#ffe766' : '#c9a100'}
              stroke="#997b00"
              strokeWidth="0.8"
              strokeLinejoin="round"
            />

            {/* Fore Jib Sail (Front Triangular Sail towards Bow) */}
            <path
              d="M20 6 L17 14 L20 13 Z"
              fill="#ffffff"
              fillOpacity="0.9"
            />
            <path
              d="M20 6 L23 14 L20 13 Z"
              fill="#e0e0e0"
              fillOpacity="0.9"
            />

            {/* Mast Apex & Bow Tip Pennant */}
            <circle cx="20" cy="12" r="1.5" fill="#ffffff" stroke="#111111" strokeWidth="0.6" />
            <polygon points="20,4 23,6 20,7" fill="#ffd700" />
          </svg>
        </div>
      </div>
    </>
  )
}

