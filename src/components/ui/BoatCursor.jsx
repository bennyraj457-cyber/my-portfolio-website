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
  const smoothAngle = useRef(0)
  const smoothRoll = useRef(0)
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
      // 1. High-precision spring lerp for silky smooth boat movement
      const posLerp = 0.12
      const dx = mousePos.current.x - currentPos.current.x
      const dy = mousePos.current.y - currentPos.current.y

      velocity.current.x += (dx * posLerp - velocity.current.x) * 0.4
      velocity.current.y += (dy * posLerp - velocity.current.y) * 0.4

      currentPos.current.x += velocity.current.x
      currentPos.current.y += velocity.current.y

      const speedSq = velocity.current.x * velocity.current.x + velocity.current.y * velocity.current.y
      const speed = Math.sqrt(speedSq)

      // 2. Smooth heading direction tracking:
      // Only steer when there is real motion (speed > 0.35) to avoid jitter when idling
      if (speed > 0.35) {
        // Boat SVG bow points UP (negative Y), so atan2(vy, vx) + 90 deg gives exact bow direction
        const targetAngle = Math.atan2(velocity.current.y, velocity.current.x) * (180 / Math.PI) + 90
        
        let angleDiff = targetAngle - smoothAngle.current
        while (angleDiff < -180) angleDiff += 360
        while (angleDiff > 180) angleDiff -= 360

        // Adaptive rotational smoothing: faster response when moving fast, velvety when cruising
        const rotLerp = Math.min(0.24, 0.08 + speed * 0.015)
        smoothAngle.current += angleDiff * rotLerp

        // Dynamic 3D banking roll into turns (smoothly filtered)
        const targetRoll = Math.max(-14, Math.min(14, (angleDiff * 0.4) + (velocity.current.x * 0.3)))
        smoothRoll.current += (targetRoll - smoothRoll.current) * 0.1

        // Spawn trailing water wake particles behind the stern
        if (Math.random() > 0.45 && speed > 1.2) {
          const sternDistance = 22
          // Stern is opposite to bow
          const sternRad = (smoothAngle.current + 90) * (Math.PI / 180)
          wakeParticles.current.push({
            x: currentPos.current.x + Math.cos(sternRad) * sternDistance,
            y: currentPos.current.y + Math.sin(sternRad) * sternDistance,
            size: 2,
            maxSize: 10 + Math.random() * 5,
            alpha: 0.5,
            decay: 0.02,
            vx: -velocity.current.x * 0.08 + (Math.random() - 0.5) * 0.25,
            vy: -velocity.current.y * 0.08 + (Math.random() - 0.5) * 0.25,
          })
        }
      } else {
        // Gently return roll to flat when stopped
        smoothRoll.current += (0 - smoothRoll.current) * 0.08
      }

      // 3. Update Boat Container position with sub-pixel float precision
      if (containerRef.current) {
        containerRef.current.style.transform = `translate3d(${currentPos.current.x.toFixed(2)}px, ${currentPos.current.y.toFixed(2)}px, 0)`
      }

      // 4. Update 3D Top-Angle Boat Perspective:
      // Direct JS matrix transform without conflicting CSS transition lag
      if (boatRef.current) {
        boatRef.current.style.transform = `perspective(800px) rotate(${smoothAngle.current.toFixed(2)}deg) rotateX(15deg) rotateY(${smoothRoll.current.toFixed(2)}deg)`
      }

      // 5. Render Trailing Water Wake on Canvas
      if (ctx && canvas) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        const wp = wakeParticles.current

        for (let i = wp.length - 1; i >= 0; i--) {
          const p = wp[i]
          p.x += p.vx
          p.y += p.vy
          p.size += 0.3
          p.alpha -= p.decay

          if (p.alpha <= 0) {
            wp.splice(i, 1)
            continue
          }

          ctx.strokeStyle = '#ffd700'
          ctx.lineWidth = 1
          ctx.globalAlpha = p.alpha * 0.6
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
          className={`relative -left-6 -top-10 select-none ${
            isHovered ? 'scale-115' : 'scale-100'
          }`}
          style={{
            transformStyle: 'preserve-3d',
            transformOrigin: '24px 38px',
            transition: 'scale 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {/* Top-Angle 3D Stylized Wooden Rowboat with Oar & Blanket based on reference illustration */}
          <svg
            width="48"
            height="76"
            viewBox="0 0 54 86"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="filter drop-shadow-[0_12px_20px_rgba(0,0,0,0.38)]"
          >
            <defs>
              {/* Outer Hull Gradient */}
              <linearGradient id="hullEdgeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#d97706" />
                <stop offset="35%" stopColor="#f59e0b" />
                <stop offset="70%" stopColor="#b45309" />
                <stop offset="100%" stopColor="#78350f" />
              </linearGradient>

              {/* Interior Wood Floor Plank Gradient */}
              <linearGradient id="interiorWoodGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#9a3412" />
                <stop offset="50%" stopColor="#7c2d12" />
                <stop offset="100%" stopColor="#6c230e" />
              </linearGradient>

              {/* Turquoise / Teal Blanket Gradient */}
              <linearGradient id="blanketGrad" x1="0%" y1="0%" x2="100%" y2="50%">
                <stop offset="0%" stopColor="#99f6e4" />
                <stop offset="40%" stopColor="#5eead4" />
                <stop offset="80%" stopColor="#2dd4bf" />
                <stop offset="100%" stopColor="#0f766e" />
              </linearGradient>
            </defs>

            {/* Ambient Water Shadow Underneath Hull (Offset to Starboard as in reference) */}
            <path
              d="M27 8 C40 18, 48 38, 46 72 C41 78, 35 80, 27 80 C19 80, 13 78, 8 72 C6 38, 14 18, 27 8 Z"
              fill="rgba(10, 25, 47, 0.28)"
              transform="translate(4, 5)"
              className="filter blur-[2.5px]"
            />

            {/* Starboard Outer Cast Shadow Edge on Water */}
            <path
              d="M34 16 C45 28, 47 48, 44 74 L49 76 C53 48, 48 24, 38 12 Z"
              fill="rgba(15, 23, 42, 0.22)"
              className="filter blur-[1px]"
            />

            {/* 1. Outer Boat Hull (Warm Golden-Orange Wood) */}
            {/* Symmetrical boat silhouette with pointed bow at top (27, 4) and transom at bottom */}
            <path
              d="M27 4 C38 14, 46 32, 44 72 C38 78, 32 80, 27 80 C22 80, 16 78, 10 72 C8 32, 16 14, 27 4 Z"
              fill="url(#hullEdgeGrad)"
              stroke="#592008"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />

            {/* Dark inner rim shadow bevel */}
            <path
              d="M27 6 C36 15, 43 31, 41 70 C36 75, 31 77, 27 77 C23 77, 18 75, 13 70 C11 31, 18 15, 27 6 Z"
              fill="#521b06"
            />

            {/* 2. Inner Boat Floor / Cockpit (Rich Warm Mahogany / Dark Wood) */}
            <path
              d="M27 9 C34 17, 40 32, 38 68 C34 72, 30 74, 27 74 C24 74, 20 72, 16 68 C14 32, 20 17, 27 9 Z"
              fill="url(#interiorWoodGrad)"
              stroke="#431407"
              strokeWidth="0.8"
            />

            {/* Subtle Floorboard Planking Lines */}
            <line x1="24" y1="14" x2="24" y2="72" stroke="#541c09" strokeWidth="0.8" />
            <line x1="27" y1="10" x2="27" y2="73" stroke="#431407" strokeWidth="0.9" />
            <line x1="30" y1="14" x2="30" y2="72" stroke="#541c09" strokeWidth="0.8" />

            {/* 3. Bow Foredeck Triangle (Solid Golden Wood) */}
            <path
              d="M27 6 C31 10, 35 15, 36 21 L18 21 C19 15, 23 10, 27 6 Z"
              fill="#ea580c"
              stroke="#9a3412"
              strokeWidth="0.8"
            />
            {/* Bow deck facet highlights */}
            <polygon points="27,6 36,21 27,21" fill="#f97316" fillOpacity="0.8" />
            <polygon points="27,6 18,21 27,21" fill="#c2410c" fillOpacity="0.6" />

            {/* 4. Turquoise Draped Cloth / Blanket across Starboard Gunwale */}
            {/* Main draped blanket body */}
            <path
              d="M19 44 L38 42 C41 43, 44 48, 44 55 C42 61, 38 62, 36 60 L18 52 Z"
              fill="url(#blanketGrad)"
              stroke="#134e4a"
              strokeWidth="0.8"
            />
            {/* Blanket soft fold ripples */}
            <path
              d="M20 47 C26 46, 32 45, 39 46"
              stroke="#ccfbf1"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
            <path
              d="M19 50 C25 49, 31 48, 38 50"
              stroke="#115e59"
              strokeWidth="0.8"
              strokeLinecap="round"
            />
            {/* Hanging over starboard gunwale edge into water */}
            <path
              d="M38 42 C42 45, 46 50, 45 58 C44 63, 41 66, 37 63 C39 58, 40 52, 38 46 Z"
              fill="#2dd4bf"
              stroke="#0f766e"
              strokeWidth="0.7"
            />
            <path
              d="M44 56 C46 62, 45 68, 42 72 C41 71, 40 68, 41 64 Z"
              fill="#14b8a6"
              opacity="0.8"
            />

            {/* 5. Center Wooden Cross-Seat (Thwart) */}
            <path
              d="M15 54 L39 52 L38 60 L16 62 Z"
              fill="#ea580c"
              stroke="#7c2d12"
              strokeWidth="0.9"
            />
            <path
              d="M15 54 L39 52 L39 55 L15 57 Z"
              fill="#fb923c"
            />

            {/* 6. Stern Triangular / Trapezoid Seat */}
            <path
              d="M18 69 L36 69 L34 76 L20 76 Z"
              fill="#c2410c"
              stroke="#7c2d12"
              strokeWidth="0.8"
            />

            {/* 7. Wooden Oar Resting Vertically inside boat */}
            {/* Oar paddle blade at top (bow end) */}
            <path
              d="M26 21 C25 24, 25 29, 26 33 L29 33 C30 29, 30 24, 29 21 Z"
              fill="#ea580c"
              stroke="#7c2d12"
              strokeWidth="0.8"
            />
            <line x1="27.5" y1="22" x2="27.5" y2="33" stroke="#fed7aa" strokeWidth="0.6" />

            {/* Long wooden oar shaft spanning past center seat to stern */}
            <rect
              x="26.5"
              y="32"
              width="2"
              height="38"
              rx="0.8"
              fill="#f97316"
              stroke="#7c2d12"
              strokeWidth="0.6"
            />
            {/* Dark rubber/leather grip section near stern */}
            <rect
              x="26.3"
              y="56"
              width="2.4"
              height="11"
              rx="0.5"
              fill="#27272a"
              stroke="#09090b"
              strokeWidth="0.5"
            />
            {/* Wooden handle end */}
            <rect
              x="26.5"
              y="67"
              width="2"
              height="3.5"
              rx="0.5"
              fill="#ea580c"
            />

            {/* Gunwale Oarlock / Rowlock accent */}
            <rect x="11.5" y="42" width="2" height="6" rx="0.6" fill="#3f3f46" />

            {/* Golden Interactive Hover Sparkle when hovering links */}
            {isHovered && (
              <circle
                cx="27"
                cy="6"
                r="3"
                fill="#ffd700"
                className="animate-ping opacity-75"
              />
            )}
          </svg>
        </div>
      </div>
    </>
  )
}

