import React, { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'

/**
 * Preloader
 *
 * High-end creative agency preloader:
 * - Dither pixel progress counter (00 -> 100)
 * - Brand reveal with split text/scale
 * - Custom pixel burst / grid shutter exit revealing the portfolio
 */
export default function Preloader({ onComplete }) {
  const containerRef = useRef(null)
  const counterRef = useRef(null)
  const brandRef = useRef(null)
  const statusRef = useRef(null)
  const barRef = useRef(null)
  const curtainLeftRef = useRef(null)
  const curtainRightRef = useRef(null)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const obj = { val: 0 }
      const tl = gsap.timeline({
        onComplete: () => {
          onComplete?.()
        },
      })

      // 1. Initial State
      gsap.set(brandRef.current, { y: 30, opacity: 0 })
      gsap.set(statusRef.current, { opacity: 0 })
      gsap.set(counterRef.current, { opacity: 0, scale: 0.9 })

      // 2. Entrance
      tl.to(brandRef.current, {
        y: 0,
        opacity: 1,
        duration: 0.8,
        ease: 'power3.out',
      })
      .to(
        statusRef.current,
        {
          opacity: 1,
          duration: 0.5,
          ease: 'power2.out',
        },
        '-=0.4'
      )
      .to(
        counterRef.current,
        {
          opacity: 1,
          scale: 1,
          duration: 0.5,
          ease: 'power2.out',
        },
        '-=0.5'
      )

      // 3. Number Counter & Progress Bar Animation
      tl.to(obj, {
        val: 100,
        duration: 1.6,
        ease: 'power2.inOut',
        onUpdate: () => {
          const current = Math.round(obj.val)
          setProgress(current)
          if (barRef.current) {
            barRef.current.style.width = `${current}%`
          }
        },
      }, '-=0.2')

      // 4. Dramatic Exit Reveal (Curtains slide out, elements lift away)
      tl.to([brandRef.current, statusRef.current, counterRef.current, barRef.current?.parentElement], {
        y: -40,
        opacity: 0,
        duration: 0.5,
        stagger: 0.06,
        ease: 'power3.in',
      })
      .to(
        curtainLeftRef.current,
        {
          yPercent: -100,
          duration: 0.9,
          ease: 'power4.inOut',
        },
        '-=0.15'
      )
      .to(
        curtainRightRef.current,
        {
          yPercent: 100,
          duration: 0.9,
          ease: 'power4.inOut',
        },
        '<0.04'
      )
      .to(
        containerRef.current,
        {
          opacity: 0,
          duration: 0.15,
          onComplete: () => {
            if (containerRef.current) {
              containerRef.current.style.display = 'none'
            }
          },
        }
      )
    }, containerRef)

    return () => ctx.revert()
  }, [onComplete])

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[100] w-full h-[100dvh] flex items-center justify-center select-none overflow-hidden"
    >
      {/* Background Split Curtains for cinematic wipe exit */}
      <div
        ref={curtainLeftRef}
        className="absolute top-0 left-0 w-full h-1/2 bg-[#0d0d0d] z-0 will-change-transform border-b border-white/[0.06]"
      />
      <div
        ref={curtainRightRef}
        className="absolute bottom-0 left-0 w-full h-1/2 bg-[#0d0d0d] z-0 will-change-transform border-t border-white/[0.06]"
      />

      {/* Decorative Dither Grid Overlay */}
      <div
        className="absolute inset-0 z-[1] opacity-15 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, #ffd700 1px, transparent 0)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Content Center */}
      <div className="relative z-10 flex flex-col items-center max-w-sm px-6 text-center">
        {/* Top Monospace Label */}
        <div
          ref={statusRef}
          className="flex items-center gap-2 mb-4 font-mono text-[10px] tracking-[0.3em] uppercase text-white/50"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#ffd700] animate-pulse" />
          <span>System Initializing</span>
        </div>

        {/* Brand Wordmark */}
        <h1
          ref={brandRef}
          className="text-4xl sm:text-5xl font-heading font-normal italic tracking-tight text-white mb-6"
        >
          Benny<span className="text-[#ffd700] not-italic">.</span>
        </h1>

        {/* Progress Bar Track */}
        <div className="w-48 sm:w-56 h-[2px] bg-white/10 rounded-full overflow-hidden mb-3 relative">
          <div
            ref={barRef}
            className="h-full bg-gradient-to-r from-[#ffd700] via-[#ffe566] to-[#ffd700] rounded-full transition-all duration-75"
            style={{ width: '0%' }}
          />
        </div>

        {/* Counter */}
        <div
          ref={counterRef}
          className="font-mono text-xs sm:text-sm tracking-widest text-[#ffd700]/90 font-medium"
        >
          {String(progress).padStart(3, '0')}%
        </div>
      </div>
    </div>
  )
}

