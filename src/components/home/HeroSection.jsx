import React from 'react'
import { personalInfo } from '../../data/personalInfo'
import { PixelArtBackground } from '../common'

/**
 * HeroSection
 *
 * Full-screen responsive viewport hero section:
 * - Full-width background dither canvas with retro coder illustration
 * - Embedded headline and bio directly woven into the pixel matrix
 */
export default function HeroSection() {
  const { headlineLine1, headlineLine2, bio } = personalInfo

  return (
    <section
      id="hero"
      aria-label="Introduction"
      className="relative w-full min-h-[90svh] md:min-h-screen flex flex-col items-center justify-end text-center px-4 sm:px-6 md:px-12 pb-12 sm:pb-16 select-none overflow-hidden"
    >
      {/* Background artwork canvas with embedded headline & bio pixels */}
      <PixelArtBackground
        className="w-full h-full"
        pixelSize={6}
        opacity={0.92}
      />

      {/* Screen-reader accessible semantic heading */}
      <h1 className="sr-only">
        {headlineLine1} {headlineLine2}
      </h1>
      <p className="sr-only">
        {bio}
      </p>

      {/* Editorial Minimalist status indicator cleanly anchored at the bottom */}
      <div className="relative z-10 w-full max-w-4xl mx-auto flex flex-col items-center">
        <div className="flex items-center gap-3 sm:gap-4 max-w-lg mx-auto select-none">
          <span className="w-6 sm:w-10 h-[1px] bg-black/15 shrink-0" />
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 ring-4 ring-red-500/20 animate-pulse shrink-0" />
            <p className="text-xs sm:text-[13px] tracking-tight text-text-body font-sans font-normal">
              <span className="font-heading italic font-normal text-text-heading mr-1">Work in progress:</span>
              Currently designing &amp; crafting this website
            </p>
          </div>
          <span className="w-6 sm:w-10 h-[1px] bg-black/15 shrink-0" />
        </div>
      </div>
    </section>
  )
}
