import React, { useState, useEffect } from 'react'
import { personalInfo } from '../../data/personalInfo'
import { PixelArtBackground } from '../common'

/**
 * HeroSection
 *
 * Full-screen responsive hero section:
 * - Full-width background dither canvas with retro coder illustration (solid flush pixels)
 * - Crystal-clear, high-contrast vector DOM typography overlay in the sky area
 * - Smooth continuous morphing between:
 *   - "Designer who ships with Code"
 *   - "Coder who ships with Designer"
 */
export default function HeroSection() {
  const [phraseState, setPhraseState] = useState(0) // 0: Designer-Code, 1: Coder-Designer
  const [fadeState, setFadeState] = useState('in') // 'in' | 'out'

  useEffect(() => {
    // Continuously swap words every 3.5 seconds
    const interval = setInterval(() => {
      setFadeState('out')
      setTimeout(() => {
        setPhraseState((prev) => (prev === 0 ? 1 : 0))
        setFadeState('in')
      }, 500)
    }, 3800)

    return () => clearInterval(interval)
  }, [])

  return (
    <section
      id="hero"
      aria-label="Introduction"
      className="relative w-full min-h-[90svh] md:min-h-screen flex flex-col items-center justify-start pt-16 sm:pt-24 md:pt-28 text-center select-none overflow-hidden"
    >
      {/* Background artwork canvas (clean pixel art) */}
      <PixelArtBackground
        className="w-full h-full"
        pixelSize={6}
        opacity={0.92}
      />

      {/* Foreground Razor-Sharp Vector Typography Overlay */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 flex flex-col items-center select-text pointer-events-auto">
        <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-heading font-normal tracking-tight text-[#0a0a0a] leading-[1.08] transition-all duration-500">
          <span
            className={`inline-block transition-all duration-500 ease-out transform ${
              fadeState === 'in' ? 'opacity-100 translate-y-0 filter-none' : 'opacity-0 -translate-y-2 blur-[2px]'
            }`}
          >
            {phraseState === 0 ? (
              <>
                <span className="italic font-bold text-[#0a0a0a]">Designer</span>{' '}
                <span className="font-normal text-[#1a1a1a]">who ships with</span>{' '}
                <span className="italic font-bold text-[#b45309] underline decoration-[#ffd700] decoration-wavy decoration-2 underline-offset-4">Code</span>
              </>
            ) : (
              <>
                <span className="italic font-bold text-[#0a0a0a]">Coder</span>{' '}
                <span className="font-normal text-[#1a1a1a]">who ships with</span>{' '}
                <span className="italic font-bold text-[#b45309] underline decoration-[#ffd700] decoration-wavy decoration-2 underline-offset-4">Designer</span>
              </>
            )}
          </span>
        </h1>
      </div>
    </section>
  )
}
