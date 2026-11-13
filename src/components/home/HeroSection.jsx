import React from 'react'
import { personalInfo } from '../../data/personalInfo'
import { PixelArtBackground } from '../common'

/**
 * HeroSection
 *
 * Full-screen responsive hero section:
 * - Full-width background dither canvas with retro coder illustration (solid flush pixels)
 * - Crystal-clear vector DOM typography in pure italic black
 */
export default function HeroSection() {
  const { headlineLine1, headlineLine2 } = personalInfo
  const headline = `${headlineLine1 || 'Designer who'} ${headlineLine2 || 'ships with Code'}`

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
        <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-heading italic tracking-tight text-black leading-[1.08]">
          {headline}
        </h1>
      </div>
    </section>
  )
}
