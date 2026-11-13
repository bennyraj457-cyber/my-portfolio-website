import React from 'react'
import { personalInfo } from '../../data/personalInfo'
import { PixelArtBackground } from '../common'
import ToolsMarquee from './ToolsMarquee'

/**
 * HeroSection
 *
 * Full-screen responsive viewport hero section:
 * - Fluid typography scaling seamlessly from mobile (320px) to 4K displays
 * - Responsive padding and breathing room
 * - Full-width background dither canvas with zero horizontal overflow
 * - Initial load: starts hidden behind solid yellow dither pixels, then gracefully emerges
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

      {/* Floating Tools Marquee & Status Indicator cleanly anchored at the bottom */}
      <div className="relative z-10 w-full max-w-4xl mx-auto flex flex-col items-center pt-8">
        <div className="w-full flex flex-col items-center">
          <span className="text-[11px] sm:text-xs font-mono uppercase tracking-[0.25em] text-text-muted font-medium mb-3 select-none">
            My Skills
          </span>
          <ToolsMarquee />

          {/* Editorial Minimalist status indicator */}
          <div className="flex items-center gap-3 sm:gap-4 mt-6 sm:mt-7 max-w-lg mx-auto select-none">
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
      </div>
    </section>
  )
}
