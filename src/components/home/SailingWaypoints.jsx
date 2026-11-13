import React, { useState, useEffect, useRef } from 'react'
import { personalInfo } from '../../data/personalInfo'

/**
 * SailingWaypoints
 *
 * Interactive Nautical Buoys / Floating Waypoint Islands in the hero section:
 * - 📍 Selected Works (quick smooth scroll to projects / works)
 * - 💡 Currently Building (interactive modal / popup snippet)
 * - 📬 Say Hello (opens direct mail / contact)
 *
 * Reacts dynamically to both mouse hover and the sailing boat cursor coordinates (via 'boatmove').
 */
export default function SailingWaypoints() {
  const [activeSnippet, setActiveSnippet] = useState(null)
  const [hoveredWaypoint, setHoveredWaypoint] = useState(null)
  const waypointRefs = useRef([])

  const playChime = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)()
      const osc = audioCtx.createOscillator()
      const gain = audioCtx.createGain()

      osc.type = 'sine'
      // Gentle sparkling chime chord tone (E6 ~ 1318Hz gliding to B6 ~ 1975Hz)
      osc.frequency.setValueAtTime(1318.5, audioCtx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(1975.5, audioCtx.currentTime + 0.12)

      gain.gain.setValueAtTime(0.04, audioCtx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.45)

      osc.connect(gain)
      gain.connect(audioCtx.destination)

      osc.start()
      osc.stop(audioCtx.currentTime + 0.45)
    } catch {
      // AudioContext unavailable or blocked by browser autoplay policy
    }
  }

  const waypoints = [
    {
      id: 'works',
      label: 'Selected Works',
      icon: '📍',
      desc: 'Jump down to view production projects and design experiments',
      action: 'scroll',
      target: '#projects',
      // Positions placed naturally in open water zones of the hero
      pos: { top: '35%', left: '16%' },
      mobilePos: { top: '32%', left: '14%' },
    },
    {
      id: 'building',
      label: 'Currently Building',
      icon: '💡',
      desc: 'Exploring WebGL shaders, fluid simulation & agentic interaction design',
      action: 'snippet',
      pos: { top: '22%', right: '18%' },
      mobilePos: { top: '24%', right: '12%' },
    },
    {
      id: 'contact',
      label: 'Say Hello',
      icon: '📬',
      desc: 'Reach out for collaborations, project inquiries or coffee chats',
      action: 'email',
      target: `mailto:${personalInfo.email}`,
      pos: { top: '56%', right: '22%' },
      mobilePos: { top: '52%', right: '14%' },
    },
  ]

  // Listen to live 'boatmove' events to detect when the sailboat sails directly over any buoy
  useEffect(() => {
    const handleBoatMove = (e) => {
      if (!e.detail) return
      const bx = e.detail.clientX
      const by = e.detail.clientY

      let triggered = null
      waypointRefs.current.forEach((el, idx) => {
        if (!el) return
        const rect = el.getBoundingClientRect()
        // Proximity radius ~ 42px around buoy
        const cx = rect.left + rect.width / 2
        const cy = rect.top + rect.height / 2
        const dist = Math.hypot(bx - cx, by - cy)

        if (dist < 42) {
          triggered = waypoints[idx]
        }
      })

      if (triggered && hoveredWaypoint !== triggered.id) {
        setHoveredWaypoint(triggered.id)
        playChime()
      } else if (!triggered && hoveredWaypoint) {
        setHoveredWaypoint(null)
      }
    }

    window.addEventListener('boatmove', handleBoatMove, { passive: true })
    return () => window.removeEventListener('boatmove', handleBoatMove)
  }, [hoveredWaypoint, waypoints])

  const handleWaypointClick = (wp) => {
    playChime()
    if (wp.action === 'scroll') {
      const targetEl = document.querySelector(wp.target)
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth' })
      } else {
        // Smoothly scroll one viewport height down if section is upcoming
        window.scrollBy({ top: window.innerHeight * 0.85, behavior: 'smooth' })
      }
    } else if (wp.action === 'email') {
      window.location.href = wp.target
    } else if (wp.action === 'snippet') {
      setActiveSnippet(wp)
    }
  }

  return (
    <>
      {/* Floating Nautical Buoy Waypoints in Hero */}
      <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden" aria-hidden="false">
        {waypoints.map((wp, idx) => {
          const isTriggered = hoveredWaypoint === wp.id

          return (
            <div
              key={wp.id}
              ref={(el) => (waypointRefs.current[idx] = el)}
              style={{
                top: wp.pos.top,
                left: wp.pos.left,
                right: wp.pos.right,
              }}
              className="absolute pointer-events-auto transform -translate-x-1/2 -translate-y-1/2 transition-transform duration-300"
            >
              {/* Buoy Container */}
              <button
                type="button"
                onClick={() => handleWaypointClick(wp)}
                onMouseEnter={() => {
                  setHoveredWaypoint(wp.id)
                  playChime()
                }}
                onMouseLeave={() => setHoveredWaypoint(null)}
                data-cursor="link"
                aria-label={wp.label}
                className="group relative flex flex-col items-center cursor-pointer focus:outline-none"
              >
                {/* Expanding Concentric Water Ripple Rings */}
                <span
                  className={`absolute -inset-4 rounded-full border border-[#ffd700]/40 transition-all duration-700 pointer-events-none ${
                    isTriggered ? 'scale-150 opacity-100 animate-ping' : 'scale-75 opacity-0'
                  }`}
                />
                <span
                  className="absolute -inset-2 rounded-full border border-black/10 transition-transform duration-1000 animate-pulse pointer-events-none"
                />

                {/* 3D Stylized Nautical Buoy Badge */}
                <div
                  className={`relative w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-all duration-300 shadow-md ${
                    isTriggered
                      ? 'bg-[#ffd700] text-black scale-110 shadow-[0_0_24px_rgba(255,215,0,0.65)] ring-2 ring-white'
                      : 'bg-black/85 text-white/90 hover:bg-black hover:text-[#ffd700] border border-white/20'
                  }`}
                >
                  {/* Buoy Flashing Beacon Light at top */}
                  <span
                    className={`absolute -top-1 w-2 h-2 rounded-full transition-colors ${
                      isTriggered ? 'bg-white shadow-[0_0_8px_#ffffff]' : 'bg-[#ffd700] animate-pulse'
                    }`}
                  />
                  <span className="text-sm sm:text-base select-none">{wp.icon}</span>
                </div>

                {/* Floating Waypoint Title Pill */}
                <div
                  className={`mt-2 px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-mono font-medium tracking-wide whitespace-nowrap transition-all duration-300 backdrop-blur-md shadow-sm border ${
                    isTriggered
                      ? 'bg-black text-[#ffd700] border-[#ffd700]/50 scale-105 translate-y-0.5'
                      : 'bg-white/90 text-black/80 border-black/10 group-hover:bg-black group-hover:text-white'
                  }`}
                >
                  {wp.label}
                </div>

                {/* Extended Preview Tooltip on Desktop */}
                <div
                  className={`absolute top-full mt-2 left-1/2 -translate-x-1/2 w-48 sm:w-56 p-2.5 rounded-xl bg-black/95 text-white border border-[#ffd700]/30 shadow-2xl backdrop-blur-lg text-left pointer-events-none transition-all duration-200 z-30 ${
                    isTriggered ? 'opacity-100 translate-y-0 visible' : 'opacity-0 -translate-y-1 invisible'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-[#ffd700] text-[11px] font-mono font-semibold mb-1">
                    <span>{wp.icon}</span>
                    <span>{wp.label}</span>
                  </div>
                  <p className="text-[11px] text-white/80 leading-relaxed font-sans">{wp.desc}</p>
                  <span className="inline-block mt-1.5 text-[9px] text-[#ffd700]/80 font-mono underline">
                    {wp.action === 'scroll' ? 'Click to navigate ↓' : wp.action === 'email' ? 'Click to email ↗' : 'Click to inspect ✦'}
                  </span>
                </div>
              </button>
            </div>
          )
        })}
      </div>

      {/* Snippet Modal / Drawer for "Currently Building" */}
      {activeSnippet && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setActiveSnippet(null)}
        >
          <div
            className="relative w-full max-w-md rounded-2xl bg-white text-black p-6 sm:p-8 shadow-2xl border border-black/10 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{activeSnippet.icon}</span>
                <div>
                  <h3 className="text-lg font-heading font-bold text-black tracking-tight">
                    {activeSnippet.label}
                  </h3>
                  <span className="text-[11px] font-mono text-[#b39700] uppercase tracking-wider">
                    Live Lab Status
                  </span>
                </div>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setActiveSnippet(null)}
                className="w-8 h-8 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center text-black/60 hover:text-black transition-colors"
                aria-label="Close dialog"
              >
                ✕
              </button>
            </div>

            {/* Content Body */}
            <div className="space-y-3 text-sm text-black/75 font-sans leading-relaxed">
              <p>
                Currently diving deep into <strong>WebGL shader physics</strong>, <strong>generative canvas rendering</strong>, and fluid micro-interactions.
              </p>
              <div className="p-3.5 rounded-xl bg-neutral-50 border border-black/5 space-y-1.5 font-mono text-xs">
                <div className="flex items-center justify-between text-black/60">
                  <span>Stack:</span>
                  <span className="text-black font-semibold">Three.js / Canvas 2D / Vite / Tailwind</span>
                </div>
                <div className="flex items-center justify-between text-black/60">
                  <span>Current Focus:</span>
                  <span className="text-[#b39700] font-semibold">Custom Sailing Physics & Dither Art</span>
                </div>
              </div>
            </div>

            {/* Action Footer */}
            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setActiveSnippet(null)}
                className="px-4 py-2 rounded-full text-xs font-mono font-medium text-black/70 hover:text-black bg-black/5 hover:bg-black/10 transition-colors"
              >
                Close
              </button>
              <a
                href={`mailto:${personalInfo.email}?subject=Let's connect on WebGL & Design`}
                className="px-5 py-2 rounded-full text-xs font-mono font-medium text-black bg-[#ffd700] hover:bg-[#e6c200] transition-colors shadow-sm"
              >
                Talk Shaders →
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
