import React, { useEffect, useRef, useState, useCallback } from 'react'
import './MagneticCapsuleButton.css'

/**
 * Reusable Magnetic Capsule Cursor Button
 *
 * Proximity-Aware Cursor:
 * - Detects proximity when cursor moves NEAR any link or button (configurable radius: 55px).
 * - Smoothly morphs into the hand-clicking pointer button and magnetically pulls toward the target.
 * - Project cards and contact elements activate their respective states when near or hovered.
 */
export default function MagneticCapsuleButton({
  defaultText = "LET'S TALK",
  projectText = 'VIEW PROJECT',
  contactText = 'CONTACT ME',
  backgroundColor = 'var(--brand-primary, #ffd700)',
  textColor = 'var(--brand-heading, #000000)',
  size = 'md',
  enabled = true,
  proximityRadius = 55, // Distance in pixels to trigger near-link/button transition
  className = '',
}) {
  const containerRef = useRef(null)
  const innerRef = useRef(null)

  // Cursor states: 'default' | 'project' | 'contact' | 'link' | 'hidden'
  const [cursorState, setCursorState] = useState('default')
  const [isClicking, setIsClicking] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [isPreloaderDone, setIsPreloaderDone] = useState(Boolean(window.__preloaderFinished))

  // Coordinate and velocity physics (run at 60/120Hz with zero React re-renders)
  const mousePos = useRef({ x: -200, y: -200 })
  const currentPos = useRef({ x: -200, y: -200 })
  const velocity = useRef({ x: 0, y: 0 })
  const targetOffset = useRef({ x: 12, y: 12 })
  const magneticTarget = useRef(null)
  const isInputHover = useRef(false)
  const interactiveElementsRef = useRef([])
  const rafId = useRef(null)
  const wasOverCloud = useRef(false)
  const throttleCounter = useRef(0)

  const isEligibleDevice = useCallback(() => {
    if (typeof window === 'undefined') return false
    const hasFinePointer = window.matchMedia('(pointer: fine) and (hover: hover)').matches
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    return hasFinePointer && !prefersReducedMotion
  }, [])

  useEffect(() => {
    if (window.__preloaderFinished) {
      setIsPreloaderDone(true)
      return
    }

    const handlePreloaderDone = () => {
      setIsPreloaderDone(true)
    }

    window.addEventListener('preloader:done', handlePreloaderDone, { once: true })
    return () => window.removeEventListener('preloader:done', handlePreloaderDone)
  }, [])

  useEffect(() => {
    if (!enabled || !isEligibleDevice() || !isPreloaderDone) return

    document.body.classList.add('has-magnetic-cursor')

    // Collect interactive elements on screen for proximity checks
    const updateInteractiveElements = () => {
      const elements = document.querySelectorAll(
        'a, button, [role="button"], [data-cursor]'
      )
      const list = []
      const vw = window.innerWidth
      const vh = window.innerHeight

      elements.forEach((el) => {
        const r = el.getBoundingClientRect()
        if (
          r.width > 0 &&
          r.height > 0 &&
          r.bottom > 0 &&
          r.top < vh &&
          r.right > 0 &&
          r.left < vw
        ) {
          list.push({
            el,
            type: el.getAttribute('data-cursor') || 'link',
            left: r.left,
            top: r.top,
            right: r.right,
            bottom: r.bottom,
            cx: r.left + r.width / 2,
            cy: r.top + r.height / 2,
          })
        }
      })
      interactiveElementsRef.current = list
    }

    updateInteractiveElements()

    const handleMouseMove = (e) => {
      mousePos.current.x = e.clientX
      mousePos.current.y = e.clientY
      if (!isVisible) setIsVisible(true)

      // Fast Proximity Check every mouse move
      const target = e.target
      if (target.closest('input, textarea, select, [contenteditable="true"]')) {
        isInputHover.current = true
        document.body.classList.add('magnetic-cursor-input-hover')
        setCursorState('hidden')
        magneticTarget.current = null
        return
      }

      if (isInputHover.current) {
        isInputHover.current = false
        document.body.classList.remove('magnetic-cursor-input-hover')
      }

      // Check distance to all visible interactive elements
      const mx = e.clientX
      const my = e.clientY
      let nearestTarget = null
      let nearestDist = Infinity
      const elements = interactiveElementsRef.current

      for (let i = 0; i < elements.length; i++) {
        const item = elements[i]
        // Compute distance from mouse to bounding rectangle
        const dx = Math.max(item.left - mx, 0, mx - item.right)
        const dy = Math.max(item.top - my, 0, my - item.bottom)
        const dist = Math.sqrt(dx * dx + dy * dy)

        if (dist <= proximityRadius && dist < nearestDist) {
          nearestDist = dist
          nearestTarget = item
        }
      }

      if (nearestTarget) {
        if (nearestTarget.type === 'none') {
          setCursorState('hidden')
          magneticTarget.current = null
        } else {
          setCursorState(nearestTarget.type)
          magneticTarget.current = {
            cx: nearestTarget.cx,
            cy: nearestTarget.cy,
          }
        }
      } else {
        setCursorState('default')
        magneticTarget.current = null
      }
    }

    const handleMouseDown = () => setIsClicking(true)
    const handleMouseUp = () => setIsClicking(false)

    const handleMouseLeaveWindow = () => {
      setIsVisible(false)
      document.body.classList.remove('has-magnetic-cursor')
    }

    const handleMouseEnterWindow = () => {
      setIsVisible(true)
      document.body.classList.add('has-magnetic-cursor')
    }

    const animate = () => {
      let targetX = mousePos.current.x + targetOffset.current.x
      let targetY = mousePos.current.y + targetOffset.current.y

      if (magneticTarget.current) {
        const { cx, cy } = magneticTarget.current
        targetX = targetX + (cx - targetX) * 0.35
        targetY = targetY + (cy - targetY) * 0.35
      }

      const ease = 0.22
      const dx = targetX - currentPos.current.x
      const dy = targetY - currentPos.current.y

      velocity.current.x = dx * ease
      velocity.current.y = dy * ease

      currentPos.current.x += velocity.current.x
      currentPos.current.y += velocity.current.y

      const tilt = Math.max(-10, Math.min(10, velocity.current.x * 0.6))

      if (containerRef.current) {
        containerRef.current.style.transform = `translate3d(${currentPos.current.x}px, ${currentPos.current.y}px, 0)`
      }

      if (innerRef.current) {
        innerRef.current.style.rotate = `${tilt}deg`

        // Check if cursor is over pixel cloud via O(1) math function and mutate directly
        if (window.__isOverPixelBackground) {
          const isOverCloud = window.__isOverPixelBackground(
            currentPos.current.x + 25,
            currentPos.current.y + 12
          )

          if (isOverCloud !== wasOverCloud.current) {
            wasOverCloud.current = isOverCloud
            if (isOverCloud) {
              innerRef.current.style.backgroundColor = '#ffffff'
              innerRef.current.style.borderColor = 'rgba(0, 0, 0, 0.15)'
              innerRef.current.style.boxShadow = '0 10px 30px -5px rgba(0, 0, 0, 0.2)'
            } else {
              innerRef.current.style.backgroundColor = backgroundColor
              innerRef.current.style.borderColor = 'rgba(0, 0, 0, 0.1)'
              innerRef.current.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.25)'
            }
          }
        }
      }

      rafId.current = requestAnimationFrame(animate)
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    window.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mouseup', handleMouseUp)
    window.addEventListener('resize', updateInteractiveElements)
    window.addEventListener('scroll', updateInteractiveElements, { passive: true })
    document.addEventListener('mouseleave', handleMouseLeaveWindow)
    document.addEventListener('mouseenter', handleMouseEnterWindow)

    const updateInterval = setInterval(updateInteractiveElements, 800)
    rafId.current = requestAnimationFrame(animate)

    return () => {
      clearInterval(updateInterval)
      document.body.classList.remove('has-magnetic-cursor', 'magnetic-cursor-input-hover')
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('resize', updateInteractiveElements)
      window.removeEventListener('scroll', updateInteractiveElements)
      document.removeEventListener('mouseleave', handleMouseLeaveWindow)
      document.removeEventListener('mouseenter', handleMouseEnterWindow)
      if (rafId.current) cancelAnimationFrame(rafId.current)
    }
  }, [enabled, isVisible, isEligibleDevice, backgroundColor, proximityRadius, isPreloaderDone])

  if (!enabled || !isPreloaderDone) return null

  const sizeClasses = {
    sm: 'text-[10px] py-1 px-3',
    md: 'text-xs py-1.5 px-4',
    lg: 'text-sm py-2 px-5',
  }

  const isLinkState = cursorState === 'link'

  let text = defaultText
  let arrowClass = 'transition-transform duration-300'
  let stateTransform = isClicking ? 'scale(0.85)' : 'scale(1)'
  let stateOpacity = isVisible && cursorState !== 'hidden' ? 1 : 0

  if (cursorState === 'project') {
    text = projectText
    arrowClass = 'translate-x-1 duration-300'
    stateTransform = isClicking ? 'scale(0.92)' : 'scale(1.05)'
  } else if (cursorState === 'contact') {
    text = contactText
    stateTransform = isClicking ? 'scale(0.92)' : 'scale(1.08)'
  } else if (isLinkState) {
    stateTransform = isClicking ? 'scale(0.85) translateY(2px)' : 'scale(1)'
  }

  return (
    <div
      ref={containerRef}
      className={`magnetic-capsule-container ${className}`}
      style={{ opacity: stateOpacity }}
      aria-hidden="true"
    >
      {/* 
        Near/Hovering links/buttons: Hand Clicking Pointer Button
      */}
      {isLinkState ? (
        <div
          ref={innerRef}
          className="w-10 h-10 rounded-full flex items-center justify-center border border-black/15 shadow-xl transition-all duration-300 cursor-none"
          style={{
            backgroundColor,
            color: textColor,
            transform: stateTransform,
          }}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-5 h-5 transition-transform duration-200"
          >
            <path d="M14 9a2 2 0 0 1-2 2H9.5a2 2 0 0 0-2 2v2.5a2 2 0 0 0 2 2h4.5a3.5 3.5 0 0 0 3.5-3.5v-3A2 2 0 0 0 14 9z" fill="currentColor" fillOpacity="0.15" />
            <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v3" />
            <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v6" />
            <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8" />
            <path d="M18 11a2 2 0 1 1 4 0v3a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.9-2.26L2.3 16.02a1.5 1.5 0 0 1 2.2-2.04L6 15" />
          </svg>
        </div>
      ) : (
        /* Default Capsule & Project Preview States */
        <div
          ref={innerRef}
          className={`magnetic-capsule-inner border border-black/10 ${sizeClasses[size] || sizeClasses.md}`}
          style={{
            backgroundColor,
            color: textColor,
            transform: stateTransform,
          }}
        >
          <span>{text}</span>
          <svg
            viewBox="0 0 20 20"
            fill="currentColor"
            className={`w-3.5 h-3.5 shrink-0 ${arrowClass}`}
          >
            <path
              fillRule="evenodd"
              d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10Z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      )}
    </div>
  )
}
