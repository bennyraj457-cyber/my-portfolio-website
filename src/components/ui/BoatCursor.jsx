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

  const currentPos = useRef({ x: -200, y: -200 })
  const velocity = useRef({ x: 0, y: 0 })
  const scrollVelocity = useRef(0)
  const smoothAngle = useRef(0)
  const smoothRoll = useRef(0)
  const wakeParticles = useRef([])
  const activeControl = useRef({ up: false, down: false, left: false, right: false })
  const rafId = useRef(null)

  useEffect(() => {
    if (!enabled) return

    // Position boat initially in the upper-center viewport
    currentPos.current.x = window.innerWidth / 2
    currentPos.current.y = window.innerHeight * 0.38
    setIsVisible(true)

    // Keyboard Arrow Keys & WASD Support:
    const handleKeyDown = (e) => {
      const key = e.key
      if (['ArrowUp', 'KeyW', 'w', 'W'].includes(key)) {
        activeControl.current.up = true
        e.preventDefault()
      } else if (['ArrowDown', 'KeyS', 's', 'S'].includes(key)) {
        activeControl.current.down = true
        e.preventDefault()
      } else if (['ArrowLeft', 'KeyA', 'a', 'A'].includes(key)) {
        activeControl.current.left = true
        e.preventDefault()
      } else if (['ArrowRight', 'KeyD', 'd', 'D'].includes(key)) {
        activeControl.current.right = true
        e.preventDefault()
      }
    }

    const handleKeyUp = (e) => {
      const key = e.key
      if (['ArrowUp', 'KeyW', 'w', 'W'].includes(key)) {
        activeControl.current.up = false
      } else if (['ArrowDown', 'KeyS', 's', 'S'].includes(key)) {
        activeControl.current.down = false
      } else if (['ArrowLeft', 'KeyA', 'a', 'A'].includes(key)) {
        activeControl.current.left = false
      } else if (['ArrowRight', 'KeyD', 'd', 'D'].includes(key)) {
        activeControl.current.right = false
      }
    }

    // Disable mouse wheel scroll & touch-drag scroll across the page
    // (Page scrolling is strictly controlled by steering the boat with arrows)
    const preventWheelScroll = (e) => {
      e.preventDefault()
    }

    const preventTouchScroll = (e) => {
      if (e.target.closest('#boat-directional-controller, a, button, input, textarea')) return
      e.preventDefault()
    }

    document.body.style.overscrollBehavior = 'none'
    document.documentElement.style.overscrollBehavior = 'none'

    window.addEventListener('wheel', preventWheelScroll, { passive: false })
    window.addEventListener('touchmove', preventTouchScroll, { passive: false })
    window.addEventListener('keydown', handleKeyDown, { passive: false })
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      document.body.style.overscrollBehavior = 'auto'
      document.documentElement.style.overscrollBehavior = 'auto'
      window.removeEventListener('wheel', preventWheelScroll)
      window.removeEventListener('touchmove', preventTouchScroll)
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [enabled])

  useEffect(() => {
    if (!enabled) return

    const canvas = wakeCanvasRef.current
    const ctx = canvas ? canvas.getContext('2d') : null

    const updateCanvasSize = () => {
      if (canvas) {
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight
      }
    }
    updateCanvasSize()

    const animate = () => {
      // Direct Arrow / D-Pad Steering Physics:
      const driveSpeed = 4.2
      const ctrl = activeControl.current

      let inputX = 0
      let inputY = 0

      if (ctrl.up) inputY -= driveSpeed
      if (ctrl.down) inputY += driveSpeed
      if (ctrl.left) inputX -= driveSpeed
      if (ctrl.right) inputX += driveSpeed

      // Acceleration & fluid water momentum
      velocity.current.x += (inputX - velocity.current.x) * 0.16
      velocity.current.y += (inputY - velocity.current.y) * 0.16

      currentPos.current.x += velocity.current.x
      currentPos.current.y += velocity.current.y

      // Screen boundary constraints
      const marginX = 35
      const marginY = 60
      currentPos.current.x = Math.max(marginX, Math.min(window.innerWidth - marginX, currentPos.current.x))
      currentPos.current.y = Math.max(marginY, Math.min(window.innerHeight - 140, currentPos.current.y))

      // Broadcast boat position so canvases (hero & about pixel backgrounds) react to the boat
      window.dispatchEvent(
        new CustomEvent('boatmove', {
          detail: { clientX: currentPos.current.x, clientY: currentPos.current.y },
        })
      )

      // Smooth inertia-dampened page scrolling:
      // Translates boat vertical momentum into silky smooth camera gliding
      let targetScrollSpeed = 0
      if (ctrl.down) {
        targetScrollSpeed = 5.2
      } else if (ctrl.up) {
        targetScrollSpeed = -5.2
      } else if (Math.abs(velocity.current.y) > 0.4) {
        targetScrollSpeed = velocity.current.y * 1.3
      }

      // Smooth lerp scroll velocity
      scrollVelocity.current += (targetScrollSpeed - scrollVelocity.current) * 0.12

      if (Math.abs(scrollVelocity.current) > 0.05) {
        window.scrollBy(0, scrollVelocity.current)
      }

      const speedSq = velocity.current.x * velocity.current.x + velocity.current.y * velocity.current.y
      const speed = Math.sqrt(speedSq)

      // Heading direction tracking
      if (speed > 0.35) {
        const targetAngle = Math.atan2(velocity.current.y, velocity.current.x) * (180 / Math.PI) + 90
        
        let angleDiff = targetAngle - smoothAngle.current
        while (angleDiff < -180) angleDiff += 360
        while (angleDiff > 180) angleDiff -= 360

        const rotLerp = Math.min(0.24, 0.08 + speed * 0.015)
        smoothAngle.current += angleDiff * rotLerp

        const targetRoll = Math.max(-14, Math.min(14, (angleDiff * 0.4) + (velocity.current.x * 0.3)))
        smoothRoll.current += (targetRoll - smoothRoll.current) * 0.1

        // Spawn trailing water wake particles behind the stern
        if (Math.random() > 0.42 && speed > 1.2) {
          const sternDistance = 22
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
        smoothRoll.current += (0 - smoothRoll.current) * 0.08
      }

      // Update Boat Container position
      if (containerRef.current) {
        containerRef.current.style.transform = `translate3d(${currentPos.current.x.toFixed(2)}px, ${currentPos.current.y.toFixed(2)}px, 0)`
      }

      // Update 3D Top-Angle Boat Perspective
      if (boatRef.current) {
        boatRef.current.style.transform = `perspective(800px) rotate(${smoothAngle.current.toFixed(2)}deg) rotateX(15deg) rotateY(${smoothRoll.current.toFixed(2)}deg)`
      }

      // Render Trailing Water Wake on Canvas
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

    window.addEventListener('resize', updateCanvasSize)
    rafId.current = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('resize', updateCanvasSize)
      if (rafId.current) cancelAnimationFrame(rafId.current)
    }
  }, [enabled])

  if (!enabled) return null

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

      {/* Floating On-Screen Arrow Controller Wheel (Available on All Devices) */}
      <div
        id="boat-directional-controller"
        className="fixed bottom-6 right-6 sm:right-8 z-50 flex flex-col items-center select-none pointer-events-auto touch-manipulation"
        style={{ touchAction: 'none' }}
      >
        {/* Subtle Label */}
        <div className="mb-2 px-3 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-[#ffd700] text-[10px] font-mono tracking-widest uppercase border border-[#ffd700]/30 shadow-lg pointer-events-none flex items-center gap-1.5">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#ffd700] animate-pulse"></span>
          Sail by Arrows
        </div>

        {/* D-Pad Controller Wheel */}
        <div className="relative w-32 h-32 rounded-full bg-black/85 backdrop-blur-xl border border-white/20 p-2 shadow-[0_12px_36px_rgba(0,0,0,0.65)] flex items-center justify-center">
          {/* Center Decorative Boat Compass Hub */}
          <div className="absolute w-11 h-11 rounded-full bg-gradient-to-b from-[#222222] to-[#111111] border border-[#ffd700]/40 flex items-center justify-center pointer-events-none shadow-inner">
            <span className="text-[#ffd700] text-sm">⚓</span>
          </div>

          {/* UP BUTTON */}
          <button
            type="button"
            aria-label="Steer boat up"
            onPointerDown={(e) => { e.preventDefault(); activeControl.current.up = true }}
            onPointerUp={(e) => { e.preventDefault(); activeControl.current.up = false }}
            onPointerLeave={() => { activeControl.current.up = false }}
            className="absolute top-1 left-1/2 -translate-x-1/2 w-10 h-9 rounded-t-xl bg-white/10 hover:bg-[#ffd700]/30 active:bg-[#ffd700]/45 text-white flex items-center justify-center transition-colors active:scale-95 cursor-pointer"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="18 15 12 9 6 15"></polyline>
            </svg>
          </button>

          {/* DOWN BUTTON (Sail Down & Scroll Page Down) */}
          <button
            type="button"
            aria-label="Steer boat down & scroll"
            onPointerDown={(e) => { e.preventDefault(); activeControl.current.down = true }}
            onPointerUp={(e) => { e.preventDefault(); activeControl.current.down = false }}
            onPointerLeave={() => { activeControl.current.down = false }}
            className="absolute bottom-1 left-1/2 -translate-x-1/2 w-10 h-9 rounded-b-xl bg-white/10 hover:bg-[#ffd700]/30 active:bg-[#ffd700]/45 text-[#ffd700] flex items-center justify-center transition-colors active:scale-95 border-b border-[#ffd700]/40 cursor-pointer"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>

          {/* LEFT BUTTON */}
          <button
            type="button"
            aria-label="Steer boat left"
            onPointerDown={(e) => { e.preventDefault(); activeControl.current.left = true }}
            onPointerUp={(e) => { e.preventDefault(); activeControl.current.left = false }}
            onPointerLeave={() => { activeControl.current.left = false }}
            className="absolute left-1 top-1/2 -translate-y-1/2 w-9 h-10 rounded-l-xl bg-white/10 hover:bg-[#ffd700]/30 active:bg-[#ffd700]/45 text-white flex items-center justify-center transition-colors active:scale-95 cursor-pointer"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>

          {/* RIGHT BUTTON */}
          <button
            type="button"
            aria-label="Steer boat right"
            onPointerDown={(e) => { e.preventDefault(); activeControl.current.right = true }}
            onPointerUp={(e) => { e.preventDefault(); activeControl.current.right = false }}
            onPointerLeave={() => { activeControl.current.right = false }}
            className="absolute right-1 top-1/2 -translate-y-1/2 w-9 h-10 rounded-r-xl bg-white/10 hover:bg-[#ffd700]/30 active:bg-[#ffd700]/45 text-white flex items-center justify-center transition-colors active:scale-95 cursor-pointer"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </div>
      </div>
    </>
  )
}

