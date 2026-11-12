import React from 'react'
import { personalInfo } from '../../data/personalInfo'

/**
 * HeroSection
 *
 * Designed to match the editorial, high-end creative direction in your reference:
 * - Prominent, italicized calligraphic heading in TRJN DaVinci font ("Designer who ships with vision")
 * - Centered sub-paragraph in Geist font with secondary text opacity
 * - Generous vertical rhythm and breathing room framed by the pixel cloud background
 */
export default function HeroSection() {
  const { headlineLine1, headlineLine2, bio } = personalInfo

  return (
    <section
      id="hero"
      aria-label="Introduction"
      className="relative min-h-[75vh] flex flex-col items-center justify-center text-center px-4 py-16 md:py-24 max-w-5xl mx-auto select-none"
    >
      <div className="space-y-6 md:space-y-8 max-w-4xl">
        {/* Main Editorial Headline */}
        <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-heading italic font-normal tracking-tight text-text-heading leading-[1.05] sm:leading-[1.02]">
          <span className="block">{headlineLine1}</span>
          <span className="block mt-1 sm:mt-2">{headlineLine2}</span>
        </h1>

        {/* Centered Bio Paragraph */}
        <p className="max-w-xl mx-auto text-base sm:text-lg md:text-xl font-normal leading-relaxed text-text-body">
          {bio}
        </p>
      </div>
    </section>
  )
}
