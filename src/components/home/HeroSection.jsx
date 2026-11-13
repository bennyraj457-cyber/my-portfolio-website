import React, { useEffect, useState } from 'react'
import { personalInfo } from '../../data/personalInfo'
import { PixelArtBackground } from '../common'
import ToolsMarquee from './ToolsMarquee'
import PixelAssembledHeading from './PixelAssembledHeading'

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
      className="relative w-full min-h-[90svh] md:min-h-screen flex flex-col items-center justify-center text-center px-4 sm:px-6 md:px-12 py-20 sm:py-24 md:py-32 select-none overflow-hidden"
    >
      {/* Pixelated artwork background matching the retro coder aesthetic */}
      <PixelArtBackground
        className="w-full h-full"
        pixelSize={5}
        opacity={0.35}
      />

      {/* Hero content sitting cleanly in z-10 above canvas */}
      <div className="relative z-10 w-full max-w-4xl mx-auto flex flex-col items-center space-y-6 sm:space-y-8">
        {/* Main Headline assembled from discrete micro-pixels */}
        <PixelAssembledHeading
          line1={headlineLine1}
          line2={headlineLine2}
          pixelSize={3}
          className="w-full"
        />

        {/* Responsive Paragraph Bio */}
        <p className="max-w-xl mx-auto text-sm sm:text-base md:text-lg lg:text-xl font-normal leading-relaxed text-text-body px-2 sm:px-0">
          {bio}
        </p>

        {/* Tools Marquee immediately after paragraph bio */}
        <div className="w-full pt-4 sm:pt-6 flex flex-col items-center">


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
